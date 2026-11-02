import { Download, RefreshCw, ChevronDown, ShieldCheck } from '../../design-system/icons';
import { PageHeader } from '../../design-system/layout';
import { ActionLink, Button, Input, Panel, Select } from '../../design-system/primitives';

export function CatalogPage() {
  return (
    <section className="view-page" id="view-catalog">
      <PageHeader
        eyebrow="PRODUCT & RELEASES"
        title="Version Catalog"
        description="Know your build. Explore what changed. Update this PC with confidence."
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
            <h2 className="panel-title">Release history</h2>
            <p className="hint">
              Numbered builds and dated milestones. Expand an entry to read its changes.
            </p>
          </div>
        </div>
        <div className="catalog-filters">
          <label htmlFor="catalogSearch">
            Search history
            <Input
              id="catalogSearch"
              type="search"
              placeholder="Version, feature, date or change…"
            />
          </label>
          <label htmlFor="catalogType">
            Show
            <Select id="catalogType">
              <option value="">All recorded history</option>
              <option value="release">Package releases</option>
              <option value="milestone">Historical updates</option>
            </Select>
          </label>
          <Button id="catalogReset" size="sm">
            Clear filters
          </Button>
        </div>
        <p id="catalogStatus" className="hint" role="status" aria-live="polite" />
        <div id="catalogEntries" />
        <p className="catalog-scope">
          Some earlier improvements shipped under version 2.0.0. Dated milestones preserve that
          history without assigning unverified patch versions.
        </p>
      </Panel>
    </section>
  );
}
