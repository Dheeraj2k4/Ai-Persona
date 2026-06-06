import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { retrieveRelevantContext, formatContextForLLM } from "@/lib/retriever";

// Groq - fast + free (llama-3.1-8b-instant)
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
  name: "groq",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid request: messages required", { status: 400 });
    }

    // Get the latest user message for RAG retrieval
    const lastUserMessage = [...messages]
      .reverse()
      .find((m: { role: string }) => m.role === "user");

    if (!lastUserMessage) {
      return new Response("No user message found", { status: 400 });
    }

    // Retrieve relevant context from knowledge base
    const startTime = Date.now();
    const relevantChunks = await retrieveRelevantContext(lastUserMessage.content, 5);
    const retrievalTime = Date.now() - startTime;
    const context = formatContextForLLM(relevantChunks);

    console.log(`[RAG] Query: "${lastUserMessage.content}"`);
    console.log(`[RAG] Retrieved ${relevantChunks.length} chunks in ${retrievalTime}ms`);
    console.log(`[RAG] Context length: ${context.length} chars`);
    if (relevantChunks.length > 0) {
      console.log(`[RAG] Top chunk source: ${relevantChunks[0].source}, score: ${relevantChunks[0].relevance}`);
    }

    // Build the augmented system prompt
    const augmentedPrompt = `${SYSTEM_PROMPT}

## Retrieved Context (use ONLY this to answer questions):
${context}

## Current Conversation
Answer the user's question based on the retrieved context above. If the context doesn't contain relevant information, acknowledge that honestly.`;

    const formattedMessages = messages.slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Use Groq (fast, free, reliable) as primary
    if (!process.env.GROQ_API_KEY) {
      return new Response("No LLM API key configured", { status: 500 });
    }

    const model = groq.chat("llama-3.1-8b-instant");
    console.log(`[LLM] Using groq`);

    const result = streamText({
      model,
      system: augmentedPrompt,
      messages: formattedMessages,
      maxOutputTokens: 500,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
