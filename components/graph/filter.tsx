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
import { getNodeShape, NodeShape } from "@/lib/graph/shapes";

interface ShapeIconProps {
  shape: NodeShape;
  color: string;
  isHidden?: boolean;
}

function ShapeIcon({ shape, color, isHidden = false }: ShapeIconProps) {
  const opacity = isHidden ? 0.5 : 1;

  switch (shape) {
    case "rectangle":
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="flex-shrink-0"
        >
          <rect
            x="1"
            y="1"
            width="10"
            height="10"
            fill={color}
            opacity={opacity}
          />
        </svg>
      );
    case "triangle":
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="flex-shrink-0"
        >
          <polygon points="6,1 11,11 1,11" fill={color} opacity={opacity} />
        </svg>
      );
    case "circle":
    default:
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="flex-shrink-0"
        >
          <circle cx="6" cy="6" r="5" fill={color} opacity={opacity} />
        </svg>
      );
  }
}

interface GraphFilterProps {
  graphData: GraphData | null;
  currentLayer?: string;
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
  const shape = getNodeShape(label);

  return (
    <div
      className={`flex items-center justify-between text-sm cursor-pointer rounded px-2 py-1 transition-colors hover:bg-sidebar-accent ${
        isHidden ? "opacity-40" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <ShapeIcon shape={shape} color={color} isHidden={isHidden} />
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
  const opacity = isHidden ? 0.5 : 1;

  return (
    <div
      className={`flex items-center justify-between text-sm cursor-pointer rounded px-2 py-1 transition-colors hover:bg-sidebar-accent ${
        isHidden ? "opacity-40" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <svg
          width="16"
          height="12"
          viewBox="0 0 16 12"
          className="flex-shrink-0"
        >
          <line
            x1="0"
            y1="6"
            x2="16"
            y2="6"
            stroke={color}
            strokeWidth="2"
            opacity={opacity}
          />
        </svg>
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

export function GraphFilter({
  graphData,
  currentLayer,
  onFilterChange,
}: GraphFilterProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { nodeTypes, linkTypes } = useFilterStats(graphData);

  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<string>>(
    new Set()
  );
  const [hiddenLinkTypes, setHiddenLinkTypes] = useState<Set<string>>(
    new Set()
  );

  // Clear filters when layer changes
  useEffect(() => {
    setHiddenNodeTypes(new Set());
    setHiddenLinkTypes(new Set());
  }, [currentLayer]);

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
