import { ActionLink, ButtonLabel } from '../../design-system/primitives';
import { useWorkspace, workbookLabel } from '../../shared/workspace-store';
import { Icon, FileText, Upload } from '../../design-system/icons';
export function CampaignAudience() {
  const { state, leads } = useWorkspace();
  return (
    <section className="campaign-audience" aria-label="Campaign audience">
      <div className="audience-heading">
        <div>
          <h2>Audience</h2>
          <p>Import a workbook, review its mapping, and confirm who you want to reach.</p>
        </div>
        <ButtonLabel className="button primary" htmlFor="upload">
          <Icon icon={Upload} /> Import .xlsx campaign
        </ButtonLabel>
      </div>
      <div className="source-strip">
        <Icon icon={FileText} size={28} />
        <div>
          <strong>{workbookLabel(state)}</strong>
          <p>Uploads stay paused until a reviewed revision is activated.</p>
        </div>
        <ActionLink href="#imports" className="button secondary">
          Review mapping
        </ActionLink>
      </div>
      <dl className="audience-counts">
        {[
          ['Total leads', state?.counts.total],
          ['Ready for outreach', state?.counts.ready],
          ['Excluded', state?.counts.excluded],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dd>{value ?? '—'}</dd>
            <dt>{label}</dt>
          </div>
        ))}
      </dl>
      <p className="hint">
        Preview follows the current Leads filter and worksheet. Inspect all leads to change the view
        or select a batch.
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
                <td colSpan={4}>
                  Import a workbook or open Leads to inspect your campaign audience.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="audience-footer">
        <a href="#leads">Inspect all leads & batch selection</a>
        <ActionLink className="button primary" href="#templates">
          Continue to messages →
        </ActionLink>
      </div>
    </section>
  );
}
