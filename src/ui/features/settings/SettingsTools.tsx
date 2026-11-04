import { useWorkspace } from '../../shared/workspace-store';
import { useState } from 'react';
import { Search, ArrowRight, CircleCheck, CircleAlert } from '../../design-system/icons';
import { Button, Input, ActionLink } from '../../design-system/primitives';
import { Drawer, openDrawer, closeDrawer } from '../../design-system/overlays';
import { settingsFields, useSettingsChanges, focusSetting } from './draft';
import { settingsTabs } from './sections';
import { confirmAction } from '../../shared/confirmation';
import { fillSettings } from './controller';
import { session } from '../../shared/session';
import { clearSettingsFeedback } from './save-feedback';

export function SettingsDraftActions({ instant }: { instant: boolean }) {
  const changes = useSettingsChanges();
  const { state } = useWorkspace();
  const locked = state?.prepared
    ? 'Close the prepared email before saving settings.'
    : state?.busy
      ? 'Wait for the current mailbox operation to finish.'
      : '';
  return (
    <div className="header-actions settings-draft-actions" hidden={instant && !changes.length}>
      <span className="settings-draft-status" role="status">
        {changes.length ? (
          <>
            <CircleAlert size={14} aria-hidden="true" />
            {changes.length} unsaved {changes.length === 1 ? 'change' : 'changes'}
          </>
        ) : (
          <>
            <CircleCheck size={14} aria-hidden="true" />
            No unsaved changes
          </>
        )}
      </span>
      <Button
        id="settingsReviewChanges"
        disabled={!changes.length}
        onClick={() => openDrawer('settingsChangeReview')}
      >
        Review edits
      </Button>
      <Button
        variant="primary"
        id="saveSettings"
        title={locked || 'Apply all configuration edits'}
        disabled={!changes.length || !!locked}
      >
        Save changes
      </Button>
      {locked && <small className="settings-lock-reason">{locked}</small>}
    </div>
  );
}
export function SettingsTools() {
  const [query, setQuery] = useState('');
  const matches = query.trim()
    ? [
        ...settingsFields,
        [
          'showWorkspaceContext',
          'Show workspace context',
          'settingsAppearance',
          'appearance hide collapse header',
        ] as const,
      ].filter((item) => {
        const text =
          `${item[1]} ${item[3]} ${settingsTabs.find((tab) => tab.id === item[2])?.label}`.toLowerCase();
        return query
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .every((word) => text.includes(word));
      })
    : [];
  return (
    <div className="settings-find">
      <label htmlFor="settingsFind">
        Find a setting
        <span>
          <Search size={16} aria-hidden="true" />
          <Input
            id="settingsFind"
            type="search"
            placeholder="Try hourly limit, PC ID, or appearance…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </span>
      </label>
      {!query && (
        <p>
          Mailbox sign-in and sender profiles live in{' '}
          <ActionLink href="#accounts" variant="ghost" size="sm">
            Accounts
            <ArrowRight size={13} aria-hidden="true" />
          </ActionLink>
        </p>
      )}
      {query && (
        <div className="settings-find-results">
          <p role="status">{matches.length} matching settings</p>
          {matches.length ? (
            <ul>
              {matches.map(([id, label, section]) => (
                <li key={id}>
                  <Button
                    size="item"
                    onClick={() => {
                      setQuery('');
                      focusSetting(id);
                    }}
                  >
                    <span>
                      {label}
                      <small>{settingsTabs.find((tab) => tab.id === section)?.label}</small>
                    </span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Try “delay”, “Firebase”, “team”, or “workspace”.</p>
          )}
          <Button size="sm" onClick={() => setQuery('')}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
export function SettingsChangeReview() {
  const changes = useSettingsChanges();
  return (
    <Drawer
      id="settingsChangeReview"
      title="Review settings edits"
      eyebrow="Before you save"
      description="Review changes across all configuration tabs. Nothing is applied until you save."
      footer={
        <>
          <Button onClick={() => closeDrawer('settingsChangeReview')}>Back to settings</Button>
          <Button
            variant="primary"
            id="settingsSaveReviewed"
            disabled={!changes.length}
            onClick={() => {
              if (!session.pending) document.getElementById('saveSettings')?.click();
            }}
          >
            Save reviewed changes
          </Button>
          <Button
            variant="danger"
            disabled={!changes.length}
            onClick={async () => {
              if (session.pending) return;
              if (
                await confirmAction(
                  'Discard all unsaved sending, eligibility, Firebase and team edits? Saved settings remain in effect. Browser appearance preferences are kept.',
                  {
                    title: 'Discard settings edits?',
                    confirmLabel: 'Discard edits',
                    destructive: true,
                  },
                )
              ) {
                document.querySelector<HTMLInputElement>('#teamToken')!.value = '';
                fillSettings();
                clearSettingsFeedback();
                closeDrawer('settingsChangeReview');
              }
            }}
          >
            Discard edits
          </Button>
        </>
      }
    >
      <div className="settings-change-list">
        {changes.length ? (
          settingsTabs
            .filter((tab) => changes.some((change) => change.section === tab.id))
            .map((tab) => (
              <section key={tab.id}>
                <h3>{tab.label}</h3>
                <dl>
                  {changes
                    .filter((change) => change.section === tab.id)
                    .map((change) => (
                      <div key={change.id}>
                        <dt>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              closeDrawer('settingsChangeReview');
                              focusSetting(change.id);
                            }}
                          >
                            {change.label}
                            <ArrowRight size={13} aria-hidden="true" />
                          </Button>
                        </dt>
                        <dd>
                          <span>
                            <small>Previously loaded</small>
                            {change.before}
                          </span>
                          <span>
                            <small>Your edit</small>
                            {change.after}
                          </span>
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))
        ) : (
          <p>No unsaved configuration changes. Your saved settings remain active.</p>
        )}
      </div>
      <p className="hint">
        Access tokens stay hidden. Changing a tracking URL affects future emails; earlier emails
        keep their original URL. Select a field name to keep editing, or save the reviewed changes
        below. Unedited settings keep their latest known saved values.
      </p>
    </Drawer>
  );
}

export function SettingsSaveScope({ active }: { active: string }) {
  const changes = useSettingsChanges();
  return (
    <p className="settings-save-scope">
      {active === 'settingsAppearance'
        ? `Browser preference · saved automatically on this device.${changes.length ? ' Pending configuration edits in other tabs still need Save changes.' : ''}`
        : active === 'settingsAbout'
          ? `Application details · no configuration changes here.${changes.length ? ' Use Review edits to inspect pending changes from other tabs.' : ''}`
          : 'Save changes applies all unsaved configuration edits across tabs. Review edits shows exactly what will change. Switching tabs keeps your draft.'}
    </p>
  );
}
