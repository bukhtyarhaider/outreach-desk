/** Portable handoff data is an explicit allowlist, never a dump of private state. */
export function carrierHandoff(context, history, input, exportedAt) {
  const owner = typeof input.intendedOwner === 'string' ? input.intendedOwner.trim() : '';
  const nextStep = typeof input.nextStep === 'string' ? input.nextStep.trim() : '';
  if (input.confirm !== true || !owner || owner.length > 100 || nextStep.length < 10 || nextStep.length > 2000)
    throw new Error('Review the handoff, enter an intended owner and a next step of 10–2,000 characters, then confirm.');
  const fields = Object.fromEntries(Object.entries(context.fields).map(([name, field]) => {
    const confirmed = field.confirmed;
    const message = confirmed && context.inbound.find(m => m.id === confirmed.messageId);
    return [name, confirmed && !field.conflict && message ? {
      status: 'operator_reviewed_carrier_statement', value: confirmed.value,
      evidence: { messageId: message.id, providerMessageId: message.messageId || null, statedAt: message.date || null, capturedAt: message.capturedAt, reviewedAt: confirmed.confirmedAt || null },
    } : { status: field.conflict ? 'conflicting_evidence' : 'needs_review' }];
  }));
  return {
    schema: 'outreach-desk.carrier-handoff.v1', exportedAt,
    handoff: { intendedOwner: owner, nextStep, status: 'exported_for_manual_handoff', acceptance: 'not_recorded' },
    carrier: { sourceCompany: context.root.company, recipient: context.root.recipient, mailbox: context.root.account, identity: 'source_reported_not_authority_verified' },
    workflow: { stage: history.carrierStatus, followUpAt: history.followUpAt || null, note: history.note || '', signingEvidence: 'workflow_stage_is_not_an_agreement' },
    qualification: { fields, missingRequired: context.missing, basis: 'Carrier-stated facts require independent operational review.' },
    protection: { hold: context.hold || null, reviewRequired: Boolean(context.pending.length || history.reviewRequired), outreachPermission: 'not_granted_by_handoff' },
    evidence: { rootId: context.root.id, trackingId: context.root.trackingId || null, conversationVersion: context.version, workflowVersion: history.statusVersion, toolSentAt: context.root.sentAt, matchedHumanMessages: context.inbound.map(m => ({ id: m.id, providerMessageId: m.messageId || null, statedAt: m.date || null, capturedAt: m.capturedAt })) },
    limitations: ['Local export only; no message was sent and no external ownership or acceptance was recorded.', 'No raw message bodies, login data, tracking tokens, or reply drafts are included.', 'Current permissions, mailbox evidence and protections must be checked before further contact.'],
  };
}
