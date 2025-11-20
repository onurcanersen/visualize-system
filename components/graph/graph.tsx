"use client";
import dynamic from "next/dynamic";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Layer, GraphNode, GraphLink, GraphData } from "@/lib/graph/types";
import {
  getLinkColor,
  renderNode,
  renderNodePointerArea,
} from "@/lib/graph/renderer";
import {
  GRAPH_STYLES,
  getLinkDirectionalParticles,
  getLinkDirectionalParticleSpeed,
  getLinkDirectionalParticleWidth,
  getLinkDirectionalParticleColor,
  getLinkWidth,
} from "@/lib/graph/styles";
import { useGraphRef } from "@/hooks/use-graph-ref";
import { GraphSpinner } from "./spinner";
import { GraphError } from "./error";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface ForceGraphProps {
  layer: Layer;
  graphData: GraphData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  onNodeSelect?: (node: GraphNode | null) => void;
  onLinkSelect?: (link: GraphLink | null) => void;
  searchNodeId?: string | null;
  searchConnectedNodes?: Set<string>;
  onClearSearch?: () => void;
}

export function ForceGraph({
  layer,
  graphData,
  loading,
  error,
  refetch,
  onNodeSelect,
  onLinkSelect,
  searchNodeId,
  searchConnectedNodes,
  onClearSearch,
}: ForceGraphProps) {
  const { graphRef, setGraphRef } = useGraphRef();

  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(
    new Set()
  );
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Process graph data to add neighbor and link references
  const processedGraphData = useMemo(() => {
    if (!graphData) return null;

    const nodes = graphData.nodes.map((node) => ({
      ...node,
      neighbors: [] as string[],
      links: [] as GraphLink[],
    }));

    const links = graphData.links.map((link) => ({ ...link }));

    // Create lookup map for nodes
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // Cross-link node objects
    links.forEach((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;
      const source = nodeMap.get(sourceId);
      const target = nodeMap.get(targetId);

      if (source && target) {
        source.neighbors.push(targetId);
        target.neighbors.push(sourceId);
        source.links.push(link);
        target.links.push(link);
      }
    });

    return { nodes, links };
  }, [graphData]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<GraphLink>();

    if (node) {
      newHighlightNodes.add(node.id);
      node.neighbors?.forEach((neighborId) =>
        newHighlightNodes.add(neighborId)
      );
      node.links?.forEach((link) => newHighlightLinks.add(link));
    }

    setHoverNode(node?.id || null);
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const handleNodeClick = useCallback(
    (node: GraphNode | null) => {
      if (node) {
        setSelectedNodeId(node.id);
        onNodeSelect?.(node);
        onLinkSelect?.(null); // Clear link selection
      }
    },
    [onNodeSelect, onLinkSelect]
  );

  const handleLinkHover = useCallback((link: GraphLink | null) => {
    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<GraphLink>();

    if (link) {
      newHighlightLinks.add(link);

      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      newHighlightNodes.add(sourceId);
      newHighlightNodes.add(targetId);
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, []);

  const handleLinkClick = useCallback(
    (link: GraphLink | null) => {
      if (link) {
        setSelectedNodeId(null); // Clear node selection
        onLinkSelect?.(link);
        onNodeSelect?.(null);
      }
    },
    [onNodeSelect, onLinkSelect]
  );

  const handleBackgroundClick = useCallback(() => {
    // Clear selections
    setSelectedNodeId(null);
    onNodeSelect?.(null);
    onLinkSelect?.(null);

    // Clear search if active
    if (searchNodeId) {
      onClearSearch?.();
    }
  }, [onNodeSelect, onLinkSelect, searchNodeId, onClearSearch]);

  // Enhanced node renderer with shadow glows instead of rings
  const renderNodeWithHighlight = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      if (!node.x || !node.y) return;

      const isSearched = searchNodeId === node.id;
      const isConnectedToSearch =
        searchConnectedNodes && searchConnectedNodes.has(node.id);
      const hasActiveSearch =
        searchNodeId !== null && searchNodeId !== undefined;
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoverNode === node.id;
      const isHighlighted = highlightNodes.has(node.id);

      // Determine opacity based on search state
      let nodeOpacity = 1.0;
      if (hasActiveSearch && !isSearched && !isConnectedToSearch) {
        nodeOpacity = 0.15; // Dim non-related nodes
      }

      // Draw shadow glows based on state (from back to front)

      // 1. Search highlight - Large purple glow for the searched node
      if (isSearched) {
        // Outer glow - very large and visible
        ctx.globalAlpha = 0.6;
        const gradient1 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 6
        );
        gradient1.addColorStop(0, "#a855f7"); // purple
        gradient1.addColorStop(0.3, "rgba(168, 85, 247, 0.6)");
        gradient1.addColorStop(0.6, "rgba(168, 85, 247, 0.3)");
        gradient1.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 6, 0, 2 * Math.PI);
        ctx.fill();

        // Middle glow
        ctx.globalAlpha = 0.8;
        const gradient2 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 3
        );
        gradient2.addColorStop(0, "#e9d5ff"); // very light purple
        gradient2.addColorStop(0.4, "#c084fc"); // light purple
        gradient2.addColorStop(0.7, "rgba(168, 85, 247, 0.5)");
        gradient2.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 3, 0, 2 * Math.PI);
        ctx.fill();

        // Inner bright core
        ctx.globalAlpha = 0.9;
        const gradient3 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 1.5
        );
        gradient3.addColorStop(0, "#f3e8ff"); // almost white purple
        gradient3.addColorStop(0.5, "#e9d5ff");
        gradient3.addColorStop(1, "rgba(233, 213, 255, 0)");
        ctx.fillStyle = gradient3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 2. Connected node highlight - Medium purple glow
      if (isConnectedToSearch && !isSearched) {
        // Outer glow
        ctx.globalAlpha = 0.7;
        const gradient1 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 4
        );
        gradient1.addColorStop(0, "#c084fc"); // light purple
        gradient1.addColorStop(0.4, "rgba(192, 132, 252, 0.5)");
        gradient1.addColorStop(1, "rgba(192, 132, 252, 0)");
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 4, 0, 2 * Math.PI);
        ctx.fill();

        // Inner glow
        ctx.globalAlpha = 0.8;
        const gradient2 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 2
        );
        gradient2.addColorStop(0, "#e9d5ff");
        gradient2.addColorStop(0.5, "#c084fc");
        gradient2.addColorStop(1, "rgba(192, 132, 252, 0)");
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 3. Selection glow - Blue glow (when no search is active)
      if (isSelected && !hasActiveSearch) {
        // Outer glow
        ctx.globalAlpha = 0.7;
        const gradient1 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 4
        );
        gradient1.addColorStop(0, "#60a5fa"); // light blue
        gradient1.addColorStop(0.4, "rgba(59, 130, 246, 0.5)");
        gradient1.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 4, 0, 2 * Math.PI);
        ctx.fill();

        // Inner glow
        ctx.globalAlpha = 0.8;
        const gradient2 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 2
        );
        gradient2.addColorStop(0, "#bfdbfe"); // very light blue
        gradient2.addColorStop(0.5, "#60a5fa");
        gradient2.addColorStop(1, "rgba(96, 165, 250, 0)");
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // 4. Hover glow - Red/Orange glow (when no search is active)
      if (
        isHighlighted &&
        !isSearched &&
        !isConnectedToSearch &&
        !hasActiveSearch
      ) {
        const glowColor = isHovered ? "#ef4444" : "#f97316"; // red or orange
        const lightColor = isHovered ? "#fca5a5" : "#fdba74"; // light red or light orange

        // Outer glow
        ctx.globalAlpha = 0.6;
        const gradient1 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 3.5
        );
        gradient1.addColorStop(0, glowColor);
        gradient1.addColorStop(0.4, `${glowColor}99`); // 60% opacity
        gradient1.addColorStop(1, `${glowColor}00`); // 0% opacity
        ctx.fillStyle = gradient1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 3.5, 0, 2 * Math.PI);
        ctx.fill();

        // Inner glow
        ctx.globalAlpha = 0.8;
        const gradient2 = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          GRAPH_STYLES.nodeSize * 1.8
        );
        gradient2.addColorStop(0, lightColor);
        gradient2.addColorStop(0.5, glowColor);
        gradient2.addColorStop(1, `${glowColor}00`);
        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize * 1.8, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Apply opacity to the node itself
      ctx.globalAlpha = nodeOpacity;

      // Draw the actual node
      renderNode(node, ctx, globalScale);

      // Reset alpha
      ctx.globalAlpha = 1.0;
    },
    [
      highlightNodes,
      hoverNode,
      selectedNodeId,
      searchNodeId,
      searchConnectedNodes,
    ]
  );

  // Enhanced link width for highlighted links
  const getHighlightedLinkWidth = useCallback(
    (link: GraphLink) => {
      if (highlightLinks.has(link)) {
        return Math.max(getLinkWidth(link), 5);
      }
      return getLinkWidth(link);
    },
    [highlightLinks]
  );

  // Apply opacity to links based on search state
  const getSearchAwareLinkColor = useCallback(
    (link: GraphLink) => {
      const baseColor = getLinkColor(link);

      if (!searchNodeId || !searchConnectedNodes) {
        return baseColor;
      }

      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      // Check if link connects to searched node or its neighbors
      const isConnected =
        searchConnectedNodes.has(sourceId) &&
        searchConnectedNodes.has(targetId);

      if (!isConnected) {
        // Return dimmed color (15% opacity)
        return baseColor + "26"; // ~15% opacity in hex
      }

      return baseColor;
    },
    [searchNodeId, searchConnectedNodes]
  );

  // Apply opacity to particles based on search state
  const getSearchAwareLinkParticleColor = useCallback(
    (link: GraphLink) => {
      if (!searchNodeId || !searchConnectedNodes) {
        return getLinkDirectionalParticleColor(link);
      }

      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      // Check if link connects to searched node or its neighbors
      const isConnected =
        searchConnectedNodes.has(sourceId) &&
        searchConnectedNodes.has(targetId);

      const baseColor = getLinkDirectionalParticleColor(link);

      if (!isConnected) {
        // Return dimmed color (15% opacity)
        return baseColor + "26"; // ~15% opacity in hex
      }

      return baseColor;
    },
    [searchNodeId, searchConnectedNodes]
  );

  if (loading) return <GraphSpinner />;
  if (error) return <GraphError error={error} onRetry={refetch} />;
  if (!processedGraphData) return null;

  return (
    <div className="absolute inset-0">
      <ForceGraph2D
        ref={setGraphRef}
        graphData={processedGraphData}
        nodeCanvasObject={renderNodeWithHighlight}
        nodePointerAreaPaint={renderNodePointerArea}
        linkColor={getSearchAwareLinkColor}
        linkWidth={getHighlightedLinkWidth}
        linkCurvature={GRAPH_STYLES.linkCurvature}
        linkDirectionalParticles={getLinkDirectionalParticles}
        linkDirectionalParticleSpeed={getLinkDirectionalParticleSpeed}
        linkDirectionalParticleWidth={getLinkDirectionalParticleWidth}
        linkDirectionalParticleColor={getSearchAwareLinkParticleColor}
        backgroundColor={GRAPH_STYLES.backgroundColor}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        onLinkHover={handleLinkHover}
        onLinkClick={handleLinkClick}
        onBackgroundClick={handleBackgroundClick}
        autoPauseRedraw={false}
      />
    </div>
  );
}
