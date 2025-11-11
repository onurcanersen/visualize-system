import { NextResponse } from "next/server";
import { Layer } from "@/lib/graph/types";
import { getQuery } from "@/lib/neo4j/queries";
import { runQuery } from "@/lib/neo4j/client";
import { combineLinks } from "@/lib/graph/combiner";

export async function GET(request: Request) {
  try {
    const layer =
      (new URL(request.url).searchParams.get("layer") as Layer) || "complete";
    const result = await runQuery(getQuery(layer));
    const record = result.records[0];

    const nodes = record?.get("nodes") || [];
    const relationships = record?.get("relationships") || [];
    const links = combineLinks(relationships);

    return NextResponse.json({ nodes, links });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
