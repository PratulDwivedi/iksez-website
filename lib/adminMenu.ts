import menuData from './adminMenu.json';

// Icon is a lucide-react component *name* (string), not a component
// reference — this file has no 'use client' (it's imported by both the
// server-rendered (protected)/layout.tsx and the client AdminSidebar), and a
// plain JSON-shaped array keeps it framework-agnostic. AdminSidebar resolves
// the name to an actual component via its own icon lookup map.
export interface AdminMenuLeaf {
  name: string;
  route: string;
  icon: string;
}

export interface AdminMenuGroup {
  name: string;
  icon: string;
  children: AdminMenuLeaf[];
}

export type AdminMenuItem = AdminMenuLeaf | AdminMenuGroup;

export function isMenuGroup(item: AdminMenuItem): item is AdminMenuGroup {
  return 'children' in item;
}

// JSON can't hold comments, so an entry is "commented out" of the sidebar by
// setting "hidden": true on it in adminMenu.json — works on groups and on
// individual children.
type Hideable<T> = T & { hidden?: boolean };
const isVisible = (item: { hidden?: boolean }) => !item.hidden;

export const adminMenu: AdminMenuItem[] = (menuData as Hideable<AdminMenuItem>[])
  .filter(isVisible)
  .map((item) =>
    isMenuGroup(item)
      ? { ...item, children: (item.children as Hideable<AdminMenuLeaf>[]).filter(isVisible) }
      : item,
  );
