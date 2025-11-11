"use client";

import { Info } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export function GraphSelection() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Selection</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton tooltip="Selection">
                <Info className="size-5" />
              </SidebarMenuButton>
            ) : (
              <div className="px-2 py-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="size-4" />
                  <span className="text-sm font-medium">Selection Details</span>
                </div>
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <p className="text-muted-foreground">
                    No node or link selected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click on a node or link to view details
                  </p>
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
