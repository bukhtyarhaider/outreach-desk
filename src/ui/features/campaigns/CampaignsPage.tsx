import { CampaignJourney } from './CampaignJourney';
import { CampaignAudience } from './CampaignAudience';
import { CodeXml, Folder, Icon } from '../../design-system/icons';
import { Button, Input, Textarea } from '../../design-system/primitives';
export function CampaignsPage() {
  return (
    <>
      <section className={'view-page'} id={'view-campaigns'}>
        <div className={'page-header'}>
          <div>
            <p className={'page-eyebrow'}>{'CAMPAIGNS / SETUP'}</p>
            <h1 className={'page-title'}>{'Build your next campaign.'}</h1>
            <p className={'page-subtitle'}>
              {'Configure campaign scopes, included worksheets, and spreadsheet column mappings.'}
            </p>
          </div>
          <div className={'header-actions'}>
            <a className="button primary" href="#templates">
              Continue to messages →
            </a>
          </div>
        </div>
        <CampaignJourney active={0} />
        <CampaignAudience />
        <section className="campaign-review-toolbar" id="campaignReview">
          <h2>Review campaign scope</h2>{' '}
          <div className={'header-actions'}>
            <Button id={'deleteCampaignBtn'} className={'danger'}>
              {'Delete campaign'}
            </Button>
            <Button id={'openImportReview'} className={'secondary'}>
              {'Review or repair mapping'}
            </Button>
            <Button id={'saveCampaign'}>{'Save campaign settings'}</Button>
          </div>
        </section>
        <div className={'dashboard-grid'}>
          <div className={'panel'}>
            <div className={'panel-head'}>
              <h2 className={'panel-title'}>
                <Icon icon={Folder} size={16} />
                {'\n                    Campaign Parameters\n                  '}
              </h2>
            </div>

            <p className="hint">
              Save the campaign scope here. Import activation and starting outreach remain separate,
              explicit actions.
            </p>
            <a className="button secondary" href="#dashboard">
              Review queue & launch controls
            </a>
            <div className={'form-group'}>
              <label htmlFor={'campaignName'}>{'Campaign Display Name'}</label>
              <Input id={'campaignName'} placeholder={'e.g. Jessica Miller - Motus leads'} />
            </div>
            <div className={'form-group'}>
              <label className={'check'}>
                <Input id={'campaignEnabled'} type={'checkbox'} />
                {
                  '\n                    Include this campaign in continuous outreach queue\n                  '
                }
              </label>
            </div>
            <div className={'form-group'}>
              <label htmlFor={'campaignSheets'}>
                {'Included Worksheets (one exact sheet name per line; leave blank for all)'}
              </label>
              <Textarea id={'campaignSheets'} rows={4} placeholder={'Leads\nJuly Carriers'} />
              <p className={'hint'}>
                {'Continuous queue only processes worksheets matching these names.'}
              </p>
            </div>
          </div>

          <div className={'panel'}>
            <div className={'panel-head'}>
              <h2 className={'panel-title'}>
                <Icon icon={CodeXml} size={16} />
                {'\n                    Custom Column Mapping (JSON)\n                  '}
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {
                '\n                  Define JSON column mappings to target custom layouts. The status column mapping controls which cell is updated after confirmed send.\n                '
              }
            </p>
            <div className={'form-group'}>
              <label htmlFor={'mapping'}>{'JSON Mapping Configuration'}</label>
              <Textarea
                id={'mapping'}
                readOnly={true}
                rows={7}
                spellCheck={'false'}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
            </div>
            <div className={'form-group'}>
              <label>{'Detected Sheet Headers'}</label>
              <pre
                id={'headers'}
                style={{
                  background: '#f2efe7',
                  border: '1px solid var(--border-subtle)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
              ></pre>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
