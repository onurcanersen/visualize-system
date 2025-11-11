export type Layer = "infrastructure" | "application" | "complete";

export interface GraphNode {
  id: string;
  type: string;
  name: string;
  info: Record<string, unknown>;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  info: Array<{ direction: string; [key: string]: unknown }>;
  count: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
