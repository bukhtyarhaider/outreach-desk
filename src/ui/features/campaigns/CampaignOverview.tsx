import { ArrowRight, Icon } from '../../design-system/icons';
import { useState } from 'react';
import { Button, Input, Panel, Select } from '../../design-system/primitives';
import { StatusBadge } from '../../design-system/layout';
import { useWorkspace } from '../../shared/workspace-store';
import { action, notice } from '../../shared/runtime';
import { selectCampaign, setCampaignIncluded } from './controller';
/** Campaign inventory owns finding/opening existing campaigns; creation has its own route. */
export function CampaignOverview() {
  const { state } = useWorkspace();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = (state?.campaigns ?? []).filter((c) => {
    const matches = `${c.name} ${c.workbook?.name || c.workbook?.file || ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return (
      matches &&
      (status === 'all' ||
        (status === 'review'
          ? c.reviewRequired
          : status === 'included'
            ? c.enabled && !c.reviewRequired
            : !c.enabled && !c.reviewRequired))
    );
  });
  return (
    <Panel className="campaign-overview" aria-label="Campaign inventory">
      <div className="campaign-library-toolbar">
        <label>
          Find a campaign
          <Input
            type="search"
            placeholder="Search campaigns or source files…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          Queue status
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All campaigns</option>
            <option value="included">Included in queue</option>
            <option value="paused">Paused</option>
            <option value="review">Needs import review</option>
          </Select>
        </label>
        <p className="hint">
          {filtered.length} {filtered.length === 1 ? 'campaign' : 'campaigns'}
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Campaign / source</th>
              <th>Worksheet scope</th>
              <th>Status</th>
              <th>Next action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>
                  <Button
                    variant="ghost"
                    className="campaign-name-action"
                    data-open-campaign={c.id}
                    aria-label={`Open campaign ${c.name}`}
                    disabled={
                      !!state?.busy || !!(state?.job.enabled && c.id !== state.activeCampaign)
                    }
                    onClick={(event) =>
                      void action(event.currentTarget, async () => {
                        await selectCampaign(c.id);
                        location.hash = 'campaign-edit';
                      })
                    }
                  >
                    {c.name} <Icon icon={ArrowRight} size={13} />
                  </Button>
                  <small>
                    {c.workbook?.name || c.workbook?.file?.split(/[\\/]/).pop() || 'No workbook'}
                  </small>
                  {c.id === state?.activeCampaign && (
                    <StatusBadge tone="info">Current workspace</StatusBadge>
                  )}
                </td>
                <td>{c.sheets?.length ? c.sheets.join(', ') : 'All worksheets'}</td>
                <td>
                  <StatusBadge
                    tone={c.reviewRequired ? 'warning' : c.enabled ? 'positive' : 'neutral'}
                  >
                    {c.reviewRequired
                      ? 'Needs import review'
                      : c.enabled
                        ? 'Included in queue'
                        : 'Paused'}
                  </StatusBadge>
                </td>
                <td>
                  <Button
                    data-campaign-queue={c.id}
                    disabled={!!state?.busy || !!state?.job.enabled || !!state?.prepared}
                    onClick={(event) =>
                      void action(event.currentTarget, async () => {
                        if (c.reviewRequired) {
                          await selectCampaign(c.id);
                          location.hash = 'imports';
                          window.dispatchEvent(new CustomEvent('fc-import-view', { detail: c.id }));
                        } else {
                          await setCampaignIncluded(c.id, !c.enabled);
                          notice(
                            c.enabled
                              ? 'Campaign paused.'
                              : 'Campaign included. Start outreach from the dashboard when ready.',
                          );
                        }
                      })
                    }
                  >
                    {c.reviewRequired
                      ? 'Review import'
                      : c.enabled
                        ? 'Pause campaign'
                        : 'Include in outreach queue'}
                  </Button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={4}>
                  {query || status !== 'all'
                    ? 'No campaigns match these filters.'
                    : 'Create your first campaign by importing a lead workbook.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
