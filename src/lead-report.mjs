/** Read-only presentation over already evaluated candidates. Never changes recipient eligibility. */
export function leadReport(candidates, params = new URLSearchParams()) {
  const sheet = params.get('sheet') || '';
  const scope = candidates.filter(lead => !sheet || lead.sheet === sheet);
  const ready = scope.filter(lead => !lead.blocked).length;
  const filter = params.get('filter') || 'all';
  const query = (params.get('q') || '').trim().toLowerCase();
  let leads = scope.filter(lead =>
    (filter !== 'ready' || !lead.blocked) &&
    (filter !== 'excluded' || lead.blocked) &&
    (!query || [lead.company, lead.email, lead.fields['owner / principal'], lead.fields.city, lead.fields.state, lead.blocked, lead.sheet].filter(Boolean).join(' ').toLowerCase().includes(query)));
  const sort = params.get('sort');
  if (['company', 'email', 'location'].includes(sort)) {
    const value = lead => sort === 'location' ? [lead.fields.state, lead.fields.city].filter(Boolean).join(' ') : lead[sort] || '';
    leads = [...leads].sort((a,b) => value(a).localeCompare(value(b), 'en', { numeric: true, sensitivity: 'base' }) || a.id.localeCompare(b.id));
  }
  const pageSize = 50;
  const requested = Number(params.get('offset'));
  const offset = Math.min(Number.isFinite(requested) ? Math.max(0, Math.floor(requested / pageSize) * pageSize) : 0, Math.max(0, Math.ceil(leads.length / pageSize) - 1) * pageSize);
  return { leads: leads.slice(offset, offset + pageSize), total: leads.length, offset, pageSize, summary: { total: scope.length, ready, excluded: scope.length - ready } };
}
