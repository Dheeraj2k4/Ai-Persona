import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { retrieveRelevantContext, formatContextForLLM } from "@/lib/retriever";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
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
    const relevantChunks = await retrieveRelevantContext(lastUserMessage.content, 5);
    const context = formatContextForLLM(relevantChunks);

    // Build the augmented system prompt
    const augmentedPrompt = `${SYSTEM_PROMPT}

## Retrieved Context (use ONLY this to answer questions):
${context}

## Current Conversation
Answer the user's question based on the retrieved context above. If the context doesn't contain relevant information, acknowledge that honestly.`;

    const result = streamText({
      model: openrouter("meta-llama/llama-3.3-70b-instruct:free"),
      system: augmentedPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
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
