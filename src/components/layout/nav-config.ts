import {
  Activity,
  ClipboardCheck,
  FileLock2,
  FolderLock,
  Gauge,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Navigation model.
 *
 * A single declarative source of truth so the sidebar, breadcrumbs and
 * (from Phase 5) the nominee permission filter all agree on what exists.
 *
 * `permission` is the key the owner toggles per nominee. Nominee items with
 * a permission are hidden entirely when that permission is off — the UI
 * mirrors what the database policies already enforce.
 */
export type NomineePermission = "vault" | "instructions" | "financial" | "checklist" | "timeline";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: NomineePermission;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const ownerNav: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Estate",
    items: [
      { title: "Digital Vault", url: "/vault", icon: FolderLock },
      { title: "Digital Assets", url: "/assets", icon: Wallet },
      { title: "Instructions", url: "/instructions", icon: ScrollText },
    ],
  },
  {
    label: "People",
    items: [{ title: "Nominees", url: "/nominees", icon: Users }],
  },
  {
    label: "Account",
    items: [{ title: "Settings", url: "/settings", icon: Settings }],
  },
];

export const nomineeNav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/nominee/dashboard", icon: Gauge },
      { title: "My Access", url: "/nominee/access", icon: KeyRound },
    ],
  },
  {
    label: "Granted Resources",
    items: [
      { title: "Encrypted Vault", url: "/nominee/vault", icon: FileLock2, permission: "vault" },
      {
        title: "Instructions",
        url: "/nominee/instructions",
        icon: ScrollText,
        permission: "instructions",
      },
      {
        title: "Financial Overview",
        url: "/nominee/financial",
        icon: Wallet,
        permission: "financial",
      },
      {
        title: "Executor Checklist",
        url: "/nominee/checklist",
        icon: ClipboardCheck,
        permission: "checklist",
      },
      {
        title: "Estate Timeline",
        url: "/nominee/timeline",
        icon: Activity,
        permission: "timeline",
      },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Security", url: "/nominee/security", icon: ShieldCheck }],
  },
];

/** Removes nav entries the nominee has not been granted. */
export function filterNavByPermissions(
  groups: NavGroup[],
  granted: NomineePermission[],
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.permission || granted.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);
}
