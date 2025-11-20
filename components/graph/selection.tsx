"use client";

import { Info, Circle, Link as LinkIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { GraphNode, GraphLink } from "@/lib/graph/types";
import { NODE_COLORS, LINK_COLORS } from "@/lib/graph/styles";
import { Badge } from "@/components/ui/badge";

interface GraphSelectionProps {
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
}

function NodeDetails({ node }: { node: GraphNode }) {
  const color = NODE_COLORS[node.type] || NODE_COLORS.default;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Circle className="size-4" style={{ color }} fill={color} />
        <span className="text-sm font-medium">Node Details</span>
      </div>
      <div className="rounded-md border p-3 space-y-2">
        <div>
          <div className="text-xs text-muted-foreground">Name</div>
          <div className="text-sm font-medium">{node.name}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Type</div>
          <Badge variant="secondary" className="text-xs">
            {node.type}
          </Badge>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">ID</div>
          <div className="text-xs font-mono break-all">{node.id}</div>
        </div>
        {Object.keys(node.info).length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Properties</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {Object.entries(node.info).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="text-muted-foreground">{key}:</span>{" "}
                  <span className="font-mono">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkDetails({ link }: { link: GraphLink }) {
  const color = LINK_COLORS[link.type] || LINK_COLORS.default;
  const sourceId =
    typeof link.source === "string" ? link.source : link.source.id;
  const targetId =
    typeof link.target === "string" ? link.target : link.target.id;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <LinkIcon className="size-4" style={{ color }} />
        <span className="text-sm font-medium">Link Details</span>
      </div>
      <div className="rounded-md border p-3 space-y-2">
        <div>
          <div className="text-xs text-muted-foreground">Type</div>
          <Badge variant="secondary" className="text-xs">
            {link.type}
          </Badge>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Source</div>
          <div className="text-xs font-mono break-all">{sourceId}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Target</div>
          <div className="text-xs font-mono break-all">{targetId}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Connections</div>
          <div className="text-sm font-medium">{link.count}</div>
        </div>
        {link.info && link.info.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">
              Connection Details
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {link.info.map((info, idx) => (
                <div key={idx} className="rounded bg-muted p-2 space-y-1">
                  <div className="text-xs font-medium">{info.direction}</div>
                  {Object.entries(info)
                    .filter(([key]) => key !== "direction")
                    .map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-muted-foreground">{key}:</span>{" "}
                        <span className="font-mono">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphSelection({
  selectedNode,
  selectedLink,
}: GraphSelectionProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const hasSelection = selectedNode || selectedLink;

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Selection</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed ? (
              <SidebarMenuButton tooltip="Selection">
                <Info className="size-5" />
                {hasSelection && (
                  <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </SidebarMenuButton>
            ) : (
              <div className="px-2 py-1 space-y-2">
                {selectedNode && <NodeDetails node={selectedNode} />}
                {selectedLink && <LinkDetails link={selectedLink} />}
                {!hasSelection && (
                  <>
                    <div className="flex items-center gap-2">
                      <Info className="size-4" />
                      <span className="text-sm font-medium">
                        Selection Details
                      </span>
                    </div>
                    <div className="rounded-md border p-3 text-sm space-y-1">
                      <p className="text-muted-foreground">
                        No node or link selected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click on a node or link to view details
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
