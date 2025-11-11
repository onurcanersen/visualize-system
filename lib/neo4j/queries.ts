import { Layer } from "@/lib/graph/types";

const INFRASTRUCTURE_QUERY = `
  MATCH (n:Node)
  WITH collect({
    id: toString(id(n)),
    type: 'Node',
    name: coalesce(n.name, 'Node-' + toString(id(n))),
    info: properties(n)
  }) as nodes
  
  MATCH (source:Node)-[r:CONNECTS_TO]->(target:Node)
  RETURN nodes, collect({
    source: toString(id(source)),
    target: toString(id(target)),
    type: 'CONNECTS_TO',
    info: properties(r)
  }) as relationships
`;

const APPLICATION_QUERY = `
  MATCH (n:Application)
  WITH collect({
    id: toString(id(n)),
    type: 'Application',
    name: coalesce(n.name, 'Application-' + toString(id(n))),
    info: properties(n)
  }) as nodes
  
  MATCH (source:Application)-[r:DEPENDS_ON]->(target:Application)
  RETURN nodes, collect({
    source: toString(id(source)),
    target: toString(id(target)),
    type: 'DEPENDS_ON',
    info: properties(r)
  }) as relationships
`;

const COMPLETE_QUERY = `
  MATCH (n)
  WHERE n:Node OR n:Application OR n:Topic
  WITH collect({
    id: toString(id(n)),
    type: head(labels(n)),
    name: coalesce(n.name, head(labels(n)) + '-' + toString(id(n))),
    info: properties(n)
  }) as nodes

  MATCH (source)-[r]->(target)
  WHERE (source:Node OR source:Application OR source:Topic) 
    AND (target:Node OR target:Application OR target:Topic)
    AND type(r) IN ['RUNS_ON', 'PUBLISHES_TO', 'SUBSCRIBES_TO']
  RETURN nodes, collect({
    source: toString(id(source)),
    target: toString(id(target)),
    type: type(r),
    info: properties(r)
  }) as relationships
`;

export function getQuery(layer: Layer): string {
  switch (layer) {
    case "infrastructure":
      return INFRASTRUCTURE_QUERY;
    case "application":
      return APPLICATION_QUERY;
    case "complete":
      return COMPLETE_QUERY;
  }
}
