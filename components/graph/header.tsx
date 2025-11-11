"use client";

import { useState } from "react";
import { Network, PanelLeftClose, PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export function GraphHeader() {
  const { state, toggleSidebar } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <div className="flex px-2 py-2">
        <div
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md hover:bg-sidebar-accent"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={toggleSidebar}
        >
          {isHovered ? (
            <PanelLeft className="size-5" />
          ) : (
            <Network className="size-5" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex h-9 items-center gap-2">
        <Network className="size-5" />
        <span className="font-semibold">Graph Visualizer</span>
      </div>
      <button
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-sidebar-accent"
      >
        <PanelLeftClose className="size-5" />
      </button>
    </div>
  );
}
