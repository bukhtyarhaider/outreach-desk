// Explicit synthetic proof for tests of timing/drafts; this never connects to IMAP.
import { replyCaptureConfig } from '../../src/reply-capture.mjs';
import { completedCoverage } from '../../src/follow-up-coverage.mjs';
import { account } from './replies.mjs';
export async function healthyCapture(f, now = f.ops.assistant.clock()) {
  await f.ops.configure({ enabled: true, auto: false, allHistory: true, allFolders: true, since: '1970-01-01', batch: 50, pages: 5, confirmReadOnly: true,
    mailboxes: [{ id: 'coverage_fixture', email: account, host: 'mail.example.invalid', passwordEnv: 'SYNTHETIC_IMAP_PASSWORD' }] });
  const config = replyCaptureConfig(f.ops.capture.env, () => now), mailbox = config.mailboxes[0];
  await f.ops.replies.transaction(s => { s.monitors[mailbox.id] = { status: 'Checked', checkedAt: new Date(now).toISOString(), folders: [], coverage: completedCoverage(s, config, mailbox, null, now) }; });
  return config;
}
