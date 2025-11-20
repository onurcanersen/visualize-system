import { useMemo } from "react";
import { GraphData } from "@/lib/graph/types";

export interface NodeTypeStats {
  type: string;
  count: number;
}

export interface LinkTypeStats {
  type: string;
  count: number;
}

export interface FilterStats {
  nodeTypes: NodeTypeStats[];
  linkTypes: LinkTypeStats[];
}

export function useFilterStats(graphData: GraphData | null): FilterStats {
  return useMemo(() => {
    if (!graphData) {
      return { nodeTypes: [], linkTypes: [] };
    }

    // Aggregate node types
    const nodeTypeCounts = new Map<string, number>();
    for (const node of graphData.nodes) {
      const count = nodeTypeCounts.get(node.type) || 0;
      nodeTypeCounts.set(node.type, count + 1);
    }

    // Aggregate link types
    const linkTypeCounts = new Map<string, number>();
    for (const link of graphData.links) {
      const count = linkTypeCounts.get(link.type) || 0;
      linkTypeCounts.set(link.type, count + 1);
    }

    // Convert to sorted arrays
    const nodeTypes = Array.from(nodeTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    const linkTypes = Array.from(linkTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return { nodeTypes, linkTypes };
  }, [graphData]);
}
