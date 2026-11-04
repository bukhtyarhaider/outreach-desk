import {
  Download,
  Icon,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  ChevronDown,
  ArrowRight,
} from '../../design-system/icons';
import { PageHeader } from '../../design-system/layout';
import {
  ActionLink,
  Button,
  ButtonLabel,
  Input,
  Select,
  Panel,
} from '../../design-system/primitives';
export function LeadsPage() {
  return (
    <section className="view-page" id="view-leads">
      <PageHeader
        eyebrow="AUDIENCE & ELIGIBILITY"
        title="Leads Workspace"
        description="Review your audience, understand exclusions, and build a focused outreach batch."
        actions={
          <>
            <ActionLink href="#campaign-new">
              <Icon icon={Upload} size={15} />
              Import campaign
            </ActionLink>
            <details className="leads-tools">
              <summary>
                Workbook tools
                <ChevronDown size={15} aria-hidden="true" />
              </summary>
              <div className="leads-tools-menu">
                <Button id="reload">
                  <Icon icon={RefreshCw} size={14} />
                  Reload workbook
                </Button>
                <ActionLink href="/api/download" id="download">
                  <Icon icon={Download} size={14} />
                  Download updated workbook
                </ActionLink>
                <ButtonLabel htmlFor="upload">
                  <Icon icon={Upload} size={14} />
                  Upload .xlsx for review
                </ButtonLabel>
                <Input id="upload" type="file" accept=".xlsx" hidden />
                <p>
                  Uploads create a campaign for mapping review. Reload reads the current workbook
                  again.
                </p>
                <Button id="deleteWorkspace" variant="danger">
                  <Icon icon={Trash2} size={14} />
                  Delete workspace
                </Button>
              </div>
            </details>
          </>
        }
      />
      <div id="leadsOverview" />
      <Panel className="leads-surface">
        <div className="leads-filters">
          <label className="leads-search" htmlFor="search">
            Find a lead
            <div>
              <Icon icon={Search} size={16} />
              <Input
                id="search"
                type="search"
                placeholder="Company, contact, email, location or reason…"
              />
            </div>
          </label>
          <label htmlFor="filter">
            Eligibility
            <Select id="filter" aria-label="Filter status">
              <option value="ready">Ready for outreach</option>
              <option value="all">All leads</option>
              <option value="excluded">Excluded leads</option>
            </Select>
          </label>
          <label htmlFor="sheet">
            Worksheet
            <Select id="sheet" aria-label="Select worksheet">
              <option value="">All worksheets</option>
            </Select>
          </label>
          <label htmlFor="leadsSort">
            Sort by
            <Select id="leadsSort">
              <option value="source">Workbook order</option>
              <option value="company">Company A–Z</option>
              <option value="email">Email A–Z</option>
              <option value="location">State / city A–Z</option>
            </Select>
          </label>
          <Button id="leadsReset">Reset filters</Button>
        </div>
        <div className="leads-selection-bar">
          <div>
            <strong id="leadsSelectionCount">No leads selected</strong>
            <p id="leadsSelectionHint">
              Select eligible leads to build a batch. Excluded contacts remain protected.
            </p>
          </div>
          <div className="leads-selection-actions">
            <ActionLink href="#outreachRunner" id="leadsReviewBatch">
              Review batch
              <ArrowRight size={14} aria-hidden="true" />
            </ActionLink>
            <Button id="clearSelection" size="sm">
              Clear selection
            </Button>
            <Button id="deleteSelectedLeads" variant="danger" size="sm" disabled>
              <Icon icon={Trash2} size={14} />
              Delete selected
            </Button>
          </div>
        </div>
        <div id="leadsFeedback" className="leads-feedback" role="status" aria-live="polite" />
        <p className="leads-scroll-hint">
          Scroll the table sideways to view contact details and row actions.
        </p>
        <div className="table-container leads-table">
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Lead records; scroll horizontally for more columns"
          >
            <table>
              <caption className="sr-only">
                Leads in the current campaign. Only eligible rows can be selected for outreach.
              </caption>
              <thead>
                <tr>
                  <th className="leads-check">
                    <Input
                      type="checkbox"
                      id="selectPage"
                      aria-label="Select eligible leads on this page"
                    />
                  </th>
                  <th scope="col">Company / contact</th>
                  <th scope="col">Email / location</th>
                  <th scope="col">Eligibility / reason</th>
                  <th scope="col" className="leads-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="leadRows" />
            </table>
          </div>
          <div className="table-footer">
            <span id="pageInfo" role="status">
              Loading leads…
            </span>
            <div className="pagination-controls">
              <Button id="previous" size="sm">
                Previous
              </Button>
              <Button id="next" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
