"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { GraphSidebar } from "@/components/graph/sidebar";
import { ForceGraph } from "@/components/graph/graph";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Layer, GraphData, GraphNode, GraphLink } from "@/lib/graph/types";
import { useGraphData } from "@/hooks/use-graph-data";

/**
 * Filters graph data by removing nodes and links of hidden types
 */
export function filterGraphData(
  graphData: GraphData | null,
  hiddenNodeTypes: Set<string>,
  hiddenLinkTypes: Set<string>
): GraphData | null {
  if (!graphData) return null;

  // Filter out hidden node types
  const visibleNodes = graphData.nodes.filter(
    (node) => !hiddenNodeTypes.has(node.type)
  );

  // Create a set of visible node IDs for efficient lookup
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

  // Filter out hidden link types and links connected to hidden nodes
  const visibleLinks = graphData.links.filter((link) => {
    const sourceId =
      typeof link.source === "string" ? link.source : link.source.id;
    const targetId =
      typeof link.target === "string" ? link.target : link.target.id;

    return (
      !hiddenLinkTypes.has(link.type) &&
      visibleNodeIds.has(sourceId) &&
      visibleNodeIds.has(targetId)
    );
  });

  return {
    nodes: visibleNodes,
    links: visibleLinks,
  };
}

export default function GraphPage() {
  const [layer, setLayer] = useState<Layer>("infrastructure");
  const { graphData, loading, error, refetch } = useGraphData(layer);

  const [hiddenNodeTypes, setHiddenNodeTypes] = useState<Set<string>>(
    new Set()
  );
  const [hiddenLinkTypes, setHiddenLinkTypes] = useState<Set<string>>(
    new Set()
  );

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);

  // Search state
  const [searchNodeId, setSearchNodeId] = useState<string | null>(null);
  const [searchConnectedNodes, setSearchConnectedNodes] = useState<Set<string>>(
    new Set()
  );

  // Memoize the filter callback to prevent recreating it on every render
  const handleFilterChange = useCallback(
    (newHiddenNodeTypes: Set<string>, newHiddenLinkTypes: Set<string>) => {
      setHiddenNodeTypes(newHiddenNodeTypes);
      setHiddenLinkTypes(newHiddenLinkTypes);
    },
    []
  );

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
  }, []);

  const handleLinkSelect = useCallback((link: GraphLink | null) => {
    setSelectedLink(link);
  }, []);

  const handleNodeSearch = useCallback(
    (nodeId: string, connectedNodeIds: Set<string>) => {
      setSearchNodeId(nodeId);
      setSearchConnectedNodes(connectedNodeIds);

      // Auto-select the searched node
      const node = graphData?.nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
      }
    },
    [graphData]
  );

  const handleClearSearch = useCallback(() => {
    setSearchNodeId(null);
    setSearchConnectedNodes(new Set());
  }, []);

  // Apply only type-based filters (no search filtering)
  const filteredGraphData = useMemo(
    () => filterGraphData(graphData, hiddenNodeTypes, hiddenLinkTypes),
    [graphData, hiddenNodeTypes, hiddenLinkTypes]
  );

  return (
    <SidebarProvider>
      <div className="relative h-screen w-full">
        <ForceGraph
          layer={layer}
          graphData={filteredGraphData}
          loading={loading}
          error={error}
          refetch={refetch}
          onNodeSelect={handleNodeSelect}
          onLinkSelect={handleLinkSelect}
          searchNodeId={searchNodeId}
          searchConnectedNodes={searchConnectedNodes}
          onClearSearch={handleClearSearch}
        />
        <GraphSidebar
          currentLayer={layer}
          onLayerChange={setLayer}
          graphData={graphData}
          onFilterChange={handleFilterChange}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onNodeSearch={handleNodeSearch}
          onClearSearch={handleClearSearch}
        />
      </div>
    </SidebarProvider>
  );
}
