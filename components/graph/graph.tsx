"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import { GraphLink, Layer } from "@/lib/graph/types";
import { GRAPH_STYLE } from "@/lib/graph/styles";
import {
  getLinkColor,
  renderNode,
  renderNodePointerArea,
} from "@/lib/graph/renderer";
import { useGraphData } from "@/hooks/use-graph-data";
import Spinner from "./spinner";
import Error from "./error";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function Graph() {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const [layer, setLayer] = useState<Layer>("complete");
  const { graphData, loading, error, refetch } = useGraphData(layer);

  const setFgRef = useCallback(
    (inst: ForceGraphMethods | null) => {
      if (!inst || layer !== "complete") return;
      fgRef.current = inst;

      const linkForce = inst.d3Force("link");
      if (linkForce) {
        linkForce.strength((link: GraphLink) =>
          link.type === "RUNS_ON" ? 1 : 0.1
        );
      }
    },
    [layer]
  );

  if (loading) return <Spinner />;
  if (error) return <Error error={error} onRetry={refetch} />;

  return (
    <ForceGraph2D
      ref={setFgRef}
      graphData={graphData}
      nodeCanvasObject={renderNode}
      nodePointerAreaPaint={renderNodePointerArea}
      linkColor={getLinkColor}
      linkWidth={GRAPH_STYLE.linkWidth}
      linkCurvature={GRAPH_STYLE.linkCurvature}
      backgroundColor={GRAPH_STYLE.backgroundColor}
    />
  );
}
