import { GRAPH_STYLE } from "./styles";

export type NodeShape = "rectangle" | "circle" | "triangle";

export const NODE_SHAPES: Record<string, NodeShape> = {
  Node: "rectangle",
  Application: "circle",
  Topic: "triangle",
  default: "circle",
};

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.rect(x - size, y - size, size * 2, size * 2);
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.arc(x, y, size, 0, 2 * Math.PI);
}

export function drawTriangle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.lineTo(x - size, y + size);
  ctx.closePath();
}

export function drawNodeShape(
  shape: NodeShape,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = GRAPH_STYLE.nodeSize
) {
  ctx.beginPath();

  switch (shape) {
    case "rectangle":
      drawRectangle(ctx, x, y, size);
      break;
    case "triangle":
      drawTriangle(ctx, x, y, size);
      break;
    case "circle":
    default:
      drawCircle(ctx, x, y, size);
      break;
  }
}

export function getNodeShape(nodeType: string): NodeShape {
  return NODE_SHAPES[nodeType] || NODE_SHAPES.default;
}
