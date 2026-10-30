import { FirebaseSync } from './firebase-sync.mjs';
import { hash } from './tracking.mjs';

/** Inspect cloud evidence against a clone; never persist, acknowledge, or change settings. */
export async function auditFirebaseSync(sync) {
  const state = sync.state;
  const config = sync.configuration();
  const preview = new FirebaseSync({ state: structuredClone(state), env: { FC_FIREBASE_DISABLE: '1' } });
  const localRecoveryPreview = { scanned: 0, matched: 0, synced: 0, alreadyApplied: 0, otherPc: 0, unmatched: 0, invalid: 0, pcMismatches: 0, acknowledged: 0 };
  const byPc = {}, payloadShapes = {}, last100 = [], newlyOpened = new Set();
  let total = 0, cursor = null;
  if (!sync.rtdb) throw new Error(sync.diagnostics().message);
  for (let page = 0; page < 100; page++) {
    let query = sync.rtdb.ref('email_opens').orderByKey();
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await sync.bounded(query.limitToFirst(500).once('value'));
    let size = 0;
    snapshot.forEach((child) => {
      size++; total++; cursor = child.key;
      const row = child.val();
      const digest = typeof row?.token === 'string' ? hash(row.token) : row?.tokenHash;
      const record = state.tracking?.records?.[state.tracking?.openIndex?.[digest]];
      const before = localRecoveryPreview.synced;
      preview.applyItem('rtdb', child.key, row, localRecoveryPreview, config);
      if (localRecoveryPreview.synced > before && record && !record.firstOpenAt) newlyOpened.add(record.id);
      last100.push({ pcId: String(row?.pcId ?? '(missing)'), pending: !row?.synced });
      if (last100.length > 100) last100.shift();
      const shape = `token:${typeof row?.token}, hash:${typeof row?.tokenHash}, time:${typeof row?.openedAt}`;
      payloadShapes[shape] = (payloadShapes[shape] || 0) + 1;
      const count = byPc[String(row?.pcId ?? '(missing)')] ||= { total: 0, pending: 0, matchingLocalToken: 0, acknowledgedWithoutLocalOpen: 0 };
      count.total++;
      if (!row?.synced) count.pending++;
      if (record) {
        count.matchingLocalToken++;
        if (row.synced && !record.opens?.length) count.acknowledgedWithoutLocalOpen++;
      }
    });
    if (size < 500) { cursor = null; break; }
  }
  const oldLast100ByPc = {};
  for (const row of last100) {
    const count = oldLast100ByPc[row.pcId] ||= { total: 0, pending: 0 };
    count.total++;
    if (row.pending) count.pending++;
  }
  let firestore;
  try {
    const snapshot = await sync.bounded(sync.firestore.collection('email_opens').limit(1).get());
    firestore = { accessible: true, hasEvents: !snapshot.empty };
  } catch { firestore = { accessible: false, message: 'Firestore read failed. Select RTDB only if the cloud endpoint uses Realtime Database.' }; }
  return {
    readOnly: true, complete: !cursor, total, byPc, oldLast100ByPc, payloadShapes, localRecoveryPreview, firestore,
    recovery: {
      scope: 'Realtime Database events compared with this local data; Firestore is checked for accessibility only',
      pcId: config.pcId, mode: config.mode, selectedBackend: config.backend,
      lastCompletedScan: sync.lastSyncAt, recoverableSignals: localRecoveryPreview.synced,
      newlyOpenedMessages: newlyOpened.size,
      automaticPollingPaused: config.mode === 'manual',
      matchingEventsWithDifferentPcId: localRecoveryPreview.pcMismatches,
      selectedDatabaseUnavailable: config.backend !== 'rtdb' && !firestore.accessible,
    },
  };
}
