"use client";

import { useState, useEffect } from "react";
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
import { GraphData } from "@/lib/graph/types";
import { NODE_COLORS, LINK_COLORS } from "@/lib/graph/styles";
import { useFilterStats } from "@/hooks/use-filter-stats";

interface GraphFilterProps {
  graphData: GraphData | null;
  onFilterChange?: (
    hiddenNodeTypes: Set<string>,
    hiddenLinkTypes: Set<string>
  ) => void;
}

function NodeItem({
  label,
  color,
  count,
  isHidden,
  onClick,
}: {
  label: string;
  color: string;
  count: number;
  isHidden: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm cursor-pointer rounded px-2 py-1 transition-colors hover:bg-sidebar-accent ${
        isHidden ? "opacity-40" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${isHidden ? "opacity-50" : ""}`}
          style={{ backgroundColor: color }}
        />
        <span className={isHidden ? "line-through" : ""}>{label}</span>
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
  isHidden,
  onClick,
}: {
  label: string;
  color: string;
  count: number;
  isHidden: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm cursor-pointer rounded px-2 py-1 transition-colors hover:bg-sidebar-accent ${
        isHidden ? "opacity-40" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-0.5 w-4 ${isHidden ? "opacity-50" : ""}`}
          style={{ backgroundColor: color }}
        />
        <span className={`text-xs ${isHidden ? "line-through" : ""}`}>
          {label}
        </span>
      </div>
      <Badge variant="secondary" className="h-5 text-xs">
        {count}
      </Badge>
    </div>
  );
}

export function GraphFilter({ graphData, onFilterChange }: GraphFilterProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { nodeTypes, linkTypes } = useFilterStats(graphData);

  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<string>>(
    new Set()
  );
  const [hiddenLinkTypes, setHiddenLinkTypes] = useState<Set<string>>(
    new Set()
  );

  const toggleNodeType = (type: string) => {
    setHiddenNodeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const toggleLinkType = (type: string) => {
    setHiddenLinkTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  // Notify parent of filter changes via useEffect
  useEffect(() => {
    onFilterChange?.(hiddenNodeTypes, hiddenLinkTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenNodeTypes, hiddenLinkTypes]);

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
                {/* Nodes Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <span className="text-sm font-medium">Nodes</span>
                  </div>
                  <div className="space-y-1">
                    {nodeTypes.length > 0 ? (
                      nodeTypes.map((node) => (
                        <NodeItem
                          key={node.type}
                          label={node.type}
                          color={NODE_COLORS[node.type] || NODE_COLORS.default}
                          count={node.count}
                          isHidden={hiddenNodeTypes.has(node.type)}
                          onClick={() => toggleNodeType(node.type)}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground px-2">
                        No nodes in graph
                      </p>
                    )}
                  </div>
                </div>

                {/* Links Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    <span className="text-sm font-medium">Links</span>
                  </div>
                  <div className="space-y-1">
                    {linkTypes.length > 0 ? (
                      linkTypes.map((link) => (
                        <LinkItem
                          key={link.type}
                          label={link.type}
                          color={LINK_COLORS[link.type] || LINK_COLORS.default}
                          count={link.count}
                          isHidden={hiddenLinkTypes.has(link.type)}
                          onClick={() => toggleLinkType(link.type)}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground px-2">
                        No links in graph
                      </p>
                    )}
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
