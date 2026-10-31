import { Button } from '../../design-system/primitives';
import { Icon, Check } from '../../design-system/icons';
export const importSteps = ['Source', 'Columns', 'Preview', 'Save copy', 'Activate'] as const;
export type ImportStep = 0 | 1 | 2 | 3 | 4;
const panels = [
  'importStepSource',
  'importStepColumns',
  'importStepPreview',
  'importStepSave',
  'importStepActivate',
];
export function ImportJourney({
  step,
  busy,
  available,
  completed,
  campaign,
  onNavigate,
}: {
  step: ImportStep;
  busy: boolean;
  available: readonly boolean[];
  completed: readonly boolean[];
  campaign: string;
  onNavigate: (step: ImportStep) => void;
}) {
  return (
    <nav className="import-stepper" aria-label="Import setup steps">
      <div className="import-stepper-context">
        <span>{campaign ? `Reviewing: ${campaign}` : 'Choose a source campaign'}</span>
        <small>
          Step {step + 1} of 5 · {importSteps[step]}
        </small>
      </div>
      <ol>
        {importSteps.map((label, index) => (
          <li key={label} data-current={step === index}>
            <Button
              variant="ghost"
              aria-current={step === index ? 'step' : undefined}
              aria-controls={panels[index]}
              disabled={busy || !available[index]}
              title={
                !available[index]
                  ? index === 4
                    ? 'Save a reviewed copy first. Existing copies are available here too.'
                    : 'Complete the previous step first.'
                  : `Open ${label.toLowerCase()}`
              }
              onClick={() => onNavigate(index as ImportStep)}
              onKeyDown={(event) => {
                const allowed = available
                  .map((enabled, i) => (enabled ? i : -1))
                  .filter((i) => i >= 0);
                const position = allowed.indexOf(index);
                const next =
                  event.key === 'ArrowRight'
                    ? allowed[(position + 1) % allowed.length]
                    : event.key === 'ArrowLeft'
                      ? allowed[(position + allowed.length - 1) % allowed.length]
                      : event.key === 'Home'
                        ? allowed[0]
                        : event.key === 'End'
                          ? allowed.at(-1)
                          : undefined;
                if (next === undefined) return;
                event.preventDefault();
                onNavigate(next as ImportStep);
                document
                  .querySelectorAll<HTMLButtonElement>('#importJourney ol button')
                  [next]?.focus({ preventScroll: true });
              }}
            >
              <span className="import-step-number" data-done={completed[index] && index < step}>
                {completed[index] && index < step ? (
                  <Icon icon={Check} size={14} />
                ) : (
                  `0${index + 1}`
                )}
              </span>
              <span>{label}</span>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
