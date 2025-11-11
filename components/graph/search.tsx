"use client";

import { Search } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export function GraphSearch() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Search</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton tooltip="Search">
                <Search className="size-5" />
              </SidebarMenuButton>
            ) : (
              <div className="px-2 py-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="size-4" />
                  <span className="text-sm font-medium">Search Nodes</span>
                </div>
                <Input placeholder="Search by name..." className="h-9" />
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
