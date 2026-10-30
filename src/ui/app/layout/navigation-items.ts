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
  label: string;
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
      { view: 'dashboard', label: 'Overview', icon: LayoutGrid },
      { view: 'campaigns', label: 'Campaigns', icon: Folder },
      { view: 'leads', label: 'Leads', icon: Users },
      { view: 'conversations', label: 'Unibox', icon: MessagesSquare },
      { view: 'activity', label: 'Reports & history', icon: Clock },
    ],
  },
  {
    label: 'Operations',
    items: [
      { view: 'live-activity', label: 'Live System Activity', icon: Activity },
      { view: 'templates', label: 'Templates', icon: SquarePen },
      { view: 'imports', label: 'Import review', icon: FileInput },
      { view: 'tracking', label: 'Email Tracking', icon: ChartLine },
      { view: 'suppression', label: 'Do Not Contact', icon: Ban },
      { view: 'catalog', label: 'Version Catalog', icon: NotebookText },
    ],
  },
  {
    label: 'Manage',
    items: [
      { view: 'accounts', label: 'Accounts', icon: Mail },
      { view: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];
