import { Button, Input, Select } from '../../design-system/primitives';
import { uiScope } from '../../shared/lifecycle';
import { contentOr } from '../../shared/regions';
import { renderRegion } from '../../shared/regions';
import { displayText } from '../../shared/utils';
import type { CaptureMailbox, SetupCandidate } from '../../shared/types/conversations';
import { eventElement } from '../../shared/dom';
import { errorMessage } from '../../shared/utils';
import { element as $ } from '../../shared/dom';
import { notice, api } from '../../shared/runtime';
import { closePreviewDrawer } from '../drawer/controller';

export function mountCarrierWorkspace() {
  (() => {
    if (!$('view-conversations')) return;
    let loaded = false,
      dirty = false,
      saving = false,
      mailboxes: CaptureMailbox[] = [],
      setupCandidates: SetupCandidate[] = [];
    const field = (
      key: string,
      label: string,
      value: string | number = '',
      type = 'text',
      help?: string,
    ) => (
      <>
        <label
          data-config-auth={
            key === 'passwordEnv' ? 'password' : key === 'accessTokenEnv' ? 'oauth' : undefined
          }
        >
          {label}
          <Input
            data-config-field={key}
            type={type}
            defaultValue={displayText(value)}
            {...{ min: key === 'port' ? 1 : undefined, max: key === 'port' ? 65535 : undefined }}
          />
          {help && <small className="hint">{help}</small>}
        </label>
      </>
    );
    const providerHelp = (provider?: string) =>
      provider === 'outlook'
        ? 'Outlook capture in this app requires a provider-authorized OAuth token reference.'
        : ['gmail', 'yahoo'].includes(provider || '')
          ? 'For Gmail or Yahoo, choose OAuth or a provider-approved app password.'
          : 'Use the sign-in method authorized by your provider. This app requires TLS port 993.';
    function renderMailboxes() {
      renderRegion(
        $('replyConfigMailboxes'),
        contentOr(
          mailboxes.map((c, index) => (
            <article
              key={c.id || index}
              className="reply-config-mailbox"
              data-config-index={index}
              data-auth-mode={c.authMode || (c.accessTokenEnv ? 'oauth' : 'password')}
            >
              <div className="mailbox-config-heading">
                <div>
                  <span className="page-eyebrow">Mailbox {index + 1}</span>
                  <h3>{c.email || 'New mailbox connection'}</h3>
                </div>
                <Button type="button" size="sm" variant="ghost" data-config-remove={index}>
                  Remove
                </Button>
              </div>
              <div className="reply-config-grid">
                {field(
                  'email',
                  'Mailbox email',
                  c.email,
                  'email',
                  'The sending identity whose replies you want in Unibox.',
                )}
                {field(
                  'host',
                  'IMAP server',
                  c.host,
                  'text',
                  'The incoming-mail server supplied by your email provider.',
                )}
                <label>
                  Provider
                  <Select
                    data-config-field="provider"
                    defaultValue={c.provider === 'privateemail' ? 'custom' : c.provider || 'custom'}
                  >
                    {[
                      ['custom', 'Private Email / other'],
                      ['gmail', 'Gmail'],
                      ['yahoo', 'Yahoo'],
                      ['outlook', 'Outlook'],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </label>
                <label>
                  How this mailbox signs in
                  <Select
                    data-config-field="authMode"
                    defaultValue={c.authMode || (c.accessTokenEnv ? 'oauth' : 'password')}
                  >
                    {[
                      ['password', 'Provider password'],
                      ['app_password', 'Provider app password'],
                      ['oauth', 'OAuth token'],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </label>
                <p className="mailbox-provider-help hint" data-config-provider-help>
                  {providerHelp(c.provider)}
                </p>
                {field(
                  'passwordEnv',
                  'Password variable name',
                  c.passwordEnv,
                  'text',
                  'Enter a variable name, for example REPLY_PASSWORD—not the password. Its value must already be configured in this PC’s .env file.',
                )}
                {field(
                  'accessTokenEnv',
                  'OAuth token variable name',
                  c.accessTokenEnv,
                  'text',
                  'Enter the variable name holding the provider token—not the token itself. Provider enrollment and token refresh are managed separately.',
                )}
              </div>
              <details className="mailbox-tools-advanced">
                <summary>Login, folders & connection details</summary>
                <div className="reply-config-grid">
                  {field(
                    'user',
                    'Login username',
                    c.user,
                    'text',
                    'Leave blank to use the mailbox email.',
                  )}
                  {field(
                    'port',
                    'TLS port',
                    c.port || 993,
                    'number',
                    'TLS is required; use the port supplied by your provider.',
                  )}
                  {field('inboxFolder', 'Inbox folder', c.inboxFolder || 'INBOX')}
                  {field(
                    'sentFolder',
                    'Sent folder',
                    c.sentFolder,
                    'text',
                    'Leave blank to detect the Sent folder automatically.',
                  )}
                  {field(
                    'id',
                    'Connection ID',
                    c.id,
                    'text',
                    'A unique internal name for this capture connection.',
                  )}
                </div>
              </details>
              <p className="hint">
                Removing this connection changes the draft only. Captured messages and opt-out
                protections are retained.
              </p>
            </article>
          )),
          <>
            <p className={'hint'}>
              {
                'No mailbox added yet. Choose a saved connection above or add a mailbox manually. You can also import one exported reply without connecting a provider.'
              }
            </p>
          </>,
        ),
      );
    }
    function readMailboxes() {
      return Array.from(
        document.querySelectorAll<HTMLElement>('[data-config-index]'),
        (element) => {
          const config: Record<string, string | number> = { id: '' };
          for (const input of element.querySelectorAll<HTMLElement>('[data-config-field]')) {
            const value = (input as HTMLInputElement).value.trim();
            if (value)
              config[input.dataset.configField!] =
                input.dataset.configField === 'port' ? Number(value) : value;
          }
          return config as unknown as CaptureMailbox;
        },
      );
    }
    uiScope.listen(window, 'fc-capture-status', ({ detail }) => {
      const shared = detail.sharedProtection;
      const nextTitle = document.getElementById('mailroomNextStepTitle');
      const nextText = document.getElementById('mailroomNextStepText');
      if (nextTitle)
        nextTitle.textContent = detail.running
          ? 'A mailbox check is in progress'
          : detail.configurationError ||
              detail.captureError ||
              detail.mailboxes.some((mailbox) => mailbox.status === 'Needs attention')
            ? 'Review the connection that needs attention'
            : detail.enabled
              ? 'Capture is enabled'
              : 'Set up read-only reply capture';
      if (nextText)
        nextText.textContent = detail.running
          ? 'You can close this window. Progress remains visible in Unibox, and saved scan progress can be resumed.'
          : detail.enabled
            ? 'Review the connection status below. Close these tools and use Scan previous replies to check available history; automatic checks run while the app is open if enabled.'
            : 'First add an authorized mailbox in Set up capture. Already have an exported reply? Import a reply works without a provider connection.';
      setupCandidates = detail.setupCandidates || [];
      const selected = $('replyExistingMailbox').value;
      renderRegion(
        $('replyExistingMailbox'),
        <>
          <option value={''}>{'Choose a saved mailbox setup…'}</option>
          {setupCandidates.map((c) => (
            <>
              <option value={displayText(c.id)}>
                {displayText(c.name + ' · ' + c.email)}
                {c.credentialsConfigured ? ' · login available' : ' · credential missing'}
              </option>
            </>
          ))}
        </>,
      );
      $('replyExistingMailbox').value = selected;
      $('replyUseExistingMailbox').disabled = !setupCandidates.length;
      $('replyExistingMailboxNote').textContent = setupCandidates.length
        ? 'Existing delivery-monitor setup is available. Reuse it, enable capture, authorize read-only access and save.'
        : 'No matching delivery-monitor setup found. Add the mailbox and its credential environment-variable name below.';
      $('replyStopCapture').disabled = !detail.running;
      $('replyConfigNote').textContent =
        `${detail.configurationSource || ''} · ${detail.protectionHealth || ''}. ${shared?.enabled ? `${shared.pending} opt-out(s) awaiting coordinator sync.` : 'Independent PC: opt-outs are local. Configure the team coordinator for shared sending protection.'}`;
      if (loaded || dirty || !detail.configuration) return;
      loaded = true;
      const c = detail.configuration;
      mailboxes = c.mailboxes;
      $('replyConfigEnabled').checked = c.enabled;
      $('replyConfigAuto').checked = c.auto;
      $('replyConfigSince').value = c.since;
      $('replyConfigBatch').value = String(c.batch);
      $('replyConfigAll').checked = c.allHistory === true;
      $('replyConfigAllFolders').checked = c.allFolders === true;
      $('replyConfigPages').value = String(c.pages || 5);
      $('replyConfigSince').disabled = c.allHistory === true;
      renderMailboxes();
    });
    uiScope.handler($('replyUseExistingMailbox'), 'onclick', () => {
      const c = setupCandidates.find((c) => c.id === $('replyExistingMailbox').value);
      if (!c) {
        notice('Choose an existing mailbox setup first.');
        return;
      }
      mailboxes = readMailboxes();
      if (mailboxes.some((m) => m.email?.toLowerCase() === c.email.toLowerCase())) {
        notice('That mailbox is already in the capture settings.');
        return;
      }
      if (mailboxes.length >= 20) {
        notice('Up to 20 mailboxes are supported.');
        return;
      }
      const { name, credentialsConfigured, ...config } = c;
      mailboxes.push(config);
      dirty = true;
      renderMailboxes();
      notice(
        'Mailbox setup added to your settings draft. Enable capture, authorize read-only access and save.',
      );
    });
    uiScope.handler($('replyConfigAll'), 'onchange', () => {
      $('replyConfigSince').disabled = $('replyConfigAll').checked;
      dirty = true;
    });
    uiScope.handler($('replyStopCapture'), 'onclick', async () => {
      try {
        await api('/api/conversations/stop-capture', {});
        notice('Stopping capture. Saved messages and cursors are retained.');
      } catch (e) {
        notice(errorMessage(e));
      }
    });
    uiScope.handler($('replyConfigPanel'), 'oninput', () => {
      dirty = true;
    });
    uiScope.handler($('replyConfigAdd'), 'onclick', () => {
      if (saving) return;
      mailboxes = readMailboxes();
      if (mailboxes.length >= 20) {
        notice('Up to 20 mailboxes are supported.');
        return;
      }
      mailboxes.push({ id: 'mailbox-' + crypto.randomUUID().slice(0, 8) });
      dirty = true;
      renderMailboxes();
    });
    uiScope.listen($('replyConfigMailboxes'), 'change', (event) => {
      const target = eventElement(event);
      if (target.dataset.configField === 'provider') {
        const help = target
          .closest('[data-config-index]')
          ?.querySelector('[data-config-provider-help]');
        if (help) help.textContent = providerHelp((target as HTMLSelectElement).value);
      }
      if (target.dataset.configField === 'authMode') {
        const card = target.closest<HTMLElement>('[data-config-index]');
        if (card) card.dataset.authMode = (target as HTMLSelectElement).value;
      }
    });
    uiScope.handler($('replyConfigMailboxes'), 'onclick', (event) => {
      const b = eventElement(event).closest<HTMLElement>('[data-config-remove]');
      if (!b || saving) return;
      mailboxes = readMailboxes();
      mailboxes.splice(Number(b.dataset.configRemove), 1);
      dirty = true;
      renderMailboxes();
    });
    uiScope.handler($('replyConfigSave'), 'onclick', async () => {
      if (saving) return;
      saving = true;
      const b = $('replyConfigSave');
      const fields = document.getElementById('mailroomConfigFields');
      if (fields instanceof HTMLFieldSetElement) fields.disabled = true;
      const feedback = document.getElementById('mailroomConfigFeedback');
      if (feedback) feedback.textContent = 'Saving capture settings…';
      b.textContent = 'Saving…';
      b.disabled = true;
      try {
        await api('/api/conversations/config', {
          enabled: $('replyConfigEnabled').checked,
          auto: $('replyConfigAuto').checked,
          since: $('replyConfigSince').value,
          batch: Number($('replyConfigBatch').value),
          allHistory: $('replyConfigAll').checked,
          allFolders: $('replyConfigAllFolders').checked,
          pages: Number($('replyConfigPages').value),
          mailboxes: readMailboxes().map((mailbox) => {
            const active = { ...mailbox };
            if (active.authMode === 'oauth') delete active.passwordEnv;
            else delete active.accessTokenEnv;
            return active;
          }),
          confirmReadOnly: $('replyConfigConfirm').checked,
        });
        loaded = false;
        dirty = false;
        $('replyConfigConfirm').checked = false;
        window.dispatchEvent(new Event('fc-conversation-view'));
        if (feedback)
          feedback.textContent = 'Capture settings saved. Secret values were not stored.';
        notice('Read-only capture configuration saved. Secret values were not stored.');
      } catch (e) {
        if (feedback) feedback.textContent = errorMessage(e) + ' Your settings draft is retained.';
        notice(errorMessage(e));
      } finally {
        saving = false;
        if (fields instanceof HTMLFieldSetElement) fields.disabled = false;
        b.textContent = 'Save capture settings';
        b.disabled = false;
      }
    });
    uiScope.listen(document, 'click', (event) => {
      const button = eventElement(event).closest<HTMLElement>('[data-conversation-email]');
      if (!button) return;
      closePreviewDrawer();
      location.hash = 'conversations';
      window.dispatchEvent(
        new CustomEvent('fc-conversation-search', { detail: button.dataset.conversationEmail }),
      );
    });
  })();
}
