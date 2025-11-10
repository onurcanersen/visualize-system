"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { GraphData, Layer } from "@/lib/graph/types";
import { GRAPH_CONFIG } from "@/lib/graph/configs";
import {
  getLinkColor,
  renderNode,
  renderNodePointerArea,
} from "@/lib/graph/renderer";
import Spinner from "./spinner";
import Error from "./error";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export function useGraphData(layer: Layer) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  const fetchGraphData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/graph?layer=${layer}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setGraphData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [layer]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return { graphData, loading, error, refetch: fetchGraphData };
}

export default function Graph() {
  const [layer, setLayer] = useState<Layer>("complete");
  const { graphData, loading, error, refetch } = useGraphData(layer);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Error error={error} onRetry={refetch} />;
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeCanvasObject={renderNode}
      nodePointerAreaPaint={renderNodePointerArea}
      linkColor={getLinkColor}
      linkWidth={GRAPH_CONFIG.linkWidth}
      backgroundColor={GRAPH_CONFIG.backgroundColor}
    />
  );
}
