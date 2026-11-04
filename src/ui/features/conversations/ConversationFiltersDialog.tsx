import { Button, Dialog, Select } from '../../design-system/primitives';
export function ConversationFiltersDialog() {
  return (
    <Dialog
      id={'mailroomFiltersDialog'}
      className={'mailroom-dialog'}
      aria-label={'Conversation filters'}
    >
      <div className={'mailroom-dialog-heading'}>
        <h2>{'Conversation filters'}</h2>
        <Button size="sm" className={'secondary'} data-close-mailroom={'mailroomFiltersDialog'}>
          {'Close filters'}
        </Button>
      </div>
      <div className={'reply-filters'}>
        <label>
          {'View'}
          <Select id={'replyGrouping'}>
            <option value={'carriers'}>{'Carriers with full email history'}</option>
            <option value={'threads'}>{'Individual tool threads'}</option>
          </Select>
        </label>
        <label hidden={true} htmlFor={'replyMode'}>
          {'Data'}
          <Select id={'replyMode'}>
            <option value={'real'}>{'Real replies'}</option>
            <option value={'demo'}>{'Sample replies'}</option>
          </Select>
        </label>
        <label htmlFor={'replyWork'}>
          {'Work queue'}
          <Select id={'replyWork'} defaultValue={'needs_reply'}>
            <option value={'active'}>{'Active conversations'}</option>
            <option value={'in_review'}>{'Carriers in review'}</option>
            <option value={'signed'}>{'Signed carriers'}</option>
            <option value={'closed'}>{'Closed carriers'}</option>
            <option value={'needs_reply'}>{'Needs my reply'}</option>
            <option value={'all'}>{'All tool-sent conversations'}</option>
            <option value={'replied'}>{'Carriers who replied'}</option>
            <option value={'no_reply'}>{'No captured carrier reply'}</option>
            <option value={'follow_up'}>{'Follow-ups and reminders'}</option>
            <option value="follow_up_overdue">Overdue reminders</option>
            <option value="follow_up_today">Reminders due later today</option>
            <option value="follow_up_upcoming">Upcoming reminders</option>
            <option value={'unread'}>{'New / unread'}</option>
            <option value={'approval'}>{'Needs draft approval'}</option>
            <option value={'interested'}>{'Interested'}</option>
            <option value={'positive'}>{'Positive engagement'}</option>
            <option value={'negative'}>{'Negative / opt-out'}</option>
            <option value={'missing_details'}>{'Missing carrier details'}</option>
          </Select>
        </label>
        <label htmlFor={'replyCategory'}>
          {'Category'}
          <Select id={'replyCategory'}>
            <option value={''}>{'All categories'}</option>
            <option value={'needs_match'}>{'Needs conversation match'}</option>
            <option value={'ignored'}>{'Ignored review items'}</option>
          </Select>
        </label>
        <Button id={'replyRefresh'} className={'secondary'}>
          {'Refresh inbox'}
        </Button>
      </div>
      <p className={'hint'}>
        {
          'Queues use captured local evidence. Waiting means no captured human reply, rather than proof of silence.'
        }
      </p>
    </Dialog>
  );
}
