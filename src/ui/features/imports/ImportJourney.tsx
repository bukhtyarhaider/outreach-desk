import { Button, ActionLink } from '../../design-system/primitives';
import { Icon, FileText, Eye, Layers, Check, ArrowRight } from '../../design-system/icons';

const steps = [
  { name: 'Inspect source', detail: 'Choose a campaign and read its workbook.', icon: FileText },
  { name: 'Preview columns', detail: 'Match fields and compare the result.', icon: Eye },
  { name: 'Save a copy', detail: 'Record the source and save a revision.', icon: Layers },
  { name: 'Use in campaign', detail: 'Choose a saved copy, then activate it.', icon: ArrowRight },
];
export function ImportJourney({
  step,
  busy,
  published,
  onNext,
  hasCampaign,
}: {
  step: number;
  busy: boolean;
  published: boolean;
  onNext: () => void;
  hasCampaign: boolean;
}) {
  return (
    <section className="import-journey" aria-label="Import review progress">
      <div className="import-journey-heading">
        <div>
          <p className="page-eyebrow">A clear path from file to campaign</p>
          <h2>Review. Preview. Save. Activate.</h2>
        </div>
        <span className="import-safe-label">Outreach stays under your control</span>
      </div>
      <ol>
        {steps.map((item, index) => (
          <li
            key={item.name}
            aria-current={step === index ? 'step' : undefined}
            data-complete={index < step}
          >
            <span className="import-step-mark">
              <Icon icon={index < step ? Check : item.icon} size={18} />
            </span>
            <div>
              <small>0{index + 1}</small>
              <strong>{item.name}</strong>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="import-next-action" role="status">
        <div>
          <strong>
            {published
              ? 'A reviewed revision is connected to this campaign.'
              : [
                  'Start with the original workbook.',
                  'Check the columns below, then preview.',
                  'Your preview is ready. Record its source.',
                  'Your saved copy is ready to inspect and activate.',
                ][step]}
          </strong>
          <p>
            {published
              ? 'Inspect the campaign leads before deciding whether to enable outreach.'
              : [
                  'Select a campaign, then inspect its saved mapping. This does not change the file.',
                  'Previewing calculates the result without saving or activating anything.',
                  'Saving creates a recoverable revision. It does not change the campaign workbook.',
                  'Activation is separate from saving and keeps the campaign paused.',
                ][step]}
          </p>
        </div>
        {published ? (
          <ActionLink href="#leads">
            Inspect campaign leads <Icon icon={ArrowRight} size={14} />
          </ActionLink>
        ) : (
          <Button disabled={busy} onClick={onNext} variant="primary">
            {
              [
                hasCampaign ? 'Inspect workbook' : 'Choose a campaign',
                'Preview selected columns',
                'Review source details',
                'Review saved copies',
              ][step]
            }
            <Icon icon={ArrowRight} size={14} />
          </Button>
        )}
      </div>
    </section>
  );
}
