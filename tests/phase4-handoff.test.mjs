import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { workspace } from './fixtures/carrier-workspace.mjs';
import { eml, account } from './fixtures/replies.mjs';

test('handoff API and browser download require current evidence and an explicit local review', async (t) => {
  const f = await workspace(t);
  await f.ops.replies.ingest(eml({ text: 'I am interested. My phone is 8175550199.' }), account);
  const port = 25998;
  const child = spawn(process.execPath, ['src/server.mjs'], {
    env: {
      ...process.env,
      FC_DATA_DIR: f.dataDir,
      PORT: String(port),
      FC_RELEASE_PREVIEW: '1',
      FC_FIREBASE_DISABLE: '1',
      FC_MONITOR_ENABLED: '0',
      FC_OPEN_TRACKING_ENABLED: '0',
      FC_REPLY_CAPTURE_ENABLED: '0',
    },
    stdio: 'ignore',
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const done = once(child, 'exit');
      child.kill();
      await done;
    }
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
      value = await r.json();
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
  const inbox = await api('conversations'),
    row = inbox.rows[0],
    detail = await api('conversation-detail?id=' + row.id + '&type=conversation');
  const request = {
    rootId: row.id,
    expectedContext: detail.assistant.version,
    expectedStatusVersion: detail.carrierHistory.statusVersion,
    intendedOwner: 'Sales manager',
    nextStep: 'Review equipment and phone evidence before contacting the carrier.',
    confirm: true,
  };
  assert.equal(
    (await raw('conversations/handoff', { ...request, expectedContext: 'stale' })).status,
    409,
  );
  assert.equal((await raw('conversations/handoff', { ...request, confirm: false })).status, 400);
  const result = await api('conversations/handoff', request);
  assert.equal(result.handoff.handoff.acceptance, 'not_recorded');
  assert(!JSON.stringify(result).includes('PRIVATE_TEAM_SECRET'));
  if (process.env.FC_BROWSER_TESTS === '1') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage({ acceptDownloads: true });
      await page.goto(`http://127.0.0.1:${port}/#conversations`);
      await page.locator('[data-reply]').first().click();
      await page.locator('#carrierManage').click();
      await page.locator('#carrierHandoffOwner').fill('Sales manager');
      await page.locator('#carrierHandoffNextStep').fill(request.nextStep);
      await page.locator('#carrierHandoffConfirm').check();
      await page
        .locator('#carrierHandoffNextStep')
        .fill(request.nextStep + ' Confirm availability.');
      assert.equal(await page.locator('#carrierHandoffConfirm').isChecked(), false);
      await page.locator('#carrierHandoffConfirm').check();
      const pending = page.waitForEvent('download');
      await page.locator('#carrierHandoffExport').click();
      const download = await pending;
      const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
      assert.equal(exported.schema, 'outreach-desk.carrier-handoff.v1');
      assert.equal(exported.handoff.intendedOwner, 'Sales manager');
      assert.equal(exported.handoff.acceptance, 'not_recorded');
      assert(!JSON.stringify(exported).includes('PRIVATE_TEAM_SECRET'));
      assert.equal(await page.locator('#carrierHandoffConfirm').isChecked(), false);
      await page.close();
    } finally {
      await browser.close();
    }
  }
  assert.equal((await api('state')).job.enabled, false);
});
