import { NextResponse } from "next/server";
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || "neo4j",
    process.env.NEO4J_PASSWORD || "password"
  )
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get("layer") || "complete";

  const session = driver.session();

  try {
    let query = "";

    switch (layer) {
      case "infrastructure":
        query = `
            // Get Node nodes
            MATCH (n:Node)
            WITH collect(distinct {
              id: toString(id(n)),
              type: 'Node',
              name: coalesce(n.name, 'Node-' + toString(id(n))),
              info: properties(n)
            }) as nodes
            
            // Get CONNECTS_TO relationships
            MATCH (source:Node)-[r:CONNECTS_TO]->(target:Node)
            RETURN nodes, collect(distinct {
              source: toString(id(source)),
              target: toString(id(target)),
              type: 'CONNECTS_TO',
              info: properties(r)
            }) as relationships
          `;
        break;

      case "application":
        query = `
            // Get Application nodes
            MATCH (n:Application)
            WITH collect(distinct {
              id: toString(id(n)),
              type: 'Application',
              name: coalesce(n.name, 'Application-' + toString(id(n))),
              info: properties(n)
            }) as nodes
            
            // Get DEPENDS_ON relationships
            MATCH (source:Application)-[r:DEPENDS_ON]->(target:Application)
            RETURN nodes, collect(distinct {
              source: toString(id(source)),
              target: toString(id(target)),
              type: 'DEPENDS_ON',
              info: properties(r)
            }) as relationships
          `;
        break;

      case "complete":
        query = `
            // Get Node, Application, and Topic nodes
            MATCH (n)
            WHERE n:Node OR n:Application OR n:Topic
            WITH collect(distinct {
              id: toString(id(n)),
              type: head(labels(n)),
              name: coalesce(n.name, head(labels(n)) + '-' + toString(id(n))),
              info: properties(n)
            }) as nodes

            // Get RUNS_ON, PUBLISHES_TO, and SUBSCRIBES_TO relationships
            MATCH (source)-[r]->(target)
            WHERE (source:Node OR source:Application OR source:Topic) 
              AND (target:Node OR target:Application OR target:Topic)
              AND type(r) IN ['RUNS_ON', 'PUBLISHES_TO', 'SUBSCRIBES_TO']
            RETURN nodes, collect(distinct {
              source: toString(id(source)),
              target: toString(id(target)),
              type: type(r),
              info: properties(r)
            }) as relationships
          `;
        break;
    }

    const result = await session.run(query);
    const record = result.records[0];

    const nodes = record?.get("nodes") || [];
    const relationships = record?.get("relationships") || [];

    return NextResponse.json({ nodes, links: relationships });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await session.close();
  }
}
