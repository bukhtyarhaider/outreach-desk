import type { ViewName } from '../routes';
import type { LucideIcon } from '../../design-system/icons';
import {
  Activity,
  Ban,
  ChartLine,
  Clock,
  Mail,
  FileInput,
  Folder,
  LayoutGrid,
  MessagesSquare,
  NotebookText,
  Settings,
  SquarePen,
  Users,
} from '../../design-system/icons';
export interface NavigationItem {
  view: ViewName;
  icon: LucideIcon;
}
export interface NavigationGroup {
  label: string;
  items: readonly NavigationItem[];
}
/** Stable route keys are independent of product copy and navigation grouping. */
export const navigationGroups: readonly NavigationGroup[] = [
  {
    label: 'Workspace',
    items: [
      { view: 'dashboard', icon: LayoutGrid },
      { view: 'campaigns', icon: Folder },
      { view: 'leads', icon: Users },
      { view: 'conversations', icon: MessagesSquare },
      { view: 'activity', icon: Clock },
    ],
  },
  {
    label: 'Operations',
    items: [
      { view: 'live-activity', icon: Activity },
      { view: 'templates', icon: SquarePen },
      { view: 'imports', icon: FileInput },
      { view: 'tracking', icon: ChartLine },
      { view: 'suppression', icon: Ban },
      { view: 'catalog', icon: NotebookText },
    ],
  },
  {
    label: 'Manage',
    items: [
      { view: 'accounts', icon: Mail },
      { view: 'settings', icon: Settings },
    ],
  },
];
