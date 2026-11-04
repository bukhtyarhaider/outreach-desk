import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { workspace } from './fixtures/carrier-workspace.mjs';

test('unconfigured capture cannot advertise or approve a proactive follow-up in API or browser', async (t) => {
  const f = await workspace(t),
    port = 25999;
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
    return { status: r.status, value: await r.json() };
  };
  for (let n = 0; ; n++) {
    try {
      if ((await api('state')).status === 200) break;
    } catch {}
    if (n > 100) throw new Error('Synthetic server failed');
    await new Promise((r) => setTimeout(r, 50));
  }
  const list = (await api('conversations?group=carriers&work=no_reply')).value,
    row = list.rows[0];
  assert(row);
  assert.equal(row.followUpReady, false);
  assert.equal(list.summary.followUpReady, 0);
  const detail = (await api('conversation-detail?id=' + row.id + '&type=conversation')).value;
  assert.equal(detail.assistant.followUpCoverage.ready, false);
  assert.match(detail.assistant.followUpCoverage.reason, /Enable read-only capture/);
  const draft = await api('conversations/draft', {
    rootId: row.id,
    expectedContext: detail.assistant.version,
    requestId: 'disabled-capture-request',
    body: 'Would dispatch support be useful?',
  });
  assert.equal(draft.status, 400);
  assert.match(draft.value.error, /capture/);
  await api('conversations/carrier-status', {
    carrierInboxId: detail.carrierHistory.carrierInboxId,
    expectedVersion: detail.carrierHistory.statusVersion,
    stage: 'follow_up',
    followUpAt: '2030-01-01T12:00:00Z',
    note: 'Reminder only; capture is not configured.',
  });
  const reminders = (await api('conversations?group=carriers')).value;
  assert.equal(reminders.summary.followUpReady, 0);
  assert.equal(reminders.summary.followUpReminders, 1);
  if (process.env.FC_BROWSER_TESTS === '1') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/#conversations`);
      await page.locator('[data-mailroom-work="no_reply"]').click();
      await page.locator('[data-reply]').first().click();
      await page.locator('#assistantBody').fill('Would dispatch support be useful?');
      await page.waitForFunction(() =>
        document.querySelector('#assistantDraftState').textContent.includes('Unsaved edits'),
      );
      assert.equal(await page.locator('#assistantSaveDraft').isDisabled(), true);
      assert.equal(await page.locator('#assistantReviewOpen').isDisabled(), true);
      assert.match(await page.locator('#assistantIntent').innerText(), /Enable read-only capture/);
      assert.match(await page.locator('#assistantIntent').innerText(), /Scan previous replies/);
      assert(
        !(await page.locator('#assistantIntent').innerText()).includes('Follow-up is eligible'),
      );
      await page.close();
    } finally {
      await browser.close();
    }
  }
});
