import { Icon, Mail, Send, SquarePen, UserRound } from '../../design-system/icons';
import { Button, Select } from '../../design-system/primitives';
import { Drawer } from '../../design-system/overlays';
export function LeadDrawer() {
  return (
    <Drawer
      id="leadPreviewDrawer"
      title="Lead Details"
      titleId="previewTitle"
      eyebrow="Lead inspector"
      eyebrowId="leadDrawerEyebrow"
      closeButtonId="closePreviewDrawer"
      description="Review carrier details and the personalized email before using the mailbox actions."
      dismissOnBackdrop
      tabs={
        <div className={'drawer-tabs'} role="tablist" aria-label="Inspector sections">
          <Button
            type={'button'}
            className={'drawer-tab active'}
            role="tab"
            aria-selected={true}
            tabIndex={0}
            id={'tabLeadDetails'}
            aria-controls="leadDetailsSection"
          >
            <Icon icon={UserRound} size={14} />
            {'\n            Lead Details\n          '}
          </Button>
          <Button
            type={'button'}
            className={'drawer-tab'}
            role="tab"
            aria-selected={false}
            tabIndex={-1}
            id={'tabEmailDraft'}
            aria-controls="emailDraftSection"
          >
            <Icon icon={Mail} size={14} />
            {'\n            Email Preview\n          '}
          </Button>
        </div>
      }
      footer={
        <>
          <Button id={'prepare'} disabled={true}>
            <Icon icon={SquarePen} size={14} />
            {'\n            Fill webmail compose\n          '}
          </Button>
          <Button id={'sendOne'} className={'success'} disabled={true}>
            <Icon icon={Send} size={14} />
            {'\n            Send prepared message\n          '}
          </Button>
          <Button id={'release'} className={'secondary'} disabled={true}>
            {'Close compose'}
          </Button>
          <Button
            type={'button'}
            className={'secondary'}
            id={'closeDrawerBtn'}
            style={{ marginLeft: 'auto' }}
          >
            {'Close'}
          </Button>
        </>
      }
    >
      <div
        id={'leadDetailsSection'}
        role="tabpanel"
        aria-labelledby="tabLeadDetails"
        className={'drawer-tab-pane active'}
      >
        <div id={'leadDetailsContainer'}>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '13px',
              textAlign: 'center',
              padding: '30px',
            }}
          >
            {'Loading lead details...'}
          </p>
        </div>
      </div>

      <div
        id={'emailDraftSection'}
        role="tabpanel"
        aria-labelledby="tabEmailDraft"
        className={'drawer-tab-pane'}
        style={{ display: 'none' }}
      >
        <div className="form-group">
          <label htmlFor="template">Template for this preview</label>
          <Select id="template" />
          <p className="hint">
            Automatic selection may choose a different eligible template when preparing a message.
          </p>
        </div>
        <p
          id={'previewTo'}
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            fontWeight: '500',
          }}
        ></p>
        <div id={'warnings'} className={'warning-callout'} hidden={true}></div>
        <div id={'previewBody'} className={'message-preview-box'}>
          {'\n              A personalized message will appear here.\n            '}
        </div>
        <div className={'signature-box'}>
          <span id={'signatureText'}>
            {'Your existing webmail signature will appear below the message.'}
          </span>
        </div>
      </div>
    </Drawer>
  );
}
