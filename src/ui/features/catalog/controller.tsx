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
      const installed = data.releases.find(
        (r) => r.kind === 'release' && r.version === data.installedVersion,
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
            <p>
              {data.installedVersion.includes('-')
                ? 'Prerelease build · review changes before rollout'
                : 'Numbered package build'}
            </p>
          </div>
        </div>
        <div className="catalog-inventory">
          <Layers size={18} aria-hidden="true" />
          <div>
            <strong>{data.packageVersions} package releases</strong>
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
  const entries = catalogData.releases
    .filter(
      (r) =>
        (!kind || r.kind === kind) &&
        (!q || [r.version, r.date, r.title, ...r.changes].join(' ').toLowerCase().includes(q)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  renderRegion(
    $('catalogEntries'),
    entries.length ? (
      entries.map((r) => {
        const installed = r.kind === 'release' && r.version === catalogData!.installedVersion;
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
                  <strong>v{r.version}</strong>
                  <time dateTime={r.date}>
                    {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(
                      new Date(`${r.date}T00:00:00Z`),
                    )}
                  </time>
                </div>
                <div className="catalog-release-title">
                  <div className="catalog-entry-meta">
                    <StatusBadge tone={r.kind === 'release' ? 'info' : 'neutral'}>
                      {r.kind === 'release' ? 'Package release' : 'Historical update'}
                    </StatusBadge>
                    {installed && <StatusBadge tone="positive">Installed build</StatusBadge>}
                  </div>
                  <h3>{r.title}</h3>
                  <small>{r.changes.length} changes</small>
                </div>
                <ChevronDown className="catalog-chevron" size={18} aria-hidden="true" />
              </summary>
              <div className="catalog-entry-body">
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
        title="No matching releases"
        description="Try a version number, feature, or a different entry type."
        action={<Button onClick={resetFilters}>Clear filters</Button>}
      />
    ),
  );
  $('catalogStatus').textContent =
    `${entries.length} of ${catalogData.releases.length} recorded entries${q || kind ? ' · filters applied' : ''}`;
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
