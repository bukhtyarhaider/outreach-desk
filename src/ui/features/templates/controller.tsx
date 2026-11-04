import { confirmAction } from '../../shared/confirmation';
import { StatusBadge } from '../../design-system/layout';
import { openDrawer, closeDrawer } from '../../design-system/overlays';
import { Icon, Trash2 } from '../../design-system/icons';
import { Button } from '../../design-system/primitives';
import { uiScope } from '../../shared/lifecycle';
import { renderStableRegion } from '../../shared/regions';
import { displayText } from '../../shared/utils';
import { eventElement } from '../../shared/dom';
import { errorMessage } from '../../shared/utils';
import { session } from '../../shared/session';
import { $, notice, action, api, downloadJson } from '../../shared/runtime';
import { refresh } from '../../app/runtime/refresh';
import { preview } from '../leads/controller';
export function renderTemplatesTable() {
  const tbody = $('templatesTableBody');
  if (!tbody || !session.state?.templates) return;
  const query = $('templateSearch').value.toLowerCase().trim();
  const status = $('templateStatusFilter').value;
  const entries = Object.entries(session.state.templates);
  const enabled = entries.filter(([, t]) => t.enabled !== false).length;
  $('templateCountBadge').textContent =
    `${entries.length} template${entries.length === 1 ? '' : 's'}`;
  const filtered = entries.filter(([, t]) => {
    if (status === 'enabled' && t.enabled === false) return false;
    if (status === 'disabled' && t.enabled !== false) return false;
    return (
      !query ||
      `${t.name} ${t.subject} ${t.body} ${(t.requiredFields || []).join(' ')}`
        .toLowerCase()
        .includes(query)
    );
  });
  const summary = document.getElementById('templateLibrarySummary');
  if (summary)
    summary.textContent = `Showing ${filtered.length} of ${entries.length} · ${enabled} enabled · ${entries.length - enabled} disabled`;
  renderStableRegion(
    tbody,
    filtered.length ? (
      filtered.map(([key, template]) => (
        <tr key={key}>
          <td data-label="Message">
            <strong className="template-row-name">{displayText(template.name)}</strong>
            <p className="template-row-subject">{displayText(template.subject || 'No subject')}</p>
            <p className="template-row-excerpt">
              {displayText(template.body || '')
                .replace(/\s+/g, ' ')
                .slice(0, 150)}
            </p>
          </td>
          <td data-label="Selection rules">
            <span className="template-weight">Weight ×{template.weight || 1}</span>
            <div className="template-required-fields">
              {template.requiredFields?.length ? (
                template.requiredFields.map((field) => (
                  <span key={field} className="tag-badge">
                    {field}
                  </span>
                ))
              ) : (
                <small>No required fields</small>
              )}
            </div>
          </td>
          <td data-label="Availability">
            <StatusBadge
              className={'status-pill ' + (template.enabled !== false ? 'ready' : 'blocked')}
            >
              {template.enabled !== false ? 'Enabled' : 'Disabled'}
            </StatusBadge>
          </td>
          <td data-label="Actions">
            <div className="row-actions">
              <Button size="sm" data-edit-template={key} aria-label={`Edit ${template.name}`}>
                Edit
              </Button>
              <Button size="sm" data-export-template={key} aria-label={`Export ${template.name}`}>
                Export
              </Button>
              <Button
                size="icon"
                variant="ghost"
                data-delete-template={key}
                aria-label={`Delete ${template.name}`}
                title="Delete template"
              >
                <Icon icon={Trash2} size={14} />
              </Button>
            </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={4}>
          <div className="template-library-empty">
            <h3>{entries.length ? 'No matching templates' : 'Build your first message'}</h3>
            <p>
              {entries.length
                ? 'Try a different search or availability filter.'
                : 'Create a reusable template with personalization and preview it before saving.'}
            </p>
            <Button size="sm" data-template-empty-action={entries.length ? 'reset' : 'create'}>
              {entries.length ? 'Clear filters' : 'New template'}
            </Button>
          </div>
        </td>
      </tr>
    ),
  );
}

function templateDraft() {
  return JSON.stringify(
    ['templateName', 'subject', 'body', 'templateWeight', 'requiredFields']
      .map((id) => (document.getElementById(id) as HTMLInputElement).value)
      .concat(String($('templateEnabled').checked)),
  );
}

async function openTemplateEditor(key: string | null) {
  if (session.pending) return;
  if (key && !session.state.templates[key]) {
    notice('This template is no longer in the library. Refresh and choose another template.');
    return;
  }
  if (session.templateEditorInitialized && session.templateEditKey === key) {
    openDrawer('templateEditor');
    return;
  }
  if (
    session.templateEditorInitialized &&
    templateDraft() !== session.templateBaseline &&
    !(await confirmAction(
      'Opening another template will replace your unsaved draft. Discard these changes?',
      {
        title: 'Discard unsaved template changes?',
        confirmLabel: 'Discard draft',
        destructive: true,
      },
    ))
  )
    return;
  session.templateEditKey = key;
  fillTemplate();
  openDrawer('templateEditor');
  $('templateName').focus();
}

export function insertOptOutInstruction() {
  const bodyEl = $('body');
  if (!bodyEl) return;
  const optOutText =
    '\n\nIf you’d prefer no further outreach, reply “remove” and I’ll take you off our list.';
  const val = bodyEl.value;
  const legalMatch = val.search(/\{\{legalName\}\}/);
  if (legalMatch !== -1) {
    bodyEl.value =
      val.substring(0, legalMatch).trimEnd() +
      optOutText +
      '\n\n' +
      val.substring(legalMatch).trimStart();
  } else {
    bodyEl.value = val.trimEnd() + optOutText;
  }
  updateTemplateLivePreview();
  notice('Opt-out instruction added to template.');
}

export function fillTemplate() {
  const selected = session.templateEditKey
    ? session.state.templates[session.templateEditKey]
    : null;
  const template = selected || {
    name: '',
    subject: '',
    body: '',
    weight: 1,
    enabled: true,
    requiredFields: [],
  };
  $('deleteTemplate').hidden = !selected;
  $('deleteTemplate').disabled = !selected;
  const title = document.getElementById('templateEditorTitle');
  if (title) title.textContent = selected ? 'Edit template' : 'New template';
  const description = document.getElementById('templateEditorDescription');
  if (description)
    description.textContent = selected
      ? `Editing “${selected.name}”. Changes apply only when you save.`
      : 'Create a reusable message. Saving adds it to your library; it does not send email.';
  $('subject').value = template.subject;
  $('body').value = template.body;
  $('templateName').value = template.name;
  $('templateEnabled').checked = template.enabled !== false;
  $('templateWeight').value = String(template.weight || 1);
  $('requiredFields').value = (template.requiredFields || []).join(', ');
  session.templateEditorInitialized = true;
  session.templateBaseline = templateDraft();
  for (const field of [$('templateName'), $('subject'), $('body'), $('templateWeight')])
    field.setCustomValidity('');
  lastFocusedTmplInput = $('body');
  updateTemplateLivePreview();
}

export function updateTemplateLivePreview() {
  const previewBox = $('templateLivePreview');
  if (!previewBox) return;
  const p = session.state?.profiles?.find((p) => p.id === session.state.activeProfile);
  const b = p?.business || session.state?.settings?.business || {};
  const sampleData = {
    firstName: 'Alex',
    company: 'Example Carrier LLC',
    city: 'Dallas',
    state: 'TX',
    locationPhrase: ' in Dallas, TX',
    senderName: b.senderName || $('senderName')?.value || 'Your name',
    businessName: b.company || $('businessName')?.value || 'Your company',
    legalName: b.legalName || $('legalName')?.value || 'Your legal business name',
    address: b.address || $('address')?.value || 'Your business address',
    services:
      b.services ||
      $('services')?.value ||
      'load sourcing, rate negotiation, lane planning, broker paperwork, and pickup/delivery coordination',
  };
  let subject = $('subject')?.value || '';
  let body = $('body')?.value || '';
  for (const [k, v] of Object.entries(sampleData)) {
    subject = subject.replaceAll(`{{${k}}}`, v);
    body = body.replaceAll(`{{${k}}}`, v);
  }
  previewBox.textContent =
    subject || body
      ? `Subject: ${subject}\n\n${body}`
      : 'Write a subject and message to see the sample preview.';
  const rawBody = $('body')?.value || '';
  const words = rawBody.split(/\s+/).filter(Boolean).length;
  const compStatus = $('templateComplianceStatus');
  if (compStatus) {
    if (!rawBody.trim()) {
      compStatus.textContent = 'Draft';
      compStatus.className = 'ui-badge ui-badge--neutral';
    } else {
      compStatus.textContent = `${words} words`;
      compStatus.className = 'ui-badge ui-badge--positive';
    }
  }
}

let lastFocusedTmplInput: HTMLInputElement | HTMLTextAreaElement | null = null;

export function mountTemplates() {
  if ($('insertOptOutChip'))
    uiScope.handler($('insertOptOutChip'), 'onclick', insertOptOutInstruction);
  if ($('saveTemplate'))
    uiScope.handler($('saveTemplate'), 'onclick', () => {
      for (const field of [$('templateName'), $('subject'), $('body')])
        field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
      for (const field of [$('templateName'), $('subject'), $('body'), $('templateWeight')]) {
        if (!field.reportValidity()) {
          field.focus();
          return;
        }
      }
      return action($('saveTemplate'), async () => {
        if (session.templateEditKey && !session.state.templates[session.templateEditKey])
          throw new Error(
            'This template was removed. Copy your draft before creating a new template.',
          );
        const saved = await api<{ key: string; warnings: string[] }>('/api/template', {
          key: session.templateEditKey || '',
          name: $('templateName').value,
          subject: $('subject').value,
          body: $('body').value,
          enabled: $('templateEnabled').checked,
          weight: Number($('templateWeight').value),
          requiredFields: $('requiredFields')
            .value.split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        });
        await refresh();
        session.templateEditKey = String(saved.key);
        fillTemplate();
        if (session.previewId && $('leadPreviewDrawer').open)
          await preview(session.previewId, 'email');
        if (saved.warnings && saved.warnings.length) {
          notice(`Template saved with warning: ${saved.warnings.join(' ')}`);
        } else {
          notice('Template saved.');
        }
      });
    });
  if ($('template'))
    uiScope.handler($('template'), 'onchange', () => {
      if (session.previewId)
        preview(session.previewId, 'email').catch((e) => notice(errorMessage(e)));
    });
  for (const field of [$('templateName'), $('subject'), $('body')])
    uiScope.listen(field, 'input', () => field.setCustomValidity(''));
  if ($('subject')) uiScope.handler($('subject'), 'oninput', updateTemplateLivePreview);
  if ($('body')) uiScope.handler($('body'), 'oninput', updateTemplateLivePreview);
  lastFocusedTmplInput = $('body');
  if ($('subject')) {
    uiScope.listen($('subject'), 'focus', () => {
      lastFocusedTmplInput = $('subject');
    });
  }
  if ($('body')) {
    uiScope.listen($('body'), 'focus', () => {
      lastFocusedTmplInput = $('body');
    });
  }
  // Token chip click helper
  document.querySelectorAll<HTMLElement>('.token-chip').forEach((chip) => {
    uiScope.handler(chip, 'onclick', async () => {
      const token = chip.dataset.token;
      if (!token) return;
      const targetEl =
        lastFocusedTmplInput === $('subject') ? $('subject') : $('body') || $('subject');
      if (!targetEl) return;
      const start = targetEl.selectionStart ?? targetEl.value.length;
      const end = targetEl.selectionEnd ?? targetEl.value.length;
      const txt = targetEl.value;
      targetEl.value = txt.substring(0, start) + token + txt.substring(end);
      targetEl.selectionStart = targetEl.selectionEnd = start + token.length;
      targetEl.focus();
      updateTemplateLivePreview();
    });
  });
  uiScope.handler($('newTemplate'), 'onclick', () => openTemplateEditor(null));
  if ($('deleteTemplate'))
    uiScope.handler($('deleteTemplate'), 'onclick', async () => {
      const key = session.templateEditKey;
      if (!key || !session.state.templates[key]) return;
      const t = session.state.templates[key];
      if (
        !(await confirmAction(
          `Are you sure you want to delete template variant "${t?.name || 'variant'}"?`,
        ))
      )
        return;
      action($('deleteTemplate'), async () => {
        await api('/api/delete-template', { key });
        if ($('template')) $('template').dataset.options = '';
        await refresh();
        session.templateEditorInitialized = false;
        session.templateEditKey = null;
        closeDrawer('templateEditor');
        notice('Template deleted.');
      });
    });
  if ($('exportTemplatesBtn'))
    uiScope.handler($('exportTemplatesBtn'), 'onclick', async () => {
      downloadJson(
        {
          exportedAt: new Date().toISOString(),
          templates: session.state.templates,
        },
        'outreach-templates.json',
      );
      notice('All templates exported.');
    });
  if ($('importTemplatesFile'))
    uiScope.handler($('importTemplatesFile'), 'onchange', async () => {
      const file = $('importTemplatesFile').files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const res = await api<{ imported: number; count: number }>('/api/import-templates', {
          templates: json,
        });
        await refresh();
        notice(`Successfully imported ${res.count} template variant(s).`);
      } catch (err) {
        notice('Failed to import templates: ' + errorMessage(err));
      } finally {
        $('importTemplatesFile').value = '';
      }
    });
  if ($('templateSearch'))
    uiScope.handler($('templateSearch'), 'oninput', () => {
      renderTemplatesTable();
    });
  uiScope.listen($('templateStatusFilter'), 'change', renderTemplatesTable);
  if ($('templatesTableBody')) {
    uiScope.handler($('templatesTableBody'), 'onclick', async (e) => {
      const emptyAction = eventElement(e).closest<HTMLElement>('[data-template-empty-action]');
      if (emptyAction) {
        if (emptyAction.dataset.templateEmptyAction === 'create') await openTemplateEditor(null);
        else {
          $('templateSearch').value = '';
          $('templateStatusFilter').value = 'all';
          renderTemplatesTable();
          $('templateSearch').focus();
        }
        return;
      }
      const editBtn = eventElement(e).closest<HTMLElement>('[data-edit-template]');
      if (editBtn) {
        await openTemplateEditor(editBtn.dataset.editTemplate || null);
        return;
      }
      const expBtn = eventElement(e).closest<HTMLElement>('[data-export-template]');
      if (expBtn) {
        const key = expBtn.dataset.exportTemplate!;
        const t = session.state.templates[key];
        if (t) {
          downloadJson({ [key]: t }, `template-${(t.name || 'custom').replace(/\s+/g, '_')}.json`);
          notice('Template exported.');
        }
        return;
      }
      const delBtn = eventElement(e).closest<HTMLElement>('[data-delete-template]');
      if (delBtn) {
        const key = delBtn.dataset.deleteTemplate!;
        const t = session.state.templates[key];
        if (
          !(await confirmAction(
            `Are you sure you want to delete template variant "${t?.name || 'variant'}"?`,
          ))
        )
          return;
        action(delBtn, async () => {
          await api('/api/delete-template', { key });
          if ($('template')?.value === key) {
            if ($('template')) $('template').dataset.options = '';
          }
          await refresh();
          if (session.templateEditKey === key) {
            session.templateEditKey = null;
            session.templateEditorInitialized = false;
            closeDrawer('templateEditor');
          }
          notice('Template deleted.');
        });
        return;
      }
    });
  }
}
