import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';

test('reviewed launch binds sender, campaign, audience and template policy; changed context is rejected', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'phase2-launch-'));
  const port = 25993;
  const child = spawn(
    process.execPath,
    ['--import', path.resolve('tests/fixtures/fake-mail.mjs'), 'src/server.mjs'],
    {
      env: {
        ...process.env,
        FC_DATA_DIR: dir,
        PORT: String(port),
        FC_FIREBASE_DISABLE: '1',
        FC_MONITOR_ENABLED: '0',
        FC_REPLY_CAPTURE_ENABLED: '0',
        FC_REPLY_AUTO: '0',
        FC_OPEN_TRACKING_ENABLED: '0',
        TEST_SEND_LOG: path.join(dir, 'sends.jsonl'),
      },
      stdio: 'ignore',
    },
  );
  t.after(async () => {
    if (child.exitCode === null) {
      const done = once(child, 'exit');
      child.kill();
      await done;
    }
    await fs.rm(dir, { recursive: true, force: true });
  });
  const raw = (route, data) =>
    fetch(
      `http://127.0.0.1:${port}/api/${route}`,
      data === undefined
        ? {}
        : {
            method: 'POST',
            headers: { 'X-FC-Request': '1', 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          },
    );
  const api = async (route, data) => {
    const r = await raw(route, data),
      v = await r.json();
    if (!r.ok) throw new Error(v.error);
    return v;
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
  let state = await api('state');
  const business = {
    company: 'Example',
    senderName: 'Rep',
    legalName: 'Example LLC',
    address: '123 Example St',
    services: 'load coordination',
  };
  await api('profile', {
    id: state.activeProfile,
    name: 'Rep',
    email: 'rep@example.com',
    provider: 'privateemail',
    business,
    autoReconnect: false,
  });
  state = await api('state');
  state.settings.eligibility.requireActive = false;
  state.settings.eligibility.requireNoOutOfService = false;
  await api('settings', { settings: state.settings });
  const workbook = path.join(dir, 'fixture.xlsx');
  execFileSync(process.platform === 'win32' ? 'python' : 'python3', [
    'tests/fixtures/workbook.py',
    workbook,
  ]);
  await api('import', { path: workbook });
  state = await api('state');
  const ids = (await api('leads')).leads.map((l) => l.id);
  const keys = Object.keys(state.templates);
  const request = {
    mode: 'selected',
    ids: [ids[0]],
    campaignId: state.activeCampaign,
    profileId: state.activeProfile,
    randomTemplates: false,
    key: keys[0],
  };
  let plan = await api('launch-plan', request);
  assert.equal(plan.count, 1);
  assert.equal(plan.sender, 'rep@example.com');
  assert.equal(plan.templatePolicy, state.templates[keys[0]].name);
  let response = await raw('launch', request);
  assert.equal(response.status, 409);
  assert.equal((await api('state')).job.enabled, false);
  const original = state.templates[keys[0]];
  await api('template', { key: keys[0], ...original, body: original.body + '\nThank you.' });
  response = await raw('launch', { ...request, expectedContext: plan.token });
  assert.equal(response.status, 409);
  assert.equal((await api('state')).job.enabled, false);
  const beforeReload = state.campaignRevision;
  await api('reload', {});
  response = await raw('prepare', {
    id: ids[0],
    key: keys[0],
    campaignId: state.activeCampaign,
    expectedCampaignRevision: beforeReload,
  });
  assert.equal(response.status, 409);
  if (process.env.FC_BROWSER_TESTS === '1') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    try {
      await api('connect', {});
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/#dashboard`);
      await page.locator('#sendingTemplate').selectOption(keys[1]);
      await page.locator('#randomTemplates').uncheck();
      // A different preview choice must not affect the dedicated sending selector.
      await page.locator('#template').evaluate((el, key) => {
        el.value = key;
      }, keys[0]);
      await page.locator('#start').click();
      const dialog = page.locator('dialog[open]').last();
      await dialog.waitFor();
      const text = await dialog.innerText();
      assert(text.includes(state.templates[keys[1]].name));
      assert(text.includes('rep@example.com'));
      assert(text.includes('3 eligible recipients now'));
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      assert.equal((await api('state')).job.enabled, false);
      await page.close();
    } finally {
      await browser.close();
    }
    await api('disconnect', {});
  }
  await api('import', { path: workbook });
  await assert.rejects(api('launch-plan', request), /Mailbox or campaign changed/);
  await api('select-campaign', { id: request.campaignId });
  const continuous = await api('launch-plan', { ...request, mode: 'continuous', ids: undefined });
  assert.equal(continuous.count, 3, 'cross-campaign duplicates count once');
  assert.equal(continuous.campaigns.length, 2);
  plan = await api('launch-plan', request);
  await api('launch', { ...plan.request, expectedContext: plan.token });
  state = await api('state');
  assert.equal(state.job.enabled, true);
  assert.equal(state.job.templateKey, keys[0]);
  assert.deepEqual(state.job.campaignIds, [request.campaignId]);
  await api('stop', {});
  assert.equal(
    await fs.access(path.join(dir, 'sends.jsonl')).then(
      () => true,
      () => false,
    ),
    false,
  );
});
