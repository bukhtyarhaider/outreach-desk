import { confirmAction } from '../../shared/confirmation';
import { Check, Icon } from '../../design-system/icons';
import { captureContent } from '../../shared/regions';
import { uiScope } from '../../shared/lifecycle';
import { renderRegion } from '../../shared/regions';
import { displayText } from '../../shared/utils';
import type { ActivityEvent } from '../../shared/types/domain';
import { eventElement } from '../../shared/dom';
import { errorMessage } from '../../shared/utils';
import { session } from '../../shared/session';
import { $, waitClock, api, notice, copyToClipboard, action } from '../../shared/runtime';
import { refresh } from '../../app/runtime/refresh';
/** Keep distinct messages and categories even when the server timestamps them together. */
export function eventIdentity(event: ActivityEvent): string {
  return JSON.stringify([
    event.at,
    event.kind,
    event.message,
    event.seconds,
    event.company,
    event.email,
  ]);
}

let pausedEvents: ActivityEvent[] | null = null;

let latestEventKey: string | null = null;

function scrollToLatestActivity() {
  const page = document.querySelector('#view-live-activity.active');
  const viewport = document.querySelector<HTMLElement>('.app-viewport');
  const tools = page?.querySelector('.activity-stream-tools');
  if (!page || !viewport || !tools) return;
  const target =
    session.liveViewMode === 'terminal'
      ? $('liveTerminalOutput')
      : $('liveVisualEventsList').firstElementChild;
  if (!target) return;
  if (session.liveViewMode === 'terminal') {
    viewport.scrollTop +=
      target.getBoundingClientRect().bottom - viewport.getBoundingClientRect().bottom + 16;
  } else {
    // Use the measured sticky stack even before the toolbar has reached its sticky position.
    const style = getComputedStyle(viewport);
    const top =
      viewport.getBoundingClientRect().top +
      parseFloat(style.getPropertyValue('--workspace-sticky-height') || '0') +
      parseFloat(style.getPropertyValue('--active-page-header-height') || '0') +
      tools.getBoundingClientRect().height;
    viewport.scrollTop += target.getBoundingClientRect().top - top - 12;
  }
}

// Live System Activity Logic
export function classifyEvent(event: ActivityEvent): 'error' | 'pause' | 'send' | 'system' {
  const kind = event.kind?.toLowerCase();
  if (kind === 'error') return 'error';
  if (['pause', 'pacing', 'rest', 'waiting'].includes(kind)) return 'pause';
  if (['sent', 'send', 'start'].includes(kind)) return 'send';
  if (['system', 'template', 'import', 'stop', 'settings', 'profile'].includes(kind))
    return 'system';
  const message = displayText(event.message);
  if (/\b(fail(?:ed|ure|ing)?|error|uncertain|needs attention|blocked)\b/i.test(message))
    return 'error';
  if (
    /\b(paus(?:e|ed|ing)|rest(?:ing)?|seconds?|waiting for leads|team pacing|interval|allowance pause)\b/i.test(
      message,
    )
  )
    return 'pause';
  if (/sent to|sending to|started .* outreach|dispatched/i.test(message)) return 'send';
  return 'system';
}

export function renderLiveActivityView() {
  if (!session.state) return;
  // 1. Accumulate events into liveEventsList without duplicates
  if (Array.isArray(session.state.events)) {
    const existingKeys = new Set(session.liveEventsList.map((e) => eventIdentity(e)));
    for (const e of session.state.events) {
      const key = eventIdentity(e);
      if (!existingKeys.has(key) && !session.liveClearedEvents.has(key)) {
        session.liveEventsList.push(e);
        existingKeys.add(key);
      }
    }
  }
  // 2. Telemetry Card 1: Runner Engine
  const runnerBadge = $('liveRunnerBadge');
  const runnerState = $('liveRunnerStateText');
  const runnerMsg = $('liveRunnerMsgText');
  const countdownWrap = $('liveCountdownWrapper');
  const countdownTimer = $('liveCountdownTimer');
  const countdownLabel = $('liveCountdownLabel');
  const job = session.state.job || {};
  const isRunning = session.state.job.enabled;
  const runnerStatus = job.status || (isRunning ? 'Running' : 'Stopped');
  if (runnerBadge) {
    runnerBadge.textContent = runnerStatus;
    runnerBadge.dataset.attention = String(!!isRunning && !session.state.connected);
    runnerBadge.className = `status-badge ${isRunning ? 'active' : ''}`;
  }
  if (runnerState) {
    runnerState.textContent = isRunning ? job.status || 'Running' : 'Idle / Stopped';
  }
  if (runnerMsg) {
    runnerMsg.textContent = job.message || 'Queue is stopped. Start continuous outreach to resume.';
  }
  if (job.nextAt && Date.parse(job.nextAt) > Date.now()) {
    if (countdownWrap) countdownWrap.hidden = false;
    const diffMs = Date.parse(job.nextAt) - Date.now();
    const totalSec = Math.max(0, Math.ceil(diffMs / 1000));
    if (countdownTimer) countdownTimer.textContent = waitClock(totalSec);
    if (countdownLabel)
      countdownLabel.textContent = job.status ? `${job.status}:` : 'Next send scheduled in:';
  } else {
    if (countdownWrap) countdownWrap.hidden = true;
  }
  // 3. Telemetry Card 2: Mailbox Session
  const mailboxPill = $('liveMailboxPill');
  const mailboxStatus = $('liveMailboxStatusText');
  const mailboxAccount = $('liveMailboxAccountText');
  const coordStatus = $('liveCoordinatorStatusText');
  const p = session.state.profiles
    ? session.state.profiles.find((p) => p.id === session.state.activeProfile)
    : null;
  const currentEmail = p?.email || session.state.settings?.account?.email || 'No account';
  if (mailboxPill) {
    mailboxPill.className = `connection-pill ${session.state.connected ? 'good' : ''}`;
  }
  if (mailboxStatus) {
    mailboxStatus.textContent = session.state.connected ? 'Connected' : 'Disconnected';
  }
  if (mailboxAccount) {
    mailboxAccount.textContent = currentEmail;
    mailboxAccount.title = currentEmail;
  }
  if (coordStatus) {
    if (session.state.settings?.team?.enabled) {
      coordStatus.textContent = session.state.teamConnected
        ? `Coordinator: Connected (${displayText(session.state.settings.team.workerName || 'worker')})`
        : 'Coordinator: Connecting / Waiting';
    } else {
      coordStatus.textContent = 'Coordinator: Standalone';
    }
  }
  // 4. Telemetry Card 3: Pacing Quotas
  const hourVal = $('liveHourQuotaText');
  const hourFill = $('liveHourQuotaFill');
  const dayVal = $('liveDayQuotaText');
  const dayFill = $('liveDayQuotaFill');
  const pacing = session.state.settings?.pacing || { hourlyCap: 20, dailyCap: 100 };
  const hourRemaining = session.state.remaining ?? pacing.hourlyCap;
  const dayRemaining = session.state.dayRemaining ?? pacing.dailyCap;
  const hourPct = Math.min(100, Math.max(0, (hourRemaining / (pacing.hourlyCap || 1)) * 100));
  const dayPct = Math.min(100, Math.max(0, (dayRemaining / (pacing.dailyCap || 1)) * 100));
  if (hourVal) hourVal.textContent = `${hourRemaining} / ${pacing.hourlyCap} left`;
  if (hourFill) {
    hourFill.style.width = `${hourPct}%`;
    hourFill.style.background =
      hourPct < 20
        ? 'var(--brand-red)'
        : hourPct < 50
          ? 'var(--brand-yellow)'
          : 'var(--accent-blue)';
  }
  if (dayVal) dayVal.textContent = `${dayRemaining} / ${pacing.dailyCap} left`;
  if (dayFill) {
    dayFill.style.width = `${dayPct}%`;
    dayFill.style.background =
      dayPct < 20 ? 'var(--brand-red)' : dayPct < 50 ? 'var(--brand-yellow)' : 'var(--accent-blue)';
  }
  const summary = document.getElementById('liveStatusSummary');
  if (summary)
    summary.textContent = `${runnerStatus} · Mailbox ${session.state.connected ? 'connected' : 'disconnected'} · ${hourRemaining}/hr · ${dayRemaining}/day left`;
  // 5. Telemetry Card 4: Metrics Breakdown
  let countSent = 0,
    countPacing = 0,
    countSystem = 0,
    countError = 0;
  for (const e of session.liveEventsList) {
    const cls = classifyEvent(e);
    if (cls === 'send') countSent++;
    else if (cls === 'pause') countPacing++;
    else if (cls === 'system') countSystem++;
    else if (cls === 'error') countError++;
  }
  if ($('liveTotalCountBadge'))
    $('liveTotalCountBadge').textContent = `${session.liveEventsList.length} events`;
  if ($('liveStreamCounter'))
    $('liveStreamCounter').textContent = `${session.liveEventsList.length} total`;
  if ($('liveMetricSent')) $('liveMetricSent').textContent = String(countSent);
  if ($('liveMetricPacing')) $('liveMetricPacing').textContent = String(countPacing);
  if ($('liveMetricSystem')) $('liveMetricSystem').textContent = String(countSystem);
  if ($('liveMetricError')) $('liveMetricError').textContent = String(countError);
  if ($('tabChipAll')) $('tabChipAll').textContent = String(session.liveEventsList.length);
  if ($('tabChipSend')) $('tabChipSend').textContent = String(countSent);
  if ($('tabChipPause')) $('tabChipPause').textContent = String(countPacing);
  if ($('tabChipSystem')) $('tabChipSystem').textContent = String(countSystem);
  if ($('tabChipError')) $('tabChipError').textContent = String(countError);
  // 6. Live Stream status badge
  const streamBadge = $('liveStreamStatusBadge');
  const streamText = $('liveStreamStatusText');
  if (session.livePaused) {
    if (streamBadge) streamBadge.className = 'live-stream-badge paused';
    if (streamText) streamText.textContent = 'FEED PAUSED';
  } else {
    if (streamBadge) streamBadge.className = 'live-stream-badge';
    if (streamText) streamText.textContent = 'STREAMING LIVE';
  }
  const feedContext = document.getElementById('liveFeedContext');
  if (feedContext)
    feedContext.textContent = session.livePaused
      ? `Feed paused · ${Math.max(0, session.liveEventsList.length - (pausedEvents?.length ?? 0))} new events waiting · runner continues independently`
      : session.liveViewMode === 'terminal'
        ? 'Oldest events first · newest at the bottom'
        : 'Newest events first · updates automatically';
  if ($('liveConsoleStatusText'))
    $('liveConsoleStatusText').textContent = session.livePaused
      ? 'Viewing a paused snapshot · resume to see new events'
      : 'Live activity · polling local state';
  // 7. Filter & Search
  const query = session.liveSearchQuery.trim().toLowerCase();
  const visibleEvents = session.livePaused ? (pausedEvents ?? []) : session.liveEventsList;
  const filtered = visibleEvents.filter((e) => {
    const cls = classifyEvent(e);
    if (session.liveFilterKind !== 'all' && cls !== session.liveFilterKind) return false;
    if (query) {
      const text =
        `${displayText(e.message)} ${e.kind || ''} ${cls} ${displayText(e.company)} ${displayText(e.email)}`.toLowerCase();
      if (!text.includes(query)) return false;
    }
    return true;
  });
  if ($('liveFilteredCountText')) {
    $('liveFilteredCountText').textContent =
      session.liveFilterKind === 'all' && !query
        ? `Showing all ${filtered.length} events`
        : `Showing ${filtered.length} of ${visibleEvents.length} events (filtered)`;
  }
  // 8. Render Visual Feed
  const visualList = $('liveVisualEventsList');
  const emptyState = $('liveVisualEmptyState');
  if (visualList) {
    if (filtered.length === 0) {
      renderRegion(visualList, '');
      if (emptyState) emptyState.hidden = false;
    } else {
      if (emptyState) emptyState.hidden = true;
      renderRegion(
        visualList,
        filtered
          .slice()
          .reverse()
          .map((e) => {
            const cls = classifyEvent(e);
            const date = new Date(e.at);
            const time = Number.isNaN(date.getTime())
              ? 'Time unavailable'
              : date.toLocaleTimeString();
            const badgeText = cls.toUpperCase();
            const metaTags = [];
            if (e.seconds) metaTags.push(`${e.seconds}s delay`);
            if (e.company) metaTags.push(displayText(e.company));
            if (e.email) metaTags.push(displayText(e.email));
            if (e.kind && e.kind !== cls) metaTags.push(displayText(e.kind));
            return (
              <>
                <li className={'live-event-card event-' + cls}>
                  <span className={'event-type-badge'}>{badgeText}</span>
                  <time className={'event-time'} title={displayText(e.at)}>
                    {displayText(time)}
                    {!Number.isNaN(date.getTime()) && (
                      <small>
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </small>
                    )}
                  </time>
                  <div className={'event-body'}>
                    <span className="event-message">{displayText(e.message)}</span>
                    {metaTags.length > 0 && (
                      <div className="event-meta-tags">
                        {metaTags.map((tag) => (
                          <span key={tag} className="event-meta-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              </>
            );
          }),
      );
    }
  }
  // 9. Render Terminal Feed
  const termOutput = $('liveTerminalOutput');
  if (termOutput && session.liveViewMode === 'terminal') {
    if (filtered.length === 0) {
      termOutput.textContent = '# [Outreach Desk] No events matching current criteria.';
    } else {
      const termLines = filtered
        .map((e) => {
          const cls = classifyEvent(e).toUpperCase().padEnd(6);
          const time = new Date(e.at).toLocaleTimeString();
          return `[${time}] [${cls}] ${displayText(e.message)}`;
        })
        .join('\n');
      termOutput.textContent = termLines;
    }
  }
  // Follow only newly collected events; polling must not pull someone away from older rows.
  const newest = visibleEvents.at(-1);
  const key = newest ? eventIdentity(newest) : '';
  const changed = latestEventKey !== null && latestEventKey !== key;
  latestEventKey = key;
  if (
    changed &&
    session.liveAutoScroll &&
    !session.livePaused &&
    filtered.some((event) => eventIdentity(event) === key)
  )
    scrollToLatestActivity();
}

export function mountLiveActivity() {
  latestEventKey = null;
  pausedEvents = session.livePaused ? session.liveEventsList.slice() : null;
  // Live Countdown Ticker Loop (500ms for smooth ticking)
  uiScope.interval(() => {
    if (session.state?.job?.nextAt) {
      const diffMs = Date.parse(session.state.job.nextAt) - Date.now();
      const wrap = $('liveCountdownWrapper');
      if (diffMs > 0) {
        if (wrap) wrap.hidden = false;
        const totalSec = Math.ceil(diffMs / 1000);
        const timerEl = $('liveCountdownTimer');
        if (timerEl) timerEl.textContent = waitClock(totalSec);
        const barEl = $('liveCountdownBar');
        if (barEl) {
          if (!session.liveCountdownTotal || totalSec > session.liveCountdownTotal) {
            session.liveCountdownTotal = totalSec;
          }
          const pct = Math.max(
            0,
            Math.min(
              100,
              ((session.liveCountdownTotal - totalSec) / session.liveCountdownTotal) * 100,
            ),
          );
          barEl.style.width = `${pct}%`;
        }
      } else {
        session.liveCountdownTotal = null;
        if (wrap) wrap.hidden = true;
      }
    } else {
      session.liveCountdownTotal = null;
      const wrap = $('liveCountdownWrapper');
      if (wrap) wrap.hidden = true;
    }
  }, 500);
  const logMenu = document.querySelector<HTMLDetailsElement>('.activity-log-menu');
  if (logMenu) {
    uiScope.listen(window, 'hashchange', () => {
      logMenu.open = false;
    });
    uiScope.listen(logMenu, 'click', (event) => {
      if (eventElement(event).closest('a[download]')) {
        logMenu.open = false;
        logMenu.querySelector('summary')?.focus();
      }
    });
    uiScope.listen(logMenu, 'keydown', (event) => {
      if ((event as KeyboardEvent).key !== 'Escape') return;
      event.preventDefault();
      logMenu.open = false;
      logMenu.querySelector('summary')?.focus();
    });
    uiScope.listen(document, 'pointerdown', (event) => {
      if (!document.querySelector('dialog[open]') && !logMenu.contains(eventElement(event)))
        logMenu.open = false;
    });
  }
  // Live System Activity setup listeners
  if ($('liveCategoryTabs')) {
    uiScope.listen($('liveCategoryTabs'), 'click', (e) => {
      const tab = eventElement(e).closest<HTMLElement>('.cat-tab');
      if (!tab) return;
      document.querySelectorAll<HTMLElement>('.cat-tab').forEach((item) => {
        item.classList.toggle('active', item === tab);
        item.setAttribute('aria-selected', String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      session.liveFilterKind = tab.dataset.kind || 'all';
      renderLiveActivityView();
    });
  }
  uiScope.listen($('liveCategoryTabs'), 'keydown', (event) => {
    const key = (event as KeyboardEvent).key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    const tabs = Array.from(
      $('liveCategoryTabs').querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const current = tabs.indexOf(eventElement(event) as HTMLButtonElement);
    if (current < 0) return;
    event.preventDefault();
    const next =
      key === 'Home'
        ? 0
        : key === 'End'
          ? tabs.length - 1
          : (current + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next]?.focus();
    tabs[next]?.click();
  });
  if ($('liveSearchInput')) {
    uiScope.listen($('liveSearchInput'), 'input', (e) => {
      session.liveSearchQuery = (eventElement(e) as HTMLInputElement).value;
      renderLiveActivityView();
    });
  }
  if ($('liveAutoScrollCheck')) {
    uiScope.listen($('liveAutoScrollCheck'), 'change', (e) => {
      session.liveAutoScroll = !!(eventElement(e) as HTMLInputElement).checked;
      if (session.liveAutoScroll) scrollToLatestActivity();
    });
  }
  uiScope.listen($('liveJumpLatestBtn'), 'click', scrollToLatestActivity);
  if ($('livePauseToggleBtn')) {
    uiScope.listen($('livePauseToggleBtn'), 'click', () => {
      session.livePaused = !session.livePaused;
      pausedEvents = session.livePaused ? session.liveEventsList.slice() : null;
      $('livePauseToggleBtn').setAttribute('aria-pressed', String(session.livePaused));
      const btnText = $('livePauseBtnText');
      if (btnText) btnText.textContent = session.livePaused ? 'Resume Feed' : 'Pause Feed';
      $('livePauseToggleBtn').classList.toggle('danger', session.livePaused);
      $('livePauseToggleBtn').classList.toggle('secondary', !session.livePaused);
      renderLiveActivityView();
      if (!session.livePaused && session.liveAutoScroll) scrollToLatestActivity();
    });
  }
  if ($('liveClearEventsBtn')) {
    uiScope.listen($('liveClearEventsBtn'), 'click', async () => {
      for (const event of [...session.liveEventsList, ...session.state.events])
        session.liveClearedEvents.add(eventIdentity(event));
      session.liveEventsList = [];
      if (session.livePaused) pausedEvents = [];
      if (
        await confirmAction(
          'Clear server activity event history as well? Click OK to reset server log, or Cancel to clear current screen view only.',
        )
      ) {
        try {
          await api('/api/clear-events', {});
          notice('Server activity log cleared.');
        } catch (err) {
          notice(`Failed to clear server log: ${errorMessage(err)}`);
        }
      } else {
        notice('Screen event view cleared.');
      }
      if (logMenu) {
        logMenu.open = false;
        logMenu.querySelector('summary')?.focus();
      }
      renderLiveActivityView();
    });
  }
  if ($('btnModeVisual')) {
    uiScope.listen($('btnModeVisual'), 'click', () => {
      session.liveViewMode = 'visual';
      $('btnModeVisual').classList.add('active');
      $('btnModeVisual').setAttribute('aria-pressed', 'true');
      $('btnModeTerminal').setAttribute('aria-pressed', 'false');
      $('btnModeTerminal').classList.remove('active');
      if ($('liveVisualFeedContainer')) $('liveVisualFeedContainer').hidden = false;
      if ($('liveTerminalContainer')) $('liveTerminalContainer').hidden = true;
      renderLiveActivityView();
    });
  }
  if ($('btnModeTerminal')) {
    uiScope.listen($('btnModeTerminal'), 'click', () => {
      session.liveViewMode = 'terminal';
      $('btnModeTerminal').classList.add('active');
      $('btnModeTerminal').setAttribute('aria-pressed', 'true');
      $('btnModeVisual').setAttribute('aria-pressed', 'false');
      $('btnModeVisual').classList.remove('active');
      if ($('liveVisualFeedContainer')) $('liveVisualFeedContainer').hidden = true;
      if ($('liveTerminalContainer')) $('liveTerminalContainer').hidden = false;
      renderLiveActivityView();
    });
  }
  if ($('liveTerminalCopyBtn')) {
    uiScope.listen($('liveTerminalCopyBtn'), 'click', async () => {
      const text = $('liveTerminalOutput')?.textContent || '';
      if (text) {
        const ok = await copyToClipboard(text);
        if (ok) {
          const btn = $('liveTerminalCopyBtn');
          const orig = captureContent(btn);
          renderRegion(
            btn,
            <>
              <Icon icon={Check} size={14} />
              {' Copied!'}
            </>,
          );
          uiScope.timeout(() => {
            renderRegion(btn, orig);
          }, 1800);
          notice('Terminal console log copied to clipboard.');
        }
      } else {
        notice('No log content to copy.');
      }
    });
  }
  if ($('reload'))
    uiScope.handler($('reload'), 'onclick', () =>
      action($('reload'), async () => {
        await api('/api/reload', {});
        session.selected.clear();
        session.previewId = null;
        session.offset = 0;
        notice('Workbook reloaded. Batch selection cleared so you can review the current rows.');
      }),
    );
  if ($('batch'))
    uiScope.handler($('batch'), 'onclick', () =>
      action($('batch'), async () => {
        await api('/api/batch', {
          ids: [...session.selected],
          key: $('template').value,
          randomTemplates: $('randomTemplates').checked,
        });
        session.selected.clear();
        notice('Batch dispatch initiated.');
      }),
    );
  if ($('start'))
    uiScope.handler($('start'), 'onclick', () =>
      action($('start'), async () => {
        await api('/api/start', {
          key: $('template').value,
          randomTemplates: $('randomTemplates').checked,
        });
        notice('Continuous outreach started.');
      }),
    );
  if ($('stop'))
    uiScope.handler($('stop'), 'onclick', async () => {
      try {
        await api('/api/stop', {});
        await refresh();
        notice('Outreach stop requested.');
      } catch (e) {
        notice(errorMessage(e));
      }
    });
}
