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
  return (
    <aside className="app-sidebar">
      <CreateCampaignLink className="button primary sidebar-create" />
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigationGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-category">{group.label}</div>
            {group.items.map((item) => (
              <NavigationLink key={item.view} item={item} />
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-foot">
          <div className="profile-avatar">FC</div>
          <div className="profile-info">
            <span className="profile-name" id="profileName">
              My Mailbox
            </span>
            <span className="profile-role">Private Email · Local Active</span>
          </div>
        </div>
        <div className="sidebar-developer">
          <span className="dev-tag">Developer</span>
          <span className="dev-name">Bukhtyar Haider</span>
        </div>
      </div>
    </aside>
  );
}
