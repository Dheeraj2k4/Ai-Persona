/**
 * Ingestion Script
 * 
 * Reads all knowledge base markdown files, chunks them, and upserts into Upstash Vector.
 * 
 * Usage:
 *   npx tsx scripts/ingest.ts
 * 
 * Prerequisites:
 *   - UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN set in .env.local
 *   - Upstash Vector index created with an embedding model (e.g., BAAI/bge-base-en-v1.5)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync, readdirSync, existsSync } from "fs";
import { Index } from "@upstash/vector";

// Load env vars
config({ path: resolve(process.cwd(), ".env.local") });

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

interface Chunk {
  id: string;
  content: string;
  source: string;
}

function chunkMarkdown(content: string, source: string): Chunk[] {
  const chunks: Chunk[] = [];
  
  // Split by ## headings
  const sections = content.split(/^## /gm).filter(Boolean);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (section.length < 20) continue; // Skip tiny sections
    
    // If section is too large (>1000 chars), split further by paragraphs
    if (section.length > 1000) {
      const paragraphs = section.split(/\n\n+/);
      let currentChunk = "";
      let chunkIdx = 0;
      
      for (const para of paragraphs) {
        if (currentChunk.length + para.length > 800 && currentChunk.length > 100) {
          chunks.push({
            id: `${source}-${i}-${chunkIdx}`,
            content: currentChunk.trim(),
            source,
          });
          currentChunk = para;
          chunkIdx++;
        } else {
          currentChunk += (currentChunk ? "\n\n" : "") + para;
        }
      }
      
      if (currentChunk.trim().length > 20) {
        chunks.push({
          id: `${source}-${i}-${chunkIdx}`,
          content: currentChunk.trim(),
          source,
        });
      }
    } else {
      chunks.push({
        id: `${source}-${i}`,
        content: "## " + section,
        source,
      });
    }
  }
  
  return chunks;
}

async function ingest() {
  console.log("🚀 Starting ingestion...\n");
  
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error("❌ UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN must be set in .env.local");
    process.exit(1);
  }

  const knowledgeDir = resolve(process.cwd(), "src/lib/knowledge");
  const allChunks: Chunk[] = [];

  // 1. Load resume
  const resumePath = resolve(knowledgeDir, "resume.md");
  if (existsSync(resumePath)) {
    const content = readFileSync(resumePath, "utf-8");
    const chunks = chunkMarkdown(content, "resume");
    allChunks.push(...chunks);
    console.log(`📄 Resume: ${chunks.length} chunks`);
  }

  // 2. Load repo docs
  const reposDir = resolve(knowledgeDir, "repos");
  if (existsSync(reposDir)) {
    const files = readdirSync(reposDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const content = readFileSync(resolve(reposDir, file), "utf-8");
      const source = file.replace(".md", "");
      const chunks = chunkMarkdown(content, source);
      allChunks.push(...chunks);
      console.log(`📁 ${source}: ${chunks.length} chunks`);
    }
  }

  console.log(`\n📊 Total chunks: ${allChunks.length}`);

  // 3. Reset existing index
  console.log("\n🗑️  Resetting index...");
  await index.reset();

  // 4. Upsert all chunks (batch of 10)
  console.log("⬆️  Upserting to Upstash Vector...\n");
  const batchSize = 10;
  
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    await index.upsert(
      batch.map((chunk) => ({
        id: chunk.id,
        data: chunk.content, // Upstash embeds this using the model configured on the index
        metadata: {
          content: chunk.content,
          source: chunk.source,
        },
      }))
    );
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allChunks.length / batchSize)} done`);
  }

  // 5. Verify
  console.log("\n✅ Ingestion complete!");
  console.log(`   Vectors stored: ${allChunks.length}`);
  console.log("\n📝 Sample chunks:");
  allChunks.slice(0, 3).forEach((c) => {
    console.log(`   [${c.source}] ${c.content.substring(0, 80)}...`);
  });
}

ingest().catch((err) => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
