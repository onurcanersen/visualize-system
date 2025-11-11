"use client";

import { Filter } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const NODE_TYPES = [
  { type: "Server", color: "bg-blue-500", count: 12 },
  { type: "Database", color: "bg-green-500", count: 5 },
  { type: "Application", color: "bg-purple-500", count: 8 },
];

const LINK_TYPES = [
  { type: "CONNECTS_TO", color: "bg-gray-500", count: 24 },
  { type: "DEPENDS_ON", color: "bg-orange-500", count: 15 },
  { type: "RUNS_ON", color: "bg-red-500", count: 12 },
];

function NodeItem({
  label,
  color,
  count,
}: {
  label: string;
  color: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span>{label}</span>
      </div>
      <Badge variant="secondary" className="h-5 text-xs">
        {count}
      </Badge>
    </div>
  );
}

function LinkItem({
  label,
  color,
  count,
}: {
  label: string;
  color: string;
  count: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`h-0.5 w-4 ${color}`} />
        <span className="text-xs">{label}</span>
      </div>
      <Badge variant="secondary" className="h-5 text-xs">
        {count}
      </Badge>
    </div>
  );
}

export function GraphFilter() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Filter</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton tooltip="Filter">
                <Filter className="size-5" />
              </SidebarMenuButton>
            ) : (
              <div className="px-2 py-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <span className="text-sm font-medium">Nodes</span>
                  </div>
                  <div className="space-y-2">
                    {NODE_TYPES.map((node) => (
                      <NodeItem
                        key={node.type}
                        label={node.type}
                        color={node.color}
                        count={node.count}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <span className="text-sm font-medium">Links</span>
                  </div>
                  <div className="space-y-2">
                    {LINK_TYPES.map((link) => (
                      <LinkItem
                        key={link.type}
                        label={link.type}
                        color={link.color}
                        count={link.count}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
