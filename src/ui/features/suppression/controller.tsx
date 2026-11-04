import { confirmAction } from '../../shared/confirmation';
import { StatusBadge } from '../../design-system/layout';
import { openDrawer } from '../../design-system/overlays';
import { Icon, Shield } from '../../design-system/icons';
import { Button } from '../../design-system/primitives';
import { uiScope } from '../../shared/lifecycle';
import { renderStableRegion } from '../../shared/regions';
import { displayText, errorMessage } from '../../shared/utils';
import { eventElement } from '../../shared/dom';
import { session } from '../../shared/session';
import { $, action, api, notice } from '../../shared/runtime';
const isCapturedOptOut = (reason: string) => /^Captured carrier opt-out\b/i.test(reason);
const readableReason = (reason: string) =>
  reason.replace(
    /Captured carrier opt-out: [a-f0-9]{64}/gi,
    'Captured carrier opt-out — review the conversation evidence in Unibox',
  );
export function renderSuppressionList() {
  if (!session.state?.suppression) return;
  const query = $('suppressionSearch').value.trim().toLowerCase();
  const kind = $('suppressionKind').value;
  const entries = Object.entries(session.state.suppression);
  const capturedCount = entries.filter(([, reason]) => isCapturedOptOut(reason)).length;
  $('suppressionCountBadge').textContent =
    `${entries.length} contact${entries.length === 1 ? '' : 's'}`;
  const filtered = entries.filter(
    ([email, reason]) =>
      (kind === 'all' ||
        (kind === 'captured' ? isCapturedOptOut(reason) : !isCapturedOptOut(reason))) &&
      (!query || `${email} ${readableReason(reason)}`.toLowerCase().includes(query)),
  );
  const summary = document.getElementById('suppressionSummary');
  if (summary)
    summary.textContent = `Showing ${filtered.length} of ${entries.length} · ${capturedCount} captured opt-out${capturedCount === 1 ? '' : 's'}`;
  const scopeTitle = document.getElementById('suppressionScopeTitle'),
    scopeNote = document.getElementById('suppressionScopeNote');
  if (scopeTitle)
    scopeTitle.textContent = session.state.settings.team.enabled
      ? 'Team coordinator configured'
      : 'Protection on this PC';
  if (scopeNote)
    scopeNote.textContent = session.state.settings.team.enabled
      ? 'This list includes local and loaded coordinator records. Protection applies across campaigns; coordinator availability and shared holds are checked separately before sending.'
      : 'These records protect outreach on this PC across campaigns and workbooks. Other PCs need a configured team coordinator for shared protection.';
  renderStableRegion(
    $('suppressionList'),
    filtered.length ? (
      filtered.map(([email, reason]) => {
        const captured = isCapturedOptOut(reason);
        return (
          <li key={email} data-suppressed-email={email}>
            <div className="suppression-contact">
              <strong>{email}</strong>
              <p>{displayText(readableReason(reason) || 'Do not contact')}</p>
              <StatusBadge tone={captured ? 'negative' : 'neutral'}>
                {captured ? 'Captured opt-out' : 'Other hold'}
              </StatusBadge>
            </div>
            <div className="suppression-row-actions">
              {captured ? (
                <Button size="sm" data-conversation-email={email}>
                  Review in Unibox
                </Button>
              ) : (
                <Button
                  size="sm"
                  data-unsuppress={email}
                  aria-label={`Remove protection for ${email}`}
                >
                  Remove entry
                </Button>
              )}
            </div>
          </li>
        );
      })
    ) : (
      <li className="suppression-empty">
        <Icon icon={Shield} size={28} />
        <h3>{entries.length ? 'No matching contacts' : 'No contacts listed here'}</h3>
        <p>
          {entries.length
            ? 'Try a different email, reason or record type.'
            : 'Add a contact to keep it out of outreach. Send history and other eligibility safeguards still apply.'}
        </p>
        <Button size="sm" data-suppression-empty={entries.length ? 'reset' : 'add'}>
          {entries.length ? 'Clear filters' : 'Protect a contact'}
        </Button>
      </li>
    ),
  );
}
export function mountSuppression() {
  const feedback = document.getElementById('suppressionFeedback');
  const open = () => {
    openDrawer('suppressionEditor');
    $('suppressEmail').focus();
  };
  uiScope.listen($('suppressionAddOpen'), 'click', open);
  uiScope.handler($('suppressionForm'), 'onsubmit', async (event) => {
    event.preventDefault();
    if (session.pending) return;
    const email = $('suppressEmail').value.trim().toLowerCase();
    $('suppressEmail').value = email;
    if (!$('suppressionForm').reportValidity()) return;
    if (Object.hasOwn(session.state.suppression, email)) {
      if (feedback)
        feedback.textContent =
          'This address is already protected. Its existing protection reason has not been changed.';
      return;
    }
    const reason = $('suppressReason').value.trim() || 'Do not contact';
    $('suppressionFields').disabled = true;
    if (feedback) feedback.textContent = 'Adding contact protection…';
    try {
      await action($('suppress'), async () => {
        try {
          await api('/api/suppress', { email, reason });
          $('suppressEmail').value = '';
          $('suppressReason').value = '';
          if (feedback) feedback.textContent = '';
          notice(`Protection added for ${email}. Add another contact or close this drawer.`);
        } catch (error) {
          if (feedback) feedback.textContent = '';
          throw new Error(`${errorMessage(error)} Your entries are retained.`);
        }
      });
    } finally {
      $('suppressionFields').disabled = false;
    }
  });
  uiScope.listen($('suppressionSearch'), 'input', renderSuppressionList);
  uiScope.listen($('suppressionKind'), 'change', renderSuppressionList);
  uiScope.handler($('suppressionList'), 'onclick', async (event) => {
    const empty = eventElement(event).closest<HTMLElement>('[data-suppression-empty]');
    if (empty) {
      if (empty.dataset.suppressionEmpty === 'add') open();
      else {
        $('suppressionSearch').value = '';
        $('suppressionKind').value = 'all';
        renderSuppressionList();
        $('suppressionSearch').focus();
      }
      return;
    }
    const button = eventElement(event).closest<HTMLButtonElement>('[data-unsuppress]');
    const email = button?.dataset.unsuppress;
    if (!button || !email || session.pending) return;
    if (isCapturedOptOut(session.state.suppression[email] || '')) {
      notice('Captured opt-outs must be reviewed in Unibox.');
      return;
    }
    if (
      !(await confirmAction(
        `Remove the Do Not Contact entry for ${email}? Other sending protections, including captured opt-outs and send history, remain in effect. If a team coordinator is configured, removal is also requested there.`,
        { title: 'Remove contact protection?', confirmLabel: 'Remove entry', destructive: true },
      ))
    )
      return;
    await action(button, async () => {
      await api('/api/unsuppress', { email });
      notice(`Removal requested for ${email}. Other sending protections still apply.`);
    });
  });
}
