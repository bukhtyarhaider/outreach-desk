import { Metric, MetricGroup } from '../../design-system/layout';
import { useWorkspace } from '../../shared/workspace-store';
import { audienceShare, StatMark } from '../../design-system/StatMark';
/** Keep audience and PC-wide send totals explicitly scoped; they are not a shared conversion funnel. */
export function DashboardMetrics() {
  const { state } = useWorkspace();
  const total = state?.counts.total ?? 0;
  const ready = state?.counts.ready ?? 0;
  const excluded = state?.counts.excluded ?? 0;
  const sent = state?.counts.sent ?? 0;
  const shareDescription = (value: number) =>
    total > 0
      ? `${Math.round(audienceShare(value, total) * 100)}% of active campaign leads`
      : 'No active campaign leads';
  return (
    <section className="dashboard-metrics" aria-label="Outreach statistics">
      <MetricGroup>
        <Metric
          label="Total leads"
          value={<div id="total">0</div>}
          detail="Active campaign"
          visual={<StatMark kind="total" value={total} total={total} />}
        />
        <Metric
          label="Ready for outreach"
          value={<div id="ready">0</div>}
          detail={
            <span title={shareDescription(ready)}>
              Eligible in this campaign<span className="sr-only"> · {shareDescription(ready)}</span>
            </span>
          }
          visual={<StatMark kind="ready" value={ready} total={total} />}
        />
        <Metric
          label="Excluded"
          value={<div id="excluded">0</div>}
          detail={
            <span title={shareDescription(excluded)}>
              Protected or ineligible
              <span className="sr-only"> · {shareDescription(excluded)}</span>
            </span>
          }
          visual={<StatMark kind="excluded" value={excluded} total={total} />}
        />
        <Metric
          label="Confirmed sends"
          value={<div id="sent">0</div>}
          detail="All campaigns · this PC"
          visual={<StatMark kind="sent" value={sent} total={0} />}
        />
      </MetricGroup>
    </section>
  );
}
