import { randomUUID } from 'node:crypto';
import { digest } from './reply-parser.mjs';
import { captureScopeSignature } from './tool-conversation-scope.mjs';

export const FOLLOW_UP_COVERAGE_MAX_AGE_MS = 15 * 60_000;
export function coverageConfiguration(config, mailbox) {
  return digest(JSON.stringify({ generation: config.generation || null, enabled: config.enabled, allHistory: config.allHistory, allFolders: config.allFolders, since: config.since,
    mailbox: [mailbox.id, mailbox.email, mailbox.user || mailbox.email, mailbox.host, mailbox.port || 993, mailbox.inboxFolder || 'INBOX', mailbox.sentFolder || '', mailbox.provider || '', mailbox.authMode || '', mailbox.passwordEnv || '', mailbox.accessTokenEnv || ''] }));
}
/** Only the capture worker creates proof, after exhausting every selected folder. */
export function completedCoverage(state, config, mailbox, previous, now, { historical = false, observedAt = now } = {}) {
  const configuration = coverageConfiguration(config, mailbox), scope = captureScopeSignature(state, mailbox.email, false);
  const old = previous?.coverage, oldAt = Date.parse(old?.checkedAt);
  const reusable = !historical && old?.version === 1 && typeof old.epoch === 'string' && old.epoch.length > 0 && old.configuration === configuration && old.scope === scope && Number.isFinite(oldAt) && oldAt <= now && now - oldAt < FOLLOW_UP_COVERAGE_MAX_AGE_MS;
  return { version: 1, epoch: reusable ? old.epoch : randomUUID(), account: mailbox.email, configuration, scope, checkedAt: new Date(observedAt).toISOString(), completedAt: new Date(now).toISOString() };
}
export function followUpCoverage(state, root, config, now = Date.now()) {
  const blocked = (reason, checkedAt = null) => ({ ready: false, reason, checkedAt, expiresAt: null, epoch: null });
  if (!config?.enabled) return blocked('Enable read-only capture and complete a full mailbox scan before a proactive follow-up.');
  const mailbox = config.mailboxes?.find(m => m.email === root.account);
  if (!mailbox) return blocked('Configure capture for this sending mailbox before a proactive follow-up.');
  if (state.monitors?._capture?.status === 'Needs attention') return blocked('Capture storage needs attention. Restore capture health and scan again.');
  if (state.monitors?._history?.status === 'Running') return blocked('Finish the historical reply scan before preparing a no-response follow-up.');
  const monitor = state.monitors?.[mailbox.id], proof = monitor?.coverage;
  if (!proof || proof.version !== 1 || !proof.epoch || proof.account !== root.account || !['Checked', 'Checking'].includes(monitor.status) || monitor.sentUnavailable)
    return blocked('Complete a successful full-history scan of all available folders, including Inbox and Sent, before a proactive follow-up.');
  if (proof.configuration !== coverageConfiguration(config, mailbox) || proof.scope !== captureScopeSignature(state, root.account, false))
    return blocked('Capture configuration or tool-contact scope changed. Run a full scan again.', proof.checkedAt);
  const checkedAt = Date.parse(proof.checkedAt);
  if (!Number.isFinite(checkedAt) || checkedAt > now || now - checkedAt >= FOLLOW_UP_COVERAGE_MAX_AGE_MS)
    return blocked('Mailbox coverage is stale. Run a full scan again; follow-ups require coverage from the last 15 minutes.', proof.checkedAt);
  return { ready: true, reason: 'Recent full mailbox coverage is available; this is not proof of human silence.', checkedAt: proof.checkedAt, expiresAt: new Date(checkedAt + FOLLOW_UP_COVERAGE_MAX_AGE_MS).toISOString(), epoch: proof.epoch };
}
