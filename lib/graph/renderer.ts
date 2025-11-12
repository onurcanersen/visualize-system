import { GraphNode, GraphLink } from "./types";
import { NODE_COLORS, LINK_COLORS, GRAPH_STYLES } from "./styles";
import { drawNodeShape, getNodeShape } from "./shapes";

export function getNodeColor(node: GraphNode): string {
  return NODE_COLORS[node.type] || NODE_COLORS.default;
}

export function getLinkColor(link: GraphLink): string {
  return LINK_COLORS[link.type] || LINK_COLORS.default;
}

export function renderNode(
  node: GraphNode,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  if (!node.x || !node.y) return;

  const size = GRAPH_STYLES.nodeSize;
  const color = getNodeColor(node);
  const shape = getNodeShape(node.type);

  // Draw node shape
  ctx.fillStyle = color;
  drawNodeShape(shape, ctx, node.x, node.y, size);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = GRAPH_STYLES.nodeBorderColor;
  ctx.lineWidth = GRAPH_STYLES.nodeBorderWidth / globalScale;
  ctx.stroke();
}

export function renderNodePointerArea(
  node: GraphNode,
  color: string,
  ctx: CanvasRenderingContext2D
) {
  if (!node.x || !node.y) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x, node.y, GRAPH_STYLES.nodeSize, 0, 2 * Math.PI);
  ctx.fill();
}
