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
          const timeList = (times as Array<{start: string}>).slice(0, 4).map(t => {
            // Convert UTC to IST (UTC+5:30) manually for reliable display
            const d = new Date(t.start);
            const istHours = (d.getUTCHours() + 5) % 24 + (d.getUTCMinutes() + 30 >= 60 ? 1 : 0);
            const istMinutes = (d.getUTCMinutes() + 30) % 60;
            const period = istHours >= 12 ? "PM" : "AM";
            const displayHour = istHours > 12 ? istHours - 12 : istHours === 0 ? 12 : istHours;
            const displayMin = istMinutes.toString().padStart(2, "0");
            // Also include the UTC ISO string so the LLM can use it directly for booking
            return `${displayHour}:${displayMin} ${period} IST (UTC: ${t.start})`;
          }).join(", ");
          return `${date}: ${timeList}`;
        })
        .join(". ");

      return slotSummary
        ? `Available slots (India Standard Time): ${slotSummary}. Tell the caller these times in IST. When they pick one, use the UTC value in parentheses for booking.`
        : "No available slots found in that date range. Ask if they'd like to check a different date.";
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

  // Refuse to book if datetime is missing
  if (!parameters?.datetime) {
    return "I need a specific date and time to book the meeting. Please ask the caller what date and time works for them.";
  }
  if (!parameters?.name || !parameters?.email) {
    return "I still need the caller's full name and email address before I can book. Please ask them for these details.";
  }

  try {
    const bookingBody = {
      start: parameters.datetime,
      eventTypeId: Number(CAL_EVENT_TYPE_ID),
      attendee: {
        name: parameters.name,
        email: parameters.email,
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
        "cal-api-version": "2024-08-13",
      },
      body: JSON.stringify(bookingBody),
    });

    const responseText = await response.text();
    console.log("[Vapi] Cal.com booking response:", response.status, responseText);

    if (response.ok || response.status === 201) {
      // Convert UTC datetime to IST for the confirmation message
      const bookDate = new Date(parameters.datetime);
      const istHours = (bookDate.getUTCHours() + 5) % 24 + (bookDate.getUTCMinutes() + 30 >= 60 ? 1 : 0);
      const istMinutes = (bookDate.getUTCMinutes() + 30) % 60;
      const period = istHours >= 12 ? "PM" : "AM";
      const displayHour = istHours > 12 ? istHours - 12 : istHours === 0 ? 12 : istHours;
      const displayMin = istMinutes.toString().padStart(2, "0");
      const istTime = `${displayHour}:${displayMin} ${period} IST`;
      return `Done! I've booked an interview for ${parameters.name} on June ${bookDate.getUTCDate()} at ${istTime}. A calendar invite will be sent to ${parameters.email}.`;
    } else {
      console.error("[Vapi] Booking failed:", responseText);
      // Try to parse error for useful message
      try {
        const errData = JSON.parse(responseText);
        const errMsg = errData?.error?.message || errData?.message || "";
        if (errMsg.toLowerCase().includes("slot")) {
          return "That time slot is no longer available. Could you pick a different time?";
        }
      } catch { /* ignore parse error */ }
      return "I wasn't able to confirm the booking automatically. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to book directly.";
    }
  } catch (err) {
    console.error("[Vapi] Booking exception:", err);
  }

  return "I'll direct you to the booking page. Please visit https://cal.com/dheeraj-talapagala-uzh1gt/30min to confirm your preferred slot.";
}

async function handleGetKnowledge(parameters: Record<string, string>): Promise<string> {
  let query = parameters?.query || "";
  // Enrich short queries for better retrieval
  if (query.length < 20) {
    query = `Dheeraj Talapagala ${query}`;
  }
  const chunks = await retrieveRelevantContext(query, 5);
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
- Use the get_knowledge function to answer ANY question about Dheeraj — including education, CGPA, skills, projects, experience, contact info, or anything else. ALWAYS call get_knowledge first. Do NOT answer from memory or make up information.
- BOOKING PROCESS (follow these steps IN ORDER, do NOT skip any):
  1. Ask the caller what date and time works for them
  2. Use check_availability to verify the slot is open
  3. Ask for their FULL NAME (do not use any default or previous name)
  4. Ask for their EMAIL ADDRESS (do not use any default or previous email)
  5. Confirm all details back to the caller: date/time, name, and email
  6. ONLY after the caller confirms, call book_meeting with the collected info
- NEVER call book_meeting without having explicitly collected name, email, and datetime from the caller in THIS conversation.
- The datetime for book_meeting must be in ISO 8601 UTC format like "2026-06-10T09:00:00Z"
- If unsure about something, say so and offer to help with something else.`,
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
