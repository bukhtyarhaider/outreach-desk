import { refresh } from '../../app/runtime/refresh';
import { confirmAction } from '../../shared/confirmation';
import { workbookLabel } from '../../shared/workspace-store';
import { syncLeadSelection } from './selection';
import { EmptyState, SummaryStrip, StatusBadge } from '../../design-system/layout';
import { Icon, Trash2, ArrowRight } from '../../design-system/icons';
import { ActionLink, Button, Input } from '../../design-system/primitives';
import { uiScope } from '../../shared/lifecycle';
import { renderRegion } from '../../shared/regions';
import { displayText } from '../../shared/utils';
import type { LeadsResponse, PreviewResponse } from '../../shared/types/api';
import { eventElement } from '../../shared/dom';
import { errorMessage } from '../../shared/utils';
import { session } from '../../shared/session';
import { $, api, notice, action } from '../../shared/runtime';
import { updateControls } from '../../app/runtime/controls';
import { switchDrawerTab, renderLeadDetails, openPreviewDrawer } from '../drawer/controller';
let leadsRequest = 0;
let previewRequest = 0;

export async function loadLeads(recoverCampaign = true): Promise<void> {
  if (!$('sheet') || !$('leadsSort')) return;
  const request = ++leadsRequest;
  const generation = uiScope.generation;
  const campaignId = session.state?.activeCampaign;
  const query = new URLSearchParams({
    sheet: $('sheet').value,
    filter: $('filter').value,
    q: $('search').value,
    sort: $('leadsSort').value,
    offset: String(session.offset),
  });
  $('leadRows').setAttribute('aria-busy', 'true');
  $('leadRows').inert = true;
  $('previous').disabled = true;
  $('next').disabled = true;
  $('selectPage').disabled = true;
  renderRegion($('leadsFeedback'), <span>Updating leads…</span>);
  updateControls();
  try {
    const result = await api<LeadsResponse>(`/api/leads?${query}`);
    if (
      request !== leadsRequest ||
      !uiScope.isCurrent(generation) ||
      session.state.activeCampaign !== campaignId
    )
      return;
    if (
      !Object.hasOwn(result, 'campaignId') ||
      !result.summary ||
      !Number.isFinite(result.offset) ||
      !Number.isFinite(result.pageSize)
    )
      throw new Error(
        'The app server is still running an older build. Restart Outreach Desk, then choose Retry to enable the updated Leads Workspace.',
      );
    if ((result.campaignId ?? null) !== (campaignId ?? null)) {
      if (!recoverCampaign)
        throw new Error(
          'The campaign changed again while loading. Choose Retry to refresh the current workspace.',
        );
      await refresh();
      if (request !== leadsRequest || !uiScope.isCurrent(generation)) return;
      session.selected.clear();
      session.previewId = null;
      session.offset = 0;
      $('sheet').value = '';
      return await loadLeads(false);
    }
    session.rows = result.leads;
    session.total = result.total;
    session.offset = result.offset;
    for (const lead of session.rows) if (lead.blocked) session.selected.delete(lead.id);
    const campaign = session.state.campaigns.find((c) => c.id === campaignId);
    renderRegion(
      $('leadsOverview'),
      <div className="leads-overview">
        <div className="leads-scope">
          <p className="page-eyebrow">CURRENT CAMPAIGN</p>
          <strong>{campaign?.name || 'No campaign selected'}</strong>
          <p>{workbookLabel(session.state)}</p>
          {campaign && (
            <ActionLink href={campaign.reviewRequired ? '#imports' : '#campaign-edit'} size="sm">
              {campaign.reviewRequired ? 'Review imported workbook' : 'Campaign setup'}
              <ArrowRight size={13} aria-hidden="true" />
            </ActionLink>
          )}
        </div>
        <SummaryStrip
          label="Eligibility in the selected worksheet scope"
          items={[
            { label: 'Leads in scope', value: result.summary.total.toLocaleString() },
            { label: 'Ready', value: result.summary.ready.toLocaleString() },
            { label: 'Excluded', value: result.summary.excluded.toLocaleString() },
          ]}
        />
        <p className="leads-scope-note">
          Counts cover {$('sheet').value ? 'the selected worksheet' : 'all worksheets'} before
          search and eligibility filters. Ready means eligible under current checks; sending is
          checked again.
        </p>
      </div>,
    );
    renderRegion(
      $('leadRows'),
      session.rows.length ? (
        session.rows.map((lead) => (
          <tr key={lead.id}>
            <td className="leads-check">
              <Input
                type="checkbox"
                data-select={lead.id}
                aria-label={`Select ${lead.company || lead.email}`}
                disabled={!!lead.blocked}
                defaultChecked={session.selected.has(lead.id)}
              />
            </td>
            <td>
              <strong>{lead.company || 'Unnamed company'}</strong>
              <small>{displayText(lead.fields['owner / principal']) || 'No contact listed'}</small>
              <small className="leads-sheet">{lead.sheet}</small>
            </td>
            <td>
              <span className="leads-email">{lead.email || 'No email address'}</span>
              <small>
                {[lead.fields.city, lead.fields.state].filter(Boolean).join(', ') ||
                  'Location not provided'}
              </small>
            </td>
            <td>
              <StatusBadge tone={lead.blocked ? 'warning' : 'positive'}>
                {lead.blocked ? 'Excluded' : 'Ready'}
              </StatusBadge>
              {lead.blocked && <small className="leads-reason">{lead.blocked}</small>}
            </td>
            <td className="leads-row-actions">
              <div>
                <Button
                  size="sm"
                  data-preview={lead.id}
                  aria-label={`Details for ${lead.company || lead.email}`}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  data-email-preview={lead.id}
                  aria-label={`Email preview for ${lead.company || lead.email}`}
                >
                  Email preview
                </Button>
                <Button
                  size="icon"
                  data-delete-lead={lead.id}
                  aria-label={`Delete ${lead.company || lead.email}`}
                  title="Delete lead from workbook"
                >
                  <Icon icon={Trash2} size={14} />
                </Button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5}>
            <EmptyState
              title={
                !campaign
                  ? 'Build your first audience'
                  : campaign.reviewRequired
                    ? 'Review this import before outreach'
                    : result.summary.total === 0
                      ? 'No leads in this worksheet'
                      : 'No leads match these filters'
              }
              description={
                !campaign
                  ? 'Import a workbook to create a campaign, review its mapping, then return here to inspect your leads.'
                  : campaign.reviewRequired
                    ? 'This workbook needs a reviewed, activated mapping. You can still inspect its contacts using All leads.'
                    : 'Try another worksheet, search term, or eligibility view. Your selected batch is retained.'
              }
              action={
                !campaign ? (
                  <ActionLink href="#campaign-new">Import campaign</ActionLink>
                ) : (
                  <>
                    <Button onClick={() => resetLeadFilters(true)}>Show all leads</Button>
                    {campaign.reviewRequired && (
                      <ActionLink href="#imports">Review import</ActionLink>
                    )}
                  </>
                )
              }
            />
          </td>
        </tr>
      ),
    );
    $('pageInfo').textContent = session.total
      ? `${session.offset + 1}–${Math.min(session.offset + result.pageSize, session.total)} of ${session.total.toLocaleString()} matching leads · Page ${Math.floor(session.offset / result.pageSize) + 1} of ${Math.ceil(session.total / result.pageSize)}`
      : '0 matching leads';
    $('previous').disabled = session.offset === 0;
    $('next').disabled = session.offset + result.pageSize >= session.total;
    renderRegion(
      $('leadsFeedback'),
      <span>
        {result.total.toLocaleString()} matching leads
        {campaign?.reviewRequired ? ' · Import review required before outreach' : ''}
      </span>,
    );
    $('leadRows').inert = false;
    updateControls();
  } catch (error) {
    if (request !== leadsRequest || !uiScope.isCurrent(generation)) return;
    renderRegion(
      $('leadsFeedback'),
      <>
        <span>
          Could not update leads: {errorMessage(error)} Previous rows are paused to prevent actions
          on stale results.
        </span>
        <Button size="sm" onClick={() => void retryLeads()}>
          Retry
        </Button>
      </>,
    );
    $('selectPage').disabled = true;
  } finally {
    if (request === leadsRequest && uiScope.isCurrent(generation))
      $('leadRows').removeAttribute('aria-busy');
  }
}

async function retryLeads() {
  try {
    const previousCampaign = session.state?.activeCampaign;
    await refresh();
    if (session.state.activeCampaign !== previousCampaign) {
      session.selected.clear();
      session.previewId = null;
      session.offset = 0;
      $('sheet').value = '';
    }
    await loadLeads();
  } catch (error) {
    notice(`Could not reconnect to Outreach Desk: ${errorMessage(error)}`);
  }
}

function resetLeadFilters(showAll = false) {
  uiScope.clearTimeout(searchTimer);
  $('search').value = '';
  $('sheet').value = '';
  $('filter').value = showAll ? 'all' : 'ready';
  $('leadsSort').value = 'source';
  session.offset = 0;
  void loadLeads();
}

export async function preview(id: string | null | undefined, tab: 'details' | 'email' = 'details') {
  const request = ++previewRequest;
  const route = location.hash;
  const generation = uiScope.generation;
  session.previewId = id ?? null;
  switchDrawerTab(tab);
  const localLead = session.rows.find((x) => x.id === id);
  if (localLead && $('previewTitle')) {
    $('previewTitle').textContent = localLead.company || 'Lead Details';
  }
  const templateKey = $('template')?.value;
  try {
    const res = await api<PreviewResponse>(
      `/api/preview?${new URLSearchParams({ id: id || '', key: templateKey })}`,
    );
    if (request !== previewRequest || !uiScope.isCurrent(generation) || location.hash !== route)
      return;
    const lead = res.lead || localLead;
    const message = res.message;
    const warnings = res.warnings || [];
    if ($('previewTitle'))
      $('previewTitle').textContent = lead && lead.company ? lead.company : 'Lead Details';
    if ($('previewTo') && message) $('previewTo').textContent = `To: ${message.to}`;
    if ($('previewBody') && message) $('previewBody').textContent = message.body;
    const warnEl = $('warnings');
    if (warnEl) {
      warnEl.hidden = !warnings.length;
      warnEl.textContent = warnings.join(' ');
    }
    renderLeadDetails(lead, message, warnings);
  } catch (err) {
    if (request !== previewRequest || !uiScope.isCurrent(generation) || location.hash !== route)
      return;
    if (localLead) {
      renderLeadDetails(localLead, null, [errorMessage(err)]);
    } else {
      notice(errorMessage(err));
    }
  }
  openPreviewDrawer();
  updateControls();
}

export let searchTimer: ReturnType<typeof setTimeout> | undefined;

export function mountLeads() {
  leadsRequest++;
  uiScope.handler($('leadsReset'), 'onclick', () => resetLeadFilters());
  const tools = document.querySelector<HTMLDetailsElement>('.leads-tools');
  if (tools) {
    uiScope.listen(document, 'click', (event) => {
      if (!tools.contains(event.target as Node)) tools.open = false;
    });
    uiScope.listen(document, 'keydown', (event) => {
      if (event.key === 'Escape' && tools.open) {
        tools.open = false;
        tools.querySelector('summary')?.focus();
      }
    });
    uiScope.listen(window, 'hashchange', () => {
      tools.open = false;
    });
    uiScope.listen(tools, 'click', (event) => {
      if (eventElement(event).closest('button,a,label')) tools.open = false;
    });
  }
  uiScope.handler($('leadRows'), 'onclick', async (event) => {
    const element = eventElement(event);
    const details = element.closest<HTMLButtonElement>('[data-preview], [data-email-preview]');
    if (details) {
      details.disabled = true;
      details.setAttribute('data-working', 'true');
      details.setAttribute('aria-busy', 'true');
      try {
        await preview(
          details.dataset.preview || details.dataset.emailPreview,
          details.dataset.emailPreview ? 'email' : 'details',
        );
      } finally {
        if (details.isConnected) {
          details.removeAttribute('data-working');
          details.removeAttribute('aria-busy');
          details.disabled = false;
        }
      }
      return;
    }
    const button = element.closest<HTMLButtonElement>('[data-delete-lead]');
    if (!button || button.disabled) return;
    const lead = session.rows.find((row) => row.id === button.dataset.deleteLead);
    const campaignId = session.state.activeCampaign;
    if (
      !lead ||
      !(await confirmAction(
        `Permanently remove ${lead.company || lead.email} (${lead.email || 'no email'}) from the current campaign workbook? Workbook rows may move. Your batch selection will be cleared; send history and Do Not Contact protections are retained.`,
        { title: 'Delete this lead?', confirmLabel: 'Delete lead', destructive: true },
      ))
    )
      return;
    await action(button, async () => {
      await api('/api/delete-leads', { ids: [lead.id], campaignId });
      session.selected.clear();
      session.previewId = null;
      notice('Lead deleted. Batch selection cleared because workbook rows may have moved.');
    });
  });
  uiScope.handler($('leadRows'), 'onchange', (event) => {
    if (session.pending) return;
    const input = eventElement(event) as HTMLInputElement;
    const lead = session.rows.find((row) => row.id === input.dataset.select);
    if (!lead || lead.blocked) return;
    if (input.checked) session.selected.add(lead.id);
    else session.selected.delete(lead.id);
    updateControls();
  });
  uiScope.handler($('selectPage'), 'onchange', () => {
    for (const lead of session.rows)
      if (!lead.blocked) {
        if ($('selectPage').checked) session.selected.add(lead.id);
        else session.selected.delete(lead.id);
      }
    updateControls();
  });
  uiScope.handler($('clearSelection'), 'onclick', () => {
    session.selected.clear();
    updateControls();
  });
  uiScope.handler($('deleteSelectedLeads'), 'onclick', async () => {
    const ids = [...session.selected];
    const campaignId = session.state.activeCampaign;
    if (
      !ids.length ||
      !(await confirmAction(
        `Permanently remove ${ids.length} selected leads from this campaign workbook, including selections outside the current page or filters? Send history and Do Not Contact protections are retained.`,
        {
          title: 'Delete selected leads?',
          confirmLabel: `Delete ${ids.length} leads`,
          destructive: true,
        },
      ))
    )
      return;
    await action($('deleteSelectedLeads'), async () => {
      await api('/api/delete-leads', { ids, campaignId });
      session.selected.clear();
      session.previewId = null;
      notice('Selected leads deleted.');
    });
  });
  for (const id of ['sheet', 'filter', 'leadsSort'] as const)
    uiScope.handler($(id), 'onchange', () => {
      uiScope.clearTimeout(searchTimer);
      session.offset = 0;
      void loadLeads();
    });
  uiScope.handler($('search'), 'oninput', () => {
    uiScope.clearTimeout(searchTimer);
    searchTimer = uiScope.timeout(() => {
      session.offset = 0;
      void loadLeads();
    }, 250);
  });
  uiScope.handler($('previous'), 'onclick', () => {
    session.offset = Math.max(0, session.offset - 50);
    void loadLeads();
  });
  uiScope.handler($('next'), 'onclick', () => {
    session.offset += 50;
    void loadLeads();
  });
  syncLeadSelection();
}
