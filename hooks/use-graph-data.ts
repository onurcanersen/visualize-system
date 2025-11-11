import { useCallback, useEffect, useState } from "react";
import { GraphData, Layer } from "@/lib/graph/types";

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
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP error: ${response.status}`);
      }
      setGraphData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [layer]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return { graphData, loading, error, refetch: fetchGraphData };
}
