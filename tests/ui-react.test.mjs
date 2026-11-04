import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { loadPlaywright } from '../src/browser.mjs';
import { workspace } from './fixtures/carrier-workspace.mjs';
import { upgrade } from '../src/config.mjs';
import { templates } from '../src/core.mjs';

const root = path.resolve(import.meta.dirname, '..');
const version = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version;
const contract = JSON.parse(
  await fs.readFile(path.join(root, 'tests/fixtures/ui-contract.json'), 'utf8'),
);
let fixtureDirectory, ui;
before(async () => {
  fixtureDirectory = await fs.mkdtemp(path.join(root, 'tests/.react-ui-'));
  const output = path.join(fixtureDirectory, 'fixture.mjs');
  await build({
    stdin: {
      resolveDir: root,
      contents: `
    export {App} from './src/ui/app/App';
    export {UIScope} from './src/ui/shared/lifecycle';
    export {workbookLabel} from './src/ui/shared/workspace-store';
    export {audienceShare, StatMark} from './src/ui/design-system/StatMark';
    export {parseUIPreferences, uiPreferencesKey} from './src/ui/shared/ui-preferences';
    export {viewNames, resolveView, navigationParent} from './src/ui/app/routes';
    export {classifyEvent, eventIdentity} from './src/ui/features/live-activity/controller';
    export {Button, Input, Textarea, Select, Dialog} from './src/ui/design-system/primitives';
  `,
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    logLevel: 'silent',
  });
  ui = await import(pathToFileURL(output).href);
});
after(async () => {
  if (fixtureDirectory) await fs.rm(fixtureDirectory, { recursive: true, force: true });
});

test('React retains every original control and separates campaign library, creation and editing', () => {
  const markup = renderToStaticMarkup(createElement(ui.App));
  const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Control IDs must remain unique');
  assert.equal(
    (markup.match(/class="app-container"/g) || []).length,
    1,
    'The shell must have exactly one sidebar/content row',
  );
  assert.deepEqual(
    contract.ids.filter((id) => !ids.includes(id)),
    [],
  );
  assert.deepEqual([...ui.viewNames].sort(), [...contract.views].sort());
  for (const view of ui.viewNames) assert.equal(ui.resolveView(view), view);
  assert.equal(ui.resolveView('missing-route'), 'dashboard');
  assert.equal(ui.resolveView('campaignReview'), 'campaign-edit');
  assert.equal(ui.resolveView('campaignSource'), 'campaign-edit');
  assert.equal(ui.resolveView('outreachRunner'), 'dashboard');
  assert.equal(ui.navigationParent('campaign-new'), 'campaigns');
  assert.equal(ui.navigationParent('campaign-edit'), 'campaigns');
  assert.equal(ui.workbookLabel({ workbook: { file: 'copies/legacy.xlsx' } }), 'legacy.xlsx');
  assert.equal(ui.workbookLabel(null), 'No workbook imported.');
  assert.equal(ui.resolveView('trackingSeedStudio'), 'tracking');
  assert.equal(ui.resolveView('trackingDomainHealth'), 'tracking');
});

test('stat accents handle empty and partial audiences without inventing a send conversion rate', () => {
  assert.equal(ui.audienceShare(0, 0), 0);
  assert.equal(ui.audienceShare(1, 2), 0.5);
  assert.equal(ui.audienceShare(-1, 2), 0);
  assert.equal(ui.audienceShare(5, 2), 1);
  assert.equal(ui.audienceShare(NaN, 2), 0);
  for (const kind of ['total', 'ready', 'excluded', 'sent', 'signal', 'warning', 'timing']) {
    for (const value of [0, 1, 2, 1000000]) {
      const markup = renderToStaticMarkup(createElement(ui.StatMark, { kind, value, total: 2 }));
      assert(!/NaN|Infinity/.test(markup));
      assert.match(markup, /aria-hidden="true"/);
    }
  }
  const sends = (total) =>
    renderToStaticMarkup(createElement(ui.StatMark, { kind: 'sent', value: 10, total }));
  assert.equal(sends(0), sends(100), 'PC-wide confirmed sends have no campaign denominator');
});

test('appearance preferences recover safely from corrupt, missing and incorrectly typed storage', () => {
  const defaults = { workspaceContextEnabled: true, workspaceContextCollapsed: false };
  for (const value of [null, '', '{', 'null', 'false', '42', '[]']) {
    assert.deepEqual(ui.parseUIPreferences(value), defaults);
  }
  assert.deepEqual(
    ui.parseUIPreferences('{"workspaceContextEnabled":"false","workspaceContextCollapsed":1}'),
    defaults,
  );
  assert.deepEqual(
    ui.parseUIPreferences('{"workspaceContextEnabled":false,"workspaceContextCollapsed":true}'),
    { workspaceContextEnabled: false, workspaceContextCollapsed: true },
  );
  assert.deepEqual(ui.parseUIPreferences('{"workspaceContextCollapsed":true}'), {
    ...defaults,
    workspaceContextCollapsed: true,
  });
});

test('activity records keep distinct messages and explicit categories without formatting them as errors', () => {
  const first = { at: '2026-10-30T11:24:52.000Z', kind: 'system', message: 'Mailbox restored.' };
  const second = { ...first, message: 'A different event at the same timestamp.' };
  assert.notEqual(ui.eventIdentity(first), ui.eventIdentity(second));
  assert.equal(ui.eventIdentity(first), ui.eventIdentity({ ...first }));
  assert.notEqual(ui.eventIdentity(first), ui.eventIdentity({ ...first, kind: 'pause' }));
  assert.equal(ui.classifyEvent(first), 'system');
  assert.equal(
    ui.classifyEvent({
      ...first,
      kind: 'import',
      message: 'Revision activated; campaign remains paused.',
    }),
    'system',
  );
  assert.equal(
    ui.classifyEvent({ ...first, kind: 'pacing', message: 'Wait for the next queue check.' }),
    'pause',
  );
  assert.equal(ui.classifyEvent({ ...first, kind: '', message: 'Session restored.' }), 'system');
  assert.equal(
    ui.classifyEvent({ ...first, kind: '', message: 'Resting for 180 seconds.' }),
    'pause',
  );
  assert.equal(ui.classifyEvent({ ...first, kind: 'sent' }), 'send');
  assert.equal(ui.classifyEvent({ ...first, kind: 'error' }), 'error');
});

test('design primitives preserve native form semantics and safely render operator text', () => {
  const markup = renderToStaticMarkup(
    createElement(
      'form',
      {},
      createElement(ui.Input, {
        id: 'port',
        type: 'number',
        min: 1,
        max: 65535,
        defaultValue: 993,
      }),
      createElement(ui.Input, { type: 'checkbox', defaultChecked: true, disabled: true }),
      createElement(ui.Textarea, { defaultValue: '<script>operator text</script>' }),
      createElement(ui.Button, { type: 'submit', variant: 'secondary' }, 'Save'),
    ),
  );
  assert.match(markup, /min="1" max="65535" value="993"/);
  assert.match(markup, /disabled="" checked=""/);
  assert.match(markup, /&lt;script&gt;operator text&lt;\/script&gt;/);
  assert.match(markup, /<button[^>]+type="submit"/);
});

test('unmount cancels requests, polling, debounces and event handlers before remount', async () => {
  const savedWindow = globalThis.window;
  const scheduled = new Map();
  let timerId = 0,
    fetchSignal;
  globalThis.window = {
    setTimeout: (callback) => {
      scheduled.set(++timerId, callback);
      return timerId;
    },
    setInterval: (callback) => {
      scheduled.set(++timerId, callback);
      return timerId;
    },
    clearTimeout: (id) => scheduled.delete(id),
    clearInterval: (id) => scheduled.delete(id),
    fetch: async (_url, options) => {
      fetchSignal = options.signal;
      return new Response('{}');
    },
  };
  try {
    const scope = new ui.UIScope(),
      target = new EventTarget();
    let clicks = 0;
    const element = { onclick: null };
    scope.begin();
    const generation = scope.generation;
    scope.listen(target, 'click', () => clicks++);
    scope.handler(element, 'onclick', () => clicks++);
    scope.interval(() => {}, 1500);
    scope.timeout(() => {}, 250);
    await scope.fetch('/api/state');
    target.dispatchEvent(new Event('click'));
    element.onclick();
    assert.equal(clicks, 2);
    scope.dispose();
    assert.equal(fetchSignal.aborted, true);
    assert.equal(scheduled.size, 0);
    assert.equal(element.onclick, null);
    assert.equal(scope.isCurrent(generation), false);
    target.dispatchEvent(new Event('click'));
    assert.equal(clicks, 2);
    scope.begin();
    scope.listen(target, 'click', () => clicks++);
    target.dispatchEvent(new Event('click'));
    assert.equal(clicks, 3);
    scope.dispose();
  } finally {
    globalThis.window = savedWindow;
  }
});

test('frontend sources use TypeScript and React rendering without legacy script or HTML injection paths', async () => {
  async function files(directory) {
    return (
      await Promise.all(
        (await fs.readdir(directory, { withFileTypes: true })).map((entry) =>
          entry.isDirectory()
            ? files(path.join(directory, entry.name))
            : path.join(directory, entry.name),
        ),
      )
    ).flat();
  }
  for (const file of await files(path.join(root, 'src/ui'))) {
    assert(!file.endsWith('.js') && !file.endsWith('.html'), file);
    if (!/\.tsx?$/.test(file)) continue;
    const source = await fs.readFile(file, 'utf8');
    assert(
      !/\.innerHTML|insertAdjacentHTML|dangerouslySetInnerHTML|@ts-(?:ignore|nocheck)|:\s*any\b|\bas any\b/.test(
        source,
      ),
      file,
    );
  }
});

test(
  'React navigation preserves unsaved edits across all routes and polling at desktop/mobile widths',
  { skip: process.env.FC_BROWSER_TESTS !== '1' },
  async (t) => {
    const cleanups = [];
    const fixture = await workspace({ after: (cleanup) => cleanups.push(cleanup) });
    const directory = fixture.dataDir;
    const state = upgrade(fixture.state);
    state.templates = structuredClone(templates);
    state.profiles[0].id = 'qa-primary';
    state.activeProfile = 'qa-primary';
    state.campaigns[0].name = 'Campaign-' + 'long-source-name-'.repeat(14);
    state.profiles.push({
      ...structuredClone(state.profiles[0]),
      id: 'qa-secondary',
      name: 'A longer secondary mailbox profile for responsive layout verification',
      email: 'a-long-secondary-mailbox-for-layout-verification@example.invalid',
      browserChannel: 'msedge',
      autoReconnect: false,
    });
    await fixture.persist();
    const port = 14689;
    const child = spawn(process.execPath, [path.join(root, 'src/server.mjs')], {
      cwd: root,
      env: {
        ...process.env,
        PORT: String(port),
        FC_DATA_DIR: directory,
        FC_FIREBASE_DISABLE: '1',
        FC_MONITOR_ENABLED: '0',
        FC_OPEN_TRACKING_ENABLED: '0',
        FC_REPLY_CAPTURE_ENABLED: '0',
        FC_REPLY_AUTO: '0',
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let errors = '',
      browser;
    child.stderr.on('data', (chunk) => {
      errors += chunk;
    });
    t.after(async () => {
      await browser?.close();
      if (child.exitCode === null) {
        const done = once(child, 'exit');
        child.kill('SIGTERM');
        await done;
      }
      for (const cleanup of cleanups.reverse()) await cleanup();
    });
    const url = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error(errors);
      try {
        if ((await fetch(`${url}/api/state`)).ok) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const previewApi = async (route, data) => {
      const result = await fetch(
        `http://127.0.0.1:${port}/api/${route}`,
        data === undefined
          ? {}
          : {
              method: 'POST',
              headers: { 'X-FC-Request': '1', 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            },
      );
      const body = await result.json();
      assert(result.ok, body.error);
      return body;
    };
    const reviewed = await previewApi('import-review', {
      campaignId: 'c1',
      mapping: {},
      addStatusColumns: { Leads: 'D' },
    });
    const revision = await previewApi('import-apply', {
      previewId: reviewed.previewId,
      confirmExperiment: true,
      provenance: { label: 'Synthetic UI fixture', permission: 'unknown' },
    });
    const archive = await previewApi('imports?campaignId=c1');
    await previewApi('import-activate', {
      campaignId: 'c1',
      revisionId: revision.revisionId,
      expectedToken: archive.activationToken,
      confirmActivation: true,
    });
    browser = await loadPlaywright().chromium.launch({
      channel: process.env.FC_TEST_BROWSER_CHANNEL || 'chrome',
      headless: true,
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
      scriptErrors = [];
    page.on('pageerror', (error) => scriptErrors.push(error.message));
    const openView = async (view) => {
      if (view === 'campaign-new') await page.locator('.sidebar-create').click();
      else if (view === 'campaign-edit') {
        await page.locator('[data-view="campaigns"]').click();
        await page.locator('#view-campaigns.active').waitFor();
        await page.locator('[data-open-campaign="c1"]').click();
      } else await page.locator(`[data-view="${view}"]`).click();
      await page.locator(`#view-${view}.active`).waitFor();
    };

    await page.goto(`${url}/#settings`);
    await page.waitForFunction(
      (version) => document.getElementById('appVersion').textContent.includes(`v${version}`),
      version,
    );
    assert.equal(
      await page.locator('#start').isDisabled(),
      true,
      'A queue with no included campaign stays disabled after initial rendering',
    );
    const paceAccents = await page.locator('.pace-control-card').evaluateAll((cards) =>
      cards.map((card) => ({
        color: getComputedStyle(card).borderTopColor,
        width: getComputedStyle(card).borderTopWidth,
      })),
    );
    assert.equal(
      new Set(paceAccents.map((accent) => accent.color)).size,
      3,
      `Timing, volume and rest use their semantic accents: ${JSON.stringify(paceAccents)}`,
    );
    assert(paceAccents.every((accent) => accent.width === '3px'));
    const savedPace = (await previewApi('state')).settings.pacing;
    await page.locator('.pace-profiles > summary').click();
    const draftBeforeGuide = await page.locator('#minSeconds').inputValue();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [key, name] of [
        ['warmup', 'Gradual'],
        ['balanced', 'Balanced'],
        ['established', 'Higher volume'],
        ['stealth', 'Background'],
      ]) {
        await page.getByRole('button', { name: `About ${name} preset`, exact: true }).click();
        const guide = page.locator(`#pace-info-${key}`);
        assert.equal(await guide.isVisible(), true);
        const centered = await guide.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 2 &&
            Math.abs((r.top + r.bottom) / 2 - innerHeight / 2) < 2
          );
        });
        assert(centered, `Preset guide is centered at ${width}px`);
        if (key === 'warmup' && process.env.FC_UI_SCREENSHOT_DIR) {
          await fs.mkdir(process.env.FC_UI_SCREENSHOT_DIR, { recursive: true });
          await page.screenshot({
            path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `pace-info-${width}.png`),
          });
        }
        assert.match(await guide.innerText(), /When to choose it/);
        assert.match(await guide.innerText(), /How it helps/);
        await page.keyboard.press('Escape');
        assert.equal(await guide.isVisible(), false);
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.equal(
      await page.locator('#minSeconds').inputValue(),
      draftBeforeGuide,
      'Reading preset guidance preserves the draft',
    );
    await page.locator('[data-preset=warmup] .preset-apply-btn').click();
    assert.equal(await page.locator('#minSeconds').inputValue(), '240');
    assert.equal(await page.locator('#dailyCap').inputValue(), '40');
    assert.deepEqual(
      (await previewApi('state')).settings.pacing,
      savedPace,
      'Preset application only changes the draft',
    );
    await page.locator('.pace-profiles > summary').click();
    const draft = 'Unsent React migration draft <&> "preserve"';
    await page.getByRole('tab', { name: 'Firebase sync', exact: true }).click();
    await page.locator('#trackingPcId').fill('4');
    const settingsPanels = [
      ['Sending pace', 'settingsSending'],
      ['Eligibility & checks', 'settingsChecks'],
      ['Firebase sync', 'settingsConnections'],
      ['Team coordination', 'settingsTeam'],
      ['Appearance', 'settingsAppearance'],
      ['About', 'settingsAbout'],
    ];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const [label, id] of settingsPanels) {
        await page.getByRole('tab', { name: label, exact: true }).click();
        await page.locator(`#${id}`).waitFor({ state: 'visible' });
        assert.equal(await page.locator('#view-settings [role=tabpanel]:visible').count(), 1);
        assert.equal(
          await page.locator('#saveSettings').isVisible(),
          true,
          'Configuration edits remain saveable from Appearance and About',
        );
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (process.env.FC_UI_SCREENSHOT_DIR) {
          await fs.mkdir(process.env.FC_UI_SCREENSHOT_DIR, { recursive: true });
          await page.screenshot({
            path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `settings-${id}-${width}.png`),
          });
          if (id === 'settingsSending') {
            await page.evaluate(() => {
              const viewport = document.querySelector('.app-viewport');
              for (let i = 0; i < 2; i++) {
                const board = document.querySelector('.pace-control-grid').getBoundingClientRect();
                const tabs = document.querySelector('.settings-tab-bar').getBoundingClientRect();
                viewport.scrollTop += board.top - tabs.bottom - 16;
              }
            });
            await page.screenshot({
              path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `pace-board-${width}.png`),
            });
          }
        }
      }
    }
    await page.getByRole('tab', { name: 'About', exact: true }).press('Home');
    await page.locator('#settingsSending').waitFor({ state: 'visible' });
    await page.getByRole('tab', { name: 'Sending pace', exact: true }).press('End');
    await page.locator('#settingsAbout').waitFor({ state: 'visible' });
    assert.equal(
      await page.locator('#trackingPcId').inputValue(),
      '4',
      'Tab navigation preserves unsaved sync configuration',
    );
    await page.getByRole('tab', { name: 'Sending pace', exact: true }).click();
    await page.locator('.pace-empty-queue > summary').click();
    await page.locator('#pollSeconds').fill('4000');
    await page.locator('.pace-empty-queue > summary').click();
    await page.getByRole('tab', { name: 'Firebase sync', exact: true }).click();
    await page.locator('#saveSettings').click();
    await page.waitForFunction(() =>
      document.querySelector('#settingsSaveFeedback').textContent.includes('pollSeconds'),
    );
    await page.locator('#pollSeconds').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#pollSeconds').inputValue(), '4000');
    assert.equal(await page.locator('#pollSeconds').getAttribute('aria-invalid'), 'true');
    await page.locator('#pollSeconds').fill('60');

    await page.setViewportSize({ width: 1440, height: 1000 });

    await page.locator('[data-view=templates]').click();
    const originalSendingTemplate = await page.locator('#template').inputValue();
    await page.locator('#newTemplate').click();
    assert.equal(await page.locator('#templateEditorTitle').innerText(), 'New template');
    assert.equal(
      await page.locator('#templateEditor #template').count(),
      0,
      'Editor does not switch the lead-preview template',
    );
    assert.equal(await page.locator('#subject').inputValue(), '');
    assert.equal(await page.locator('#body').inputValue(), '');
    assert.equal(await page.locator('#deleteTemplate').isVisible(), false);
    await page.locator('#templateName').fill('QA flow template');
    await page.locator('#subject').fill('Hello {{company}}');
    await page.locator('#body').fill('Hello {{firstName}}, can we discuss dispatch support?');
    await page.locator('#insertOptOutChip').click();
    await page.locator('#templateEnabled').uncheck();
    await page.locator('#subject').focus();
    await page.locator('#subject').evaluate((el) => el.setSelectionRange(0, 0));
    await page.locator('.template-personalization > summary').click();
    await page.locator('[data-token="{{firstName}}"]').click();
    assert.match(
      await page.locator('#subject').inputValue(),
      /^\{\{firstName\}\}Hello/,
      'Personalization can be inserted at position zero',
    );
    await page.locator('#subject').fill('Hello {{company}}');
    await page.getByRole('button', { name: 'Close Email template', exact: true }).click();
    await page.locator('[data-edit-template]').first().click();
    await page
      .getByRole('dialog', { name: 'Discard unsaved template changes?', exact: true })
      .getByRole('button', { name: 'Cancel', exact: true })
      .click();
    await page.locator('#newTemplate').click();
    assert.equal(
      await page.locator('#templateName').inputValue(),
      'QA flow template',
      'Closing and reopening keeps the new draft',
    );
    await page.locator('#saveTemplate').click();
    await page.waitForFunction(
      () => document.querySelector('#templateEditorTitle').textContent === 'Edit template',
    );
    const createdTemplates = (await previewApi('state')).templates;
    const qaKey = Object.keys(createdTemplates).find(
      (key) => createdTemplates[key].name === 'QA flow template',
    );
    assert(qaKey, 'Creating a template saves a new key');
    assert.equal(
      await page.locator('#template').inputValue(),
      originalSendingTemplate,
      'Saving a library template preserves lead-preview selection',
    );
    await page.locator('#body').fill('Updated draft. Reply remove to opt out.');
    await page.locator('#saveTemplate').click();
    await page
      .getByRole('dialog', { name: 'Save edited details?', exact: true })
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    await page.waitForFunction(
      () =>
        document.querySelector('#notice').textContent === 'Template saved.' &&
        !document.querySelector('.ui-save-feedback'),
    );
    assert.equal(
      (await previewApi('state')).templates[qaKey].body,
      'Updated draft. Reply remove to opt out.',
    );
    await page.getByRole('button', { name: 'Close Email template', exact: true }).click();
    await page.locator('#templateStatusFilter').selectOption('disabled');
    assert.equal(await page.locator(`[data-edit-template="${qaKey}"]`).count(), 1);
    await page.locator('#templateSearch').fill('no such template');
    assert.match(await page.locator('#templatesTableBody').innerText(), /No matching templates/);
    await page.locator('[data-template-empty-action=reset]').click();
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `template-library-${width}.png`),
        });
      await page.locator('.template-library-table').scrollIntoViewIfNeeded();
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `template-library-rows-${width}.png`),
        });
    }
    await page.locator(`[data-edit-template="${qaKey}"]`).click();
    await page.locator('#deleteTemplate').click();
    await page
      .getByRole('dialog', { name: 'Delete template?', exact: true })
      .getByRole('button', { name: 'Confirm deletion', exact: true })
      .click();
    await page.locator('#templateEditor').waitFor({ state: 'hidden' });
    assert.equal((await previewApi('state')).templates[qaKey], undefined);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-edit-template]').first().click();
    await page.locator('#templateEditor').waitFor({ state: 'visible' });
    await page
      .locator('#body')
      .fill(
        '{{firstName}} at {{company}} — {{senderName}} / {{businessName}} / {{legalName}} / {{address}}',
      );
    await page.waitForFunction(() =>
      document
        .querySelector('#templateLivePreview')
        .textContent.includes('Alex at Example Carrier LLC'),
    );
    assert.doesNotMatch(
      await page.locator('#templateEditor').innerText(),
      /Mark Anthony|Fleet Core Logistics|FC Logistics|132 French Creek/i,
    );
    assert.match(
      await page.locator('#templateEditor .signature-box').innerText(),
      /not included in this sample preview/,
    );
    if (process.env.FC_UI_SCREENSHOT_DIR)
      await page.screenshot({
        path: path.join(process.env.FC_UI_SCREENSHOT_DIR, 'neutral-template-preview.png'),
      });
    await page.locator('#subject').fill(draft);
    await page.locator('#body').fill(draft);
    const extraTemplate = await previewApi('template', {
      name: 'QA concurrent library update',
      subject: 'Hello',
      body: 'A separate message.',
      enabled: true,
      weight: 1,
      requiredFields: [],
    });
    await page.waitForResponse((response) => response.url().endsWith('/api/state'));
    assert.equal(
      await page.locator('#body').inputValue(),
      draft,
      'Option-list changes never replace editor drafts',
    );
    await previewApi('delete-template', { key: extraTemplate.key });
    let releaseSave;
    const saveGate = new Promise((resolve) => {
      releaseSave = resolve;
    });
    await page.route('**/api/template', async (route) => {
      await saveGate;
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic template validation error' }),
      });
    });
    // A confirmation is a new top-layer modal, not a replacement for the editor.
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `drawer-template-${width}.png`),
        });
      await page.locator('#deleteTemplate').click();
      await page.locator('.ui-confirmation').waitFor({ state: 'visible' });
      assert(await page.locator('#templateEditor').isVisible());
      const modalFits = await page.locator('.ui-confirmation').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.x >= 0 &&
          r.right <= innerWidth &&
          r.y >= 0 &&
          r.bottom <= innerHeight &&
          el.scrollWidth <= el.clientWidth + 1
        );
      });
      assert(modalFits, `Nested confirmation fits at ${width}px`);
      if (process.env.FC_UI_SCREENSHOT_DIR) {
        await fs.mkdir(process.env.FC_UI_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `confirmation-drawer-${width}.png`),
        });
      }
      await page
        .locator('.ui-confirmation')
        .getByRole('button', { name: 'Cancel', exact: true })
        .click();
      assert.equal(await page.locator('#body').inputValue(), draft);
      assert(await page.locator('#deleteTemplate').evaluate((el) => el === document.activeElement));
    }
    await page.locator('#deleteTemplate').click();
    await page.locator('.ui-confirmation').press('Escape');
    await page.locator('.ui-confirmation').waitFor({ state: 'detached' });
    assert(await page.locator('#templateEditor').isVisible());
    await page.locator('#deleteTemplate').click();
    await page.locator('#deleteTemplate').evaluate((el) => el.click());
    assert.equal(
      await page.locator('.ui-confirmation').count(),
      1,
      'Duplicate requests do not queue stale decisions',
    );
    await page.locator('#templateEditor').evaluate((el) => el.close());
    await page.locator('.ui-confirmation').waitFor({ state: 'detached' });
    await page.locator('[data-edit-template]').first().click();
    await page.locator('#subject').fill(draft);
    await page.locator('#body').fill(draft);
    await page.locator('#saveTemplate').click();
    await page
      .locator('.ui-confirmation')
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    await page.getByRole('dialog', { name: 'Saving changes', exact: true }).waitFor();
    await page.getByRole('dialog', { name: 'Saving changes', exact: true }).press('Escape');
    assert(await page.getByRole('dialog', { name: 'Saving changes', exact: true }).isVisible());
    releaseSave();
    await page.waitForFunction(() =>
      document
        .querySelector('#templateEditor [data-drawer-notice]')
        .textContent.includes('Synthetic template validation error'),
    );
    assert(
      await page.locator('#templateEditor [data-drawer-notice]').isVisible(),
      'Save errors must be readable inside the modal',
    );
    assert.equal(
      await page.locator('#body').inputValue(),
      draft,
      'Failed saves preserve the draft',
    );
    await page.unroute('**/api/template');
    await page.locator('#saveTemplate').press('Tab');
    assert(
      await page.evaluate(() => !!document.activeElement.closest('#templateEditor')),
      'Keyboard focus stays inside the modal',
    );
    await page.getByRole('button', { name: 'Close Email template', exact: true }).click();
    for (const view of ui.viewNames) {
      await openView(view);
      await page.waitForFunction(
        (view) => document.querySelector('.view-page.active')?.id === `view-${view}`,
        view,
      );
      assert.equal(await page.locator('.view-page.active').getAttribute('id'), `view-${view}`);
    }
    await page.waitForResponse((response) => response.url().endsWith('/api/state'));
    assert.equal(await page.locator('#trackingPcId').inputValue(), '4');
    assert.equal(await page.locator('#subject').inputValue(), draft);
    assert.equal(await page.locator('#body').inputValue(), draft);
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const view of ui.viewNames) {
        await openView(view);
        await page.waitForFunction(
          (view) => document.querySelector('.view-page.active')?.id === `view-${view}`,
          view,
        );
        const shell = await page.evaluate(() => {
          const sidebar = document.querySelector('.app-sidebar').getBoundingClientRect();
          const viewport = document.querySelector('.app-viewport').getBoundingClientRect();
          const container = document.querySelector('.app-container').getBoundingClientRect();
          return {
            count: document.querySelectorAll('.app-container').length,
            gap: viewport.left - sidebar.right,
            rightGap: container.right - viewport.right,
            viewportContent: document.querySelector('.app-viewport').scrollWidth,
            viewportWidth: document.querySelector('.app-viewport').clientWidth,
          };
        });
        assert.equal(shell.count, 1, `${view}: one shell row`);
        assert(
          shell.viewportContent <= shell.viewportWidth + 1,
          `${view}: the content pane must not scroll sideways (${shell.viewportContent}/${shell.viewportWidth})`,
        );
        assert(
          Math.abs(shell.gap) <= 1,
          `${view}: content must start beside the sidebar, got ${shell.gap}px gap`,
        );
        assert(Math.abs(shell.rightGap) <= 1, `${view}: content must fill the shell`);
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${view} at ${width}px`,
        );
      }
    }
    await openView('suppression');
    await previewApi('suppress', {
      email: 'long-protected-contact-name-for-responsive-checking@example.invalid',
      reason:
        'A long existing protection reason that should remain readable without pushing the actions beyond the record edge.',
    });
    await page.locator('#suppressionAddOpen').click();
    await page.locator('#suppressEmail').fill('QA-PROTECTED@example.invalid');
    await page.locator('#suppressReason').fill('Manual review hold');
    await page.locator('#suppressReason').press('Enter');
    await page.waitForFunction(
      () =>
        document
          .querySelector('#suppressionEditor [data-drawer-notice]')
          .textContent.includes('Protection added for qa-protected@example.invalid') &&
        !document.querySelector('#suppress').disabled,
    );
    assert.equal(
      (await previewApi('state')).suppression['qa-protected@example.invalid'],
      'Manual review hold',
    );
    await page.locator('#suppressEmail').fill('qa-protected@example.invalid');
    await page.locator('#suppressReason').fill('Do not replace the existing reason');
    await page.locator('#suppress').click();
    await page.waitForFunction(() =>
      document.querySelector('#suppressionFeedback').textContent.includes('already protected'),
    );
    assert.equal(
      (await previewApi('state')).suppression['qa-protected@example.invalid'],
      'Manual review hold',
      'Duplicate add retains the original protection reason',
    );
    await page.route('**/api/suppress', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Synthetic protection save error' }),
      }),
    );
    await page.locator('#suppressEmail').fill('unsaved-hold@example.invalid');
    await page.locator('#suppressReason').fill('Retained protection draft');
    await page.locator('#suppress').click();
    await page.waitForFunction(() =>
      document
        .querySelector('#suppressionEditor [data-drawer-notice]')
        .textContent.includes('Synthetic protection save error'),
    );
    assert.equal(await page.locator('#suppressEmail').inputValue(), 'unsaved-hold@example.invalid');
    assert.equal(await page.locator('#suppressReason').inputValue(), 'Retained protection draft');
    await page.unroute('**/api/suppress');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(
        await page
          .locator('#suppressionEditor')
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      );
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `dnc-add-${width}.png`),
        });
    }
    await page.getByRole('button', { name: 'Close Protect a contact', exact: true }).click();
    await previewApi('suppress', {
      email: 'captured-optout@example.invalid',
      reason: 'Captured carrier opt-out: ' + 'a'.repeat(64),
    });
    await page.waitForFunction(() =>
      document
        .querySelector('#suppressionList')
        .textContent.includes('captured-optout@example.invalid'),
    );
    const capturedRow = page.locator('[data-suppressed-email="captured-optout@example.invalid"]');
    assert.equal(await capturedRow.locator('[data-unsuppress]').count(), 0);
    assert.equal(
      await capturedRow
        .locator('[data-conversation-email]')
        .getAttribute('data-conversation-email'),
      'captured-optout@example.invalid',
    );
    assert(
      !(await capturedRow.innerText()).includes('a'.repeat(64)),
      'Technical opt-out hashes are replaced with readable guidance',
    );
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('.suppression-records').scrollIntoViewIfNeeded();
      assert(
        await page
          .locator('.suppression-records')
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      );
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `dnc-list-${width}.png`),
        });
    }
    await page.locator('#suppressionKind').selectOption('captured');
    assert.equal(await page.locator('#suppressionList [data-suppressed-email]').count(), 1);
    await page.locator('#suppressionKind').selectOption('other');
    await page.locator('#suppressionSearch').fill('qa-protected');
    await page.locator('[data-unsuppress="qa-protected@example.invalid"]').click();
    await page
      .getByRole('dialog', { name: 'Remove contact protection?', exact: true })
      .getByRole('button', { name: 'Cancel', exact: true })
      .click();
    assert.equal(
      (await previewApi('state')).suppression['qa-protected@example.invalid'],
      'Manual review hold',
    );
    await page.locator('[data-unsuppress="qa-protected@example.invalid"]').click();
    await page
      .getByRole('dialog', { name: 'Remove contact protection?', exact: true })
      .getByRole('button', { name: 'Remove entry', exact: true })
      .click();
    await page.waitForFunction(() =>
      document.querySelector('#notice').textContent.includes('Removal requested'),
    );
    assert.equal(
      (await previewApi('state')).suppression['qa-protected@example.invalid'],
      undefined,
    );
    await page.locator('#suppressionSearch').fill('no match for this protection');
    assert.match(await page.locator('#suppressionList').innerText(), /No matching contacts/);
    await page.locator('[data-suppression-empty=reset]').click();
    assert.equal(await page.locator('#suppressionKind').inputValue(), 'all');
    await page.locator('[data-view="accounts"]').click();
    await page.locator('[data-edit-profile]').first().click();
    await page.locator('#connectionMode').selectOption('cdp');
    await page.locator('#cdpSettings').waitFor({ state: 'visible' });
    for (const width of [1440, 1350, 1280, 1200, 1024, 820, 768, 480, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.locator('#profileEditor').evaluate((dialog) => {
        const bounds = dialog.getBoundingClientRect();
        return {
          left: bounds.left,
          right: bounds.right,
          width: innerWidth,
          overflow: dialog.scrollWidth - dialog.clientWidth,
          fieldsFit: [...dialog.querySelectorAll('input,select,textarea,button')]
            .filter((e) => e.getBoundingClientRect().width)
            .every((e) => e.getBoundingClientRect().right <= bounds.right + 1),
        };
      });
      assert(
        layout.left >= 0 && layout.right <= layout.width + 1,
        `Profile drawer stays inside ${width}px viewport`,
      );
      assert(layout.overflow <= 1 && layout.fieldsFit, `Profile fields fit at ${width}px`);
      if ([1440, 390].includes(width) && process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `drawer-profile-${width}.png`),
        });
    }
    await page.locator('#accountName').fill('Uncommitted account draft');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#profileEditor').isVisible(), false);
    assert.equal(await page.locator('#accountName').inputValue(), 'Uncommitted account draft');
    await page.locator('[data-view="settings"]').click();
    assert.equal(
      await page.locator('#view-settings #accountEmail').count(),
      0,
      'Profile setup belongs to Accounts',
    );
    for (const width of [1440, 1280, 1024, 820, 768, 480, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.locator('#view-settings').evaluate((view) => {
        const panels = [...view.querySelectorAll('.settings-tab-panel .panel')];
        const fits = panels.every((panel) => panel.scrollWidth <= panel.clientWidth + 1);
        const viewport = document.querySelector('.app-viewport');
        return {
          panels: panels.length,
          fits,
          paneFit: viewport.scrollWidth <= viewport.clientWidth + 1,
        };
      });
      assert.equal(
        layout.panels,
        12,
        'All concern-specific settings cards remain mounted across tabs',
      );
      assert(layout.fits && layout.paneFit, `Settings sections fit at ${width}px`);
    }
    assert.equal(await page.locator('#trackingPcId').inputValue(), '4');
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.locator('[data-view="leads"]').click();
    await page.locator('#filter').selectOption('all');
    await page.locator('#leadRows [data-preview]').first().click();
    await page.locator('#leadPreviewDrawer').waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const footer = document.querySelector('#leadPreviewDrawer .drawer-footer');
      const bounds = footer.getBoundingClientRect();
      return (
        bounds.left >= 0 &&
        bounds.right <= innerWidth + 1 &&
        footer.scrollWidth <= footer.clientWidth + 1 &&
        [...footer.querySelectorAll('button')].every(
          (button) => button.getBoundingClientRect().right <= bounds.right + 1,
        )
      );
    });
    assert.equal(
      await page.locator('#leadPreviewDrawer').evaluate((el) => el.matches(':modal')),
      true,
    );
    await page.locator('#tabLeadDetails').focus();
    await page.keyboard.press('End');
    assert.equal(await page.locator('#tabEmailDraft').getAttribute('aria-selected'), 'true');
    const anotherPreviewKey = await page.locator('#template option').nth(1).getAttribute('value');
    await page.locator('#template').selectOption(anotherPreviewKey);
    await page.waitForResponse((response) => response.url().includes('/api/preview?'));
    assert.equal(
      await page.locator('#tabEmailDraft').getAttribute('aria-selected'),
      'true',
      'Selecting a lead-preview template keeps the Email Preview tab open',
    );
    assert.equal(
      await page.locator('#body').inputValue(),
      draft,
      'Lead-preview selection does not switch the editor draft',
    );
    await page.keyboard.press('Home');
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `drawer-lead-${width}.png`),
        });
    }
    await page.locator('#closeDrawerBtn').click();
    assert.equal(await page.locator('#leadPreviewDrawer').isVisible(), false);
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.locator('#leadRows input[type="checkbox"]:not(:disabled)').first().check();
    await page.waitForFunction(() =>
      document.querySelector('.context-selection').textContent.includes('1 selected'),
    );
    await page.locator('[data-view="campaigns"]').click();
    assert(await page.locator('.workspace-context #campaignSelect').isVisible());
    assert(await page.locator('.workspace-context #profileSelect').isVisible());
    assert.match(await page.locator('.context-selection').innerText(), /1 selected/);
    assert.match(await page.locator('.context-connection').innerText(), /Mailbox (dis)?connected/);
    assert.match(await page.locator('.context-source').innerText(), /File:/);
    await page.locator('[data-open-campaign="c1"]').click();
    await page.locator('#view-campaign-edit.active').waitFor();
    await page.getByRole('tab', { name: 'Queue settings', exact: true }).click();
    await page.locator('#campaignName').fill('Unsaved campaign scope draft');
    await page.getByRole('tab', { name: 'Source & mapping', exact: true }).click();
    assert.equal(await page.locator('#campaignName').inputValue(), 'Unsaved campaign scope draft');
    assert.equal(await page.locator('.nav-link.active').getAttribute('data-view'), 'campaigns');
    await page.goBack();
    await page.locator('#campaign-panel-settings').waitFor({ state: 'visible' });
    assert.equal(
      await page.getByRole('tab', { name: 'Queue settings' }).getAttribute('aria-selected'),
      'true',
    );
    await page.getByRole('tab', { name: 'Queue settings' }).press('ArrowLeft');
    await page.locator('#campaign-panel-audience').waitFor({ state: 'visible' });
    await page.locator('.sidebar-create').click();
    await page.locator('#view-campaign-new.active').waitFor();
    assert.equal(
      await page.locator('#campaignName').inputValue(),
      'Unsaved campaign scope draft',
      'Entering creation does not reset the current campaign',
    );
    assert.equal(
      (await previewApi('state')).activeCampaign,
      'c1',
      'Navigation never creates or switches a campaign',
    );
    await page.locator('[data-view="campaigns"]').click();
    await page.locator('[data-open-campaign="c1"]').click();
    await page.getByRole('tab', { name: 'Audience', exact: true }).click();
    await page.getByRole('link', { name: 'Open template library', exact: true }).click();
    await page.locator('#view-templates.active').waitFor();
    assert.equal(await page.locator('#subject').inputValue(), draft);
    assert.equal(
      await page.locator('#view-templates [role="tablist"]').count(),
      0,
      'Global template library does not impersonate campaign steps',
    );
    await page.locator('[data-view="tracking"]').click();
    await page.waitForFunction(
      () => document.querySelector('.view-page.active').id === 'view-tracking',
    );

    await page.locator('[data-track]').first().click();
    await page.locator('#trackingDrawer').waitFor({ state: 'visible' });
    assert.equal(
      await page.locator('#trackingDrawer').evaluate((el) => el.matches(':modal')),
      true,
    );
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const fits = await page.locator('#trackingDrawer').evaluate((el) => {
        const r = el.getBoundingClientRect(),
          body = el.querySelector('.ui-drawer__body'),
          footer = el.querySelector('.ui-drawer__footer');
        body.scrollTop = body.scrollHeight;
        return (
          r.left >= 0 &&
          r.right <= innerWidth + 1 &&
          el.scrollWidth <= el.clientWidth + 1 &&
          footer.getBoundingClientRect().bottom <= innerHeight + 1
        );
      });
      assert(fits, `Tracking drawer fits and actions remain visible at ${width}px`);
      if (process.env.FC_UI_SCREENSHOT_DIR)
        await page.screenshot({
          path: path.join(process.env.FC_UI_SCREENSHOT_DIR, `drawer-tracking-${width}.png`),
        });
    }
    await page.locator('#tabTrackingOverview').focus();
    await page.keyboard.press('End');
    assert.equal(await page.locator('#tabTrackingRaw').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#trackingDrawer').isVisible(), false);
    assert.equal(
      await page
        .locator('[data-track]')
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );

    await page.locator('[data-pill-status="seeds"]').click();
    assert.equal(await page.locator('#trackingSearch').inputValue(), 'seed');
    await page.locator('[data-pill-status=""]').click();
    assert.equal(
      await page.locator('#trackingSearch').inputValue(),
      '',
      'All records clears the seed quick filter',
    );
    await page.locator('#trackingStatus').selectOption('soft_bounced');
    await page.waitForFunction(() =>
      document.querySelector('#trackingFilterSummary').textContent.includes('1 active filter'),
    );
    assert.equal(
      await page.locator('#trackingQuickPills [aria-pressed="true"]').count(),
      0,
      'Status selection never leaves an unrelated quick filter selected',
    );
    await page.locator('#trackingResetFilters').click();
    await page.waitForFunction(() =>
      document
        .querySelector('#trackingFilterSummary')
        .textContent.startsWith('All recorded messages'),
    );
    assert.equal(await page.locator('[data-pill-status=""]').getAttribute('aria-pressed'), 'true');

    await page.waitForFunction(
      () => document.querySelector('#trackingMessages').getAttribute('aria-busy') === 'false',
    );
    let releaseTracking;
    let blockTracking = true;
    const trackingGate = new Promise((resolve) => {
      releaseTracking = resolve;
    });
    await page.route(/\/api\/tracking\?/, async (route) => {
      if (blockTracking) {
        blockTracking = false;
        await trackingGate;
      }
      await route.continue();
    });
    await page.locator('[data-pill-status="open_detected"]').click();
    await page.waitForFunction(
      () => document.querySelector('#trackingMessages').getAttribute('aria-busy') === 'true',
    );
    await page.locator('#trackingStatus').selectOption('soft_bounced');
    const latestTracking = page.waitForResponse(
      (response) =>
        response.url().includes('/api/tracking?') &&
        new URL(response.url()).searchParams.get('status') === 'soft_bounced',
    );
    releaseTracking();
    await latestTracking;
    await page.waitForFunction(
      () => document.querySelector('#trackingMessages').getAttribute('aria-busy') === 'false',
    );
    assert.equal(
      await page.locator('#trackingStatus').inputValue(),
      'soft_bounced',
      'The latest filter is replayed after an in-flight refresh',
    );
    await page.unroute(/\/api\/tracking\?/);
    await page.locator('#trackingResetFilters').click();
    for (const section of ['trackingSeedStudio', 'trackingDomainHealth']) {
      await page.locator(`#tab-${section}`).click();
      await page.waitForFunction(
        (section) =>
          location.hash === `#${section}` &&
          document.querySelector('.view-page.active').id === 'view-tracking',
        section,
      );
      await page.locator(`#${section}`).waitFor({ state: 'visible' });
      const header = await page.locator(`#${section} .panel-head`).evaluate((element) => {
        const right = element.getBoundingClientRect().right;
        return [...element.children].every(
          (child) => child.getBoundingClientRect().right <= right + 1,
        );
      });
      assert(header, `${section}: header children fit inside the panel at mobile width`);
    }
    assert.equal(await page.locator('#view-tracking [role=tabpanel]:visible').count(), 1);
    await page.locator('#healthDomain').fill('preserved.example.com');
    await page.getByRole('tab', { name: 'Domain Health', exact: true }).press('Home');
    await page.locator('#trackingMessagePanel').waitFor({ state: 'visible' });
    assert.equal(
      await page.getByRole('tab', { name: 'Messages', exact: true }).getAttribute('aria-selected'),
      'true',
    );
    await page.getByRole('tab', { name: 'Messages', exact: true }).press('End');
    await page.locator('#trackingDiagnostics').waitFor({ state: 'visible' });
    await page.getByRole('tab', { name: 'Domain Health', exact: true }).click();
    assert.equal(await page.locator('#healthDomain').inputValue(), 'preserved.example.com');
    await page.goto(`${url}/#trackingSeedStudio`);
    await page.locator('#trackingRows tr').first().waitFor({ state: 'attached' });
    assert.equal(await page.locator('.view-page.active').getAttribute('id'), 'view-tracking');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openView('dashboard');
    const overview = await page.locator('#view-dashboard').evaluate((view) => ({
      stats: view.querySelector('.dashboard-metrics').getBoundingClientRect().bottom,
      start: view.querySelector('#start').getBoundingClientRect().bottom,
      connect: view.querySelector('#connect').getBoundingClientRect().bottom,
      height: innerHeight,
    }));
    assert(
      overview.stats < overview.height &&
        overview.start < overview.height &&
        overview.connect < overview.height,
      'Stats, runner and connection actions share the first desktop viewport',
    );
    assert.match(
      await page.locator('.dashboard-metrics').innerText(),
      /All campaigns · this PC/,
      'Send totals keep their true PC-wide scope',
    );
    const beforeCreate = await previewApi('state');
    await page.locator('.sidebar-create').click();
    await page.locator('#view-campaign-new.active').waitFor();
    assert.equal(
      await page.locator('#campaignName').isVisible(),
      false,
      'Creation does not expose the selected campaign editor',
    );
    assert.equal(
      (await previewApi('state')).campaigns.length,
      beforeCreate.campaigns.length,
      'Navigation alone does not create records',
    );
    const chooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Choose .xlsx workbook', exact: true }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: 'New-campaign-UX-check.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: fixture.original,
    });
    await page.locator('#view-imports.active').waitFor();
    const afterCreate = await previewApi('state');
    const created = afterCreate.campaigns.find((c) => c.id === afterCreate.activeCampaign);
    assert.equal(afterCreate.campaigns.length, beforeCreate.campaigns.length + 1);
    assert.notEqual(created.id, beforeCreate.activeCampaign);
    assert.equal(created.enabled, false, 'A new campaign remains paused');
    assert.equal(created.reviewRequired, true, 'Creation cannot bypass source review');
    assert.equal(
      afterCreate.campaigns.find((c) => c.id === 'c1').name,
      beforeCreate.campaigns.find((c) => c.id === 'c1').name,
      'Existing campaign data remains intact',
    );
    await page.locator('[data-view="campaigns"]').click();
    await page.locator(`[data-open-campaign="${created.id}"]`).click();
    await page.locator('#view-campaign-edit.active').waitFor();
    await page.getByRole('tab', { name: 'Source & mapping', exact: true }).click();
    await page.locator('#openImportReview').click();
    await page.locator('#view-imports.active').waitFor();
    await page.waitForFunction(
      (id) => document.querySelector('#reviewCampaign').value === id,
      created.id,
    );

    // Appearance changes never unmount controller-owned fields or discard unsaved edits.
    const campaignControl = await page.locator('#campaignSelect').elementHandle();
    const activeCampaign = await page.locator('#campaignSelect').inputValue();
    const activeProfile = await page.locator('#profileSelect').inputValue();
    const templateDraft = await page.locator('#subject').inputValue();
    await page
      .getByRole('button', { name: 'Collapse workspace context', exact: true })
      .press('Space');
    assert.equal(await page.locator('#workspaceContextContent').isVisible(), false);
    assert.equal(
      await page
        .getByRole('button', { name: 'Expand workspace context' })
        .getAttribute('aria-expanded'),
      'false',
    );
    assert(await page.locator('.context-summary').isVisible());
    assert(await campaignControl.evaluate((element) => element.isConnected));
    await openView('settings');
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByLabel('Show workspace context', { exact: true }).uncheck();
    assert.equal(await page.locator('.workspace-context-shell').isVisible(), false);
    assert.equal(await page.locator('#campaignSelect').count(), 1);
    assert(await campaignControl.evaluate((element) => element.isConnected));
    assert.equal(await page.locator('#campaignSelect').inputValue(), activeCampaign);
    assert.equal(await page.locator('#profileSelect').inputValue(), activeProfile);
    assert.equal(await page.locator('#subject').inputValue(), templateDraft);
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await page.locator('#view-settings.active').waitFor();
    assert.equal(
      await page.getByLabel('Show workspace context', { exact: true }).isChecked(),
      false,
    );
    assert.equal(await page.locator('.workspace-context-shell').isVisible(), false);
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByLabel('Show workspace context', { exact: true }).check();
    assert(await page.getByRole('button', { name: 'Expand workspace context' }).isVisible());
    await page.getByRole('button', { name: 'Expand workspace context' }).press('Enter');
    assert(await page.locator('#campaignSelect').isVisible());
    assert.equal(await page.locator('#campaignSelect').inputValue(), activeCampaign);
    assert.equal(await page.locator('#profileSelect').inputValue(), activeProfile);
    page.once('dialog', (dialog) => dialog.accept());
    await page.reload();
    await page.locator('#campaignSelect option').first().waitFor({ state: 'attached' });
    assert.equal(
      await page
        .getByRole('button', { name: 'Collapse workspace context' })
        .getAttribute('aria-expanded'),
      'true',
    );
    await openView('dashboard');
    await page.locator('#carrierAttentionMetrics .ui-metric').first().waitFor();
    for (const width of [1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const statsFit = await page.locator('#carrierAttentionMetrics').evaluate((wrapper) => {
        const group = wrapper.querySelector('.ui-metric-group');
        return (
          Math.abs(group.getBoundingClientRect().width - wrapper.getBoundingClientRect().width) <
            2 &&
          [...group.querySelectorAll('.ui-metric')].every(
            (card) => card.scrollWidth <= card.clientWidth + 1,
          )
        );
      });
      assert(statsFit, `Carrier statistics fill the panel without overlapping at ${width}px`);
    }
    for (const width of [1440, 1024, 858, 768, 680, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const fits = await page.locator('.app-titlebar').evaluate((header) => {
        const bounds = header.getBoundingClientRect();
        const pattern = header.querySelector('.header-pattern').getBoundingClientRect();
        return (
          Math.abs(pattern.right - bounds.right) < 1 &&
          Math.abs(pattern.top - bounds.top) < 1 &&
          [...header.querySelectorAll('.workspace-breadcrumb, .connection-pill')].every(
            (element) => {
              const box = element.getBoundingClientRect();
              return box.right <= pattern.left && box.left >= bounds.left;
            },
          ) &&
          header.scrollWidth <= header.clientWidth + 1
        );
      });
      assert(fits, `Header pattern and controls fit without overlap at ${width}px`);
    }

    // Every route shares the same sticky title/actions, including both context modes and hiding.
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const mode of ['expanded', 'collapsed', 'hidden']) {
        await openView('settings');
        if (mode === 'collapsed') {
          await page.getByRole('button', { name: 'Collapse workspace context' }).click();
        } else if (mode === 'hidden') {
          await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
          await page.getByLabel('Show workspace context', { exact: true }).uncheck();
        } else {
          await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
          await page.getByLabel('Show workspace context', { exact: true }).check();
          if (await page.getByRole('button', { name: 'Expand workspace context' }).isVisible()) {
            await page.getByRole('button', { name: 'Expand workspace context' }).click();
          }
        }
        for (const view of ui.viewNames) {
          await openView(view);
          const layout = await page.evaluate(async () => {
            const viewport = document.querySelector('.app-viewport');
            viewport.scrollTo(0, 0);
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            );
            const header = document.querySelector('.view-page.active > .page-header');
            const context = document.querySelector('.workspace-context-shell');
            const offset =
              getComputedStyle(context).position === 'sticky'
                ? context.getBoundingClientRect().height
                : 0;
            const naturalTop = header.getBoundingClientRect().top;
            viewport.scrollTo(0, 700);
            await new Promise((resolve) => requestAnimationFrame(resolve));
            const bounds = header.getBoundingClientRect();
            const style = getComputedStyle(header);
            return {
              sectionNav: (() => {
                const nav = document.querySelector('.tracking-section-nav');
                return {
                  height: nav.getBoundingClientRect().height,
                  top: nav.getBoundingClientRect().top,
                  position: getComputedStyle(nav).position,
                };
              })(),
              position: style.position,
              top: bounds.top,
              height: bounds.height,
              offset,
              scrolled: viewport.scrollTop,
              naturalTop,
              scrollInset: parseFloat(getComputedStyle(viewport).scrollPaddingTop),
              fits: header.scrollWidth <= header.clientWidth + 1,
            };
          });
          if (view === 'tracking') {
            assert.equal(layout.sectionNav.position, 'sticky');
            if (layout.scrolled >= layout.naturalTop - layout.offset + layout.height + 16)
              assert(
                Math.abs(layout.sectionNav.top - layout.offset - layout.height) <= 1,
                `Tracking section links pin below header: ${JSON.stringify(layout)}`,
              );
            assert(
              layout.scrollInset >= layout.offset + layout.height + layout.sectionNav.height,
              'Tracking anchors clear section navigation',
            );
          }
          const independentInbox = view === 'conversations' && width > 1020;
          assert.equal(
            layout.position,
            independentInbox ? 'relative' : 'sticky',
            `${view}/${mode}/${width}: shared page header`,
          );
          assert(layout.fits, `${view}/${mode}/${width}: header actions fit`);
          if (!independentInbox && layout.scrolled >= layout.naturalTop - layout.offset) {
            assert(
              Math.abs(layout.top - layout.offset) <= 1,
              `${view}/${mode}/${width}: title/actions pin below context (${JSON.stringify(layout)})`,
            );
          }
          assert(
            layout.scrollInset >= layout.offset + layout.height,
            `${view}/${mode}/${width}: anchors clear the sticky stack`,
          );
        }
        await openView('settings');
        await page.getByRole('tab', { name: 'Firebase sync', exact: true }).click();
        await page.waitForFunction(() => {
          const section = document.querySelector('#settingsConnections').getBoundingClientRect();
          const header = document
            .querySelector('#view-settings > .page-header')
            .getBoundingClientRect();
          return section.top >= header.bottom && section.top < innerHeight;
        });
        const saveButtonIsClear = await page.locator('#saveSettings').evaluate((button) => {
          const bounds = button.getBoundingClientRect();
          return button.contains(
            document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2),
          );
        });
        assert(
          saveButtonIsClear,
          `Settings save action remains unobstructed after section navigation (${mode}/${width})`,
        );
      }
    }
    await openView('settings');
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByLabel('Show workspace context', { exact: true }).check();
    await page.getByRole('button', { name: 'Expand workspace context' }).click();

    // Storage denial must preserve working in-session controls and explain the limitation.
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Blocked', 'SecurityError');
      };
    });
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByLabel('Show workspace context', { exact: true }).uncheck();
    assert.equal(await page.locator('.workspace-context-shell').isVisible(), false);
    assert.match(
      await page.locator('#settingsAppearance [role="status"]').innerText(),
      /Browser storage is unavailable/,
    );
    await page.getByRole('tab', { name: 'Appearance', exact: true }).click();
    await page.getByLabel('Show workspace context', { exact: true }).check();
    assert(await page.locator('#campaignSelect').isVisible());
    assert.deepEqual(scriptErrors, []);
  },
);
