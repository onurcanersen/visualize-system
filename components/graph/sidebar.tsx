"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Layer } from "@/lib/graph/types";
import { GraphHeader } from "./header";
import { GraphLayer } from "./layer";
import { GraphSearch } from "./search";
import { GraphSelection } from "./selection";
import { GraphFilter } from "./filter";

interface SidebarProps {
  currentLayer: Layer;
  onLayerChange: (layer: Layer) => void;
}

export function GraphSidebar({ currentLayer, onLayerChange }: SidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <GraphHeader />
      </SidebarHeader>
      <SidebarContent>
        <GraphLayer currentLayer={currentLayer} onLayerChange={onLayerChange} />
        <GraphSearch />
        <GraphSelection />
        <GraphFilter />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
