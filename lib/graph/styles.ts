export const NODE_COLORS: Record<string, string> = {
  Node: "#3b82f6", // blue
  Application: "#10b981", // green
  Topic: "#f59e0b", // amber
  default: "#6b7280", // gray
};

export const LINK_COLORS: Record<string, string> = {
  CONNECTS_TO: "#3b82f6", // blue
  DEPENDS_ON: "#10b981", // green
  RUNS_ON: "#00CEC8", // blue-green
  PUBLISHES_TO: "#5cbf48", // yellow-green
  SUBSCRIBES_TO: "#bca743", // olive-gold
  default: "#9ca3af", // light gray
};

export const GRAPH_STYLE = {
  nodeSize: 3,
  nodeBorderColor: "#ffffff",
  nodeBorderWidth: 1.5,
  linkWidth: 2,
  linkCurvature: 0.1,
  backgroundColor: "#ffffff",
};
