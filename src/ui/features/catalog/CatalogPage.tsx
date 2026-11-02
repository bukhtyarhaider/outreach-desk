import { Download, RefreshCw, ChevronDown, ShieldCheck } from '../../design-system/icons';
import { PageHeader } from '../../design-system/layout';
import { ActionLink, Button, Input, Panel, Select } from '../../design-system/primitives';

export function CatalogPage() {
  return (
    <section className="view-page" id="view-catalog">
      <PageHeader
        eyebrow="PRODUCT & INTERNAL BUILDS"
        title="Version Catalog"
        description="Internal testing history. Explore changes and identify the build running on this PC."
        actions={
          <>
            <Button id="catalogRefresh">
              <RefreshCw size={16} aria-hidden="true" />
              Refresh
            </Button>
            <ActionLink href="/api/export-catalog">
              <Download size={16} aria-hidden="true" />
              Export catalog
            </ActionLink>
          </>
        }
      />
      <div
        id="catalogMetrics"
        className="catalog-build"
        aria-label="Installed build and recorded history"
      />
      <p className="catalog-version-guide">
        <strong>How build numbers work</strong> <code>0.1.0-alpha.1</code> is the first build under
        the internal-alpha numbering scheme. Increase the final number for the next packaged test
        build. Beta, release candidate, and the first public <code>1.0.0</code> come later.
      </p>
      <details className="catalog-guide">
        <summary>
          <ShieldCheck size={19} aria-hidden="true" />
          <span>
            <strong>Update this PC safely</strong>
            <small>Backup, install, verify · manual update guide</small>
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </summary>
        <div className="catalog-guide-body">
          <p className="hint">
            Follow these steps on each PC separately. Keep its own configuration and data.
          </p>
          <ol id="catalogUpgradeSteps" className="catalog-upgrade" />
          <p className="catalog-scope">
            This catalog ships with your installed application. It does not check online for newer
            builds or confirm updates on other PCs.
          </p>
        </div>
      </details>
      <Panel className="catalog-history">
        <div className="catalog-history-heading">
          <div>
            <h2 className="panel-title">Internal build history</h2>
            <p className="hint">
              Development checkpoints and dated changes. No public releases have been made.
            </p>
          </div>
        </div>
        <div className="catalog-filters">
          <label htmlFor="catalogSearch">
            Search history
            <Input
              id="catalogSearch"
              type="search"
              placeholder="Build, old label, feature or date…"
            />
          </label>
          <label htmlFor="catalogType">
            Show
            <Select id="catalogType">
              <option value="">All recorded history</option>
              <option value="build">Internal build checkpoints</option>
              <option value="milestone">Development milestones</option>
            </Select>
          </label>
          <Button id="catalogReset" size="sm">
            Clear filters
          </Button>
        </div>
        <p id="catalogStatus" className="hint" role="status" aria-live="polite" />
        <div id="catalogEntries" />
        <p className="catalog-scope">
          Earlier labels such as 1.0.0, 2.0.0 and 2.2.0-rc.9 were internal identifiers, not public
          releases. Original labels remain inside each entry for traceability.
        </p>
      </Panel>
    </section>
  );
}
