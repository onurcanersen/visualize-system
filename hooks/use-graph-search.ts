import { useMemo, useState, useCallback } from "react";
import { GraphData, GraphNode } from "@/lib/graph/types";

export interface SearchResult {
  node: GraphNode;
  matchScore: number;
}

/**
 * Custom hook for performant graph search with autocomplete
 * Uses memoization and efficient string matching
 */
export function useGraphSearch(graphData: GraphData | null) {
  const [searchTerm, setSearchTerm] = useState("");

  // Create a search index for fast lookups and build neighbor relationships
  const searchIndex = useMemo(() => {
    if (!graphData) {
      return {
        nodeMap: new Map(),
        searchableNodes: [],
        neighborMap: new Map(),
      };
    }

    const nodeMap = new Map<string, GraphNode>();
    const neighborMap = new Map<string, Set<string>>();
    const searchableNodes: Array<{
      id: string;
      searchText: string;
      node: GraphNode;
    }> = [];

    // Initialize nodes and neighbor maps
    graphData.nodes.forEach((node) => {
      nodeMap.set(node.id, node);

      // Initialize neighbor set with the node itself
      neighborMap.set(node.id, new Set([node.id]));

      // Create searchable text from node properties
      const searchText = [
        node.name,
        node.type,
        node.id,
        ...Object.values(node.info || {}).map((v) => String(v)),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      searchableNodes.push({
        id: node.id,
        searchText,
        node,
      });
    });

    // Build neighbor relationships from links
    let linkCount = 0;
    graphData.links.forEach((link) => {
      const sourceId =
        typeof link.source === "string" ? link.source : link.source.id;
      const targetId =
        typeof link.target === "string" ? link.target : link.target.id;

      // Add bidirectional neighbors
      const sourceNeighbors = neighborMap.get(sourceId);
      const targetNeighbors = neighborMap.get(targetId);

      if (sourceNeighbors && targetNeighbors) {
        sourceNeighbors.add(targetId);
        targetNeighbors.add(sourceId);
        linkCount++;
      } else {
        console.warn(
          "useGraphSearch: Could not find nodes for link:",
          sourceId,
          "->",
          targetId
        );
      }
    });

    // Log some sample neighbor counts
    let sampleCount = 0;
    neighborMap.forEach((neighbors, nodeId) => {
      if (sampleCount < 3) {
        const node = nodeMap.get(nodeId);

        sampleCount++;
      }
    });

    return { nodeMap, searchableNodes, neighborMap };
  }, [graphData]);

  // Get autocomplete suggestions (top 10 matches)
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      return [];
    }

    const query = searchTerm.toLowerCase().trim();
    const results: SearchResult[] = [];

    for (const item of searchIndex.searchableNodes) {
      // Calculate match score
      let score = 0;

      const nodeName = (item.node.name || "").toLowerCase();
      const nodeType = (item.node.type || "").toLowerCase();
      const nodeId = (item.node.id || "").toLowerCase();

      // Exact name match gets highest score
      if (nodeName === query) {
        score = 1000;
      }
      // Name starts with query
      else if (nodeName.startsWith(query)) {
        score = 500;
      }
      // Name contains query
      else if (nodeName.includes(query)) {
        score = 250;
      }
      // Type matches
      else if (nodeType.includes(query)) {
        score = 100;
      }
      // ID matches
      else if (nodeId.includes(query)) {
        score = 50;
      }
      // Any property matches
      else if (item.searchText.includes(query)) {
        score = 10;
      }

      if (score > 0) {
        results.push({ node: item.node, matchScore: score });
      }

      // Early exit if we have enough high-quality results
      if (results.length >= 50 && score < 100) break;
    }

    // Sort by score and return top 10
    const topResults = results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return topResults;
  }, [searchTerm, searchIndex.searchableNodes]);

  // Get connected nodes for a given node (includes the node itself)
  const getConnectedNodes = useCallback(
    (nodeId: string): Set<string> => {
      if (!graphData) {
        return new Set([nodeId]);
      }

      // Get neighbors from the pre-built neighbor map
      const neighbors = searchIndex.neighborMap.get(nodeId);

      if (!neighbors) {
        console.warn(
          "useGraphSearch.getConnectedNodes: No neighbors found for node:",
          nodeId
        );
        return new Set([nodeId]);
      }

      return neighbors;
    },
    [graphData, searchIndex.neighborMap]
  );

  // Search and return node with its connected nodes
  const searchAndHighlight = useCallback(
    (nodeId: string) => {
      const node = searchIndex.nodeMap.get(nodeId);
      if (!node) {
        console.error(
          "useGraphSearch.searchAndHighlight: Node not found:",
          nodeId
        );
        return null;
      }

      const connectedNodeIds = getConnectedNodes(nodeId);

      return {
        node,
        connectedNodeIds,
      };
    },
    [searchIndex.nodeMap, getConnectedNodes]
  );

  return {
    searchTerm,
    setSearchTerm,
    suggestions,
    searchAndHighlight,
    getConnectedNodes,
  };
}
