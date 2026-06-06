import fs from "fs";
import path from "path";
import { vectorSearch, VectorSearchResult } from "./vector";

export interface KnowledgeChunk {
  content: string;
  source: string;
  relevance: number;
}

/**
 * Primary retrieval: uses Upstash Vector (semantic search)
 * Fallback: keyword-based search if vector DB is not configured
 */
export async function retrieveRelevantContext(
  query: string,
  topK: number = 5
): Promise<KnowledgeChunk[]> {
  // Try vector search first
  if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
    try {
      const results = await vectorSearch(query, topK);
      if (results.length > 0) {
        return results.map((r) => ({
          content: r.content,
          source: r.source,
          relevance: r.score,
        }));
      }
    } catch (error) {
      console.error("Vector search failed, falling back to keyword search:", error);
    }
  }

  // Fallback: keyword-based search
  return keywordSearch(query, topK);
}

// ----- Keyword-based fallback -----

function loadKnowledgeBase(): { content: string; source: string }[] {
  const knowledgeDir = path.join(process.cwd(), "src/lib/knowledge");
  const chunks: { content: string; source: string }[] = [];

  // Load resume
  const resumePath = path.join(knowledgeDir, "resume.md");
  if (fs.existsSync(resumePath)) {
    const resumeContent = fs.readFileSync(resumePath, "utf-8");
    const sections = resumeContent.split(/^## /gm).filter(Boolean);
    for (const section of sections) {
      chunks.push({
        content: "## " + section.trim(),
        source: "resume",
      });
    }
  }

  // Load repo docs
  const reposDir = path.join(knowledgeDir, "repos");
  if (fs.existsSync(reposDir)) {
    const files = fs.readdirSync(reposDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(reposDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const sections = content.split(/^## /gm).filter(Boolean);
        for (const section of sections) {
          chunks.push({
            content: "## " + section.trim(),
            source: file.replace(".md", ""),
          });
        }
      }
    }
  }

  return chunks;
}

function scoreRelevance(query: string, content: string): number {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2);

  const contentLower = content.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    const matches = (contentLower.match(new RegExp(term, "g")) || []).length;
    score += matches * 2;
    if (contentLower.includes(term)) {
      score += 1;
    }
  }

  const queryLower = query.toLowerCase();
  if (contentLower.includes(queryLower)) {
    score += 10;
  }

  const lengthPenalty = Math.log(content.length / 100 + 1);
  return score / lengthPenalty;
}

function keywordSearch(query: string, topK: number): KnowledgeChunk[] {
  const allChunks = loadKnowledgeBase();
  const scored = allChunks.map((chunk) => ({
    ...chunk,
    relevance: scoreRelevance(query, chunk.content),
  }));
  scored.sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, topK).filter((c) => c.relevance > 0);
}

export function formatContextForLLM(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant information found in the knowledge base.";
  }

  return chunks
    .map(
      (chunk) =>
        `[Source: ${chunk.source} | Relevance: ${chunk.relevance.toFixed(2)}]\n${chunk.content}`
    )
    .join("\n\n---\n\n");
}
