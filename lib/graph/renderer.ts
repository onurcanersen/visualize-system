import { Node, Link } from "./types";
import { NODE_COLORS, LINK_COLORS, GRAPH_CONFIG } from "./configs";
import { drawNodeShape, getNodeShape } from "./shapes";

export function getNodeColor(node: Node): string {
  return NODE_COLORS[node.type] || NODE_COLORS.default;
}

export function getLinkColor(link: Link): string {
  return LINK_COLORS[link.type] || LINK_COLORS.default;
}

export function renderNode(
  node: Node,
  ctx: CanvasRenderingContext2D,
  globalScale: number
) {
  if (!node.x || !node.y) return;

  const size = GRAPH_CONFIG.nodeSize;
  const color = getNodeColor(node);
  const shape = getNodeShape(node.type);

  // Draw node shape
  ctx.fillStyle = color;
  drawNodeShape(shape, ctx, node.x, node.y, size);
  ctx.fill();

  // Draw border
  ctx.strokeStyle = GRAPH_CONFIG.nodeBorderColor;
  ctx.lineWidth = GRAPH_CONFIG.nodeBorderWidth / globalScale;
  ctx.stroke();
}

export function renderNodePointerArea(
  node: Node,
  color: string,
  ctx: CanvasRenderingContext2D
) {
  if (!node.x || !node.y) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x, node.y, GRAPH_CONFIG.nodeSize, 0, 2 * Math.PI);
  ctx.fill();
}
