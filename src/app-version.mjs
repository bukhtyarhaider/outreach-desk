import fs from 'node:fs';

// Package metadata is the single source for the application identity, not data/schema versions.
export const APP_VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
export function describeVersion(version) {
  if (/-alpha(?:\.|$)/.test(version)) return 'Internal alpha';
  if (/-beta(?:\.|$)/.test(version)) return 'Beta testing';
  if (/-rc(?:\.|$)/.test(version)) return 'Release candidate';
  if (version.startsWith('0.') || version.includes('-')) return 'Development build';
  return 'Release';
}
export const APP_BUILD_LABEL = describeVersion(APP_VERSION);
