import { ActionLink, Panel } from '../../design-system/primitives';
import { Notice, SectionHeader, Metric, MetricGroup } from '../../design-system/layout';
import { useWorkspace, workbookLabel } from '../../shared/workspace-store';
export function CampaignAudience() {
  const { state, leads } = useWorkspace();
  const campaign = state?.campaigns.find((item) => item.id === state.activeCampaign);
  return (
    <section className="campaign-audience" aria-label="Campaign audience">
      {campaign?.reviewRequired && (
        <Notice tone="warning">
          This campaign needs source review before outreach.{' '}
          <a href="#imports">Open Import Review →</a>
        </Notice>
      )}
      <MetricGroup>
        <Metric label="Total leads" value={state?.counts.total ?? '—'} detail="Active campaign" />
        <Metric
          label="Ready for outreach"
          value={state?.counts.ready ?? '—'}
          detail="Eligible leads"
        />
        <Metric
          label="Excluded"
          value={state?.counts.excluded ?? '—'}
          detail="Protected or ineligible"
        />
      </MetricGroup>
      <Panel>
        <SectionHeader
          title="Audience"
          description={workbookLabel(state)}
          actions={<ActionLink href="#leads">Open leads table</ActionLink>}
        />
        <p className="hint">
          This preview follows the current Leads filter and worksheet. Use the leads table to
          inspect every row or select a batch.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Worksheet</th>
                <th>Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.company}</strong>
                  </td>
                  <td>{lead.email || 'No email'}</td>
                  <td>{lead.sheet}</td>
                  <td>{lead.blocked || lead.reason || lead.status || 'Ready'}</td>
                </tr>
              ))}
              {!leads.length && (
                <tr>
                  <td colSpan={4}>Open the leads table to inspect or change this audience view.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="campaign-related-tools">
        <div>
          <h3>Shared message templates</h3>
          <p>
            Reusable templates are managed in the library and matched to eligible leads by the
            existing sending rules.
          </p>
        </div>
        <ActionLink href="#templates">Open template library</ActionLink>
      </div>
    </section>
  );
}
