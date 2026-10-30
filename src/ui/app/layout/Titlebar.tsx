import { Icon, LayoutGrid } from '../../design-system/icons';
export function Titlebar() {
  return (
    <header className="app-titlebar">
      <div className="workspace-breadcrumb">
        <Icon icon={LayoutGrid} size={15} />
        <span>Workspace</span>
        <span aria-hidden="true">/</span>
        <strong>Outreach Desk</strong>
      </div>
      <span className="connection-pill" id="connection">
        <span className="connection-dot" />
        Mailbox disconnected
      </span>
    </header>
  );
}
