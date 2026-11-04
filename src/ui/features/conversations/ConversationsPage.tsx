import { ConversationFiltersDialog } from './ConversationFiltersDialog';
import { MailboxToolsDialog } from './MailboxToolsDialog';
import {
  Icon,
  Inbox,
  Search,
  SlidersHorizontal,
  Settings,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from '../../design-system/icons';
import { StatusBadge } from '../../design-system/layout';
import {
  ActionLink,
  Button,
  Dialog,
  Input,
  Select,
  Textarea,
} from '../../design-system/primitives';
export function ConversationsPage() {
  return (
    <>
      <section className={'view-page mailroom-page'} id={'view-conversations'}>
        <header className={'page-header mailroom-header'}>
          <div>
            <p className={'page-eyebrow'}>{'CONVERSATION WORKSPACE'}</p>
            <h1 className={'page-title'}>{'Unibox'}</h1>
          </div>
          <label className={'mailroom-mailbox'}>
            <span className={'mailroom-field-label'}>{'Mailbox'}</span>
            <Select id={'replyMailbox'}>
              <option value={''}>{'All mailboxes'}</option>
            </Select>
          </label>
          <label className={'mailroom-search'}>
            <span className={'mailroom-field-label'}>
              <Icon icon={Search} size={12} /> Search conversations
            </span>
            <Input
              id={'replySearch'}
              type={'search'}
              placeholder={'Search conversations, senders, or keywords…'}
            />
          </label>
        </header>
        <div className={'mailroom-toolbar'}>
          <nav className={'mailroom-tabs'} aria-label={'Conversation queues'}>
            <Button size="sm" type={'button'} data-mailroom-work={'active'} aria-pressed={'false'}>
              {'Active '}
              <span id={'mailroomActiveCount'}>{'0'}</span>
            </Button>
            <Button
              size="sm"
              type={'button'}
              data-mailroom-work={'needs_reply'}
              aria-pressed={'true'}
            >
              {'Needs reply '}
              <span id={'mailroomNeedsCount'}>{'0'}</span>
            </Button>
            <Button size="sm" type={'button'} data-mailroom-work={'all'} aria-pressed={'false'}>
              {'All '}
              <span id={'mailroomAllCount'}>{'0'}</span>
            </Button>
            <Button
              size="sm"
              type={'button'}
              data-mailroom-work={'no_reply'}
              aria-pressed={'false'}
            >
              {'Waiting '}
              <span id={'mailroomWaitingCount'}>{'0'}</span>
            </Button>
            <Button
              size="sm"
              type={'button'}
              data-mailroom-work={'in_review'}
              aria-pressed={'false'}
            >
              {'In review '}
              <span id={'mailroomReviewCount'}>{'0'}</span>
            </Button>
          </nav>
          <div className={'mailroom-tools'}>
            <Button type="button" id="mailroomResetFilters" variant="ghost" size="sm" hidden>
              Clear filters
            </Button>
            <Button size="sm" id={'replyScan'} className={'secondary'} disabled={true}>
              <Icon icon={RefreshCw} size={14} /> Scan previous replies
            </Button>
            <Button
              size="sm"
              id={'replyStopCapture'}
              className={'secondary'}
              disabled={true}
              hidden={true}
            >
              {'Stop scan'}
            </Button>
            <Button size="sm" id={'mailroomFiltersOpen'} className={'secondary'}>
              <Icon icon={SlidersHorizontal} size={14} /> Filters
            </Button>
            <Button size="sm" id={'mailroomToolsOpen'} className={'secondary'}>
              <Icon icon={Settings} size={14} /> Mailbox tools
            </Button>
          </div>
        </div>
        <StatusBadge id="mailroomQueueLabel" tone="info" hidden />
        <div className="mailroom-sync-bar">
          <Icon icon={ShieldCheck} size={15} />
          <p
            id={'replyScanProgress'}
            className={'mailroom-scan-note'}
            role={'status'}
            aria-live={'polite'}
          ></p>
          <Button type="button" variant="ghost" size="sm" data-mailroom-setup>
            Capture settings <Icon icon={ArrowRight} size={12} />
          </Button>
        </div>
        <p id={'replyError'} className={'experiment-error'} role={'alert'} hidden={true}></p>
        <div className={'mailroom-workspace'} id={'mailroomWorkspace'} data-thread-open={'false'}>
          <aside className={'mailroom-list-pane'} aria-label={'Carrier conversations'}>
            <div className="mailroom-list-heading">
              <strong>Conversations</strong>
              <small>Select a carrier to continue</small>
            </div>
            <div
              id={'mailroomList'}
              className={'mailroom-list'}
              aria-label={'Conversation results'}
            ></div>
            <div className={'mailroom-pagination'}>
              <span id={'replyPage'} className={'hint'}></span>
              <Button id={'replyPrev'} className={'secondary'} aria-label={'Previous page'}>
                {'Previous'}
              </Button>
              <Button id={'replyNext'} className={'secondary'} aria-label={'Next page'}>
                {'Next'}
              </Button>
            </div>
          </aside>
          <div className={'mailroom-reader-stage'}>
            <div id={'mailroomEmpty'} className={'mailroom-empty'}>
              <Icon icon={Inbox} size={36} />
              <p className="ui-eyebrow">YOUR CONVERSATION DESK</p>
              <h2>{'Choose a conversation'}</h2>
              <p>
                Choose a carrier from the inbox to read their history, review the evidence and
                prepare your next reply.
              </p>
              <ol className="mailroom-workflow">
                <li>Read the conversation</li>
                <li>Write and review your reply</li>
                <li>Continue in your mailbox</li>
              </ol>
              <Button className={'secondary'} id={'mailroomEmptyTools'}>
                {'Set up mailbox capture'}
              </Button>
            </div>
            <p id={'mailroomLoading'} className={'mailroom-empty'} role={'status'} hidden={true}>
              {'Opening conversation…'}
            </p>
            <section id={'replyInspector'} className={'mailroom-reader'} hidden={true}>
              <header className={'mailroom-subject-bar'}>
                <Button size="sm" id={'replyClose'} className={'secondary mailroom-back'}>
                  {'Back to inbox'}
                </Button>
                <h2 id={'replyThreadTitle'}>{'Conversation'}</h2>
                <Button size="sm" id={'replyThreadRefresh'} className={'secondary'}>
                  {'Refresh'}
                </Button>
                <Button size="sm" id={'mailroomDetailsOpen'} className={'secondary'}>
                  {'Details'}
                </Button>
              </header>
              <div id={'carrierRecord'} className={'carrier-record'} hidden={true}>
                <div>
                  <strong id={'carrierRecordLabel'}></strong>
                  <p id={'carrierHistoryNote'} className={'hint'}></p>
                </div>
                <Button size="sm" id={'carrierManage'} className={'secondary'}>
                  {'Carrier status'}
                </Button>
              </div>
              <p id={'mailroomFilterNote'} className={'hint'} hidden={true}></p>
              <div id={'replyThread'} className={'mailroom-thread'}></div>
              <p id={'mailroomHold'} className={'mailroom-hold'} role={'status'} hidden={true}></p>
              <Button id={'mailroomResolve'} className={'secondary'} hidden={true}>
                {'Review conversation match'}
              </Button>
              <section id={'replyAssistant'} className={'reply-assistant'} hidden={true}>
                <p id={'assistantStatus'} className={'hint'} role={'status'}></p>
                <p
                  id={'assistantError'}
                  className={'experiment-error'}
                  role={'alert'}
                  hidden={true}
                ></p>
                <div className={'assistant-draft'}>
                  <div className={'mailroom-compose-heading'}>
                    <h3>
                      {'Compose reply '}
                      <span>{'(draft)'}</span>
                    </h3>
                    <p id={'assistantDraftBasis'} className={'hint'}></p>
                    <Button id={'mailroomCarrierDetails'} className={'secondary'} hidden>
                      {'Details'}
                    </Button>
                  </div>
                  <label htmlFor={'assistantBody'}>
                    <span className={'sr-only'}>{'Write in your own words'}</span>
                    <Textarea
                      id={'assistantBody'}
                      rows={7}
                      maxLength={12000}
                      placeholder={'Write a reply in your own words…'}
                    />
                  </label>
                  <p
                    id={'assistantDraftState'}
                    className={'hint'}
                    role={'status'}
                    aria-live={'polite'}
                  ></p>
                  <div className={'experiment-buttons mailroom-compose-actions'}>
                    <Button id={'assistantSaveDraft'} className={'secondary'}>
                      {'Save draft'}
                    </Button>
                    <Button id={'assistantSuggest'} className={'secondary'}>
                      {'Help with wording'}
                    </Button>{' '}
                    <details id={'assistantSavedReplies'} className={'mailroom-saved-lines'}>
                      <summary>{'Saved lines'}</summary>
                      <div className={'mailroom-lines-popover'}>
                        <label htmlFor={'assistantSavedSearch'}>
                          {'Find saved replies'}
                          <Input
                            id={'assistantSavedSearch'}
                            type={'search'}
                            placeholder={'Search name, purpose or wording'}
                          />
                        </label>
                        <div id={'assistantSavedCards'} className={'saved-reply-list'}></div>
                        <Button id={'mailroomManageLines'} className={'secondary'}>
                          {'Manage saved replies'}
                        </Button>
                      </div>
                    </details>
                    <Button
                      variant="primary"
                      id={'assistantReviewOpen'}
                      className={'primary mailroom-review-primary'}
                    >
                      {'Review reply'}
                    </Button>
                  </div>
                  <Select
                    id={'assistantTemplate'}
                    hidden={true}
                    aria-hidden={'true'}
                    tabIndex={-1}
                  ></Select>
                  <section
                    id={'assistantWordingPreview'}
                    className={'wording-preview'}
                    hidden={true}
                  >
                    <h4 id={'assistantWordingName'}></h4>
                    <pre id={'assistantWordingText'}></pre>
                    <p className={'hint'}>
                      {'Preview only. Choose where to put it, then edit it freely.'}
                    </p>
                    <div className={'experiment-buttons'}>
                      <Button id={'assistantInsertWording'} className={'secondary'}>
                        {'Insert at cursor'}
                      </Button>
                      <Button id={'assistantReplaceWording'} className={'secondary'}>
                        {'Replace reply'}
                      </Button>
                      <Button id={'assistantDismissWording'} className={'secondary'}>
                        {'Close preview'}
                      </Button>
                    </div>
                  </section>
                  <div
                    id={'mailroomApprovedActions'}
                    className={'experiment-buttons'}
                    hidden={true}
                  >
                    <Button id={'assistantCopy'} className={'secondary'}>
                      {'Copy approved reply'}
                    </Button>
                    <ActionLink
                      id={'assistantMailbox'}
                      className={'button secondary'}
                      target={'_blank'}
                      rel={'noopener noreferrer'}
                      hidden={true}
                    >
                      {'Open my mailbox'}
                    </ActionLink>
                  </div>
                  <p className={'hint'}>
                    {
                      'You send from your existing mailbox. Use native Reply and paste above your signature.'
                    }
                  </p>
                  <details id={'mailroomSentReport'} hidden={true}>
                    <summary>{'After sending in your mailbox'}</summary>
                    <label>
                      {'Mailbox action evidence'}
                      <Input
                        id={'assistantSentNote'}
                        maxLength={2000}
                        placeholder={'Record what you checked in your mailbox'}
                      />
                    </label>
                    <label className={'check'}>
                      <Input id={'assistantSentConfirm'} type={'checkbox'} />
                      {'I sent this approved reply myself in the correct mailbox/thread.'}
                    </label>
                    <Button id={'assistantReportSent'} className={'secondary'}>
                      {'Record my mailbox action'}
                    </Button>
                    <p className={'hint'}>
                      {'Your report, a matching Sent copy and delivery evidence remain separate.'}
                    </p>
                  </details>
                  <details>
                    <summary>{'Draft options & history'}</summary>
                    <div className={'experiment-buttons'}>
                      <Button id={'assistantNewDraft'} className={'secondary'}>
                        {'New draft'}
                      </Button>
                      <Button id={'assistantCancelDraft'} className={'secondary'}>
                        {'Cancel saved draft / approval'}
                      </Button>
                      <Button id={'assistantSaveAsWording'} className={'secondary'}>
                        {'Save this wording for reuse'}
                      </Button>
                    </div>
                    <div id={'assistantHistory'}></div>
                  </details>
                </div>
              </section>
            </section>
          </div>
        </div>
        <ConversationFiltersDialog />
        <MailboxToolsDialog />
        <Dialog
          id={'mailroomDetailsDialog'}
          className={'mailroom-dialog mailroom-wide'}
          aria-label={'Conversation details'}
        >
          <div className={'mailroom-dialog-heading'}>
            <h2>{'Conversation details'}</h2>
            <Button size="sm" className={'secondary'} data-close-mailroom={'mailroomDetailsDialog'}>
              {'Close details'}
            </Button>
          </div>
          <section id={'carrierStatusPanel'} className={'carrier-status-panel'} hidden={true}>
            <h3>{'Carrier workflow'}</h3>
            <label>
              {'Status'}
              <Select id={'carrierStage'}>
                <option value={'waiting'}>{'Waiting for a response'}</option>
                <option value={'in_review'}>{'In review'}</option>
                <option value={'active'}>{'Active conversation'}</option>
                <option value={'follow_up'}>{'Follow up'}</option>
                <option value={'signed'}>{'Signed'}</option>
                <option value={'closed'}>{'Closed'}</option>
              </Select>
            </label>
            <label>
              {'Follow-up date'}
              <Input id={'carrierFollowUpAt'} type={'datetime-local'} />
            </label>
            <label>
              {'Status / follow-up note'}
              <Textarea id={'carrierStatusNote'} maxLength={2000} rows={2} />
            </label>
            <div className={'experiment-buttons'}>
              <Button id={'carrierStatusSave'} className={'secondary'}>
                {'Save carrier status'}
              </Button>
              <Button id={'carrierStatusReload'} className={'secondary'} hidden={true}>
                {'Reload saved status'}
              </Button>
              <Button id={'carrierSeen'} className={'secondary'}>
                {'Mark history read'}
              </Button>
            </div>
            <p id={'carrierStatusResult'} className={'hint'} role={'status'}></p>
            <p className={'hint'}>
              {
                'Status labels and dates are for your workflow. They do not send email or clear opt-outs, uncertain sends or thread review requirements.'
              }
            </p>
          </section>
          <section id="carrierHandoffPanel" hidden>
            <h3>Prepare a carrier handoff</h3>
            <p className="hint">
              Download reviewed facts and their evidence references for a manual handoff. This does
              not assign shared ownership, record acceptance or authorize contact. Save workflow
              edits first.
            </p>
            <label htmlFor="carrierHandoffOwner">Intended owner</label>
            <Input id="carrierHandoffOwner" maxLength={100} />
            <label htmlFor="carrierHandoffNextStep">Reviewed next step</label>
            <Textarea id="carrierHandoffNextStep" rows={3} maxLength={2000} />
            <label className="check">
              <Input id="carrierHandoffConfirm" type="checkbox" />I reviewed this carrier’s
              evidence, holds and next step.
            </label>
            <Button id="carrierHandoffExport" className="secondary">
              Download carrier handoff
            </Button>
          </section>
          <p id={'mailroomReplyHistory'} className={'hint'}></p>
          <details>
            <summary>{'Full thread & message evidence'}</summary>
            <div id={'mailroomThreadHistory'}></div>
          </details>
          <div className={'experiment-buttons'}>
            <Button id={'replyMarkRead'} className={'secondary'}>
              {'Mark read'}
            </Button>
            <Button id={'replyMarkUnread'} className={'secondary'}>
              {'Mark unread'}
            </Button>
            <Button id={'replyStartThread'} className={'secondary'} hidden={true}>
              {'Create conversation'}
            </Button>
          </div>
          <div id={'assistantIntent'} className={'carrier-evidence'}></div>{' '}
          <details id={'assistantCarrierDetails'}>
            <summary>{'Carrier details & source evidence'}</summary>
            <p className={'hint'}>
              {
                'Extracted values are suggestions. Confirm each value against its matched carrier message. A reviewed email statement does not verify phone ownership or carrier authority.'
              }
            </p>
            <div id={'assistantDetails'}></div>
            <label className={'check'}>
              <Input id={'assistantDetailsConfirm'} type={'checkbox'} />
              {'I reviewed the carrier-stated values and their source messages.'}
            </label>
            <label>
              {'Detail review note'}
              <Input id={'assistantDetailsNote'} maxLength={2000} />
            </label>
            <Button id={'assistantConfirmDetails'} className={'secondary'}>
              {'Confirm selected details'}
            </Button>
            <details>
              <summary>{'Confirm a value the extractor missed'}</summary>
              <label>
                {'Field'}
                <Select id={'assistantManualField'}></Select>
              </label>
              <label>
                {'Carrier-stated value'}
                <Input id={'assistantManualValue'} maxLength={240} />
              </label>
              <label>
                {'Source carrier message'}
                <Select id={'assistantManualSource'}></Select>
              </label>
              <label>
                {'Exact quote containing the value'}
                <Textarea id={'assistantManualQuote'} rows={2} maxLength={1000} />
              </label>
              <Button id={'assistantManualConfirm'} className={'secondary'}>
                {'Confirm cited value'}
              </Button>
            </details>
          </details>{' '}
          <section id={'replyReviewPanel'} className={'reply-review'} hidden={true}>
            <h3>{'Review selected message'}</h3>
            <p id={'replyReviewEvidence'} className={'hint'}></p>
            <label htmlFor={'replyReviewCategory'}>
              {'Category'}
              <Select id={'replyReviewCategory'}></Select>
            </label>
            <div id={'replyMatchPanel'} hidden={true}>
              <label htmlFor={'replyLink'}>
                {'Choose conversation'}
                <Select id={'replyLink'}></Select>
              </label>
              <label className={'check'}>
                <Input id={'replyLinkConfirm'} type={'checkbox'} />
                {'I checked the original evidence and confirm this manual link.'}
              </label>
              <p className={'hint'}>
                {
                  'A manual link requires a note explaining the evidence. Subject similarity alone is insufficient.'
                }
              </p>
            </div>
            <label htmlFor={'replyReviewNote'}>
              {'Review / evidence note'}
              <Textarea id={'replyReviewNote'} rows={4} maxLength={2000} />
            </label>
            <div className={'experiment-buttons'}>
              <Button id={'replyReviewSave'}>{'Save reply review'}</Button>
              <Button id={'replyIgnore'} className={'secondary'} hidden={true}>
                {'Ignore review item'}
              </Button>
              <Button id={'replyUnignore'} className={'secondary'} hidden={true}>
                {'Return to review'}
              </Button>
            </div>
            <p className={'hint'}>
              {
                'Drafts stay while navigating this page. Reload discards unsaved drafts. Changing a category or ignoring a review item never clears an existing opt-out protection.'
              }
            </p>
          </section>
        </Dialog>
        <Dialog
          id={'mailroomLibraryDialog'}
          className={'mailroom-dialog mailroom-wide'}
          aria-label={'Saved replies'}
        >
          <div className={'mailroom-dialog-heading'}>
            <h2>{'Saved replies'}</h2>
            <Button size="sm" className={'secondary'} data-close-mailroom={'mailroomLibraryDialog'}>
              {'Close saved replies'}
            </Button>
          </div>{' '}
          <details className={'panel reply-library'}>
            <summary>{'Manage saved replies & follow-up rules'}</summary>
            <p className={'hint'}>
              {
                'Saved wording is optional. Preview it inside a conversation before using it. Initial outreach templates are separate.'
              }
            </p>
            <div className={'reply-library-grid'}>
              <div>
                <label htmlFor={'replyLibrarySearch'}>
                  {'Find saved replies'}
                  <Input
                    id={'replyLibrarySearch'}
                    type={'search'}
                    placeholder={'Search name or wording'}
                  />
                </label>
                <div id={'replyLibraryCards'} className={'saved-reply-list'}></div>
              </div>
              <div>
                <label>
                  {'Saved reply'}
                  <Select id={'replyLibrarySelect'}></Select>
                </label>
                <Button id={'replyLibraryNew'} className={'secondary'}>
                  {'New template'}
                </Button>
                <label>
                  {'Name'}
                  <Input id={'replyLibraryName'} maxLength={100} />
                </label>
                <label>
                  {'Use for'}
                  <Select id={'replyLibraryCategory'}>
                    <option value={'interested'}>{'Interested'}</option>
                    <option value={'positive'}>{'Positive response'}</option>
                    <option value={'pricing'}>{'Pricing question'}</option>
                    <option value={'how_it_works'}>{'How it works'}</option>
                    <option value={'neutral'}>{'Clarify / neutral'}</option>
                    <option value={'negative'}>{'Acknowledge decline'}</option>
                    <option value={'follow_up'}>{'No-response follow-up'}</option>
                  </Select>
                </label>
                <label>
                  {'Body'}
                  <Textarea id={'replyLibraryBody'} rows={8} maxLength={12000} />
                </label>
                <p id={'replyLibraryVariables'} className={'hint'}></p>
                <label className={'check'}>
                  <Input id={'replyLibraryActive'} type={'checkbox'} defaultChecked={true} />
                  {'Active template'}
                </label>
                <div id={'replyLibraryFields'} className={'template-field-buttons'}></div>
                <div className={'experiment-buttons'}>
                  <Button id={'replyLibrarySave'}>{'Save wording'}</Button>
                  <Button id={'replyLibraryCopy'} className={'secondary'}>
                    {'Save as new copy'}
                  </Button>
                </div>
                <p id={'replyLibraryVersion'} className={'hint'}></p>
              </div>
            </div>
            <div className={'reply-config-grid'}>
              <label>
                {'Wait days before suggesting a follow-up'}
                <Input
                  id={'replyFollowDays'}
                  type={'number'}
                  min={'1'}
                  max={'30'}
                  defaultValue={'3'}
                />
              </label>
              <label>
                {'Maximum reviewed follow-ups'}
                <Input
                  id={'replyFollowMax'}
                  type={'number'}
                  min={'1'}
                  max={'3'}
                  defaultValue={'1'}
                />
              </label>
              <Button id={'replyFollowSave'} className={'secondary'}>
                {'Save follow-up rules'}
              </Button>
            </div>
            <p
              id={'replyLibraryStatus'}
              className={'hint'}
              role={'status'}
              aria-live={'polite'}
            ></p>
          </details>
        </Dialog>
        <Dialog
          id={'mailroomApprovalDialog'}
          className={'mailroom-dialog'}
          aria-label={'Review and approve reply'}
        >
          <div className={'mailroom-dialog-heading'}>
            <h2>{'Review this reply'}</h2>
            <Button
              size="sm"
              className={'secondary'}
              data-close-mailroom={'mailroomApprovalDialog'}
            >
              {'Close review'}
            </Button>
          </div>
          <p id={'mailroomApprovalRecipient'} className={'hint'}></p>
          <pre id={'mailroomApprovalBody'}></pre>
          <p
            id={'mailroomApprovalError'}
            className={'experiment-error'}
            role={'alert'}
            hidden={true}
          ></p>{' '}
          <details id={'assistantReview'}>
            <summary>{'Review & approve this reply'}</summary>
            <p className={'hint'}>
              {
                'Check the exact text above and the sending account/recipient. Changes require fresh approval.'
              }
            </p>
            <label htmlFor={'assistantApprovalNote'}>
              {'Approval note'}
              <Input
                id={'assistantApprovalNote'}
                maxLength={2000}
                placeholder={'What you reviewed'}
              />
            </label>
            <label className={'check'}>
              <Input id={'assistantApproveConfirm'} type={'checkbox'} />
              {'I reviewed this exact text, recipient, sending account and message evidence.'}
            </label>
            <Button variant="primary" id={'assistantApprove'}>
              {'Approve this exact draft'}
            </Button>
          </details>
        </Dialog>
      </section>
    </>
  );
}
