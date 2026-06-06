import { Index } from "@upstash/vector";

// Lazy initialization to avoid errors when env vars are not set (build time)
let _index: Index | null = null;

function getIndex(): Index {
  if (!_index) {
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error("Upstash Vector credentials not configured");
    }
    _index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    });
  }
  return _index;
}

export interface VectorSearchResult {
  content: string;
  source: string;
  score: number;
}

/**
 * Query the vector database for semantically similar chunks
 */
export async function vectorSearch(
  query: string,
  topK: number = 5
): Promise<VectorSearchResult[]> {
  try {
    const results = await getIndex().query({
      data: query,
      topK,
      includeMetadata: true,
      includeData: true,
    });

    console.log(`[Vector] Got ${results.length} results for query: "${query.substring(0, 50)}..."`);

    return results
      .map((r) => {
        // Try metadata.content first, then fall back to data field
        const metadata = r.metadata as Record<string, string> | undefined;
        const content = metadata?.content || (r as unknown as { data?: string }).data || "";
        const source = metadata?.source || "unknown";

        return {
          content,
          source,
          score: r.score,
        };
      })
      .filter((r) => r.content.length > 0); // Filter out empty results
  } catch (error) {
    console.error("Vector search error:", error);
    return [];
  }
}

/**
 * Upsert chunks into the vector database
 */
export async function upsertChunks(
  chunks: { id: string; content: string; source: string }[]
) {
  // Batch upsert in groups of 10
  const batchSize = 10;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    await getIndex().upsert(
      batch.map((chunk) => ({
        id: chunk.id,
        data: chunk.content, // Upstash embeds this automatically
        metadata: {
          content: chunk.content,
          source: chunk.source,
        },
      }))
    );
  }
}

/**
 * Delete all vectors (useful for re-ingestion)
 */
export async function resetIndex() {
  await getIndex().reset();
}

export { getIndex };
