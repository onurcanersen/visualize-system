import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI || "bolt://localhost:7687",
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME || "neo4j",
        process.env.NEO4J_PASSWORD || "password"
      )
    );
  }
  return driver;
}

export async function runQuery(query: string) {
  const session = getDriver().session();
  try {
    return await session.run(query);
  } finally {
    await session.close();
  }
}
