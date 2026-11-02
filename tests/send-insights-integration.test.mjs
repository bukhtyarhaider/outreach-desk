import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { insightState } from './fixtures/send-insights.mjs';
import { APP_VERSION, APP_BUILD_LABEL } from '../src/app-version.mjs';
import { releaseCatalog } from '../src/release-catalog.mjs';
import { loadPlaywright } from '../src/browser.mjs';
const root = path.resolve(import.meta.dirname, '..');
async function fixture(t, port, extra = 30) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fc-send-insights-'));
  await fs.writeFile(path.join(dir, 'state.json'), JSON.stringify({ ...insightState(extra), releaseNotes: [{ id: 'legacy-note', title: 'Retained private legacy note' }] }));
  let child;
  const stop = async () => { if (child?.exitCode === null) { const exit = once(child, 'exit'); child.kill('SIGTERM'); await exit; } };
  const start = async () => {
    child = spawn(process.execPath, [path.join(root, 'src/server.mjs')], { cwd: root,
      env: { ...process.env, PORT: String(port), FC_DATA_DIR: dir, FC_FIREBASE_DISABLE: '1', FC_MONITOR_ENABLED: '0', FC_OPEN_TRACKING_ENABLED: '0', FC_SEEDS: '[]' }, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = ''; child.stderr.on('data', (b) => { stderr += b; });
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error(stderr);
      try { if ((await fetch(`http://127.0.0.1:${port}/api/state`)).ok) return; } catch {}
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error('Startup timeout');
  };
  const raw = (route, data) => fetch(`http://127.0.0.1:${port}/api/${route}`, data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-FC-Request': '1' }, body: JSON.stringify(data) });
  const api = async (route, data) => { const r = await raw(route, data); const value = await r.json(); if (!r.ok) throw new Error(value.error); return value; };
  t.after(async () => { await stop(); await fs.rm(dir, { recursive: true, force: true }); });
  await start(); return { dir, api, raw, start, stop, url: `http://127.0.0.1:${port}` };
}

test('history HTTP exports match all filtered pages; reply reviews survive restart and removed catalog notes cannot be written', async (t) => {
  const { api, raw, stop, start, dir } = await fixture(t, 14672);
  const report = await api('history?offset=25');
  assert.equal(report.total, 37); assert.equal(report.records.length, 12); assert.equal(report.summary.attempts, 37);
  assert(!JSON.stringify(report).includes('PRIVATE_TEAM_TOKEN')); assert(!JSON.stringify(report).includes('openTokenHash'));
  const filtered = await api('export-history?scope=filtered&seen=seen');
  assert.equal(filtered.records.length, 5); assert.equal(filtered.tracking.length, 5);
  assert.equal(filtered.summary.seen, 5); assert(!filtered.suppression);
  const text = await (await raw('export-history?scope=filtered&format=csv&offset=25')).text();
  assert(text.includes('extra-29@example.com')); assert(text.includes('fast@example.com'));
  const stats = await (await raw('export-history?scope=stats&format=csv&seen=seen')).text();
  assert(stats.includes('averageFirstSeenMs')); assert(stats.includes('filter_seen'));
  const full = await api('export-history');
  assert.equal(full.records.length, 37); assert(full.suppression); assert(!JSON.stringify(full).includes('openTokenHash'));
  await api('history/review', { trackingId: 'tracking-fast', status: 'no_reply', note: 'Manual inspection; follow up Friday' });
  const removed = await raw('catalog/note', { version: '2.1.0', title: 'Removed feature' });
  assert.equal(removed.status, 410);
  const saved = JSON.parse(await fs.readFile(path.join(dir, 'state.json'), 'utf8'));
  assert.equal(saved.history['fast@example.com'].status, 'Sent'); assert.equal(saved.history['fast@example.com'].sendStatus, 'webmail_sent');
  assert.equal(saved.history['fast@example.com'].teamToken, 'PRIVATE_TEAM_TOKEN');
  assert.equal(saved.releaseNotes[0].title, 'Retained private legacy note');
  await stop(); await start();
  const reviewed = await api('history?q=fast@example.com');
  assert.equal(reviewed.records[0].replyStatus, 'no_reply'); assert.match(reviewed.records[0].followUp.note, /follow up Friday/);
  const catalog = await api('catalog'); assert.equal(catalog.installedVersion, APP_VERSION); assert(!('notes' in catalog));
  assert(!('notes' in await api('export-catalog')));
  assert.equal((await api('state')).appVersion, APP_VERSION);
  assert.equal((await api('state')).appBuildLabel, APP_BUILD_LABEL);
  assert.equal((await api('state')).version, 2, 'Data schema version must not change');
  assert.equal(catalog.publicReleaseCount, 0);
  assert.equal((await api('export-catalog')).buildLabel, 'Internal alpha');
});

test('send insights and version catalog UI support filters, exports, review and narrow screens', { skip: process.env.FC_BROWSER_TESTS !== '1' }, async (t) => {
  const { url, api } = await fixture(t, 14673, 0);
  const browser = await loadPlaywright().chromium.launch({ channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(url + '/#activity');
  await page.waitForFunction(() => document.querySelector('#historyPageInfo').textContent.includes('7 matching'));
  assert.match(await page.locator('#historyMetrics').innerText(), /32m 30s/);
  assert.match(await page.locator('#historyMetrics').innerText(), /5m 0s/);
  await page.locator('#historySeen').selectOption('seen');
  await page.waitForFunction(() => document.querySelector('#historyRows').querySelectorAll('tr').length === 5);
  assert.match(await page.locator('#historyExportCsv').getAttribute('href'), /seen=seen/);
  await page.locator('#historySort').selectOption('fastest');
  await page.waitForFunction(() => document.querySelector('#historyRows tr').textContent.includes('fast@example.com'));
  await page.locator('#historyRows tr').first().getByRole('button', { name: 'View', exact: true }).click();
  assert.match(await page.locator('#historyMessage').innerText(), /First seen \(image request\)/);
  await page.locator('#historyReviewStatus').selectOption('no_reply');
  await page.locator('#historyReviewNote').fill('Checked manually; no reply yet');
  await page.locator('#historyRefresh').click();
  assert.equal(await page.locator('#historyReviewNote').inputValue(), 'Checked manually; no reply yet');
  await page.locator('#historySaveReview').click();
  await page.waitForFunction(() => document.querySelector('#notice').textContent === 'Manual reply review saved.');
  assert.equal((await api('history?q=fast@example.com')).records[0].replyStatus, 'no_reply');
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#historyMetrics').scrollIntoViewIfNeeded();
    const bounds = await page.locator('#historyMetrics').boundingBox(); assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, JSON.stringify(bounds));
    if (process.env.FC_UI_SCREENSHOT_DIR) { await fs.mkdir(process.env.FC_UI_SCREENSHOT_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `send-insights-${width}.png`) }); }
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.locator('[data-view="catalog"]').click();
  await page.waitForFunction(version => document.querySelector('#catalogMetrics').textContent.includes(version), APP_VERSION);
  assert((await page.locator('#appVersion').textContent()).includes(APP_VERSION));
  assert.match(await page.locator('#appVersion').textContent(), /Internal alpha/);
  assert.match(await page.locator('#view-catalog').innerText(), /No public releases have been made/);
  await page.locator('#catalogType').selectOption('build');
  assert.equal(await page.locator('#catalogEntries article').count(), releaseCatalog().internalBuilds);
  assert.equal(await page.locator('#catalogNoteTitle').count(), 0);
  assert.equal(await page.locator('#catalogType option[value="local"]').count(), 0);
  const current = page.locator('.catalog-current details');
  assert(await current.evaluate(el => el.open));
  await current.locator('summary').click();
  await page.locator('#catalogRefresh').click();
  await page.waitForFunction(() => !document.querySelector('#catalogEntries').hasAttribute('aria-busy'));
  assert.equal(await current.evaluate(el => el.open), false);
  await page.locator('#catalogType').selectOption('milestone');
  assert.equal(await page.locator('#catalogEntries article').count(), releaseCatalog().milestones);
  await page.locator('#catalogSearch').fill('nothing matches xyz');
  assert.match(await page.locator('#catalogEntries').innerText(), /No matching builds/);
  await page.locator('#catalogEntries').getByRole('button', { name: 'Clear filters' }).click();
  assert.equal(await page.locator('#catalogType').inputValue(), '');
  await page.locator('#catalogSearch').fill('2.2.0-rc.9');
  assert.equal(await page.locator('#catalogEntries article').count(), 1);
  assert.match(await page.locator('#catalogEntries').innerText(), /Original internal package label: v2.2.0-rc.9. Not a public release/);
  await page.locator('#catalogSearch').fill('Firebase');
  assert(await page.locator('#catalogEntries article').count() > 0);
  assert(await page.locator('#catalogEntries details').evaluateAll(nodes => nodes.every(n => n.open)));
  await page.locator('#catalogReset').click();
  await page.route('**/api/catalog', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({error:'Test connection failure'}) }));
  await page.locator('#catalogRefresh').click();
  await page.waitForFunction(() => document.querySelector('#catalogStatus').textContent.includes('Previously loaded history'));
  assert.equal(await page.locator('#catalogEntries article').count(), releaseCatalog().entries.length);
  await page.unroute('**/api/catalog');
  await page.locator('#catalogRefresh').click();
  await page.waitForFunction(count => document.querySelector('#catalogStatus').textContent.includes(`${count} of ${count}`), releaseCatalog().entries.length);
  await current.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert(await current.evaluate(el => el.open));
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('link', {name:'Export catalog', exact:true}).click();
  const download = await downloadEvent;
  assert.match(download.suggestedFilename(), /outreach-catalog/);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('#catalogMetrics').scrollIntoViewIfNeeded();
    const bounds = await page.locator('#catalogMetrics').boundingBox(); assert(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, JSON.stringify(bounds));
    assert(await page.locator('#catalogEntries').evaluate((el) => el.getBoundingClientRect().right <= window.innerWidth + 1));
    if (process.env.FC_UI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `version-catalog-${width}.png`) });
    await page.locator('.catalog-history').scrollIntoViewIfNeeded();
    if (process.env.FC_UI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `version-history-${width}.png`) });
    await page.locator('.catalog-guide > summary').click();
    assert(await page.locator('.catalog-guide').evaluate(el => el.open));
    assert.equal(await page.locator('#catalogUpgradeSteps li').count(), 5);
    if (process.env.FC_UI_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `version-guide-${width}.png`) });
    await page.locator('.catalog-guide > summary').click();
  }
  assert.deepEqual(errors, []);
});
