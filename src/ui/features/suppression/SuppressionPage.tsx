import { StatusBadge } from '../../design-system/layout';
import { Drawer } from '../../design-system/overlays';
import { Ban, Icon, Plus, Search, Shield } from '../../design-system/icons';
import { Button, Input, Panel, Select } from '../../design-system/primitives';
export function SuppressionPage() {
  return (
    <>
      <section className="view-page" id="view-suppression">
        <div className="page-header">
          <div>
            <p className="page-eyebrow">Contact protection</p>
            <h1 className="page-title">Do Not Contact</h1>
            <p className="page-subtitle">
              Keep protected recipients out of outreach. Find the reason behind a hold and review
              its evidence.
            </p>
          </div>
          <div className="header-actions">
            <Button id="suppressionAddOpen" variant="primary">
              <Icon icon={Plus} size={14} />
              Protect a contact
            </Button>
          </div>
        </div>
        <div className="suppression-scope">
          <Icon icon={Shield} size={18} />
          <div>
            <strong id="suppressionScopeTitle">Protection across campaigns</strong>
            <p id="suppressionScopeNote">
              Protection remains in effect across workbooks. This view includes local and loaded
              coordinator records.
            </p>
          </div>
        </div>
        <Panel className="suppression-records">
          <div className="suppression-toolbar">
            <div>
              <h2>
                Protected contacts{' '}
                <StatusBadge id="suppressionCountBadge" tone="negative">
                  0 contacts
                </StatusBadge>
              </h2>
              <p id="suppressionSummary" role="status">
                Loading protected contacts…
              </p>
            </div>
            <div className="suppression-filters">
              <label>
                <span>Search contacts & reasons</span>
                <div className="toolbar-search">
                  <Icon icon={Search} />
                  <Input
                    id="suppressionSearch"
                    type="search"
                    placeholder="Email address or protection reason…"
                  />
                </div>
              </label>
              <label>
                <span>Record type</span>
                <Select id="suppressionKind">
                  <option value="all">All records</option>
                  <option value="captured">Captured opt-outs</option>
                  <option value="other">Other holds</option>
                </Select>
              </label>
            </div>
          </div>
          <div className="suppression-guide">
            <Icon icon={Ban} size={14} />
            <span>
              Captured opt-outs are reviewed in Unibox and cannot be cleared here. Removing another
              entry does not reset send history or other eligibility checks.
            </span>
          </div>
          <ul id="suppressionList" aria-label="Protected contacts" />
        </Panel>
      </section>
      <Drawer
        id="suppressionEditor"
        title="Protect a contact"
        eyebrow="Do Not Contact"
        description="Add one email address and an optional reason. Existing protection records are kept intact."
        footer={
          <Button id="suppress" type="submit" form="suppressionForm" variant="primary">
            <Icon icon={Shield} size={14} />
            Add protection
          </Button>
        }
      >
        <form id="suppressionForm">
          <fieldset id="suppressionFields">
            <div className="form-group">
              <label htmlFor="suppressEmail">Email address</label>
              <Input
                id="suppressEmail"
                type="email"
                placeholder="contact@example.com"
                autoComplete="email"
                required
              />
              <p className="hint">
                Protects this email address across campaigns, not an entire domain.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="suppressReason">
                Reason <span className="hint">(optional)</span>
              </label>
              <Input
                id="suppressReason"
                maxLength={200}
                placeholder="e.g. Requested no further outreach"
              />
              <p className="hint">
                Use a clear reason so other operators understand the hold. Up to 200 characters.
              </p>
            </div>
            <div className="suppression-drawer-note">
              <Icon icon={Shield} size={18} />
              <p>
                Adding protection does not delete conversations or send history. If this address is
                already listed, its existing reason is preserved.
              </p>
            </div>
          </fieldset>
        </form>
        <p
          id="suppressionFeedback"
          className="suppression-feedback"
          role="status"
          aria-live="polite"
        />
      </Drawer>
    </>
  );
}
