import { NextResponse } from "next/server";
import { retrieveRelevantContext, formatContextForLLM } from "@/lib/retriever";

// Vapi sends webhook requests for tool calls (function calling)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    // Handle different Vapi webhook event types
    if (message?.type === "function-call") {
      const functionName = message.functionCall?.name;
      const parameters = message.functionCall?.parameters;

      switch (functionName) {
        case "check_availability": {
          // Call Cal.com API to check available slots
          const calApiKey = process.env.CAL_COM_API_KEY;
          if (!calApiKey) {
            return NextResponse.json({
              result: "I can help you book an interview! Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to see available slots and book directly.",
            });
          }

          try {
            const response = await fetch(
              `https://api.cal.com/v1/availability?apiKey=${calApiKey}&dateFrom=${parameters?.dateFrom || new Date().toISOString().split("T")[0]}&dateTo=${parameters?.dateTo || ""}`,
              { headers: { "Content-Type": "application/json" } }
            );

            if (response.ok) {
              const data = await response.json();
              return NextResponse.json({
                result: `Here are the available slots: ${JSON.stringify(data.slots || data)}. Would you like me to book one of these?`,
              });
            }
          } catch {
            // Fallback to booking link
          }

          return NextResponse.json({
            result: "Let me help you book a time. You can pick a slot at https://cal.com/dheeraj-talapagala-uzh1gt/30min — or tell me your preferred day and time, and I'll guide you through it.",
          });
        }

        case "book_meeting": {
          const calApiKey = process.env.CAL_COM_API_KEY;
          if (!calApiKey) {
            return NextResponse.json({
              result: `Great! To confirm the booking, please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min and select your preferred time. Dheeraj will receive the confirmation automatically.`,
            });
          }

          // Attempt to book via Cal.com API
          try {
            const response = await fetch(
              `https://api.cal.com/v1/bookings?apiKey=${calApiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventTypeId: process.env.CAL_EVENT_TYPE_ID,
                  start: parameters?.datetime,
                  name: parameters?.name || "Interview Candidate",
                  email: parameters?.email || "",
                  timeZone: parameters?.timezone || "Asia/Kolkata",
                }),
              }
            );

            if (response.ok) {
              const booking = await response.json();
              return NextResponse.json({
                result: `Done! I've booked an interview for ${parameters?.datetime}. Dheeraj will receive the confirmation. Booking reference: ${booking.id || "confirmed"}.`,
              });
            }
          } catch {
            // Fallback
          }

          return NextResponse.json({
            result: `I'll direct you to the booking page. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to confirm your preferred slot.`,
          });
        }

        case "get_knowledge": {
          // RAG retrieval for voice agent
          const query = parameters?.query || "";
          const chunks = await retrieveRelevantContext(query, 3);
          const context = formatContextForLLM(chunks);

          return NextResponse.json({
            result: context || "I don't have specific information about that topic.",
          });
        }

        default:
          return NextResponse.json({
            result: "I'm not sure how to handle that request. Can I help you with something else about Dheeraj?",
          });
      }
    }

    // Handle assistant-request (Vapi asking for configuration)
    if (message?.type === "assistant-request") {
      return NextResponse.json({
        assistant: {
          firstMessage: "Hi! I'm Dheeraj's AI representative. I can tell you about his background, skills, and projects, or help you schedule an interview. What would you like to know?",
          model: {
            provider: "groq",
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are Dheeraj Talapagala's AI representative on a phone call. Keep responses SHORT (2-3 sentences). Be natural and conversational. Only answer from the knowledge provided by the get_knowledge function. If unsure, say so.`,
              },
            ],
            functions: [
              {
                name: "check_availability",
                description: "Check Dheeraj's calendar availability for booking an interview",
                parameters: {
                  type: "object",
                  properties: {
                    dateFrom: { type: "string", description: "Start date (YYYY-MM-DD)" },
                    dateTo: { type: "string", description: "End date (YYYY-MM-DD)" },
                  },
                },
              },
              {
                name: "book_meeting",
                description: "Book an interview meeting with Dheeraj",
                parameters: {
                  type: "object",
                  properties: {
                    datetime: { type: "string", description: "Proposed datetime" },
                    name: { type: "string", description: "Caller's name" },
                    email: { type: "string", description: "Caller's email" },
                    timezone: { type: "string", description: "Caller's timezone" },
                  },
                  required: ["datetime"],
                },
              },
              {
                name: "get_knowledge",
                description: "Retrieve information about Dheeraj's background, skills, projects, or experience",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "The question or topic to look up" },
                  },
                  required: ["query"],
                },
              },
            ],
          },
        },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Vapi may also send GET requests for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", service: "dheeraj-ai-vapi-webhook" });
}
