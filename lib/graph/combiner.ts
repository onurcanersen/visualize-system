import { GraphLink } from "./types";

interface RawRelationship {
  source: string;
  target: string;
  type: string;
  info: Record<string, unknown>;
}

export function combineLinks(relationships: RawRelationship[]): GraphLink[] {
  const linkMap = new Map<string, GraphLink>();

  for (const rel of relationships) {
    const nodes = [rel.source, rel.target].sort();
    const key = `${nodes[0]}-${nodes[1]}-${rel.type}`;
    const direction = `${rel.source}→${rel.target}`;

    if (!linkMap.has(key)) {
      linkMap.set(key, {
        source: rel.source,
        target: rel.target,
        type: rel.type,
        info: [{ direction, ...rel.info }],
        count: 1,
      });
    } else {
      const existing = linkMap.get(key)!;
      existing.info.push({ direction, ...rel.info });
      existing.count++;
    }
  }

  return Array.from(linkMap.values());
}
