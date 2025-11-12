import { useCallback, useRef } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import { GraphLink } from "@/lib/graph/types";

export function useGraphRef() {
  const graphRef = useRef<ForceGraphMethods | null>(null);

  const setGraphRef = useCallback((inst: ForceGraphMethods | null) => {
    graphRef.current = inst;

    if (!inst) return;

    setTimeout(() => inst.zoomToFit(400, 20), 100);

    const linkForce = inst.d3Force("link");
    if (linkForce) {
      linkForce.strength((link: GraphLink) => {
        switch (link.type) {
          case "RUNS_ON":
            return 1;
          default:
            return 0.1;
        }
      });
    }
  }, []);

  return { graphRef, setGraphRef };
}
