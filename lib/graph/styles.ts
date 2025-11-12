import { GraphLink } from "./types";

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

export const GRAPH_STYLES = {
  nodeSize: 3,
  nodeBorderColor: "#ffffff", // white
  nodeBorderWidth: 1.5,
  linkWidth: 2,
  linkCurvature: 0.1,
  linkParticleColor: "#ff0000", // red
  backgroundColor: "#ffffff", // white
};

const LINK_METRICS = {
  DEPENDS_ON: { maxValue: 100000, property: "throughput_bps" },
  PUBLISHES_TO: { maxValue: 100, property: "msg_rate_hz" },
  SUBSCRIBES_TO: { maxValue: 100, property: "consumption_rate" },
};

const LINK_PARTICLE_RANGE = {
  speed: { min: 0.001, max: 0.01 },
  width: { min: 2, max: 4 },
};

const LINK_WIDTH_RANGE = { min: 1, max: 5 };

const getMetricConfig = (linkType: string) => LINK_METRICS[linkType];

const calculateAverage = (link: GraphLink): number => {
  if (!link.info?.length) return 0;

  const config = getMetricConfig(link.type);
  if (!config) return 0;

  const sum = link.info.reduce(
    (acc, item) => acc + (item[config.property] || 0),
    0
  );
  return sum / link.info.length;
};

const normalize = (link: GraphLink): number => {
  const average = calculateAverage(link);
  const config = getMetricConfig(link.type);
  if (!config) return 0;

  return Math.min(1, average / config.maxValue);
};

const scale = (value: number, min: number, max: number) =>
  min + value * (max - min);

export const getLinkDirectionalParticles = (link: GraphLink) => {
  if (!link.info?.length || !getMetricConfig(link.type)) return 0;
  return link.info.length;
};

export const getLinkDirectionalParticleSpeed = (link: GraphLink) => {
  const normalized = normalize(link);
  return scale(
    normalized,
    LINK_PARTICLE_RANGE.speed.min,
    LINK_PARTICLE_RANGE.speed.max
  );
};

export const getLinkDirectionalParticleWidth = (link: GraphLink) => {
  const normalized = normalize(link);
  return scale(
    normalized,
    LINK_PARTICLE_RANGE.width.min,
    LINK_PARTICLE_RANGE.width.max
  );
};

export const getLinkWidth = (link: GraphLink) => {
  if (!getMetricConfig(link.type)) return GRAPH_STYLES.linkWidth;

  const normalized = normalize(link);
  return scale(normalized, LINK_WIDTH_RANGE.min, LINK_WIDTH_RANGE.max);
};
