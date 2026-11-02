import { Input, Panel, Select } from '../../design-system/primitives';
import { Icon, SquareCheckBig } from '../../design-system/icons';
import { StatusBadge } from '../../design-system/layout';
export function ChecksSettings() {
  return (
    <>
      <div className="settings-concern-grid">
        <Panel as="div" className={'panel'}>
          <div className={'panel-head'}>
            <h2 className={'panel-title'}>{'Template checks'}</h2>
            <StatusBadge className={'status-pill ready'}>{'Advisory by default'}</StatusBadge>
          </div>
          <p className={'hint'}>
            {
              'Choose how wording checks behave for all templates in previews, manual sends, selected batches, and continuous outreach. Warn only adds a review note and lets outreach continue.'
            }
          </p>
          <div className={'form-group'}>
            <label className={'check'}>
              <Input id={'templateChecksEnabled'} type={'checkbox'} defaultChecked={true} />
              {'\n                      Enable template checks\n                    '}
            </label>
          </div>
          <fieldset id={'templateCheckOptions'} className={'template-check-options'}>
            <div className={'form-group'}>
              <label htmlFor={'promotionalClaimsCheck'}>
                {'Pricing, guarantees & promotional claims'}
              </label>
              <Select id={'promotionalClaimsCheck'}>
                <option value={'warn'}>{'Warn only — continue outreach'}</option>
                <option value={'block'}>{'Stop before sending'}</option>
                <option value={'off'}>{'Off'}</option>
              </Select>
              <p className={'hint'}>
                {'Flags wording such as guarantees, prices, percentages, and urgency for review.'}
              </p>
            </div>
            <div className={'form-group'}>
              <label htmlFor={'messageLengthCheck'}>{'Introduction over 180 words'}</label>
              <Select id={'messageLengthCheck'}>
                <option value={'warn'}>{'Warn only — continue outreach'}</option>
                <option value={'block'}>{'Stop before sending'}</option>
                <option value={'off'}>{'Off'}</option>
              </Select>
            </div>
          </fieldset>
          <p className={'hint'}>
            {
              'Turning template checks off keeps your individual choices for when you enable them again. Save changes to apply your edits. A stopped queue must be started again.'
            }
          </p>
          <p className={'hint'}>
            {
              'Lead eligibility checks are below. Recipient validity, duplicate and opt-out protection, mailbox identity, signature verification, send confirmation, and sending allowances stay active.'
            }
          </p>
        </Panel>
        <Panel as="div" className={'panel'}>
          <div className={'panel-head'}>
            <h2 className={'panel-title'}>
              <Icon icon={SquareCheckBig} size={16} />
              {'\n                      Lead eligibility rules\n                    '}
            </h2>
          </div>
          <div className={'form-group'}>
            <label className={'check'}>
              <Input id={'requireActive'} type={'checkbox'} />
              {
                '\n                      Require Active operating status in the workbook\n                    '
              }
            </label>
            <label className={'check'}>
              <Input id={'requireNoOutOfService'} type={'checkbox'} />
              {'\n                      Require No out-of-service flag\n                    '}
            </label>
            <label className={'check'}>
              <Input id={'allowHidden'} type={'checkbox'} />
              {'\n                      Allow reading from hidden worksheets\n                    '}
            </label>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'readyStatuses'}>{'Eligible workbook statuses'}</label>
            <Input id={'readyStatuses'} aria-describedby="readyStatusesHelp" />
            <p id="readyStatusesHelp" className="hint">
              Separate statuses with commas, for example: blank, new, pending, ready. Use “blank” to
              allow empty Status cells. These rules do not verify FMCSA records.
            </p>
          </div>
          <div className={'form-group'}>
            <label htmlFor={'sentStatus'}>{'Workbook status after a confirmed send'}</label>
            <Input id={'sentStatus'} placeholder={'e.g. Proposal Sent'} />
          </div>
        </Panel>
      </div>
    </>
  );
}
