import { CreateCampaignPage } from '../features/campaigns/CreateCampaignPage';
import { CampaignEditorPage } from '../features/campaigns/CampaignEditorPage';
import { AccountsPage } from '../features/accounts/AccountsPage';
import { WorkspaceContext } from './layout/WorkspaceContext';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { LeadsPage } from '../features/leads/LeadsPage';
import { CampaignsPage } from '../features/campaigns/CampaignsPage';
import { ImportsPage } from '../features/imports/ImportsPage';
import { ConversationsPage } from '../features/conversations/ConversationsPage';
import { TemplatesPage } from '../features/templates/TemplatesPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { LiveActivityPage } from '../features/live-activity/LiveActivityPage';
import { HistoryPage } from '../features/history/HistoryPage';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { TrackingPage } from '../features/tracking/TrackingPage';
import { SuppressionPage } from '../features/suppression/SuppressionPage';
import { Titlebar } from './layout/Titlebar';
import { Sidebar } from './layout/Sidebar';
import { LeadDrawer } from './layout/LeadDrawer';
import { TrackingDrawer } from './layout/TrackingDrawer';
import { useStickyHeaders } from './layout/use-sticky-headers';
/** Feature adapters own mutable leaves. Keep page trees mounted to preserve unsaved edits across navigation. */
export function App() {
  const viewportRef = useStickyHeaders();
  return (
    <>
      <a
        className="skip-to-content"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const destination =
            document.querySelector<HTMLElement>('.view-page.active h1') ||
            document.getElementById('main-content');
          if (destination) {
            destination.tabIndex = -1;
            destination.focus();
          }
        }}
      >
        Skip to main content
      </a>
      <div className="app-shell">
        <div className="app-container">
          <Sidebar />
          <main className="app-viewport" id="main-content" tabIndex={-1} ref={viewportRef}>
            <Titlebar />
            <WorkspaceContext />
            <p id="releasePreviewBanner" className="carrier-preview-banner" hidden>
              Sample preview · Sending and live mailbox capture are disabled. Use your normal app
              window for real inbox capture.
            </p>
            <div id="notice" role="status" hidden />
            <details id="settingsDetails" hidden />
            <DashboardPage />
            <LeadsPage />
            <CampaignsPage />
            <CreateCampaignPage />
            <CampaignEditorPage />
            <ImportsPage />
            <ConversationsPage />
            <TemplatesPage />
            <AccountsPage />
            <SettingsPage />
            <LiveActivityPage />
            <HistoryPage />
            <CatalogPage />
            <TrackingPage />
            <SuppressionPage />
          </main>
        </div>
      </div>
      <LeadDrawer />
      <TrackingDrawer />
    </>
  );
}
