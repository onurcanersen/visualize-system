export type Layer = "infrastructure" | "application" | "complete";

export interface GraphNode {
  id: string;
  type: string;
  name: string;
  info: Record<string, unknown>;
  x?: number;
  y?: number;
  neighbors?: string[];
  links?: GraphLink[];
}

export interface GraphLink {
  source: string | { id: string };
  target: string | { id: string };
  type: string;
  info: Array<{ direction: string; [key: string]: unknown }>;
  count: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
