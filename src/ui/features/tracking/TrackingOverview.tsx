import { Metric, MetricGroup } from '../../design-system/layout';
export function TrackingOverview({
  summary,
  total,
}: {
  summary: Record<string, number>;
  total: number;
}) {
  const attempts = summary.attempts || 0,
    sent = summary.webmail_sent || 0;
  const bounces = (summary.hard_bounced || 0) + (summary.soft_bounced || 0);
  const seedTotal =
    (summary.inbox || 0) + (summary.spam || 0) + (summary.other || 0) + (summary.not_found || 0);
  return (
    <>
      <MetricGroup>
        <Metric
          label="Webmail confirmed"
          value={sent}
          detail={`${attempts} attempts · ${attempts ? Math.round((sent / attempts) * 100) : 0}% confirmed`}
        />
        <Metric
          label="Open signals"
          value={summary.open_detected || 0}
          detail="Image requests, not verified reads"
        />
        <Metric
          label="DSN bounces"
          value={bounces}
          detail={`${summary.hard_bounced || 0} permanent · ${summary.soft_bounced || 0} temporary`}
        />
        <Metric
          label="Seed inbox"
          value={seedTotal ? `${Math.round(((summary.inbox || 0) / seedTotal) * 100)}%` : '—'}
          detail={`${summary.awaiting || 0} awaiting inspection`}
        />
      </MetricGroup>
      <dl className="ui-summary-strip">
        {[
          ['Tracked messages', total],
          ['Unique recipients', summary.recipients || 0],
          ['Failed submissions', summary.send_failed || 0],
          ['Delivery unknown', summary.delivery_unknown || 0],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
