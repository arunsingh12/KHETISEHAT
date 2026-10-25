/**
 * AI WhatsApp-to-Booking — the coordinator pastes a farmer's WhatsApp
 * message (Hindi or English) and this turns it into structured booking
 * fields with a per-field confidence tag.
 *
 * Uses the Anthropic API when ANTHROPIC_API_KEY is set, forcing a
 * structured tool-call response so we never have to hand-parse prose.
 * Falls back to a small keyword heuristic when no key is configured, so
 * the intake tool still works (with lower accuracy) out of the box.
 */
import Anthropic from "@anthropic-ai/sdk";
import { AgriCategory, HealthCategory, Section } from "@/generated/prisma/enums";

export type Confidence = "high" | "medium" | "low";

export type ExtractedField<T> = {
  value: T | null;
  confidence: Confidence;
};

export type ExtractedBooking = {
  section: ExtractedField<Section>;
  agriCategory: ExtractedField<AgriCategory>;
  healthCategory: ExtractedField<HealthCategory>;
  name: ExtractedField<string>;
  location: ExtractedField<string>;
  preferredDateText: ExtractedField<string>;
  details: ExtractedField<string>; // crop details or chief complaint
  urgency: ExtractedField<string>;
  specialInstructions: ExtractedField<string>;
  usedAi: boolean;
};

const SECTION_VALUES = Object.values(Section);
const AGRI_VALUES = Object.values(AgriCategory);
const HEALTH_VALUES = Object.values(HealthCategory);

const TOOL_SCHEMA = {
  name: "record_booking",
  description:
    "Record the structured booking fields extracted from a farmer's WhatsApp message.",
  input_schema: {
    type: "object" as const,
    properties: {
      section: { type: "string", enum: SECTION_VALUES },
      agriCategory: { type: "string", enum: [...AGRI_VALUES, "unknown"] },
      healthCategory: { type: "string", enum: [...HEALTH_VALUES, "unknown"] },
      name: { type: "string" },
      location: { type: "string" },
      preferredDateText: { type: "string" },
      details: {
        type: "string",
        description: "Crop details for agri requests, or the chief complaint for health requests.",
      },
      urgency: { type: "string", enum: ["urgent", "normal", "unknown"] },
      specialInstructions: { type: "string" },
      confidence: {
        type: "object",
        description: "high | medium | low for each field above.",
        properties: {
          section: { type: "string", enum: ["high", "medium", "low"] },
          category: { type: "string", enum: ["high", "medium", "low"] },
          name: { type: "string", enum: ["high", "medium", "low"] },
          location: { type: "string", enum: ["high", "medium", "low"] },
          preferredDateText: { type: "string", enum: ["high", "medium", "low"] },
          details: { type: "string", enum: ["high", "medium", "low"] },
          urgency: { type: "string", enum: ["high", "medium", "low"] },
          specialInstructions: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: [
          "section",
          "category",
          "name",
          "location",
          "preferredDateText",
          "details",
          "urgency",
          "specialInstructions",
        ],
      },
    },
    required: ["section", "confidence"],
  },
};

type ToolInput = {
  section: Section;
  agriCategory?: AgriCategory | "unknown";
  healthCategory?: HealthCategory | "unknown";
  name?: string;
  location?: string;
  preferredDateText?: string;
  details?: string;
  urgency?: "urgent" | "normal" | "unknown";
  specialInstructions?: string;
  confidence: Record<
    "section" | "category" | "name" | "location" | "preferredDateText" | "details" | "urgency" | "specialInstructions",
    Confidence
  >;
};

export async function extractBookingFromMessage(message: string): Promise<ExtractedBooking> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      return await extractWithAnthropic(message, apiKey);
    } catch (error) {
      console.error("AI extraction failed, falling back to heuristic parser:", error);
    }
  }
  return extractWithHeuristics(message);
}

async function extractWithAnthropic(message: string, apiKey: string): Promise<ExtractedBooking> {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
    max_tokens: 1024,
    system:
      "You extract service-booking details from WhatsApp messages sent by farmers in rural India, in Hindi, English, or Hinglish. " +
      "Always call the record_booking tool. Use 'unknown' for a category field you cannot place, " +
      "and mark your own confidence honestly — 'low' for anything guessed or inferred rather than stated.",
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "record_booking" },
    messages: [{ role: "user", content: message }],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not return a tool_use block");
  }

  const input = toolUse.input as ToolInput;
  const c = input.confidence;

  return {
    usedAi: true,
    section: { value: input.section, confidence: c.section },
    agriCategory: {
      value: input.agriCategory && input.agriCategory !== "unknown" ? input.agriCategory : null,
      confidence: c.category,
    },
    healthCategory: {
      value: input.healthCategory && input.healthCategory !== "unknown" ? input.healthCategory : null,
      confidence: c.category,
    },
    name: { value: input.name?.trim() || null, confidence: c.name },
    location: { value: input.location?.trim() || null, confidence: c.location },
    preferredDateText: { value: input.preferredDateText?.trim() || null, confidence: c.preferredDateText },
    details: { value: input.details?.trim() || null, confidence: c.details },
    urgency: {
      value: input.urgency && input.urgency !== "unknown" ? input.urgency : null,
      confidence: c.urgency,
    },
    specialInstructions: { value: input.specialInstructions?.trim() || null, confidence: c.specialInstructions },
  };
}

// First match wins, so the more specific categories come first.
const AGRI_KEYWORDS: [RegExp, AgriCategory][] = [
  [/drone|ड्रोन|छिड़काव|spray/i, "DRONE_SERVICES"],
  [/scheme|yojana|योजना|subsidy|सब्सिडी|\bfpo\b|एफपीओ|pm[- ]?kisan|kcc|kisan credit/i, "GOVT_SCHEMES_FPO"],
  [/poly ?house|पॉलीहाउस|green ?house|net ?house|hydroponic|smart farm|स्मार्ट फार्मिंग/i, "PROTECTED_CULTIVATION"],
  [/fish|मछली|मत्स्य|pond|तालाब|aquacultur|prawn|shrimp/i, "FISHERY_AQUACULTURE"],
  [/poultry|पोल्ट्री|murgi|मुर्गी|chicken|broiler|piggery|सूअर|pig\b/i, "POULTRY_PIGGERY"],
  [/dairy|डेयरी|cow|गाय|buffalo|भैंस|cattle|पशु|livestock|goat|बकरी|vet(erinar)?/i, "DAIRY_LIVESTOCK"],
  [/labou?r|मजदूर|majdoor|sowing|बुवाई|transplant|रोपाई|weeding|निराई|crew/i, "FARM_LABOR"],
  [/cold storage|कोल्ड स्टोरेज|mandi|मंडी|transport|परिवहन|warehouse|गोदाम|post[- ]?harvest/i, "POST_HARVEST_LOGISTICS"],
  [/soil test|water test|leaf test|मिट्टी जांच|मिट्टी परीक्षण|पानी की जांच/i, "SOIL_TESTING"],
  [/solar|सोलर|सौर|irrigation|सिंचाई|drip|ड्रिप|sprinkler|borewell|बोरवेल/i, "SOLAR_SERVICES"],
  [/tractor|ट्रैक्टर|equipment|किराया|rental|harvester|thresher|machinery|मशीनरी/i, "EQUIPMENT_RENTAL"],
  [/agronomist|कृषि विशेषज्ञ|crop advi[cs]e|फसल सलाह|pest|कीट|disease|रोग/i, "AGRONOMIST"],
];

const HEALTH_KEYWORDS: [RegExp, HealthCategory][] = [
  [/doctor|डॉक्टर|physician|checkup|चिकित्सक/i, "DOCTOR"],
  [/nurse|नर्स/i, "NURSE"],
  [/pharmac|दवा|medicine/i, "PHARMACY"],
  [/lab test|pathology|जांच|blood test/i, "PATHOLOGY_LAB"],
  [/physio|फिजियो/i, "PHYSIOTHERAPIST"],
  [/ambulance|एम्बुलेंस/i, "AMBULANCE"],
];

const URGENT_KEYWORDS = /urgent|जरूरी|जल्दी|emergency|अभी/i;
const DATE_KEYWORDS: [RegExp, string][] = [
  [/kal subah|कल सुबह/i, "कल सुबह"],
  [/kal|कल/i, "कल"],
  [/aaj|आज/i, "आज"],
  [/parso|परसों/i, "परसों"],
];

/** Best-effort, no-API-key fallback: keyword matching only, low confidence throughout. */
function extractWithHeuristics(message: string): ExtractedBooking {
  const agriHit = AGRI_KEYWORDS.find(([re]) => re.test(message));
  const healthHit = HEALTH_KEYWORDS.find(([re]) => re.test(message));
  const section: Section = healthHit && !agriHit ? "HEALTH" : "AGRI";
  const dateHit = DATE_KEYWORDS.find(([re]) => re.test(message));
  const urgent = URGENT_KEYWORDS.test(message);

  const empty: ExtractedField<string> = { value: null, confidence: "low" };

  return {
    usedAi: false,
    section: { value: section, confidence: agriHit || healthHit ? "medium" : "low" },
    agriCategory: { value: agriHit?.[1] ?? null, confidence: agriHit ? "medium" : "low" },
    healthCategory: { value: healthHit?.[1] ?? null, confidence: healthHit ? "medium" : "low" },
    name: empty,
    location: empty,
    preferredDateText: { value: dateHit?.[1] ?? null, confidence: dateHit ? "medium" : "low" },
    details: { value: message.slice(0, 160), confidence: "low" },
    urgency: { value: urgent ? "urgent" : "normal", confidence: urgent ? "medium" : "low" },
    specialInstructions: empty,
  };
}
