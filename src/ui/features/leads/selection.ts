import { session } from '../../shared/session';
import { $ } from '../../shared/runtime';

/** Keep page selection truthful without refetching or replacing focused rows. */
export function syncLeadSelection() {
  if (!session.state || !$('leadRows') || !$('leadsSelectionCount')) return;
  const eligible = session.rows.filter((lead) => !lead.blocked);
  const onPage = session.rows.filter((lead) => session.selected.has(lead.id)).length;
  const selectedEligible = eligible.filter((lead) => session.selected.has(lead.id)).length;
  $('selectPage').checked = eligible.length > 0 && selectedEligible === eligible.length;
  $('selectPage').indeterminate = selectedEligible > 0 && selectedEligible < eligible.length;
  $('selectPage').disabled = !eligible.length || session.pending || $('leadRows').inert;
  $('clearSelection').disabled = !session.selected.size || session.pending;
  $('leadsSelectionCount').textContent = session.selected.size
    ? `${session.selected.size.toLocaleString()} selected`
    : 'No leads selected';
  $('leadsSelectionHint').textContent = session.selected.size
    ? `${onPage} on this page · ${session.selected.size - onPage} elsewhere in this campaign. Filters keep your selection; Review batch opens the runner without sending.`
    : 'Select eligible leads to build a batch. Excluded contacts remain protected.';
  const review = $('leadsReviewBatch');
  review.hidden = !session.selected.size;
  for (const input of $('leadRows').querySelectorAll<HTMLInputElement>('[data-select]')) {
    input.checked = session.selected.has(input.dataset.select!);
    input.disabled =
      session.pending || !!session.rows.find((lead) => lead.id === input.dataset.select)?.blocked;
    input.closest('tr')?.classList.toggle('leads-row-selected', input.checked);
  }
  const locked =
    session.pending || session.state.busy || session.state.job.enabled || !!session.state.prepared;
  for (const button of $('leadRows').querySelectorAll<HTMLButtonElement>('[data-delete-lead]'))
    button.disabled = locked;
}
