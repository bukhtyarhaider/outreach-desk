import { SectionHeader } from '../../design-system/layout';
import { ActionLink, Panel } from '../../design-system/primitives';
export function CarrierAttentionPanel() {
  return (
    <Panel className="carrier-attention">
      <SectionHeader
        title="Carrier inbox"
        description="Unread messages, reply tasks and approvals."
        actions={
          <ActionLink size="sm" href="#conversations">
            Open Unibox
          </ActionLink>
        }
      />
      <p id="carrierAttentionStatus" className="hint" role="status">
        Loading carrier activity…
      </p>
      <div id="carrierAttentionMetrics" className="carrier-attention-metrics" />
      <div id="carrierAttentionRows" />
    </Panel>
  );
}
export function RecentActivityPanel() {
  return (
    <Panel className="dashboard-activity">
      <SectionHeader
        title="Recent system activity"
        actions={
          <ActionLink href="#live-activity" size="sm">
            Open activity log
          </ActionLink>
        }
      />
      <ol id="events" className="events-stream" />
    </Panel>
  );
}
