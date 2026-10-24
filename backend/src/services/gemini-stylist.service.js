import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const stylistResponseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "A concise natural-language response to the user.",
    },

    intent: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "The user's styling intent.",
        },
      },
      required: ["type"],
    },

    outfit: {
      type: "object",
      properties: {
        itemIds: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "IDs of wardrobe items from the actual closet that should be used.",
        },

        explanation: {
          type: "string",
          description: "Why these wardrobe items work together.",
        },
      },
      required: ["itemIds", "explanation"],
    },

    missingItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },

          category: {
            type: ["string", "null"],
          },

          articleType: {
            type: ["string", "null"],
          },

          color: {
            type: ["string", "null"],
          },

          reason: {
            type: "string",
          },
          searchQuery: {
  type: "string",
  description:
    "A concise shopping search query for this exact missing item.",
},
        },

        required: [
          "name",
          "category",
          "articleType",
          "color",
          "reason",
        ],
      },
    },
  },

  required: [
    "message",
    "intent",
    "outfit",
    "missingItems",
  ],
};

export async function generateGeminiStylistResponse({
  message = "",
  closet = [],
  selectedItem = null,
   profile = null,
    conversation = [],
  occasion = "casual",
  style = "casual",
  temperatureC = null,
  weatherCondition = "clear",
}) {
  const closetForAI = closet.map((item) => ({
    id: String(item.id),
    color: item.color || null,
    articleType: item.articleType || null,
    category: item.category || null,
    pattern: item.pattern || null,
    fabric: item.fabric || null,
    name: item.name || null,
  }));

  const selectedItemForAI = selectedItem
    ? {
        id: String(selectedItem.id),
        color: selectedItem.color || null,
        articleType: selectedItem.articleType || null,
        category: selectedItem.category || null,
        pattern: selectedItem.pattern || null,
        fabric: selectedItem.fabric || null,
        name: selectedItem.name || null,
      }
    : null;
    const profileForAI = profile
  ? {
      gender: profile.gender || null,
      bodyType: profile.bodyType || null,
      undertone: profile.undertone || null,
      styles: profile.styles || null,
      occasions: profile.occasions || null,
    }
  : null;

  const prompt = `
You are the AI Stylist for StyleBuddy.

Your job is to understand the user's fashion request and create an outfit using the user's ACTUAL wardrobe.

USER REQUEST:
${message}

CONVERSATION HISTORY:
${JSON.stringify(conversation, null, 2)}

CONTEXT:
Occasion: ${occasion}
Style: ${style}
Temperature: ${temperatureC ?? "unknown"}°C
Weather: ${weatherCondition}

ACTUAL CLOSET:
${JSON.stringify(closetForAI, null, 2)}

SELECTED WARDROBE ITEM:
${JSON.stringify(selectedItemForAI, null, 2)}

USER STYLE PROFILE:
${JSON.stringify(profileForAI, null, 2)}

IMPORTANT RULES:

1. The closet provided above is the ONLY wardrobe the user owns.
2. Never invent a wardrobe item.
3. If a selected wardrobe item is provided, use that EXACT item in the outfit.
4. Understand the user's request before deciding what outfit is appropriate.
5. Consider the occasion, requested style, weather, and selected item.
6. Do NOT use fixed rules such as "every outfit needs shoes".
7. Do NOT assume something is missing simply because a category is absent.
8. First determine what outfit would satisfy the user's request.
9. Then inspect the actual closet to determine whether that outfit can be completed.
10. missingItems must contain ONLY items that are genuinely needed and unavailable.
11. missingItems may be completely empty.
12. If something is missing, describe the SPECIFIC item that would complete the outfit.
13. Every itemId in outfit.itemIds MUST belong to the actual closet.
14. Never put a missing item into outfit.itemIds.
15. Do not invent closet item IDs.
16. Keep the explanation concise and useful.
18. Use the user profile as supporting context for styling decisions.
19. Do not invent profile information that is null or unavailable.
20. Profile preferences must not override the user's explicit request.
21. Profile information must not be used to assume that an item is missing.
22. The actual closet is still the only source of wardrobe items.
23. Use conversation history only as context for understanding follow-up requests.
24. For every new request, re-check the CURRENT ACTUAL CLOSET provided above.
25. Never assume that a wardrobe item exists merely because it appeared in conversation history.
26. If the user refers to an item such as "my black jeans" or "that shirt", resolve it against the CURRENT ACTUAL CLOSET.
27. If the user explicitly selects a wardrobe item, that selected item takes priority and must be used.
28. The conversation history must never become a substitute for the actual closet.
`;


  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: prompt,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: stylistResponseSchema,
    },
  });

  return JSON.parse(interaction.output_text);
}