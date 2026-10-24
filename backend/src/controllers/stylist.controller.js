import { prisma } from "../config/prisma.js";

import {
  generateStylistRecommendation,
} from "../services/stylist.service.js";


/* =========================================================
   STYLEBUDDY STYLIST CONTROLLER

   The controller is intentionally kept thin.

   Responsibilities:
   - Authenticate user through middleware
   - Read request
   - Load user's wardrobe
   - Load user's style profile
   - Pass everything to stylist.service.js
   - Return the result

   Fashion reasoning, wardrobe analysis and dynamic
   missing-item detection belong to stylist.service.js.
   ========================================================= */


/* =========================================================
   LOAD USER CLOSET
   ========================================================= */

async function getUserCloset(userId) {
  return prisma.closetItem.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}


/* =========================================================
   LOAD USER PROFILE
   ========================================================= */

async function getUserProfile(userId) {
  return prisma.profile.findUnique({
    where: {
      userId,
    },
  });
}


/* =========================================================
   POST /api/stylist/recommend

   Used by the main Stylist page.

   Example request:

   {
     "occasion": "College",
     "style": "Casual",
     "role": "Full Outfit"
   }

   The actual outfit analysis is handled by
   stylist.service.js.
   ========================================================= */

export async function recommendOutfit(req, res) {
  try {
    const {
      occasion = "casual",
      style = "casual",
      role = "Full Outfit",
      temperatureC = null,
      weatherCondition = "clear",
      budget = null,
      selectedItemId = null,
      wardrobeOnly = false,
      
      message = "",
    } = req.body || {};


    /* -------------------------------------------------------
       GET USER'S CLOSET
       ------------------------------------------------------- */

    const closetItems =
      await getUserCloset(req.userId);


    if (!closetItems.length) {
      return res.status(400).json({
        success: false,

        message:
          "Your closet is empty. Upload some clothes first.",
      });
    }


    /* -------------------------------------------------------
       GET USER'S STYLE PROFILE
       ------------------------------------------------------- */

    const profile =
      await getUserProfile(req.userId);


    /* -------------------------------------------------------
       SEND EVERYTHING TO THE STYLIST SERVICE
       ------------------------------------------------------- */

    const result =
      await generateStylistRecommendation({
        closetItems,

        profile,

        message,


        occasion,

        style,

        role,

        temperatureC,

        weatherCondition,

        budget,

        selectedItemId,

        wardrobeOnly,
      });


    return res.json(result);

  } catch (error) {

    console.error(
      "Stylist recommendation error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Unable to generate an outfit right now.",
    });
  }
}


/* =========================================================
   PUBLIC CLOSET ITEM FORMAT

   Kept here because the chat endpoint may need to expose
   a safe subset of wardrobe information later.

   We do NOT expose database internals unnecessarily.
   ========================================================= */

function toPublicStylistItem(item) {
  if (!item) {
    return null;
  }

  return {
    id: item.id,

    image:
      item.imageUrl || "",

    name:
      item.articleType ||
      item.category ||
      "Clothing item",

    category:
      item.category || "",

    articleType:
      item.articleType || "",

    color:
      item.color || "",

    pattern:
      item.pattern || "",

    fabric:
      item.fabric || "",
  };
}


/* =========================================================
   POST /api/stylist/chat

   Conversational AI Stylist.

   IMPORTANT:

   We do NOT decide here that:
       shoes are missing
       bottoms are missing
       accessories are missing

   The stylist service determines this dynamically after
   analysing the user's wardrobe and the requested outfit.
   ========================================================= */

export async function chatWithStylist(req, res) {
  try {

    const {
      message = "",

      /*
       * These are optional because the frontend may not
       * provide them during a normal chat message.
       */
      occasion = "casual",

      style = "casual",

      role = "Full Outfit",

      temperatureC = null,

      weatherCondition = "clear",

      budget = null,

      selectedItemId = null,

      wardrobeOnly = false,

      conversation = [],

    } = req.body || {};


    /* -------------------------------------------------------
       VALIDATE MESSAGE
       ------------------------------------------------------- */

    const userMessage =
      String(message || "").trim();


    if (!userMessage) {
      return res.status(400).json({
        success: false,

        message:
          "Please tell StyleBuddy what you're looking for.",
      });
    }


    /* -------------------------------------------------------
       GET USER'S CLOSET
       ------------------------------------------------------- */

    const closetItems =
      await getUserCloset(req.userId);


    if (!closetItems.length) {
      return res.status(400).json({
        success: false,

        message:
          "Your closet is empty. Upload some clothes first so I can style you.",
      });
    }


    /* -------------------------------------------------------
       GET USER'S STYLE PROFILE
       ------------------------------------------------------- */

    const profile =
      await getUserProfile(req.userId);


    /* -------------------------------------------------------
       GENERATE STYLIST RESULT
       ------------------------------------------------------- */

console.log("\n===== STYLIST CHAT PAYLOAD =====");
console.log({
  message: userMessage,
  selectedItemId,
  conversationLength: Array.isArray(conversation)
    ? conversation.length
    : 0,
  conversation,
});

    const result =
      await generateStylistRecommendation({
        closetItems,

        profile,

        message: userMessage,

         conversation,

        occasion,

        style,

        role,

        temperatureC,

        weatherCondition,

        budget,

        selectedItemId,

        wardrobeOnly,
      });


    /* -------------------------------------------------------
       RESPONSE

       The stylist service is now the source of truth for:

       - outfit
       - missingItems
       - shoppingRequired
       - context
       - intent
       - selected item
       ------------------------------------------------------- */


    return res.json({
      success: true,

      message:
        result.message ||
        "Here's your StyleBuddy recommendation.",

      intent:
        result.intent || {
          type: "style_outfit",
        },

      context:
        result.context || null,

      outfit:
        result.outfit || null,

      missingItems:
        result.missingItems ||
        result.outfit?.missingItems ||
        [],

      shoppingRequired:
        result.shoppingRequired ||
        false,

      budget:
        result.budget ||
        null,
    });

  } catch (error) {

    console.error(
      "Stylist chat error:",
      error
    );


    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "I couldn't process your styling request right now. Please try again.",
    });
  }
}