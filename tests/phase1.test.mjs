import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { parseReply } from '../src/reply-parser.mjs';
import { MailboxMonitor } from '../src/mailbox-monitor.mjs';
import { initTracking } from '../src/tracking.mjs';

test('affirmative short stop requests are protected, negated requests remain distinct', async () => {
  for (const text of [
    'Please unsubscribe.',
    'Please stop.',
    'Do not send me any more emails.',
    'Remove my company from your list.',
    "Don't remove my notes. Please stop emailing us.",
  ]) {
    const r = await parseReply(`From: owner@example.com\r\nTo: rep@example.com\r\n\r\n${text}`);
    assert.equal(r.suggestion.definiteOptOut, true, text);
  }
  const r = await parseReply(
    "From: owner@example.com\r\nTo: rep@example.com\r\n\r\nDon't remove me. I am interested.",
  );
  assert.notEqual(r.suggestion.category, 'opt_out');
});
test('patched inbound address parser ignores nested comment addresses', async () => {
  const r = await parseReply(
    'From: Victim (x(y) <carrier@example.com>) <attacker@example.net>\r\nTo: rep@example.com\r\n\r\nHello',
  );
  assert.deepEqual(r.from, ['attacker@example.net']);
});
test('delivery scan retains cursor on missing metadata/source unless expunged', async () => {
  for (const missing of ['metadata', 'source']) {
    const state = { history: {} };
    initTracking(state);
    let saves = 0;
    const monitor = new MailboxMonitor({
      state,
      persist: async () => {
        saves++;
      },
    });
    const client = {
      mailboxOpen: async () => ({ uidValidity: 1 }),
      search: async () => [17],
      fetchOne: async (_uid, what) =>
        what.size ? (missing === 'metadata' ? null : { size: 10 }) : { source: null },
    };
    await assert.rejects(
      monitor.scan(client, { user: 'rep@example.com', host: 'mail.example.com' }, 'INBOX'),
      /cursor retained/,
    );
    assert.equal(saves, 0);
    assert.deepEqual(state.tracking.cursors, {});
  }
});
test('campaign deletion retains protection and working file, restores paused, and survives failed publication', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'phase1-'));
  let child;
  t.after(async () => {
    if (child?.exitCode === null) {
      const done = once(child, 'exit');
      child.kill();
      await done;
    }
    await fs.rm(dir, { recursive: true, force: true });
  });
  const workbook = path.join(dir, 'fixture.xlsx');
  execFileSync(process.platform === 'win32' ? 'python' : 'python3', [
    'tests/fixtures/workbook.py',
    workbook,
  ]);
  const port = 25983;
  child = spawn(
    process.execPath,
    ['--import', path.resolve('tests/fixtures/fake-mail.mjs'), 'src/server.mjs'],
    {
      env: {
        ...process.env,
        TEST_SEND_LOG: path.join(dir, 'sends.jsonl'),
        FC_DATA_DIR: dir,
        PORT: String(port),
        FC_FIREBASE_DISABLE: '1',
        FC_MONITOR_ENABLED: '0',
        FC_REPLY_CAPTURE_ENABLED: '0',
        FC_OPEN_TRACKING_ENABLED: '0',
      },
      stdio: 'ignore',
    },
  );
  const api = async (route, data) => {
    const r = await fetch(
      `http://127.0.0.1:${port}/api/${route}`,
      data === undefined
        ? {}
        : {
            method: 'POST',
            headers: { 'X-FC-Request': '1', 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          },
    );
    const value = await r.json();
    if (!r.ok) throw new Error(value.error);
    return value;
  };
  for (let n = 0; ; n++) {
    try {
      await api('state');
      break;
    } catch (e) {
      if (n > 100) throw e;
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  if (process.env.FC_BROWSER_TESTS === '1') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage();
      let states = 0;
      page.on('request', (r) => {
        if (r.url().includes('/api/state')) states++;
      });
      let failed = false;
      await page.route('**/api/history*', (route) => {
        if (!failed) {
          failed = true;
          return route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'temporary history error' }),
          });
        }
        return route.continue();
      });
      await page.goto(`http://127.0.0.1:${port}/#templates`);
      await page.locator('[data-edit-template]').first().waitFor();
      const button = page.locator('[data-edit-template]').first();
      await button.focus();
      await page.waitForTimeout(3300);
      assert(states >= 2, 'startup reporting error must not stop polling');
      assert(
        await button.evaluate((el) => document.activeElement === el),
        'polling must retain table focus',
      );
      await page.close();
    } finally {
      await browser.close();
    }
  }
  await api('import', { path: workbook });
  let s = await api('state');
  const first = s.activeCampaign;
  // Source opt-out exists before the second campaign is imported/reviewed.
  execFileSync(
    process.platform === 'win32' ? 'python' : 'python3',
    ['src/workbook.py', 'patch', path.join(dir, s.workbook.file)],
    {
      input: JSON.stringify({
        changes: [
          {
            id: (await api('leads')).leads[0].id,
            email: 'owner2@example.com',
            status: 'unsubscribe',
          },
        ],
      }),
    },
  );
  await api('reload', {});
  await api('import', { path: workbook });
  s = await api('state');
  const second = s.activeCampaign;
  // Review in the order that previously left the ready campaign's protection cache stale.
  for (const campaignId of [second, first]) {
    const preview = await api('import-review', { campaignId });
    const revision = await api('import-apply', {
      previewId: preview.previewId,
      confirmExperiment: true,
      provenance: { label: 'Synthetic authorized export', permission: 'unknown' },
    });
    const status = await api('imports?campaignId=' + campaignId);
    await api('import-activate', {
      campaignId,
      revisionId: revision.revisionId,
      expectedToken: status.activationToken,
      confirmActivation: true,
    });
  }
  await api('delete-campaign', { id: first });
  assert((await api('leads')).leads.find((l) => l.email === 'owner2@example.com').blocked);
  s = await api('state');
  assert.equal(s.deletedCampaigns.length, 1);
  assert.equal(
    (
      await fs.stat(
        path.join(
          dir,
          s.deletedCampaigns[0].id === first
            ? JSON.parse(await fs.readFile(path.join(dir, 'state.json'))).deletedCampaigns[0]
                .campaign.workbook.file
            : '',
        ),
      )
    ).isFile(),
    true,
  );
  await api('restore-campaign', { id: first });
  s = await api('state');
  assert.equal(s.campaigns.find((c) => c.id === first).enabled, false);
  const business = {
    company: 'Example',
    senderName: 'Rep',
    legalName: 'Example LLC',
    address: '123 Test Street',
    services: 'load coordination',
  };
  await api('profile', {
    id: s.activeProfile,
    email: 'rep@example.com',
    name: 'Rep',
    provider: 'privateemail',
    url: 'https://privateemail.com/spm/mail/INBOX/',
    business,
    autoReconnect: false,
  });
  s = await api('state');
  s.settings.business = business;
  s.settings.eligibility.requireActive = false;
  s.settings.eligibility.requireNoOutOfService = false;
  s.settings.pacing.minSeconds = 180;
  await api('settings', { settings: s.settings });
  await api('connect', { password: '' });
  const ready = (await api('leads')).leads.filter((l) => !l.blocked);
  assert(ready.length >= 2);
  const key = Object.keys(s.templates)[0];
  await api('prepare', { id: ready[0].id, key });
  await api('send', {});
  await api('prepare', { id: ready[1].id, key });
  await assert.rejects(api('send', {}), /Retry after/);
  await api('release', {});
  const target = s.campaigns.find((c) => c.id === second);
  await fs.mkdir(path.join(dir, 'state.json.tmp'));
  await assert.rejects(api('delete-campaign', { id: second }));
  assert((await fs.stat(path.join(dir, target.workbook.file))).isFile());
  const saved = JSON.parse(await fs.readFile(path.join(dir, 'state.json')));
  assert(saved.campaigns.some((c) => c.id === second));
  await fs.rmdir(path.join(dir, 'state.json.tmp'));
  await api('suppress', { email: 'local-only@example.com', reason: 'Test local hold' });
  await api('unsuppress', { email: 'local-only@example.com' });
  assert(
    !JSON.parse(await fs.readFile(path.join(dir, 'state.json'))).replySuppressionOutbox[
      'local-only@example.com'
    ],
  );
  const exited = once(child, 'exit');
  child.kill();
  await exited;
  const next = JSON.parse(await fs.readFile(path.join(dir, 'state.json')));
  next.settings.team = { enabled: true, url: 'http://127.0.0.1:25985', workerName: 'test' };
  await fs.writeFile(path.join(dir, 'state.json'), JSON.stringify(next));
  child = spawn(
    process.execPath,
    ['--import', path.resolve('tests/fixtures/fake-mail.mjs'), 'src/server.mjs'],
    {
      env: {
        ...process.env,
        TEST_SEND_LOG: path.join(dir, 'sends.jsonl'),
        FC_DATA_DIR: dir,
        PORT: String(port),
        FC_FIREBASE_DISABLE: '1',
        FC_MONITOR_ENABLED: '0',
        FC_OPEN_TRACKING_ENABLED: '0',
      },
      stdio: 'ignore',
    },
  );
  for (let n = 0; ; n++) {
    try {
      await api('state');
      break;
    } catch (e) {
      if (n > 100) throw e;
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  await api('suppress', { email: 'offline@example.com', reason: 'Requested removal' });
  assert.equal((await api('state')).suppression['offline@example.com'], 'Requested removal');
  await assert.rejects(api('unsuppress', { email: 'offline@example.com' }), /pending/);
  assert.equal((await api('state')).suppression['offline@example.com'], 'Requested removal');
  assert(
    JSON.parse(await fs.readFile(path.join(dir, 'state.json'))).replySuppressionOutbox[
      'offline@example.com'
    ],
  );
});

test('launcher never terminates an unverified live lock PID', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'phase1-lock-'));
  const unrelated = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], {
    stdio: 'ignore',
  });
  try {
    await fs.writeFile(path.join(dir, 'app.lock'), String(unrelated.pid));
    const launch = spawn(process.execPath, ['scripts/launch.mjs', '--close'], {
      env: { ...process.env, FC_DATA_DIR: dir, PORT: '25987' },
      stdio: 'ignore',
    });
    const [code] = await once(launch, 'exit');
    assert.equal(code, 1);
    assert.equal(unrelated.exitCode, null);
    assert.equal(Number(await fs.readFile(path.join(dir, 'app.lock'), 'utf8')), unrelated.pid);
  } finally {
    const done = once(unrelated, 'exit');
    unrelated.kill();
    await done;
    await fs.rm(dir, { recursive: true, force: true });
  }
});
