"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Layer, GraphData, GraphNode, GraphLink } from "@/lib/graph/types";
import { GraphHeader } from "./header";
import { GraphLayer } from "./layer";
import { GraphSearch } from "./search";
import { GraphSelection } from "./selection";
import { GraphFilter } from "./filter";

interface SidebarProps {
  currentLayer: Layer;
  onLayerChange: (layer: Layer) => void;
  graphData: GraphData | null;
  onFilterChange?: (
    hiddenNodeTypes: Set<string>,
    hiddenLinkTypes: Set<string>
  ) => void;
  selectedNode: GraphNode | null;
  selectedLink: GraphLink | null;
  onNodeSearch?: (nodeId: string, connectedNodeIds: Set<string>) => void;
  onClearSearch?: () => void;
}

export function GraphSidebar({
  currentLayer,
  onLayerChange,
  graphData,
  onFilterChange,
  selectedNode,
  selectedLink,
  onNodeSearch,
  onClearSearch,
}: SidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <GraphHeader />
      </SidebarHeader>
      <SidebarContent>
        <GraphLayer currentLayer={currentLayer} onLayerChange={onLayerChange} />
        <GraphSearch
          graphData={graphData}
          onNodeSearch={onNodeSearch}
          onClearSearch={onClearSearch}
        />
        <GraphSelection
          selectedNode={selectedNode}
          selectedLink={selectedLink}
        />
        <GraphFilter graphData={graphData} onFilterChange={onFilterChange} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
