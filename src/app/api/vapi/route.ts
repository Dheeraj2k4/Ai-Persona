import { NextResponse } from "next/server";
import { retrieveRelevantContext, formatContextForLLM } from "@/lib/retriever";

export const dynamic = "force-dynamic";

const CAL_API_BASE = "https://api.cal.com/v2";
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID || "5920487";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getCalHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.CAL_COM_API_KEY}`,
    "cal-api-version": "2024-09-04",
  };
}

// --- Tool handler functions ---

async function handleCheckAvailability(parameters: Record<string, string>): Promise<string> {
  const calApiKey = process.env.CAL_COM_API_KEY;
  if (!calApiKey) {
    return "I can help you book an interview! Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to see available slots.";
  }

  try {
    const startDate = parameters?.dateFrom || new Date().toISOString().split("T")[0];
    const endDate = parameters?.dateTo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const response = await fetch(
      `${CAL_API_BASE}/slots?eventTypeId=${CAL_EVENT_TYPE_ID}&start=${startDate}&end=${endDate}&timeZone=Asia/Kolkata`,
      { headers: getCalHeaders() }
    );

    if (response.ok) {
      const data = await response.json();
      const slots = data.data || {};
      const slotSummary = Object.entries(slots)
        .slice(0, 3)
        .map(([date, times]) => {
          const timeList = (times as Array<{start: string}>).slice(0, 3).map(t => {
            const d = new Date(t.start);
            return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
          }).join(", ");
          return `${date}: ${timeList}`;
        })
        .join(". ");

      return slotSummary
        ? `Here are some available slots: ${slotSummary}. Would you like me to book one of these?`
        : "I don't see any available slots in the next few days. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to check further out.";
    }

    console.error("[Vapi] Cal.com slots error:", await response.text());
  } catch (err) {
    console.error("[Vapi] Cal.com slots exception:", err);
  }

  return "Let me help you book a time. You can pick a slot at https://cal.com/dheeraj-talapagala-uzh1gt/30min — or tell me your preferred day and time.";
}

async function handleBookMeeting(parameters: Record<string, string>): Promise<string> {
  const calApiKey = process.env.CAL_COM_API_KEY;
  if (!calApiKey) {
    return "To confirm the booking, please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min and select your preferred time.";
  }

  try {
    const bookingBody = {
      start: parameters?.datetime,
      eventTypeId: Number(CAL_EVENT_TYPE_ID),
      attendee: {
        name: parameters?.name || "Interview Candidate",
        email: parameters?.email || "candidate@example.com",
        timeZone: parameters?.timezone || "Asia/Kolkata",
        language: "en",
      },
      metadata: { source: "vapi-voice-agent" },
    };

    console.log("[Vapi] Booking request:", JSON.stringify(bookingBody));

    const response = await fetch(`${CAL_API_BASE}/bookings`, {
      method: "POST",
      headers: {
        ...getCalHeaders(),
        "cal-api-version": "2026-02-25",
      },
      body: JSON.stringify(bookingBody),
    });

    const responseText = await response.text();
    console.log("[Vapi] Cal.com booking response:", response.status, responseText);

    if (response.ok || response.status === 201) {
      return `Done! I've booked an interview for ${parameters?.datetime}. Dheeraj will receive the confirmation. You should get a calendar invite shortly.`;
    } else {
      console.error("[Vapi] Booking failed:", responseText);
      return "I wasn't able to confirm the booking automatically. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to book directly.";
    }
  } catch (err) {
    console.error("[Vapi] Booking exception:", err);
  }

  return "I'll direct you to the booking page. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to confirm your preferred slot.";
}

async function handleGetKnowledge(parameters: Record<string, string>): Promise<string> {
  const query = parameters?.query || "";
  const chunks = await retrieveRelevantContext(query, 3);
  const context = formatContextForLLM(chunks);
  return context || "I don't have specific information about that topic.";
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

// Vapi sends webhook requests for tool calls (function calling)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Vapi may send message at top level or nested under "message"
    const message = body.message || body;

    console.log("[Vapi] Received event:", message?.type, JSON.stringify(body).slice(0, 500));

    // Handle tool-calls (new Vapi format)
    if (message?.type === "tool-calls") {
      const toolCalls = message.toolCallList || [];
      const results = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function?.name;
        const parameters = toolCall.function?.arguments ? 
          (typeof toolCall.function.arguments === "string" ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments) 
          : {};
        const toolCallId = toolCall.id;

        console.log("[Vapi] Tool call:", functionName, parameters);

        let result = "I'm not sure how to handle that request.";

        switch (functionName) {
          case "check_availability": {
            result = await handleCheckAvailability(parameters);
            break;
          }
          case "book_meeting": {
            result = await handleBookMeeting(parameters);
            break;
          }
          case "get_knowledge": {
            result = await handleGetKnowledge(parameters);
            break;
          }
        }

        results.push({ toolCallId, result });
      }

      return NextResponse.json({ results }, { headers: CORS_HEADERS });
    }

    // Handle function-call (old Vapi format)
    if (message?.type === "function-call") {
      const functionName = message.functionCall?.name;
      const parameters = message.functionCall?.parameters;

      console.log("[Vapi] Function call:", functionName, parameters);

      let result = "I'm not sure how to handle that request. Can I help you with something else about Dheeraj?";

      switch (functionName) {
        case "check_availability":
          result = await handleCheckAvailability(parameters);
          break;
        case "book_meeting":
          result = await handleBookMeeting(parameters);
          break;
        case "get_knowledge":
          result = await handleGetKnowledge(parameters);
          break;
      }

      return NextResponse.json({ result }, { headers: CORS_HEADERS });
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
                content: `You are Dheeraj Talapagala's AI representative on a phone call. Keep responses SHORT (2-3 sentences). Be natural and conversational.

IMPORTANT RULES:
- Use the get_knowledge function to answer ANY question about Dheeraj's background, skills, projects, or experience. Do NOT answer from memory.
- When someone wants to book an interview, FIRST use check_availability to show available times, THEN use book_meeting with the confirmed datetime.
- For booking, you MUST collect: their preferred date/time. Ask for their name and email too.
- The datetime for book_meeting must be in ISO 8601 UTC format like "2026-06-10T09:00:00Z"
- If unsure about something, say so and offer to help with something else.
- Never make up information. Only use what get_knowledge returns.`,
              },
            ],
            functions: [
              {
                name: "check_availability",
                description: "Check Dheeraj's calendar availability for the next few days to find open interview slots",
                parameters: {
                  type: "object",
                  properties: {
                    dateFrom: { type: "string", description: "Start date in YYYY-MM-DD format" },
                    dateTo: { type: "string", description: "End date in YYYY-MM-DD format" },
                  },
                },
              },
              {
                name: "book_meeting",
                description: "Book a confirmed interview meeting with Dheeraj after the caller has chosen a specific time slot",
                parameters: {
                  type: "object",
                  properties: {
                    datetime: { type: "string", description: "The confirmed meeting time in ISO 8601 UTC format, e.g. 2026-06-10T09:00:00Z" },
                    name: { type: "string", description: "Caller's full name" },
                    email: { type: "string", description: "Caller's email address for calendar invite" },
                    timezone: { type: "string", description: "Caller's timezone, e.g. Asia/Kolkata" },
                  },
                  required: ["datetime", "name", "email"],
                },
              },
              {
                name: "get_knowledge",
                description: "Retrieve information about Dheeraj's background, skills, projects, or experience from his knowledge base",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "The question or topic to look up about Dheeraj" },
                  },
                  required: ["query"],
                },
              },
            ],
          },
        },
      }, { headers: CORS_HEADERS });
    }

    return NextResponse.json({ status: "ok" }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// Vapi may also send GET requests for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", service: "dheeraj-ai-vapi-webhook" }, { headers: CORS_HEADERS });
}
