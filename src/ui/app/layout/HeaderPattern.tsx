import { RunnerMotion } from '../../shared/RunnerMotion';
import { useUIPreferences } from '../../shared/ui-preferences';
import { useWorkspace } from '../../shared/workspace-store';
/** Build 1's original proportions, anchored to the top-right edge of the shell. */
export function HeaderPattern() {
  const { preferences } = useUIPreferences();
  const { state } = useWorkspace();
  if (preferences.headerRunnerAnimation && state?.job.enabled)
    return (
      <div className="header-pattern">
        <RunnerMotion compact />
      </div>
    );
  return (
    <svg
      className="header-pattern"
      viewBox="0 0 198 82"
      width="198"
      height="82"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M0 0H85V82C38 82 0 46 0 0Z" fill="var(--brand-red)" />
      <path d="M85 0H135V82H85Z" fill="var(--accent-blue)" />
      <circle cx="166.5" cy="50.5" r="31.5" fill="var(--brand-yellow)" />
    </svg>
  );
}
