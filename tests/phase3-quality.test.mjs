import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { followUpSchedule } from '../src/follow-up-schedule.mjs';
import { validateTemplate } from '../src/template-validation.mjs';

test('template validation rejects invalid weights, unknown/prototype fields, malformed fields and oversized content', () => {
  const base = { subject: 'Hello {{company}}', body: 'Hi {{firstName}}', weight: 1 };
  assert.deepEqual(validateTemplate(base), []);
  for (const change of [
    { weight: 0 },
    { subject: '{{notSupported}}' },
    { body: '{{constructor}}' },
    { body: '{{ firstName }}' },
    { body: 'a'.repeat(12001) },
    { subject: 'a'.repeat(201) },
  ])
    assert.throws(() => validateTemplate({ ...base, ...change }));
});
test('reminder buckets respect timezone/daylight boundaries and exclude protected or unscheduled work', () => {
  const now = Date.parse('2026-11-04T03:00:00Z'); // Nov 3 evening in Los Angeles, Nov 4 in Karachi.
  const rows = [
    { id: 'past', followUpAt: '2026-11-04T02:00:00Z' },
    { id: 'later', followUpAt: '2026-11-04T04:00:00Z' },
    { id: 'tomorrow', followUpAt: '2026-11-04T10:00:00Z' },
    { id: 'protected', hold: 'Opt-out', followUpAt: '2026-11-04T02:00:00Z' },
    { id: 'bad', followUpAt: 'invalid' },
  ].map((r) => ({ carrierStatus: 'follow_up', ...r }));
  const west = followUpSchedule(rows, { now, timeZone: 'America/Los_Angeles' });
  assert.equal(west.buckets.get('past'), 'overdue');
  assert.equal(west.buckets.get('later'), 'today');
  assert.equal(west.buckets.get('tomorrow'), 'upcoming');
  assert(!west.buckets.has('protected'));
  assert(!west.buckets.has('bad'));
  const east = followUpSchedule(rows, { now, timeZone: 'Asia/Karachi' });
  assert.equal(east.buckets.get('tomorrow'), 'today');
  assert.throws(() => followUpSchedule(rows, { now, timeZone: 'not-a-time-zone' }));
  const fallBack = followUpSchedule(
    [{ id: 'repeated-hour', carrierStatus: 'follow_up', followUpAt: '2026-11-01T09:15:00Z' }],
    { now: Date.parse('2026-11-01T08:30:00Z'), timeZone: 'America/Los_Angeles' },
  );
  assert.equal(fallBack.buckets.get('repeated-hour'), 'today');
});
test('template imports publish atomically with row errors, and keyboard navigation retains the active route', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'phase3-quality-')),
    port = 25996;
  const child = spawn(process.execPath, ['src/server.mjs'], {
    env: {
      ...process.env,
      FC_DATA_DIR: dir,
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
  for (let n = 0; ; n++) {
    try {
      if ((await raw('state')).ok) break;
    } catch {}
    if (n > 100) throw new Error('Fixture server failed');
    await new Promise((r) => setTimeout(r, 50));
  }
  const initial = await (await raw('state')).json(),
    before = initial.templates;
  let response = await raw('import-templates', {
    templates: [
      { name: 'Valid', subject: 'Hello', body: 'Hello {{firstName}}' },
      { name: 'Broken', subject: 'Hello', body: '{{unsupported}}' },
      null,
    ],
  });
  assert.equal(response.status, 400);
  const failed = await response.json();
  assert.equal(failed.errors.length, 2);
  assert.match(failed.errors[0], /Template 2/);
  assert.match(failed.errors[1], /Template 3/);
  assert.deepEqual((await (await raw('state')).json()).templates, before);
  response = await raw('import-templates', {
    templates: [{ name: 'Valid', subject: 'Hello', body: 'Hello {{firstName}}' }],
  });
  assert.equal(response.status, 200);
  assert.equal(
    Object.keys((await (await raw('state')).json()).templates).length,
    Object.keys(before).length + 1,
  );
  if (process.env.FC_BROWSER_TESTS === '1') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    try {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/#templates`);
      await page.waitForFunction(() => document.title === 'Templates · Outreach Desk');
      await page.getByRole('link', { name: 'Skip to main content', exact: true }).focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#templates');
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
      const navigation = page.locator('.nav-link[data-view="leads"]');
      await navigation.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.title === 'Leads · Outreach Desk');
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
      await page.close();
    } finally {
      await browser.close();
    }
  }
});
