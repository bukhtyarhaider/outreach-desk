import test from 'node:test';
import assert from 'node:assert/strict';
import { leadReport } from '../src/lead-report.mjs';
const leads = Array.from({ length: 107 }, (_, index) => ({
  id: String(index).padStart(3, '0'), company: `Carrier ${106 - index}`, email: `contact${index}@example.com`, sheet: index < 100 ? 'Main' : 'Extra',
  blocked: index % 10 === 0 ? 'Suppressed: Do not contact' : '', fields: { city: index % 2 ? 'Austin' : 'Dallas', state: 'TX', 'owner / principal': 'Alex' },
}));
test('lead report keeps eligibility intact and reports worksheet scope separately from matching filters', () => {
  const result = leadReport(leads, new URLSearchParams({sheet:'Main',filter:'excluded',q:'do not contact'}));
  assert.deepEqual(result.summary, {total:100,ready:90,excluded:10});
  assert.equal(result.total, 10);
  assert(result.leads.every(lead => lead.blocked));
  const ready = leadReport(leads, new URLSearchParams({filter:'ready',q:'Austin'}));
  assert(ready.leads.every(lead => !lead.blocked && lead.fields.city === 'Austin'));
  assert.equal(ready.total, 53);
  assert.equal(leads[0].blocked, 'Suppressed: Do not contact');
});
test('global sorting precedes pagination and stale final-page offsets recover after deletions', () => {
  const sorted = leadReport(leads, new URLSearchParams({sort:'company',offset:'50'}));
  assert.equal(sorted.leads[0].company,'Carrier 50');
  assert.equal(sorted.leads.length,50);
  const last = leadReport(leads.slice(0, 49), new URLSearchParams({offset:'100'}));
  assert.equal(last.offset,0);
  assert.equal(last.leads.length,49);
  for (const offset of ['NaN','Infinity','-50']) assert.equal(leadReport(leads,new URLSearchParams({offset})).offset,0);
  assert.equal(leadReport([],new URLSearchParams({offset:'50'})).offset,0);
  assert.equal(leadReport(leads,new URLSearchParams({q:'not found'})).total,0);
});
