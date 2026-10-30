import { useWorkspace } from '../../shared/workspace-store';
import { Brand } from './Brand';
import { CreateCampaignLink } from '../../features/campaigns/CreateCampaignLink';
import { Icon } from '../../design-system/icons';
import { navigationGroups } from './navigation-items';
import type { NavigationItem } from './navigation-items';
function NavigationLink({ item }: { item: NavigationItem }) {
  const live = item.view === 'live-activity';
  return (
    <a
      className={`nav-link${item.view === 'dashboard' ? ' active' : ''}`}
      href={`#${item.view}`}
      data-view={item.view}
      aria-label={item.label}
      title={item.label}
      id={live ? 'navLiveActivity' : undefined}
    >
      <Icon icon={item.icon} />
      <span>{item.label}</span>
      {live && <span className="live-status-dot" id="liveNavDot" title="Live telemetry active" />}
    </a>
  );
}
export function Sidebar() {
  const { state } = useWorkspace();
  const profile = state?.profiles.find((item) => item.id === state.activeProfile);
  const initials = (profile?.name || 'Outreach Desk')
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return (
    <aside className="app-sidebar">
      <Brand />
      <CreateCampaignLink className="button primary sidebar-create" />
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigationGroups
          .filter((group) => group.label !== 'Manage')
          .map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-category">{group.label}</div>
              {group.items.map((item) => (
                <NavigationLink key={item.view} item={item} />
              ))}
            </div>
          ))}
      </nav>
      <nav className="sidebar-manage" aria-label="Workspace management">
        {navigationGroups
          .find((group) => group.label === 'Manage')
          ?.items.map((item) => (
            <NavigationLink key={item.view} item={item} />
          ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-foot">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-info">
            <span className="profile-name" id="profileName">
              My Mailbox
            </span>
            <span className="profile-role">{profile?.email || 'No mailbox configured'}</span>
          </div>
        </div>
        <div className="sidebar-version">
          <span id="appVersion">Desktop</span>
        </div>
        <div className="sidebar-developer">
          <span className="dev-tag">Developer</span>
          <span className="dev-name">Bukhtyar Haider</span>
        </div>
      </div>
    </aside>
  );
}
