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

export const adminMenu = menuData as AdminMenuItem[];
