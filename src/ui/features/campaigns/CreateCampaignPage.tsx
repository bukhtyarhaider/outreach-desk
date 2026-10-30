import { ActionLink, ButtonLabel, Panel } from '../../design-system/primitives';
import { Notice, PageHeader } from '../../design-system/layout';
import { FileInput, Icon, Upload } from '../../design-system/icons';
import { useWorkspace } from '../../shared/workspace-store';
export function CreateCampaignPage() {
  const { state } = useWorkspace();
  const locked = !state || !!(state.busy || state.job.enabled || state.prepared);
  return (
    <section className="view-page" id="view-campaign-new">
      <PageHeader
        eyebrow="CAMPAIGNS / NEW"
        title="Create a campaign"
        description="Start with a lead workbook. Each import creates a separate campaign for review."
        actions={<ActionLink href="#campaigns">Back to campaigns</ActionLink>}
      />
      <Panel className="campaign-create-source">
        <Icon icon={FileInput} size={40} />
        <p className="page-eyebrow">01 / ADD YOUR AUDIENCE</p>
        <h2>Start with your lead workbook.</h2>
        <p>
          Choose an .xlsx file, then check its column mapping and eligibility before including the
          new campaign in outreach.
        </p>
        <ButtonLabel
          variant="primary"
          htmlFor="upload"
          aria-disabled={locked}
          onClick={(event) => {
            if (locked) event.preventDefault();
          }}
        >
          <Icon icon={Upload} />
          Choose .xlsx workbook
        </ButtonLabel>
        {!state ? (
          <p className="hint">Loading workspace…</p>
        ) : locked ? (
          <Notice tone="warning">
            Finish the current action and stop outreach before importing a new campaign.
          </Notice>
        ) : (
          <p className="hint">
            The campaign stays paused until its reviewed workbook is activated and queue inclusion
            is enabled.
          </p>
        )}
      </Panel>
      <div className="campaign-create-guide" aria-label="What happens after import">
        <div>
          <span>02</span>
          <h3>Review the source</h3>
          <p>
            Check columns and lead eligibility in Import Review. Save and activate a reviewed
            revision.
          </p>
        </div>
        <div>
          <span>03</span>
          <h3>Set campaign scope</h3>
          <p>Choose worksheets and queue inclusion in the campaign workspace.</p>
        </div>
        <div>
          <span>04</span>
          <h3>Connect & start</h3>
          <p>
            Choose a mailbox and reusable message templates, then start outreach from the dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
