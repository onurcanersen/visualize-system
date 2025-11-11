"use client";

import { useState } from "react";
import { GraphSidebar } from "@/components/graph/sidebar";
import { ForceGraph } from "@/components/graph/graph";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layer } from "@/lib/graph/types";

export default function GraphPage() {
  const [layer, setLayer] = useState<Layer>("infrastructure");

  return (
    <SidebarProvider>
      <div className="relative h-screen w-full">
        <ForceGraph layer={layer} />
        <GraphSidebar currentLayer={layer} onLayerChange={setLayer} />
      </div>
    </SidebarProvider>
  );
}
