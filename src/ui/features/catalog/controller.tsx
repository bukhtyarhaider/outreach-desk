import { ChevronDown, Monitor, Layers } from '../../design-system/icons';
import { EmptyState, StatusBadge } from '../../design-system/layout';
import { Button } from '../../design-system/primitives';
import { uiScope } from '../../shared/lifecycle';
import { renderRegion } from '../../shared/regions';
import { errorMessage } from '../../shared/utils';
import type { Catalog } from '../../shared/types/api';
import { $, api, action } from '../../shared/runtime';
export let catalogData: Catalog | null = null;
let openEntries = new Set<string>();
let loadedOnce = false;

export async function loadCatalog() {
  $('catalogStatus').textContent = 'Loading recorded history…';
  $('catalogEntries').setAttribute('aria-busy', 'true');
  try {
    const data = await api<Catalog>('/api/catalog');
    catalogData = data;
    if (!loadedOnce) {
      const installed = data.entries.find(
        (r) => r.kind === 'build' && r.version === data.installedVersion,
      );
      if (installed) openEntries.add(installed.id);
      loadedOnce = true;
    }
    renderRegion(
      $('catalogMetrics'),
      <>
        <div className="catalog-installed">
          <span className="catalog-build-icon">
            <Monitor size={23} aria-hidden="true" />
          </span>
          <div>
            <p className="page-eyebrow">INSTALLED ON THIS PC</p>
            <strong>v{data.installedVersion}</strong>
            <p>{data.buildLabel} · not a public release</p>
          </div>
        </div>
        <div className="catalog-inventory">
          <Layers size={18} aria-hidden="true" />
          <div>
            <strong>{data.internalBuilds} internal build checkpoints</strong>
            <span>{data.milestones} historical updates</span>
          </div>
        </div>
      </>,
    );
    renderRegion(
      $('catalogUpgradeSteps'),
      data.upgradeSteps.map((step, index) => (
        <li key={step}>
          <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <p>{step}</p>
        </li>
      )),
    );
    renderCatalogEntries();
  } catch (error) {
    $('catalogStatus').textContent =
      `Could not refresh catalog. ${catalogData ? 'Previously loaded history remains visible. ' : ''}${errorMessage(error)} Use Refresh to try again.`;
    throw error;
  } finally {
    $('catalogEntries').removeAttribute('aria-busy');
  }
}

export function renderCatalogEntries() {
  if (!catalogData) return;
  const q = $('catalogSearch').value.trim().toLowerCase();
  const kind = $('catalogType').value;
  const entries = catalogData.entries
    .filter(
      (r) =>
        (!kind || r.kind === kind || (kind === 'build' && r.kind === 'checkpoint')) &&
        (!q ||
          [r.version, r.legacyVersion, r.date, r.title, ...r.changes]
            .join(' ')
            .toLowerCase()
            .includes(q)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  renderRegion(
    $('catalogEntries'),
    entries.length ? (
      entries.map((r) => {
        const installed = r.kind === 'build' && r.version === catalogData!.installedVersion;
        return (
          <article className={`catalog-entry${installed ? ' catalog-current' : ''}`} key={r.id}>
            <details
              open={q ? true : openEntries.has(r.id)}
              onToggle={(event) => {
                if (q) return;
                if (event.currentTarget.open) openEntries.add(r.id);
                else openEntries.delete(r.id);
              }}
            >
              <summary>
                <div className="catalog-version">
                  <strong>
                    {r.version
                      ? `v${r.version}`
                      : r.legacyVersion
                        ? 'Internal checkpoint'
                        : 'Development update'}
                  </strong>
                  <time dateTime={r.date}>
                    {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(
                      new Date(`${r.date}T00:00:00Z`),
                    )}
                  </time>
                </div>
                <div className="catalog-release-title">
                  <div className="catalog-entry-meta">
                    <StatusBadge tone={r.kind === 'build' ? 'info' : 'neutral'}>
                      {r.kind === 'build'
                        ? 'Internal alpha'
                        : r.kind === 'checkpoint'
                          ? 'Internal checkpoint'
                          : 'Development milestone'}
                    </StatusBadge>
                    {installed && <StatusBadge tone="positive">Installed build</StatusBadge>}
                  </div>
                  <h3>{r.title}</h3>
                  <small>{r.changes.length} changes</small>
                </div>
                <ChevronDown className="catalog-chevron" size={18} aria-hidden="true" />
              </summary>
              <div className="catalog-entry-body">
                {r.legacyVersion && (
                  <p className="catalog-legacy">
                    Original internal package label: v{r.legacyVersion}. Not a public release.
                  </p>
                )}
                <ul>
                  {r.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
                {r.evidence && <p className="hint">Recorded source: {r.evidence}</p>}
              </div>
            </details>
          </article>
        );
      })
    ) : (
      <EmptyState
        title="No matching builds"
        description="Try a build label, feature, or a different entry type."
        action={<Button onClick={resetFilters}>Clear filters</Button>}
      />
    ),
  );
  $('catalogStatus').textContent =
    `${entries.length} of ${catalogData.entries.length} recorded entries${q || kind ? ' · filters applied' : ''}`;
  $('catalogReset').disabled = !q && !kind;
}
function resetFilters() {
  $('catalogSearch').value = '';
  $('catalogType').value = '';
  renderCatalogEntries();
  $('catalogSearch').focus();
}
export function mountCatalog() {
  catalogData = null;
  loadedOnce = false;
  openEntries = new Set();
  uiScope.handler($('catalogSearch'), 'oninput', renderCatalogEntries);
  uiScope.handler($('catalogType'), 'onchange', renderCatalogEntries);
  uiScope.handler($('catalogReset'), 'onclick', resetFilters);
  uiScope.handler($('catalogRefresh'), 'onclick', () => action($('catalogRefresh'), loadCatalog));
}
