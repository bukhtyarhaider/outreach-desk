import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completedCoverage,
  followUpCoverage,
  FOLLOW_UP_COVERAGE_MAX_AGE_MS as ttl,
} from '../src/follow-up-coverage.mjs';
import { workspace } from './fixtures/carrier-workspace.mjs';
import { account, recipient, eml } from './fixtures/replies.mjs';
import { replyCaptureConfig } from '../src/reply-capture.mjs';
const now = Date.parse('2026-11-04T12:00:00Z');
function proofFixture() {
  const root = { id: 'root', account, recipient, source: 'local_sent_history', messageIds: [] };
  const state = { roots: { root }, messages: {}, monitors: {} };
  const mailbox = { id: 'one', email: account, host: 'mail.example.invalid', user: account };
  const config = {
    generation: 'one',
    enabled: true,
    allHistory: true,
    allFolders: true,
    since: '1970-01-01',
    mailboxes: [mailbox],
  };
  state.monitors.one = {
    status: 'Checked',
    coverage: completedCoverage(state, config, mailbox, null, now),
  };
  return { root, state, config, mailbox };
}
test('proactive coverage requires this mailbox, current scope/configuration, successful folders and fresh evidence', () => {
  const { root, state, config } = proofFixture();
  const check = (s = state, c = config, time = now) => followUpCoverage(s, root, c, time);
  assert.equal(check().ready, true);
  assert.equal(check().expiresAt, new Date(now + ttl).toISOString());
  assert.equal(check(state, { ...config, enabled: false }).ready, false);
  assert.equal(check(state, { ...config, mailboxes: [] }).ready, false);
  assert.equal(check({ ...state, monitors: {} }).ready, false);
  assert.equal(
    check({ ...state, monitors: { ...state.monitors, _history: { status: 'Running' } } }).ready,
    false,
  );
  assert.equal(
    check({ ...state, monitors: { ...state.monitors, _capture: { status: 'Needs attention' } } })
      .ready,
    false,
  );
  for (const status of ['Needs attention', 'Stopped', 'Backfill in progress'])
    assert.equal(
      check({ ...state, monitors: { one: { ...state.monitors.one, status } } }).ready,
      false,
    );
  assert.equal(check(state, { ...config, generation: 'changed' }).ready, false);
  assert.equal(
    check({
      ...state,
      roots: {
        ...state.roots,
        newRoot: { ...root, id: 'newRoot', recipient: 'other@example.com' },
      },
    }).ready,
    false,
  );
  assert.equal(
    check({
      ...state,
      roots: {
        ...state.roots,
        anotherMailbox: { ...root, id: 'anotherMailbox', account: 'other@example.com' },
      },
    }).ready,
    true,
  );
  assert.equal(check(state, config, now + ttl).ready, false);
  assert.equal(check(state, config, now - 1).ready, false);
  const slowScan = completedCoverage(state, config, config.mailboxes[0], null, now, {
    observedAt: now - ttl,
  });
  assert.equal(
    check({ ...state, monitors: { one: { status: 'Checked', coverage: slowScan } } }).ready,
    false,
    'late completion cannot disguise old observations',
  );
});
test('healthy renewal keeps approvals stable; failure, expiry, full review and configuration changes create new epochs', () => {
  const { state, config, mailbox } = proofFixture(),
    previous = state.monitors.one;
  assert.equal(
    completedCoverage(state, config, mailbox, previous, now + 60000).epoch,
    previous.coverage.epoch,
  );
  assert.notEqual(
    completedCoverage(state, config, mailbox, previous, now + ttl).epoch,
    previous.coverage.epoch,
  );
  assert.notEqual(
    completedCoverage(state, config, mailbox, { coverage: null }, now + 60000).epoch,
    previous.coverage.epoch,
  );
  assert.notEqual(
    completedCoverage(state, config, mailbox, previous, now + 60000, { historical: true }).epoch,
    previous.coverage.epoch,
  );
  assert.notEqual(
    completedCoverage(state, { ...config, generation: 'new' }, mailbox, previous, now + 60000)
      .epoch,
    previous.coverage.epoch,
  );
});
test('real capture pipeline creates proof, preserves healthy approvals, and cannot revive approvals after failure', async (t) => {
  const f = await workspace(t);
  let clock = now,
    broken = false,
    changeScope = false;
  f.ops.assistant.clock = () => clock;
  f.ops.capture.clock = () => clock;
  let detail = await f.ops.assistant.detail(
    (await f.ops.assistant.list()).rows[0].id,
    'conversation',
  );
  assert.equal(detail.assistant.followUpReady, false);
  await assert.rejects(
    f.ops.assistant.draft({
      rootId: detail.root.id,
      expectedContext: detail.assistant.version,
      requestId: 'no-capture-follow-up',
    }),
    /capture|scan/,
  );
  await f.ops.configure({
    enabled: true,
    auto: false,
    allHistory: true,
    allFolders: true,
    since: '1970-01-01',
    batch: 50,
    pages: 5,
    confirmReadOnly: true,
    mailboxes: [
      {
        id: 'one',
        email: account,
        host: 'mail.example.invalid',
        passwordEnv: 'TEST_CAPTURE_SECRET',
      },
    ],
  });
  f.ops.capture.env.TEST_CAPTURE_SECRET = 'SYNTHETIC_PRIVATE_PASSWORD';
  f.ops.capture.clientFactory = () => ({
    on() {},
    connect: async () => {},
    close() {},
    list: async () => [
      { path: 'INBOX' },
      { path: 'Sent', specialUse: '\\Sent' },
      { path: 'Archive' },
    ],
    mailboxOpen: async (folder, options) => {
      assert.equal(options.readOnly, true);
      if (broken && folder === 'Sent') throw new Error('Synthetic folder failure');
      if (changeScope && folder === 'Archive') {
        changeScope = false;
        await f.ops.replies.transaction((s) => {
          const original = Object.values(s.roots)[0];
          s.roots['new-during-scan'] = {
            ...original,
            id: 'new-during-scan',
            recipient: 'later@example.com',
          };
        });
      }
      return { uidValidity: 1 };
    },
    search: async () => [],
    fetchOne: async () => {
      throw new Error('No messages expected');
    },
  });
  const run = async (historical) =>
    f.ops.capture.run({ ...replyCaptureConfig(f.ops.capture.env, () => clock), historical });
  await run(true);
  detail = await f.ops.assistant.detail(detail.root.id, 'conversation');
  assert.equal(detail.assistant.followUpReady, true);
  const saved = await f.ops.assistant.draft({
    rootId: detail.root.id,
    expectedContext: detail.assistant.version,
    requestId: 'verified-capture-follow-up',
    body: 'Just following up. Which lanes are useful for you?',
  });
  await f.ops.assistant.approve({
    id: saved.draft.id,
    expectedVersion: saved.draft.version,
    expectedContext: detail.assistant.version,
    confirm: true,
    note: 'Reviewed complete recent coverage and exact follow-up',
  });
  const initial = (await f.ops.assistant.detail(detail.root.id, 'conversation')).assistant
    .followUpCoverage.epoch;
  clock += 61000;
  await run(false);
  assert.equal(
    (await f.ops.assistant.detail(detail.root.id, 'conversation')).assistant.followUpCoverage.epoch,
    initial,
  );
  await f.ops.assistant.approved(saved.draft.id);
  broken = true;
  clock += 61000;
  await run(false);
  assert.equal(
    (await f.ops.assistant.detail(detail.root.id, 'conversation')).assistant.followUpReady,
    false,
  );
  await assert.rejects(f.ops.assistant.approved(saved.draft.id), /scan|coverage/);
  broken = false;
  clock += 121000;
  await run(false);
  detail = await f.ops.assistant.detail(detail.root.id, 'conversation');
  assert.equal(detail.assistant.followUpReady, true);
  assert.notEqual(detail.assistant.followUpCoverage.epoch, initial);
  await assert.rejects(f.ops.assistant.approved(saved.draft.id), /review again/);
  changeScope = true;
  clock += 61000;
  await run(false);
  detail = await f.ops.assistant.detail(detail.root.id, 'conversation');
  assert.equal(
    detail.assistant.followUpCoverage.ready,
    false,
    'a scan cannot certify contact scope added after its earlier folders were read',
  );
  assert(!JSON.stringify(await f.ops.replies.load()).includes('SYNTHETIC_PRIVATE_PASSWORD'));
});
test('answering an existing human response does not require proactive follow-up coverage', async (t) => {
  const f = await workspace(t);
  await f.ops.replies.ingest(eml({ text: 'I am interested.' }), account);
  const root = (await f.ops.assistant.list()).rows[0],
    detail = await f.ops.assistant.detail(root.id, 'conversation');
  assert.equal(detail.assistant.followUpCoverage.ready, false);
  assert.equal(detail.assistant.needsReply, true);
  const draft = await f.ops.assistant.draft({
    rootId: root.id,
    expectedContext: detail.assistant.version,
    requestId: 'human-reply-no-capture',
    body: 'Thank you. What lanes do you prefer?',
  });
  assert.equal(draft.draft.kind, 'reply');
});
