import React, { useState } from "react";
import {
  Send,
  Sparkles,
  UserRound,
  Heart,
  Check,
} from "lucide-react";

import { services } from "../api";
import { useApp } from "../context/AppContext";


/* =========================================================
   QUICK SUGGESTIONS
   ========================================================= */

const suggestions = [
  "Casual college outfit",
  "Office look",
  "Party outfit",
  "Date night",
  "Wedding",
];


/* =========================================================
   BACKEND IMAGE URL
   ========================================================= */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const BACKEND_URL =
  API_BASE.replace(/\/api\/?$/, "");


function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (
    typeof image !== "string"
  ) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }

  return `${BACKEND_URL}/${image}`;
}


/* =========================================================
   ITEM HELPERS
   ========================================================= */

function getItemName(item) {
  return (
    item?.articleType ||
    item?.name ||
    item?.category ||
    "Clothing item"
  );
}


function getItemColor(item) {
  return (
    item?.color ||
    ""
  );
}


function getItemImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.image_url ||
    ""
  );
}


function formatCategory(category) {
  if (!category) {
    return "Clothing";
  }

  return String(category)
    .replace(/_/g, " ")
    .replace(/s$/, "")
    .replace(
      /^./,
      (letter) =>
        letter.toUpperCase()
    );
}
function formatProductPrice(price, currency = "INR") {
  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "Price unavailable";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "Price unavailable";
  }

  if (currency === "INR") {
    return `₹${numericPrice.toLocaleString("en-IN")}`;
  }

  return `${currency} ${numericPrice.toLocaleString()}`;
}
function getShoppingStoreLabel(product) {
  return (
    product?.store ||
    product?.provider ||
    "Shopping"
  );
}


/* =========================================================
   COMPONENT
   ========================================================= */

export default function ChatInterface() {

  const {
    conversation,
    setConversation,
    setCurrentOutfit,
  } = useApp();


  /* =======================================================
     CHAT STATE
     ======================================================= */

  const [text, setText] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [savedOutfitId, setSavedOutfitId] =
    useState(null);


  /* =======================================================
     WARDROBE SELECTION STATE
     ======================================================= */

  const [
    showWardrobePicker,
    setShowWardrobePicker,
  ] = useState(false);

  const [
    wardrobeItems,
    setWardrobeItems,
  ] = useState([]);

  const [
    wardrobeLoading,
    setWardrobeLoading,
  ] = useState(false);

  const [
    wardrobeError,
    setWardrobeError,
  ] = useState("");

  const [
    selectedWardrobeItem,
    setSelectedWardrobeItem,
  ] = useState(null);


  /* =======================================================
     LOAD ACTUAL WARDROBE
     ======================================================= */

  const openWardrobePicker =
    async () => {

      if (busy) {
        return;
      }

      setShowWardrobePicker(true);
      setWardrobeError("");

      /*
       * We load the actual Dynamic Closet.
       * Nothing is hardcoded here.
       */

      setWardrobeLoading(true);

      try {

        const items =
          await services.closet.getItems();

        setWardrobeItems(
          Array.isArray(items)
            ? items
            : []
        );

      } catch (error) {

        console.error(
          "Unable to load wardrobe:",
          error
        );

        setWardrobeError(
          error?.message ||
          "Unable to load your wardrobe."
        );

      } finally {

        setWardrobeLoading(false);

      }
    };


  /* =======================================================
     SELECT WARDROBE ITEM
     ======================================================= */

  const selectWardrobeItem =
    (item) => {

      if (!item) {
        return;
      }

      console.log(
        "👕 Selected wardrobe item:",
        item
      );

      setSelectedWardrobeItem(
        item
      );

      setShowWardrobePicker(
        false
      );

    };


  /* =======================================================
     REMOVE SELECTED ITEM
     ======================================================= */

  const clearSelectedWardrobeItem =
    () => {

      setSelectedWardrobeItem(
        null
      );

    };


  /* =======================================================
     SEND CHAT MESSAGE
     ======================================================= */

  const send = async (
    msg = text
  ) => {

    const userMessage =
      String(msg || "").trim();


    if (
      !userMessage ||
      busy
    ) {
      return;
    }


    setText("");


    /* -------------------------------------------------------
       USER MESSAGE
       ------------------------------------------------------- */

    setConversation(
      (current) => [
        ...current,

        {
          role: "user",
          text: userMessage,

          /*
           * Keep the selected item with
           * the conversation message so
           * the UI knows what was used.
           */
          selectedItem:
            selectedWardrobeItem ||
            null,
        },
      ]
    );


    setBusy(true);


    try {

      console.log(
        "💬 Stylist request:",
        {
          message:
            userMessage,

          selectedItem:
            selectedWardrobeItem,
        }
      );


      /* -----------------------------------------------------
         SEND EXACT SELECTED ITEM
         ----------------------------------------------------- */

    const response = await services.stylist.chat({
  message: userMessage,

  // Exact wardrobe item selected by the user, if any.
  selectedItemId:
    selectedWardrobeItem?.id || null,

  // Send the previous conversation so follow-up messages
  // have context.
  conversation: conversation
    .filter((msg) => msg?.role === "user" || msg?.role === "ai")
    .slice(-10)
    .map((msg) => ({
      role: msg.role,
      text: msg.text || "",
    })),
});

      /* -----------------------------------------------------
         RESPONSE
         ----------------------------------------------------- */

     const outfit =
  response?.outfit ||
  null;

const missingItems =
  response?.missingItems ||
  outfit?.missingItems ||
  [];

const shoppingResults =
  response?.shoppingResults ||
  outfit?.shoppingResults ||
  [];


      if (outfit) {

        setCurrentOutfit(
          outfit
        );

      }


      /* -----------------------------------------------------
         AI MESSAGE
         ----------------------------------------------------- */

      setConversation(
        (current) => [
          ...current,

          {
            role: "ai",

            text:
              response?.message ||
              "Here's a recommendation for you.",

            outfit,

            missingItems,

            shoppingResults,

            shoppingRequired:
              response?.shoppingRequired ||
              false,

            budget:
              response?.budget ||
              null,

            intent:
              response?.intent ||
              null,

            selectedItem:
              selectedWardrobeItem ||
              null,
          },
        ]
      );


    } catch (error) {

      console.error(
        "Stylist chat error:",
        error
      );


      setConversation(
        (current) => [
          ...current,

          {
            role: "ai",

            text:
              error?.message ||
              "Sorry, I couldn't create your outfit right now. Please try again.",

            error: true,
          },
        ]
      );


    } finally {

      setBusy(false);

    }

  };


  /* =======================================================
     SAVE OUTFIT
     ======================================================= */

  const saveOutfit =
    async (outfit) => {

      if (!outfit) {
        return;
      }


      try {

        await services.outfit.save(
          outfit
        );


        setSavedOutfitId(
          outfit.name ||
          JSON.stringify(outfit)
        );


      } catch (error) {

        console.error(
          "Save outfit error:",
          error
        );

      }

    };


  /* =======================================================
     CREATE OUTFIT USING SELECTED ITEM
     ======================================================= */

  const createAroundSelectedItem =
    () => {

      if (
        !selectedWardrobeItem ||
        busy
      ) {
        return;
      }


      /*
       * The exact item is already sent
       * separately as selectedItem.
       *
       * The message only describes the
       * user's intention.
       */

      send(
        "Create an outfit around my selected wardrobe item."
      );

    };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="chat-wrap">


      {/* ===================================================
          QUICK SUGGESTIONS
          =================================================== */}

      <div className="chat-suggestions">

        {suggestions.map(
          (suggestion) => (

            <button
              key={suggestion}
              type="button"
              onClick={() =>
                send(suggestion)
              }
              disabled={busy}
            >
              {suggestion}
            </button>

          )
        )}

      </div>


      {/* ===================================================
          STYLEBUUDY ACTIONS
          =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          padding:
            "0 0 14px 0",
        }}
      >

        {/* BUILD AROUND ITEM */}

        <button
          type="button"
          onClick={
            openWardrobePicker
          }
          disabled={busy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding:
              "10px 14px",
            borderRadius:
              "10px",
            border:
              "1px solid #ddd",
            background:
              "#fff",
            cursor:
              busy
                ? "not-allowed"
                : "pointer",
            fontWeight: 600,
          }}
        >

          <span>
            👕
          </span>

          Build around an item

        </button>


        {/* LET AI CHOOSE */}

        {selectedWardrobeItem && (

          <button
            type="button"
            onClick={
              clearSelectedWardrobeItem
            }
            disabled={busy}
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "8px",
              padding:
                "10px 14px",
              borderRadius:
                "10px",
              border:
                "1px solid #ddd",
              background:
                "#f7f7f7",
              cursor:
                busy
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 600,
            }}
          >

            ✨
            Let StyleBuddy choose

          </button>

        )}

      </div>


      {/* ===================================================
          SELECTED WARDROBE ITEM
          =================================================== */}

      {selectedWardrobeItem && (

        <div
          style={{
            marginBottom:
              "14px",
            padding:
              "12px",
            border:
              "1px solid #e5e5e5",
            borderRadius:
              "14px",
            background:
              "#fafafa",
          }}
        >

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap:
                "12px",
              marginBottom:
                "10px",
            }}
          >

            <strong>
              👕 Building around
            </strong>


            <button
              type="button"
              onClick={
                openWardrobePicker
              }
              disabled={busy}
              style={{
                border:
                  "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
                fontWeight:
                  600,
              }}
            >
              Change
            </button>

          </div>


          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "12px",
            }}
          >

            <div
              style={{
                width:
                  "64px",
                height:
                  "64px",
                borderRadius:
                  "10px",
                overflow:
                  "hidden",
                background:
                  "#eee",
                flexShrink:
                  0,
              }}
            >

              {getImageUrl(
                getItemImage(
                  selectedWardrobeItem
                )
              ) ? (

                <img
                  src={
                    getImageUrl(
                      getItemImage(
                        selectedWardrobeItem
                      )
                    )
                  }
                  alt={getItemName(
                    selectedWardrobeItem
                  )}
                  style={{
                    width:
                      "100%",
                    height:
                      "100%",
                    objectFit:
                      "cover",
                  }}
                />

              ) : (

                <div
                  style={{
                    width:
                      "100%",
                    height:
                      "100%",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Sparkles
                    size={20}
                  />
                </div>

              )}

            </div>


            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "3px",
              }}
            >

              <strong>
                {getItemName(
                  selectedWardrobeItem
                )}
              </strong>

              {getItemColor(
                selectedWardrobeItem
              ) && (

                <span
                  style={{
                    fontSize:
                      "13px",
                    opacity:
                      0.7,
                  }}
                >
                  {getItemColor(
                    selectedWardrobeItem
                  )}
                </span>

              )}

              <span
                style={{
                  fontSize:
                    "12px",
                  opacity:
                    0.6,
                }}
              >
                {formatCategory(
                  selectedWardrobeItem.category
                )}
              </span>

            </div>

          </div>


          <button
            type="button"
            onClick={
              createAroundSelectedItem
            }
            disabled={busy}
            style={{
              width:
                "100%",
              marginTop:
                "12px",
              padding:
                "11px 14px",
              border:
                "none",
              borderRadius:
                "10px",
              background:
                "#111",
              color:
                "#fff",
              cursor:
                busy
                  ? "not-allowed"
                  : "pointer",
              fontWeight:
                600,
            }}
          >
            ✨ Create outfit around this item
          </button>

        </div>

      )}


      {/* ===================================================
          WARDROBE PICKER
          =================================================== */}

      {showWardrobePicker && (

        <div
          style={{
            marginBottom:
              "16px",
            padding:
              "16px",
            border:
              "1px solid #e3e3e3",
            borderRadius:
              "16px",
            background:
              "#fff",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >

          {/* PICKER HEADER */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap:
                "12px",
              marginBottom:
                "16px",
            }}
          >

            <div>

              <h3
                style={{
                  margin:
                    "0 0 5px",
                }}
              >
                Choose an item
              </h3>

              <p
                style={{
                  margin:
                    0,
                  fontSize:
                    "13px",
                  opacity:
                    0.7,
                }}
              >
                Pick the exact clothing piece
                you want StyleBuddy to build
                your outfit around.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setShowWardrobePicker(
                  false
                )
              }
              style={{
                border:
                  "none",
                background:
                  "transparent",
                fontSize:
                  "22px",
                cursor:
                  "pointer",
                lineHeight:
                  1,
              }}
              aria-label="Close wardrobe picker"
            >
              ×
            </button>

          </div>


          {/* LOADING */}

          {wardrobeLoading && (

            <div
              style={{
                padding:
                  "30px 10px",
                textAlign:
                  "center",
                opacity:
                  0.7,
              }}
            >
              Loading your wardrobe…
            </div>

          )}


          {/* ERROR */}

          {!wardrobeLoading &&
            wardrobeError && (

              <div
                style={{
                  padding:
                    "12px",
                  borderRadius:
                    "10px",
                  background:
                    "#fff1f1",
                  color:
                    "#a40000",
                  fontSize:
                    "14px",
                }}
              >
                {wardrobeError}
              </div>

            )}


          {/* EMPTY WARDROBE */}

          {!wardrobeLoading &&
            !wardrobeError &&
            wardrobeItems.length === 0 && (

              <div
                style={{
                  padding:
                    "30px 10px",
                  textAlign:
                    "center",
                  opacity:
                    0.7,
                }}
              >

                <div
                  style={{
                    fontSize:
                      "30px",
                    marginBottom:
                      "8px",
                  }}
                >
                  👕
                </div>

                <strong>
                  Your wardrobe is empty
                </strong>

                <p
                  style={{
                    fontSize:
                      "13px",
                    marginTop:
                      "6px",
                  }}
                >
                  Add some clothes to your
                  Dynamic Closet first.
                </p>

              </div>

            )}


          {/* ACTUAL WARDROBE */}

          {!wardrobeLoading &&
            !wardrobeError &&
            wardrobeItems.length > 0 && (

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(130px, 1fr))",
                  gap:
                    "12px",
                  maxHeight:
                    "430px",
                  overflowY:
                    "auto",
                  padding:
                    "2px",
                }}
              >

                {wardrobeItems.map(
                  (item) => {

                    const image =
                      getImageUrl(
                        getItemImage(
                          item
                        )
                      );

                    const isSelected =
                      String(
                        selectedWardrobeItem?.id
                      ) ===
                      String(
                        item?.id
                      );

                    return (

                      <button
                        key={
                          item?.id
                        }
                        type="button"
                        onClick={() =>
                          selectWardrobeItem(
                            item
                          )
                        }
                        disabled={busy}
                        style={{
                          position:
                            "relative",
                          padding:
                            "0",
                          textAlign:
                            "left",
                          border:
                            isSelected
                              ? "2px solid #111"
                              : "1px solid #e5e5e5",
                          borderRadius:
                            "12px",
                          background:
                            "#fff",
                          overflow:
                            "hidden",
                          cursor:
                            busy
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >

                        {/* ITEM IMAGE */}

                        <div
                          style={{
                            width:
                              "100%",
                            aspectRatio:
                              "1 / 1",
                            background:
                              "#f3f3f3",
                            overflow:
                              "hidden",
                          }}
                        >

                          {image ? (

                            <img
                              src={image}
                              alt={getItemName(
                                item
                              )}
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                objectFit:
                                  "cover",
                              }}
                            />

                          ) : (

                            <div
                              style={{
                                width:
                                  "100%",
                                height:
                                  "100%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                              }}
                            >
                              <Sparkles
                                size={24}
                              />
                            </div>

                          )}

                        </div>


                        {/* ITEM INFO */}

                        <div
                          style={{
                            padding:
                              "9px",
                          }}
                        >

                          <strong
                            style={{
                              display:
                                "block",
                              fontSize:
                                "13px",
                              whiteSpace:
                                "nowrap",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                            }}
                          >
                            {getItemName(
                              item
                            )}
                          </strong>


                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "3px",
                              fontSize:
                                "12px",
                              opacity:
                                0.65,
                            }}
                          >
                            {getItemColor(
                              item
                            ) ||
                              formatCategory(
                                item.category
                              )}
                          </span>

                        </div>


                        {/* SELECTED CHECK */}

                        {isSelected && (

                          <div
                            style={{
                              position:
                                "absolute",
                              top:
                                "8px",
                              right:
                                "8px",
                              width:
                                "25px",
                              height:
                                "25px",
                              borderRadius:
                                "50%",
                              background:
                                "#111",
                              color:
                                "#fff",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >
                            <Check
                              size={15}
                            />
                          </div>

                        )}

                      </button>

                    );

                  }
                )}

              </div>

            )}

        </div>

      )}


      {/* ===================================================
          CHAT MESSAGES
          =================================================== */}

      <div className="chat-messages">


        {/* EMPTY CHAT */}

        {conversation.length === 0 && (

          <div className="chat-empty">

            <div className="ai-orb">
              <Sparkles />
            </div>

            <h2>
              What are we styling today?
            </h2>

            <p>
              Tell me the occasion, mood,
              budget, weather, or choose
              an item from your wardrobe
              to build around.
            </p>

          </div>

        )}


        {/* CONVERSATION */}

        {conversation.map(
          (message, index) => (

            <div
              className={`bubble-row ${message.role}`}
              key={index}
            >

              <div className="avatar">

                {message.role === "ai" ? (

                  <Sparkles size={15} />

                ) : (

                  <UserRound size={15} />

                )}

              </div>


              <div className="chat-message-content">


                {/* MESSAGE */}

                <div className="bubble">
                  {message.text}
                </div>


                {/* =========================================
                    OUTFIT INSIDE CHAT
                    ========================================= */}

                {message.role === "ai" &&
                  message.outfit && (

                    <div className="chat-outfit-card">


                      {/* OUTFIT HEADER */}

                      <div className="chat-outfit-header">

                        <div>

                          <span className="chat-outfit-label">
                            STYLEBUDDY LOOK
                          </span>

                          <h3>
                            {message.outfit.name ||
                              "Your AI Outfit"}
                          </h3>

                        </div>


                        {message.outfit.score !==
                          undefined && (

                          <div className="chat-outfit-score">
                            {message.outfit.score}%
                          </div>

                        )}

                      </div>


                      {/* OUTFIT ITEMS */}

                      {message.outfit.items?.length >
                        0 && (

                        <div className="chat-outfit-items">

                          {message.outfit.items.map(
                            (item) => {

                              const imageUrl =
                                getImageUrl(
                                  item.image ||
                                  item.imageUrl
                                );


                              return (

                                <div
                                  className="chat-outfit-item"
                                  key={item.id}
                                >

                                  <div className="chat-outfit-image">

                                    {imageUrl ? (

                                      <img
                                        src={imageUrl}
                                        alt={getItemName(
                                          item
                                        )}
                                      />

                                    ) : (

                                      <div className="chat-outfit-placeholder">

                                        <Sparkles
                                          size={20}
                                        />

                                      </div>

                                    )}

                                  </div>


                                  <div className="chat-outfit-item-info">

                                    <strong>
                                      {getItemName(
                                        item
                                      )}
                                    </strong>

                                    <span>
                                      {formatCategory(
                                        item.category
                                      )}
                                    </span>

                                  </div>

                                </div>

                              );

                            }
                          )}

                        </div>

                      )}


                      {/* EXPLANATION */}

                      {message.outfit.explanation && (

                        <div className="chat-outfit-explanation">

                          <Sparkles size={14} />

                          <span>
                            {message.outfit.explanation}
                          </span>

                        </div>

                      )}


                      {/* ACTIONS */}

                      <div className="chat-outfit-actions">

                        <button
                          type="button"
                          onClick={() =>
                            saveOutfit(
                              message.outfit
                            )
                          }
                        >

                          <Heart size={14} />

                          {savedOutfitId ===
                            (
                              message.outfit.name ||
                              JSON.stringify(
                                message.outfit
                              )
                            )
                            ? "Saved"
                            : "Save Outfit"}

                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            send(
                              "Show me another outfit"
                            )
                          }
                        >

                          <Sparkles size={14} />

                          Show Another

                        </button>

                      </div>


                      {/* =====================================
                          AI-IDENTIFIED MISSING ITEMS
                          ===================================== */}

                      {message.missingItems?.length > 0 && (

                        <div
                          className="chat-missing-items"
                          style={{
                            marginTop: "18px",
                            padding: "16px",
                            borderRadius: "16px",
                            background:
                              "linear-gradient(135deg, #faf7ff 0%, #fff 100%)",
                            border: "1px solid #e9e1f7",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                              marginBottom: "14px",
                            }}
                          >

                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f0e8ff",
                                color: "#6f42c1",
                                flexShrink: 0,
                              }}
                            >
                              <Sparkles size={17} />
                            </div>

                            <div>
                              <strong
                                style={{
                                  display: "block",
                                  fontSize: "14px",
                                  marginBottom: "3px",
                                }}
                              >
                                Missing from your wardrobe
                              </strong>

                              <span
                                style={{
                                  display: "block",
                                  fontSize: "12px",
                                  lineHeight: 1.45,
                                  opacity: 0.65,
                                }}
                              >
                                Your AI Stylist identified the specific item
                                needed to complete this look.
                              </span>
                            </div>

                          </div>


                          {message.missingItems.map(
                            (item, itemIndex) => {

                              const isString =
                                typeof item === "string";

                              const title =
                                isString
                                  ? item
                                  : item?.name ||
                                    item?.title ||
                                    item?.articleType ||
                                    item?.category ||
                                    "Missing item";

                              const reason =
                                isString
                                  ? ""
                                  : item?.reason || "";

                              const category =
                                isString
                                  ? ""
                                  : item?.category || "";

                              const articleType =
                                isString
                                  ? ""
                                  : item?.articleType || "";

                              const color =
                                isString
                                  ? ""
                                  : item?.color || "";

                              const searchQuery =
                                isString
                                  ? ""
                                  : item?.searchQuery || "";

                              return (

                                <div
                                  key={
                                    item?.id ||
                                    item?.name ||
                                    item?.articleType ||
                                    item?.category ||
                                    itemIndex
                                  }
                                  className="chat-missing-item"
                                  style={{
                                    padding: "13px",
                                    marginBottom:
                                      itemIndex <
                                      message.missingItems.length - 1
                                        ? "10px"
                                        : "0",
                                    borderRadius: "13px",
                                    background: "#fff",
                                    border: "1px solid #ece7f4",
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      justifyContent: "space-between",
                                      gap: "12px",
                                    }}
                                  >

                                    <div
                                      style={{
                                        minWidth: 0,
                                        flex: 1,
                                      }}
                                    >

                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          marginBottom: "7px",
                                        }}
                                      >
                                        <span
                                          style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background: "#8b5cf6",
                                            flexShrink: 0,
                                          }}
                                        />

                                        <strong
                                          style={{
                                            fontSize: "14px",
                                            lineHeight: 1.35,
                                          }}
                                        >
                                          {title}
                                        </strong>

                                      </div>


                                      {(category ||
                                        articleType ||
                                        color) && (

                                        <div
                                          style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "6px",
                                            marginBottom:
                                              reason ? "8px" : "0",
                                          }}
                                        >

                                          {articleType && (
                                            <span
                                              style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                background: "#f5f5f5",
                                                fontSize: "11px",
                                                opacity: 0.75,
                                              }}
                                            >
                                              {articleType}
                                            </span>
                                          )}

                                          {category &&
                                            category !== articleType && (
                                              <span
                                                style={{
                                                  padding: "4px 8px",
                                                  borderRadius: "999px",
                                                  background: "#f5f5f5",
                                                  fontSize: "11px",
                                                  opacity: 0.75,
                                                }}
                                              >
                                                {formatCategory(category)}
                                              </span>
                                            )}

                                          {color && (
                                            <span
                                              style={{
                                                padding: "4px 8px",
                                                borderRadius: "999px",
                                                background: "#f5f5f5",
                                                fontSize: "11px",
                                                opacity: 0.75,
                                              }}
                                            >
                                              {color}
                                            </span>
                                          )}

                                        </div>
                                      )}


                                      {reason && (
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            lineHeight: 1.5,
                                            opacity: 0.68,
                                          }}
                                        >
                                          {reason}
                                        </div>
                                      )}

                                    </div>

                                  </div>


                                  {/* SHOPPING STATUS */}

                                  {message.shoppingRequired && (
                                    <div
                                      style={{
                                        marginTop: "12px",
                                        paddingTop: "11px",
                                        borderTop:
                                          "1px solid #f0edf4",
                                      }}
                                    >

                                      {message.shoppingResults?.length > 0 ? (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "7px",
                                            fontSize: "12px",
                                            fontWeight: 600,
                                            color: "#5b3a8e",
                                          }}
                                        >
                                          <span
                                            style={{
                                              width: "22px",
                                              height: "22px",
                                              borderRadius: "7px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              background: "#f0e8ff",
                                            }}
                                          >
                                            🛍️
                                          </span>
                                          Shopping options found below
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "8px",
                                            fontSize: "12px",
                                            lineHeight: 1.45,
                                            opacity: 0.65,
                                          }}
                                        >
                                          <span>🛍️</span>
                                          <span>
                                            This item has been identified for
                                            shopping. Product options will
                                            appear here when an enabled
                                            shopping provider returns results.
                                          </span>
                                        </div>
                                      )}

                                    </div>
                                  )}

                                </div>

                              );
                            }
                          )}

                        </div>

                      )}


                      {/* =====================================
                          SHOPPING RESULTS
                          ===================================== */}

                      {message.shoppingResults?.length > 0 && (

                        <div
                          className="chat-shopping-results"
                          style={{
                            marginTop: "14px",
                            padding: "16px",
                            borderRadius: "16px",
                            background: "#fff",
                            border: "1px solid #e8e8e8",
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "10px",
                              marginBottom: "15px",
                            }}
                          >

                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f4f4f4",
                                flexShrink: 0,
                              }}
                            >
                              🛍️
                            </div>

                            <div>
                              <strong
                                style={{
                                  display: "block",
                                  fontSize: "14px",
                                  marginBottom: "3px",
                                }}
                              >
                                Shop the missing item
                              </strong>

                              <span
                                style={{
                                  display: "block",
                                  fontSize: "12px",
                                  lineHeight: 1.45,
                                  opacity: 0.62,
                                }}
                              >
                                These products were found for the item
                                identified by your AI Stylist.
                              </span>
                            </div>

                          </div>


                          {message.shoppingResults.map(
                            (shoppingResult, resultIndex) => {

                              const products =
  Array.isArray(
    shoppingResult?.shoppingProducts
  ) &&
  shoppingResult.shoppingProducts.length > 0
    ? shoppingResult.shoppingProducts
    : Array.isArray(
        shoppingResult?.products
      )
      ? shoppingResult.products
      : [];

                              const missingItem =
                                shoppingResult?.missingItem || {};

                              const missingTitle =
                                missingItem?.name ||
                                missingItem?.title ||
                                missingItem?.articleType ||
                                missingItem?.category ||
                                "Recommended item";

                              if (!products.length) {
                                return (
                                  <div
                                    key={`shopping-empty-${resultIndex}`}
                                    style={{
                                      padding: "12px",
                                      marginBottom:
                                        resultIndex <
                                        message.shoppingResults.length - 1
                                          ? "10px"
                                          : "0",
                                      borderRadius: "12px",
                                      background: "#f8f8f8",
                                      fontSize: "12px",
                                      lineHeight: 1.45,
                                    }}
                                  >
                                    <strong
                                      style={{
                                        display: "block",
                                        fontSize: "13px",
                                        marginBottom: "3px",
                                      }}
                                    >
                                      {missingTitle}
                                    </strong>

                                    <span
                                      style={{
                                        opacity: 0.62,
                                      }}
                                    >
                                      No products are currently available
                                      for this item.
                                    </span>
                                  </div>
                                );
                              }


                              return (
                                <div
                                  key={`shopping-result-${resultIndex}`}
                                  style={{
                                    marginBottom:
                                      resultIndex <
                                      message.shoppingResults.length - 1
                                        ? "18px"
                                        : "0",
                                  }}
                                >

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: "10px",
                                      marginBottom: "10px",
                                    }}
                                  >

                                    <strong
                                      style={{
                                        fontSize: "13px",
                                      }}
                                    >
                                      {missingTitle}
                                    </strong>

                                    <span
                                      style={{
                                        fontSize: "11px",
                                        opacity: 0.55,
                                      }}
                                    >
                                      {products.length}{" "}
                                      {products.length === 1
                                        ? "option"
                                        : "options"}
                                    </span>

                                  </div>


                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fill, minmax(165px, 1fr))",
                                      gap: "10px",
                                    }}
                                  >

                                    {products.map(
                                      (product, productIndex) => {

                                        const image =
                                          getImageUrl(
                                            product?.image
                                          );

                                        const store =
                                          getShoppingStoreLabel(
                                            product
                                          );

                                        const productName =
                                          product?.name ||
                                          "Shopping product";

                                        return (
                                          <div
                                            key={
                                              product?.id ||
                                              `${resultIndex}-${productIndex}`
                                            }
                                            style={{
                                              border:
                                                "1px solid #e7e7e7",
                                              borderRadius: "13px",
                                              overflow: "hidden",
                                              background: "#fff",
                                              display: "flex",
                                              flexDirection: "column",
                                              minWidth: 0,
                                            }}
                                          >

                                            {/* PRODUCT IMAGE */}

                                            <div
                                              style={{
                                                width: "100%",
                                                aspectRatio: "1 / 1",
                                                background: "#f5f5f5",
                                                overflow: "hidden",
                                              }}
                                            >

                                              {image ? (
                                                <img
                                                  src={image}
                                                  alt={productName}
                                                  loading="lazy"
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                  }}
                                                />
                                              ) : (
                                                <div
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    opacity: 0.35,
                                                  }}
                                                >
                                                  <Sparkles size={22} />
                                                </div>
                                              )}

                                            </div>


                                            {/* PRODUCT INFO */}

                                            <div
                                              style={{
                                                padding: "10px",
                                                display: "flex",
                                                flexDirection: "column",
                                                flex: 1,
                                              }}
                                            >

                                              <strong
                                                title={productName}
                                                style={{
                                                  fontSize: "12px",
                                                  lineHeight: 1.4,
                                                  display: "-webkit-box",
                                                  WebkitLineClamp: 2,
                                                  WebkitBoxOrient: "vertical",
                                                  overflow: "hidden",
                                                }}
                                              >
                                                {productName}
                                              </strong>


                                              <div
                                                style={{
                                                  marginTop: "8px",
                                                  fontSize: "15px",
                                                  fontWeight: 700,
                                                }}
                                              >
                                                {formatProductPrice(
                                                  product?.price,
                                                  product?.currency ||
                                                    "INR"
                                                )}
                                              </div>


                                              <div
                                                style={{
                                                  marginTop: "3px",
                                                  fontSize: "11px",
                                                  opacity: 0.58,
                                                }}
                                              >
                                                {store}
                                              </div>


                                              {product?.url ? (
                                                <a
                                                  href={product.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  style={{
                                                    marginTop: "10px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: "8px 9px",
                                                    borderRadius: "8px",
                                                    background: "#111",
                                                    color: "#fff",
                                                    textDecoration: "none",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                  }}
                                                >
                                                  View Product →
                                                </a>
                                              ) : (
                                                <div
                                                  style={{
                                                    marginTop: "10px",
                                                    padding: "8px 9px",
                                                    borderRadius: "8px",
                                                    background: "#f5f5f5",
                                                    textAlign: "center",
                                                    fontSize: "11px",
                                                    opacity: 0.55,
                                                  }}
                                                >
                                                  Link unavailable
                                                </div>
                                              )}

                                            </div>

                                          </div>
                                        );
                                      }
                                    )}

                                  </div>

                                </div>
                              );
                            }
                          )}

                        </div>
                      )}


                    </div>

                  )}

              </div>

            </div>

          )
          
        )}
        {/* ===================================================
            TYPING INDICATOR
            =================================================== */}

        {busy && (

          <div className="bubble-row ai">

            <div className="avatar">
              <Sparkles size={15} />
            </div>

            <div className="bubble typing">
              Thinking…
            </div>

          </div>

        )}

      </div>


      {/* ===================================================
          INPUT
          =================================================== */}

      <form
        className="chat-input"
        onSubmit={(event) => {

          event.preventDefault();

          send();

        }}
      >

        <input
          value={text}
          onChange={(event) =>
            setText(
              event.target.value
            )
          }
          placeholder={
            selectedWardrobeItem
              ? `Ask StyleBuddy to style your ${getItemName(selectedWardrobeItem)}…`
              : "Ask StyleBuddy anything about your wardrobe…"
          }
          disabled={busy}
        />


        <button
          type="submit"
          aria-label="Send"
          disabled={
            busy ||
            !text.trim()
          }
        >
          <Send size={18} />
        </button>

      </form>

    </div>

  );
}