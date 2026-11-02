import { Input, Panel } from '../../design-system/primitives';
import { Icon, Users } from '../../design-system/icons';
export function TeamSettings() {
  return (
    <>
      <div className="settings-concern-grid">
        <Panel as="div" className={'panel'}>
          <div className={'panel-head'}>
            <h2 className={'panel-title'}>
              <Icon icon={Users} size={16} />
              {'\n                      Shared team coordination\n                    '}
            </h2>
          </div>
          <div className={'form-group'}>
            <label className={'check'}>
              <Input id={'teamEnabled'} type={'checkbox'} />
              {'\n                      Use a shared coordinator\n                    '}
            </label>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'teamUrl'}>{'Coordinator server URL'}</label>
            <Input id={'teamUrl'} type={'url'} placeholder={'http://192.168.1.50:4318'} />
          </div>
          <div className={'form-grid-2'}>
            <div className={'form-group'}>
              <label htmlFor={'workerName'}>{'Worker display name'}</label>
              <Input id={'workerName'} placeholder={'PC-01'} />
            </div>
            <div className={'form-group'}>
              <label htmlFor={'teamToken'}>{'Access token'}</label>
              <Input
                id={'teamToken'}
                type={'password'}
                autoComplete={'off'}
                placeholder={'Coordinator token'}
              />
            </div>
          </div>
          <p className="hint">
            Leave the token blank to keep the existing credential. Enter a replacement only when it
            changes. Saving does not start outreach.
          </p>
          <p id={'teamStatus'} className={'hint'} role="status" aria-live="polite"></p>
        </Panel>
        <Panel className="settings-card settings-explainer">
          <h2>What is shared?</h2>
          <dl>
            <div>
              <dt>Recipient reservations</dt>
              <dd>Coordinate work between PCs to avoid competing sends.</dd>
            </div>
            <div>
              <dt>Mailbox pacing</dt>
              <dd>Share the coordinator’s mailbox limits across participating workers.</dd>
            </div>
            <div>
              <dt>Separate from Firebase</dt>
              <dd>Open-event history uses Firebase. Configure it in the Firebase sync tab.</dd>
            </div>
          </dl>
          <p className="hint">This worker’s name is separate from its Firebase PC ID.</p>
        </Panel>
      </div>
    </>
  );
}
