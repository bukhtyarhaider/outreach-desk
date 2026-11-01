import { Button, Input, Panel, Select } from '../../design-system/primitives';
import { Icon, RefreshCw } from '../../design-system/icons';
import { StatusBadge } from '../../design-system/layout';
export function FirebaseSettings() {
  return (
    <>
      <div className="settings-concern-grid settings-sync-grid">
        <Panel as="div" className={'panel'}>
          <div className={'panel-head'}>
            <div className={'settings-panel-heading'}>
              <h2 className={'panel-title'}>
                <Icon icon={RefreshCw} size={16} />
                {'\n                        Firebase Open Telemetry Sync\n                      '}
              </h2>
              <StatusBadge className={'status-pill'} id={'settingsFirebaseStatusBadge'}>
                {'Not checked'}
              </StatusBadge>
            </div>
          </div>
          <p className={'hint'}>
            {
              'Give each PC its own ID and keep its original data folder. Cloud opens are matched to the tracking tokens saved on that PC.'
            }
          </p>
          <div
            id={'firebaseWarnings'}
            className={'firebase-warnings'}
            role={'status'}
            aria-live={'polite'}
          ></div>
          <div className={'form-group'}>
            <label htmlFor={'trackingPcId'}>{"This PC's tracking ID"}</label>
            <Input
              id={'trackingPcId'}
              maxLength={64}
              placeholder={'e.g. 1, 2, 3 or 4'}
              autoComplete={'off'}
            />
            <p className={'hint'} id={'trackingPcIdHint'}>
              {
                'Save a unique ID for each PC. Blank uses FC_TRACKING_PC_ID, then the legacy default 1.'
              }
            </p>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'trackingPublicUrl'}>{'Public tracking URL'}</label>
            <Input
              id={'trackingPublicUrl'}
              type={'url'}
              placeholder={'https://tracking.example.com/t/1'}
            />
            <p className={'hint'}>
              {
                'Use the cloud endpoint for this PC (for example /t/2 for PC 2). Blank uses FC_TRACKING_PUBLIC_URL. Changes apply to future emails; old emails keep their original URL.'
              }
            </p>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'firebaseBackend'}>{'Cloud database to sync'}</label>
            <Select id={'firebaseBackend'}>
              <option value={'both'}>{'Realtime Database + Firestore'}</option>
              <option value={'rtdb'}>{'Realtime Database only'}</option>
              <option value={'firestore'}>{'Cloud Firestore only'}</option>
            </Select>
            <p className={'hint'}>
              {
                'Select the database your cloud endpoint writes to. Errors from any selected database are shown below.'
              }
            </p>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'firebaseSyncMode'}>{'Sync Mode'}</label>
            <Select id={'firebaseSyncMode'}>
              <option value={'auto'}>
                {'Automatic (Background polling every 15s + startup sync)'}
              </option>
              <option value={'manual'}>{'Manual (Sync only on demand / button click)'}</option>
            </Select>
            <p className={'hint'} id={'firebaseSyncModeHint'}>
              {
                'In automatic mode, open signals from recipients are fetched seamlessly in the background while the app is running.'
              }
            </p>
          </div>
          <div className={'settings-sync-actions'}>
            <small
              id={'settingsFirebaseDiag'}
              className={'hint'}
              role={'status'}
              aria-live={'polite'}
            >
              {'Checking sync configuration…'}
            </small>
            <Button
              id={'settingsFirebaseSyncBtn'}
              type={'button'}
              className={'secondary'}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              {'Sync opens now'}
            </Button>
          </div>
        </Panel>
        <Panel as="div" className={'panel firebase-diagnostics-panel'}>
          <div className={'panel-head'}>
            <h2 className={'panel-title'}>{'PC & Firebase diagnostics'}</h2>
          </div>
          <p className={'hint'}>
            {
              'Live values from this running app. Credential keys are hidden. Environment and credential file changes require a restart.'
            }
          </p>
          <dl id={'firebaseDiagnostics'} className={'firebase-diagnostics'}></dl>
          <div
            id={'firebaseBackendDiagnostics'}
            className={'firebase-backend-diagnostics'}
            aria-live={'polite'}
          ></div>
          <p className={'hint'}>
            {
              'Open signals are image requests; they do not prove a person read the email. Team coordination uses a separate worker ID and does not synchronize open history.'
            }
          </p>
        </Panel>
      </div>
    </>
  );
}
