import type { ImportSummary, ImportMapping } from '../../shared/types/imports';
export function ImportPreviewSummary({
  baseline,
  proposed,
  preview,
  stale = false,
  before = {},
  after = {},
}: {
  baseline: ImportSummary;
  proposed: ImportSummary;
  preview: boolean;
  stale?: boolean;
  before?: ImportMapping;
  after?: ImportMapping;
}) {
  const changes = [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((sheet) =>
    [...new Set([...Object.keys(before[sheet] || {}), ...Object.keys(after[sheet] || {})])]
      .filter((field) => before[sheet]?.[field] !== after[sheet]?.[field])
      .map((field) => ({
        sheet,
        field,
        before: before[sheet]?.[field],
        after: after[sheet]?.[field],
      })),
  );
  const rows = [
    ['Parsed rows', 'rows'],
    ['Rows needing layout review', 'flaggedRows'],
    ['Missing / invalid email', 'invalidEmailRows'],
    ['Extra rows sharing an email', 'duplicateEmailRows'],
  ] as const;
  return (
    <section className="import-preview-summary" aria-label="Mapping preview comparison">
      <div>
        <p className="page-eyebrow">
          {stale
            ? 'Preview needed'
            : preview
              ? 'Preview · no files changed'
              : 'Your starting point'}
        </p>
        <h3>
          {stale
            ? 'Your column choices changed. Preview again.'
            : preview
              ? 'What would this mapping change?'
              : 'Understand the file before making changes'}
        </h3>
        <p>
          {stale
            ? 'The previous preview is out of date. Run Preview changes to compare your latest proposal before saving.'
            : preview
              ? 'Compare the saved mapping with your proposal. These are parsing results, not a verification of contact permission or sending eligibility.'
              : 'Inspect the original worksheet evidence alongside the column choices. Then preview your proposal to see a comparison here.'}
        </p>
      </div>
      {preview &&
        (changes.length ? (
          <details open className="import-mapping-changes">
            <summary>
              {changes.length} column mapping {changes.length === 1 ? 'change' : 'changes'}
            </summary>
            <div className="experiment-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Worksheet / field</th>
                    <th>Was</th>
                    <th>Will use</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change) => (
                    <tr key={`${change.sheet}:${change.field}`}>
                      <th>
                        {change.sheet} · {change.field.replaceAll('_', ' ')}
                      </th>
                      <td data-label="Was">{change.before || 'Not mapped'}</td>
                      <td data-label="Will use">{change.after || 'Not mapped'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ) : (
          <p>
            Column mapping is unchanged. Any added Status headers are shown in the worksheet
            evidence.
          </p>
        ))}
      {preview && (
        <div className="experiment-scroll">
          <table>
            <thead>
              <tr>
                <th>Check</th>
                <th>Saved mapping</th>
                <th>Preview</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, key]) => {
                const delta = proposed[key] - baseline[key];
                return (
                  <tr key={key}>
                    <th>{label}</th>
                    <td data-label="Saved mapping">{baseline[key]}</td>
                    <td data-label="Preview">{proposed[key]}</td>
                    <td data-label="Change">
                      {delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${delta}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {preview && (
        <p className="import-preview-caveat">
          {proposed.flaggedRows
            ? `${proposed.flaggedRows} rows still need layout review. Their flags remain in the saved revision.`
            : 'No layout flags in this preview. Other contact and sending safeguards still apply.'}
        </p>
      )}
    </section>
  );
}
