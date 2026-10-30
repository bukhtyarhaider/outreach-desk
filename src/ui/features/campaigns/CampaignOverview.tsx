import { Button } from '../../design-system/primitives';
import { useWorkspace } from '../../shared/workspace-store';
import { action } from '../../shared/runtime';
import { selectCampaign } from './controller';
/** Real campaign inventory; opening a workspace never starts its queue. */
export function CampaignOverview() {
  const { state } = useWorkspace();
  return (
    <section className="panel campaign-overview" aria-label="Campaign inventory">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Your campaigns</h2>
          <p className="hint">Choose a workspace to review its audience and prepare outreach.</p>
        </div>
        <a className="button secondary" href="#campaigns">
          Create or configure a campaign
        </a>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Worksheet scope</th>
              <th>Queue inclusion</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {state?.campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td>
                  <strong>{campaign.name}</strong>
                  {campaign.id === state.activeCampaign && <small>Current workspace</small>}
                </td>
                <td>{campaign.sheets?.length ? campaign.sheets.join(', ') : 'All worksheets'}</td>
                <td>
                  {campaign.reviewRequired
                    ? 'Import review required'
                    : campaign.enabled
                      ? 'Included in queue'
                      : 'Paused'}
                </td>
                <td>
                  <Button
                    className="secondary"
                    disabled={state.job.enabled || state.busy}
                    onClick={(event) =>
                      void action(event.currentTarget, async () => {
                        await selectCampaign(campaign.id);
                        location.hash = 'campaigns';
                      })
                    }
                  >
                    Open campaign
                  </Button>
                </td>
              </tr>
            ))}
            {!state?.campaigns.length && (
              <tr>
                <td colSpan={4}>Create your first campaign by importing a lead workbook.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
