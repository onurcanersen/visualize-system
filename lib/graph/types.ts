export type Layer = "infrastructure" | "application" | "complete";

export interface Node {
  id: string;
  type: string;
  name: string;
  info: Record<string, unknown>;
  x?: number;
  y?: number;
}

export interface Link {
  source: string;
  target: string;
  type: string;
  info: Record<string, unknown>;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}
