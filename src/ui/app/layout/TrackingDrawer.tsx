import { Clock, CodeXml, Copy, FileText, Icon } from '../../design-system/icons';
import { Button } from '../../design-system/primitives';
import { Drawer } from '../../design-system/overlays';
export function TrackingDrawer() {
  return (
    <Drawer
      id="trackingDrawer"
      title="Tracking Details"
      titleId="trackingDrawerTitle"
      eyebrow="Delivery & evidence"
      eyebrowId="trackingDrawerEyebrow"
      closeButtonId="closeTrackingDrawer"
      description="Inspect the recorded signals, timeline and source evidence for this message."
      bodyId="trackingDetail"
      dismissOnBackdrop
      tabs={
        <div className={'drawer-tabs'} role="tablist" aria-label="Inspector sections">
          <Button
            type={'button'}
            className={'drawer-tab active'}
            role="tab"
            aria-selected={true}
            tabIndex={0}
            id={'tabTrackingOverview'}
            aria-controls="trackingSecOverview"
          >
            <Icon icon={Clock} size={14} />
            {'\n            Overview & Timeline\n          '}
          </Button>
          <Button
            type={'button'}
            className={'drawer-tab'}
            role="tab"
            aria-selected={false}
            tabIndex={-1}
            id={'tabTrackingSpecs'}
            aria-controls="trackingSecSpecs"
          >
            <Icon icon={FileText} size={14} />
            {'\n            Technical Specs\n          '}
          </Button>
          <Button
            type={'button'}
            className={'drawer-tab'}
            role="tab"
            aria-selected={false}
            tabIndex={-1}
            id={'tabTrackingRaw'}
            aria-controls="trackingSecRaw"
          >
            <Icon icon={CodeXml} size={14} />
            {'\n            Raw JSON\n          '}
          </Button>
        </div>
      }
      footer={
        <>
          <Button type={'button'} className={'secondary'} id={'trackingCopyBtn'}>
            <Icon icon={Copy} size={14} />
            {'\n            Copy Summary\n          '}
          </Button>
          <Button
            type={'button'}
            className={'secondary'}
            id={'closeTrackingDrawerBtn'}
            style={{ marginLeft: 'auto' }}
          >
            {'Close'}
          </Button>
        </>
      }
    >
      {null}
    </Drawer>
  );
}
