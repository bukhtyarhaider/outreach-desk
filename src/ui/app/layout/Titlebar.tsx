import { Icon, LayoutGrid } from '../../design-system/icons';
import { useRouteHash } from '../use-route';
import { navigationParent, resolveView, routeLabels } from '../routes';
import { HeaderPattern } from './HeaderPattern';
export function Titlebar() {
  const route = resolveView(useRouteHash());
  const parent = navigationParent(route);
  return (
    <header className="app-titlebar">
      <nav className="workspace-breadcrumb" aria-label="Breadcrumb">
        <Icon icon={LayoutGrid} size={15} />
        <a href="#dashboard">Workspace</a>
        <span aria-hidden="true">/</span>
        {parent !== route && (
          <>
            <a href={`#${parent}`}>{routeLabels[parent]}</a>
            <span aria-hidden="true">/</span>
          </>
        )}
        <strong>{routeLabels[route]}</strong>
      </nav>
      <span className="connection-pill" id="connection">
        Mailbox disconnected
      </span>
      <HeaderPattern />
    </header>
  );
}
