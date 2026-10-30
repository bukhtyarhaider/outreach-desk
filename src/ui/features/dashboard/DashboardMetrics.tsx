import { Metric, MetricGroup } from '../../design-system/layout';
/** Keep audience and PC-wide send totals explicitly scoped; they are not a shared conversion funnel. */
export function DashboardMetrics() {
  return (
    <section className="dashboard-metrics" aria-label="Outreach statistics">
      <MetricGroup>
        <Metric label="Total leads" value={<div id="total">0</div>} detail="Active campaign" />
        <Metric
          label="Ready for outreach"
          value={<div id="ready">0</div>}
          detail="Eligible in this campaign"
        />
        <Metric
          label="Excluded"
          value={<div id="excluded">0</div>}
          detail="Protected or ineligible"
        />
        <Metric
          label="Confirmed sends"
          value={<div id="sent">0</div>}
          detail="All campaigns · this PC"
        />
      </MetricGroup>
    </section>
  );
}
