"use client";
import dynamic from "next/dynamic";
import { Layer } from "@/lib/graph/types";
import { GRAPH_STYLES } from "@/lib/graph/styles";
import {
  getLinkColor,
  renderNode,
  renderNodePointerArea,
} from "@/lib/graph/renderer";
import {
  getLinkDirectionalParticles,
  getLinkDirectionalParticleSpeed,
  getLinkDirectionalParticleWidth,
  getLinkWidth,
} from "@/lib/graph/styles";
import { useGraphData } from "@/hooks/use-graph-data";
import { useGraphRef } from "@/hooks/use-graph-ref";
import { GraphSpinner } from "./spinner";
import { GraphError } from "./error";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface ForceGraphProps {
  layer: Layer;
}

export function ForceGraph({ layer }: ForceGraphProps) {
  const { graphData, loading, error, refetch } = useGraphData(layer);
  const { setGraphRef } = useGraphRef();

  if (loading) return <GraphSpinner />;
  if (error) return <GraphError error={error} onRetry={refetch} />;

  return (
    <div className="absolute inset-0">
      <ForceGraph2D
        ref={setGraphRef}
        graphData={graphData}
        nodeCanvasObject={renderNode}
        nodePointerAreaPaint={renderNodePointerArea}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkCurvature={GRAPH_STYLES.linkCurvature}
        linkDirectionalParticles={getLinkDirectionalParticles}
        linkDirectionalParticleSpeed={getLinkDirectionalParticleSpeed}
        linkDirectionalParticleWidth={getLinkDirectionalParticleWidth}
        linkDirectionalParticleColor={() => "#000000"}
        backgroundColor={GRAPH_STYLES.backgroundColor}
      />
    </div>
  );
}
