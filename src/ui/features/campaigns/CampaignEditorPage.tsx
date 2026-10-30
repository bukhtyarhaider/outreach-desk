import { useRouteHash } from '../../app/use-route';
import { Tabs } from '../../design-system/navigation';
import { Notice, PageHeader, SectionHeader } from '../../design-system/layout';
import { ActionLink, Button, Input, Panel, Textarea } from '../../design-system/primitives';
import { useWorkspace, workbookLabel } from '../../shared/workspace-store';
import { CampaignAudience } from './CampaignAudience';
const editorTabs = [
  { id: 'audience', label: 'Audience' },
  { id: 'settings', label: 'Queue settings' },
  { id: 'source', label: 'Source & mapping' },
] as const;
function CampaignScope() {
  const { state } = useWorkspace();
  const locked = !state?.activeCampaign || !!state?.busy || !!state?.job.enabled;
  return (
    <Panel className="campaign-scope">
      <SectionHeader
        title="Queue settings"
        description="Name this campaign and choose the worksheets included in continuous outreach."
        actions={
          <Button variant="primary" id="saveCampaign" disabled={locked}>
            Save campaign settings
          </Button>
        }
      />
      {locked && <Notice tone="warning">Stop outreach before changing campaign settings.</Notice>}
      <div className="form-group">
        <label htmlFor="campaignName">Campaign name</label>
        <Input id="campaignName" placeholder="e.g. Northeast carriers" disabled={locked} />
      </div>
      <label className="check">
        <Input id="campaignEnabled" type="checkbox" disabled={locked} />
        Include this campaign in the continuous outreach queue
      </label>
      <div className="form-group">
        <label htmlFor="campaignSheets">Included worksheets</label>
        <Textarea
          id="campaignSheets"
          rows={4}
          placeholder={'Leads\nJuly Carriers'}
          disabled={locked}
        />
        <p className="hint">
          One exact worksheet name per line. Leave blank to include all worksheets.
        </p>
      </div>
      <div className="campaign-settings-footer">
        <p className="hint">Saving these settings does not start outreach.</p>
        <Button id="deleteCampaignBtn" variant="danger">
          Delete campaign
        </Button>
      </div>
    </Panel>
  );
}
function CampaignSource() {
  const { state } = useWorkspace();
  return (
    <Panel>
      <SectionHeader
        title="Source & mapping"
        description="Inspect the imported workbook and its current column mapping."
        actions={
          <Button id="openImportReview" disabled={!state?.activeCampaign || !!state?.busy}>
            Open import review
          </Button>
        }
      />
      <p className="campaign-source-name">{workbookLabel(state)}</p>
      <Notice>
        Use Import Review to change mappings, save revisions, activate a reviewed workbook or
        restore an earlier revision.
      </Notice>
      <div className="form-group">
        <label htmlFor="mapping">Current mapping (read only)</label>
        <Textarea id="mapping" readOnly rows={8} spellCheck={false} />
      </div>
      <div className="form-group">
        <label>Detected worksheet headers</label>
        <pre id="headers" className="campaign-headers" />
      </div>
    </Panel>
  );
}
export function CampaignEditorPage() {
  const hash = useRouteHash();
  const { state } = useWorkspace();
  const campaign = state?.campaigns.find((item) => item.id === state.activeCampaign);
  const active =
    hash === 'campaignReview' ? 'settings' : hash === 'campaignSource' ? 'source' : 'audience';
  return (
    <section className="view-page" id="view-campaign-edit">
      <PageHeader
        eyebrow="CAMPAIGNS / WORKSPACE"
        title={campaign?.name || 'Campaign workspace'}
        description="Manage the selected campaign’s audience, queue inclusion and source mapping."
        actions={
          <>
            <ActionLink href="#campaigns">All campaigns</ActionLink>
            <ActionLink href="#outreachRunner">Open outreach controls</ActionLink>
          </>
        }
      />
      {!campaign && (
        <Notice tone="warning">
          Choose a campaign from the library or create one by importing a workbook.
        </Notice>
      )}
      <Tabs
        label="Campaign workspace"
        prefix="campaign"
        items={editorTabs}
        activeId={active}
        onChange={(id) => {
          location.hash =
            id === 'settings'
              ? 'campaignReview'
              : id === 'source'
                ? 'campaignSource'
                : 'campaign-edit';
        }}
      />
      <div
        role="tabpanel"
        id="campaign-panel-audience"
        aria-labelledby="campaign-tab-audience"
        hidden={active !== 'audience'}
      >
        <CampaignAudience />
      </div>
      <div
        role="tabpanel"
        id="campaign-panel-settings"
        aria-labelledby="campaign-tab-settings"
        hidden={active !== 'settings'}
      >
        <CampaignScope />
      </div>
      <div
        role="tabpanel"
        id="campaign-panel-source"
        aria-labelledby="campaign-tab-source"
        hidden={active !== 'source'}
      >
        <CampaignSource />
      </div>
    </section>
  );
}
