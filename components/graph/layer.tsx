"use client";

import { Layers, ChevronDown } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { Layer } from "@/lib/graph/types";

const LAYERS = [
  {
    id: "infrastructure",
    title: "Infrastructure Layer",
    description: "Node connections",
  },
  {
    id: "application",
    title: "Application Layer",
    description: "Application dependencies",
  },
  { id: "complete", title: "Complete System", description: "Full topology" },
];

interface GraphLayerProps {
  currentLayer: Layer;
  onLayerChange: (layer: Layer) => void;
}

export function GraphLayer({ currentLayer, onLayerChange }: GraphLayerProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const selected = LAYERS.find((l) => l.id === currentLayer) || LAYERS[2];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={isCollapsed ? selected.title : undefined}
                >
                  <Layers className="size-5 shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{selected.title}</span>
                      <ChevronDown className="size-4 shrink-0 opacity-50" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side={isCollapsed ? "right" : "bottom"}
                className="w-56"
              >
                {LAYERS.map((layer) => (
                  <DropdownMenuItem
                    key={layer.id}
                    onSelect={() => onLayerChange(layer.id)}
                  >
                    <div className="flex flex-col">
                      <span>{layer.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {layer.description}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
