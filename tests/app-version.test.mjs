import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { APP_VERSION, APP_BUILD_LABEL, describeVersion } from '../src/app-version.mjs';
import { BUILD_HISTORY } from '../src/release-catalog.mjs';

test('internal app identity stays consistent across package metadata and catalog without altering schema numbers', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
  assert.equal(APP_VERSION, pkg.version);
  assert.equal(APP_VERSION, lock.version);
  assert.equal(APP_VERSION, lock.packages[''].version);
  assert.match(APP_VERSION, /^0\.\d+\.\d+-alpha\.[1-9]\d*$/);
  assert.equal(APP_BUILD_LABEL, 'Internal alpha');
  assert.equal(BUILD_HISTORY.filter(entry => entry.version === APP_VERSION).length, 1);
  assert.equal(new Set(BUILD_HISTORY.map(entry => entry.id)).size, BUILD_HISTORY.length);
  for (const entry of BUILD_HISTORY) {
    assert(['build', 'checkpoint', 'milestone'].includes(entry.kind));
    assert.equal(new Date(entry.date).toISOString().slice(0, 10), entry.date);
    if (entry.kind === 'checkpoint') { assert(entry.legacyVersion); assert(!entry.version); }
  }
});

test('build stage labels distinguish internal work, beta, candidate and actual release versions', () => {
  for (const [version, label] of [
    ['0.1.0-alpha.2', 'Internal alpha'],
    ['0.1.0-beta.1', 'Beta testing'],
    ['1.0.0-rc.1', 'Release candidate'],
    ['0.2.0', 'Development build'],
    ['1.0.0-preview.1', 'Development build'],
    ['1.0.0', 'Release'],
  ]) assert.equal(describeVersion(version), label);
});
