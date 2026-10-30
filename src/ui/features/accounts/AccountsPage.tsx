import { Icon, Mail } from '../../design-system/icons';
import { Button, Input, Panel, Select, Textarea } from '../../design-system/primitives';
import { Drawer } from '../../design-system/overlays';
import { PageHeader, StatusBadge } from '../../design-system/layout';
export function AccountsPage() {
  return (
    <>
      <section className="view-page" id="view-accounts">
        <PageHeader
          eyebrow="WORKSPACE"
          title="Accounts"
          description="Manage mailbox identities and reusable browser connections. Sending rules live in Settings."
        />
        <Panel as="div" className={'panel settings-profiles-panel'}>
          <div className={'panel-head'}>
            <div className={'settings-panel-heading'}>
              <h2 className={'panel-title'}>
                <Icon icon={Mail} size={16} />
                {'\n                        Configured Mailbox Profiles\n                      '}
              </h2>
              <StatusBadge className={'status-pill ready'} id={'profilesCountBadge'}>
                {'1 Active'}
              </StatusBadge>
            </div>
            <Button
              variant="primary"
              id={'newProfileBtn'}
              className={'secondary'}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              {'+ New profile'}
            </Button>
          </div>
          <div className={'table-container'} style={{ border: 'none', boxShadow: 'none' }}>
            <div className={'table-wrap'} style={{ maxHeight: '280px', minHeight: '120px' }}>
              <table>
                <thead>
                  <tr>
                    <th>{'Profile Label'}</th>
                    <th>{'Email'}</th>
                    <th>{'Browser'}</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>{'Status'}</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>{'Actions'}</th>
                  </tr>
                </thead>
                <tbody id={'profilesTableBody'}></tbody>
              </table>
            </div>
          </div>
        </Panel>
      </section>
      <Drawer
        id="profileEditor"
        title="Mailbox profile"
        titleId="profileSetupTitle"
        description="Set the sender identity, business details and browser connection for this mailbox."
        footer={
          <div className={'form-actions'} style={{ display: 'flex', gap: '10px' }}>
            <Button variant="primary" id={'saveProfile'}>
              {'Save mailbox profile'}
            </Button>
            <Button
              type={'button'}
              id={'deleteCurrentProfile'}
              className={'danger'}
              style={{ display: 'none' }}
            >
              {'Delete profile'}
            </Button>
          </div>
        }
      >
        <div className={'form-grid-2'}>
          <div className={'form-group'}>
            <label htmlFor={'accountName'}>{'Profile Label'}</label>
            <Input id={'accountName'} placeholder={'e.g. Mark Anthony'} />
          </div>
          <div className={'form-group'}>
            <label htmlFor={'accountEmail'}>{'Email Address'}</label>
            <Input id={'accountEmail'} type={'email'} autoComplete={'username'} />
          </div>
        </div>
        <div className={'form-grid-2 settings-provider-fields'}>
          <div className={'form-group'}>
            <label htmlFor={'provider'}>{'Provider'}</label>
            <Select id={'provider'}>
              <option value={'privateemail'}>{'Private Email Webmail'}</option>
            </Select>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'browserChannel'}>{'Browser'}</label>
            <Select id={'browserChannel'}>
              <option value={'chrome'}>{'Google Chrome'}</option>
              <option value={'msedge'}>{'Microsoft Edge'}</option>
            </Select>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'senderName'}>{'Sender First Name'}</label>
            <Input id={'senderName'} placeholder={'Mark'} />
          </div>
        </div>
        <div className={'form-group'}>
          <label htmlFor={'accountUrl'}>{'Webmail Interface URL'}</label>
          <Input id={'accountUrl'} type={'url'} />
        </div>
        <div className={'form-group'}>
          <label htmlFor={'connectionMode'}>{'Browser Connection Method'}</label>
          <Select id={'connectionMode'}>
            <option value={'saved'}>{'Saved Browser Profile'}</option>
            <option value={'cdp'}>{'Connect to Existing Browser (CDP)'}</option>
          </Select>
          <p className={'hint'}>
            {
              'Saved profiles keep the login on this device, separately for each mailbox and browser. Passwords entered here are not stored.'
            }
          </p>
        </div>
        <div id={'cdpSettings'} hidden={true}>
          <div className={'form-group'}>
            <label htmlFor={'cdpEndpoint'}>{'Local Browser Debugging Address'}</label>
            <Input id={'cdpEndpoint'} type={'url'} placeholder={'http://127.0.0.1:9222'} />
          </div>
          <Button id={'discoverBrowsers'} type={'button'} className={'secondary'}>
            {'Find local debugging browsers'}
          </Button>
          <div className={'form-group'}>
            <label htmlFor={'availableBrowsers'}>{'Available Browsers'}</label>
            <Select id={'availableBrowsers'}>
              <option value={''}>{'Run discovery or enter an address above'}</option>
            </Select>
          </div>
          <p className={'hint'} id={'browserGuideMessage'}></p>
          <pre
            id={'browserDebugCommand'}
            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', userSelect: 'text' }}
          ></pre>
          <p className={'hint'}>
            {
              'Run the command in Terminal on macOS or PowerShell on Windows. This starts a separate persistent debug profile. Sign in there once and reuse it. Keep debugging accessible only from this device.'
            }
          </p>
        </div>
        <label className={'check hint'}>
          <Input id={'autoReconnect'} type={'checkbox'} defaultChecked={true} />
          {' Restore this connection when the application starts'}
        </label>
        <div className={'form-grid-2'}>
          <div className={'form-group'}>
            <label htmlFor={'businessName'}>{'Display Brand Name'}</label>
            <Input id={'businessName'} placeholder={'FC Logistics'} />
          </div>
          <div className={'form-group'}>
            <label htmlFor={'legalName'}>{'Legal Registered Entity'}</label>
            <Input id={'legalName'} placeholder={'Fleet Core Logistics LLC'} />
          </div>
        </div>
        <div className={'form-group'}>
          <label htmlFor={'address'}>{'Postal Business Address'}</label>
          <Input id={'address'} placeholder={'132 French Creek Dr, Rochester, NY 14618'} />
        </div>
        <div className={'form-group'}>
          <label htmlFor={'services'}>{'Services Offered (used in templates)'}</label>
          <Textarea id={'services'} rows={2} />
        </div>

        <Button id="newProfile" hidden>
          New profile
        </Button>
      </Drawer>
    </>
  );
}
