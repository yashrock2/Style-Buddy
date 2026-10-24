import React, { useState } from "react";
import {
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  Check,
  Shirt,
  Footprints,
  Watch,
  Layers3,
  Heart,
} from "lucide-react";

import { services } from "../api";
import { useApp } from "../context/AppContext";

import {
  Button,
  PageHeader,
  Pill,
} from "../components/UI";

import ChatInterface from "../components/ChatInterface";


/* =========================================================
   BACKEND IMAGE URL
   ========================================================= */

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const BACKEND_URL =
  API_BASE.replace(/\/api\/?$/, "");


function getImageUrl(image) {
  if (!image) return "";

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
   HELPERS
   ========================================================= */

function formatCategory(category) {
  if (!category) return "Clothing";

  const formatted = category
    .replace(/s$/, "")
    .replace(/^./, (letter) =>
      letter.toUpperCase()
    );

  return formatted;
}


function getItemName(item) {
  return (
    item.articleType ||
    item.name ||
    item.category ||
    "Clothing item"
  );
}


function getItemIcon(item) {
  const value = `${item.category || ""} ${
    item.articleType || ""
  }`.toLowerCase();

  if (
    value.includes("shoe") ||
    value.includes("footwear")
  ) {
    return Footprints;
  }

  if (
    value.includes("accessor") ||
    value.includes("bag") ||
    value.includes("watch")
  ) {
    return Watch;
  }

  if (
    value.includes("bottom") ||
    value.includes("jean") ||
    value.includes("trouser") ||
    value.includes("short")
  ) {
    return Layers3;
  }

  return Shirt;
}




/* =========================================================
   STYLIST
   ========================================================= */

export default function Stylist() {

  const {
    currentOutfit,
    setCurrentOutfit,
  } = useApp();


  const [role, setRole] =
    useState("Full Outfit");

  const [occasion, setOccasion] =
    useState("Casual");

  const [style, setStyle] =
  useState("Smart Casual");

// TEMPORARY WEATHER TEST
const [temperatureC, setTemperatureC] =
  useState(29);

const [weatherCondition, setWeatherCondition] =
  useState("clear");

const [busy, setBusy] =
  useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     SAVE STATE
     ======================================================= */

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);


  /* =======================================================
     GENERATE
     ======================================================= */

  const recommend = async () => {

    setBusy(true);
    setError("");
    setSaved(false);

    try {

      console.log(
  "Generating recommendation...",
  {
    role,
    occasion,
    style,
    temperatureC,
    weatherCondition,
  }
);

     const response =
  await services.stylist.recommend({
    role,
    occasion,
    style,
    temperatureC,
    weatherCondition,
  });
      console.log(
        "Stylist API response:",
        response
      );

      const outfit =
        response?.outfit || response;

      if (!outfit) {
        throw new Error(
          "No outfit was returned by the AI stylist."
        );
      }

      setCurrentOutfit(outfit);

    } catch (err) {

      console.error(
        "Stylist recommendation error:",
        err
      );

      setError(
        err?.message ||
          "Unable to generate an outfit. Please try again."
      );

    } finally {

      setBusy(false);

    }
  };


  /* =======================================================
     SAVE OUTFIT
     ======================================================= */

  const saveOutfit = async () => {

    if (!currentOutfit || saving || saved) {
      return;
    }

    setSaving(true);
    setError("");

    try {

      console.log(
        "Saving outfit...",
        currentOutfit
      );

      const response =
        await services.outfit.save(
          currentOutfit
        );

      console.log(
        "Save outfit API response:",
        response
      );

      if (
        response?.success === false
      ) {
        throw new Error(
          response?.message ||
            "Unable to save this outfit."
        );
      }

      setSaved(true);

    } catch (err) {

      console.error(
        "Save outfit error:",
        err
      );

      setError(
        err?.message ||
          "Unable to save this outfit. Please try again."
      );

    } finally {

      setSaving(false);

    }
  };


  return (
    <div className="page stylist-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <PageHeader
        eyebrow="STYLEBUDDY AI"
        title="Your personal stylist."
        description="Tell us what you're looking for and StyleBuddy will build a look from your own wardrobe."
      />


      {/* =================================================
          CONTROLS
          ================================================= */}

      <div className="stylist-layout">

        <ChatInterface
          onOutfit={(outfit) => {
            setCurrentOutfit(outfit);
            setSaved(false);
          }}
        />


        <aside className="stylist-panel">

          <div className="panel-title">
            <SlidersHorizontal size={17} />

            <span>
              Recommendation controls
            </span>
          </div>


          <div className="control-section">

            <label>
              What do you want?
            </label>

            <p className="control-hint">
              Choose what StyleBuddy should create
            </p>

            <div className="segmented">

              {[
                "Top",
                "Bottom",
                "Shoes",
                "Accessory",
                "Full Outfit",
              ].map((x) => (

                <button
                  key={x}
                  type="button"
                  className={
                    role === x
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setRole(x)
                  }
                >
                  {x}
                </button>

              ))}

            </div>

          </div>


          <div className="control-section">

            <label>
              Occasion
            </label>

            <p className="control-hint">
              Where are you planning to wear it?
            </p>

            <div className="select-grid">

              {[
                "Casual",
                "College",
                "Office",
                "Party",
                "Date",
                "Wedding",
                "Travel",
                "Gym",
              ].map((x) => (

                <button
                  key={x}
                  type="button"
                  className={
                    occasion === x
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setOccasion(x)
                  }
                >
                  {x}

                  {occasion === x && (
                    <Check size={12} />
                  )}

                </button>

              ))}

            </div>

          </div>


          <div className="control-section">

            <label>
              Style
            </label>

            <p className="control-hint">
              Pick the look you want
            </p>

            <select
              value={style}
              onChange={(e) =>
                setStyle(e.target.value)
              }
            >
              <option>Casual</option>
              <option>Formal</option>
              <option>Party</option>
              <option>Traditional</option>
              <option>Streetwear</option>
              <option>Minimal</option>
              <option>Smart Casual</option>
            </select>

          </div>


          {error && (
            <div className="stylist-error">

              <strong>
                Something went wrong
              </strong>

              <span>
                {error}
              </span>

            </div>
          )}


          <Button
            className="btn-dark full stylist-generate-button"
            onClick={recommend}
            disabled={busy}
          >

            {busy ? (
              <>
                <Sparkles
                  size={16}
                  className="spin"
                />

                Creating your look...
              </>
            ) : (
              <>
                <Sparkles size={16} />

                Generate my outfit

                <ArrowRight size={16} />
              </>
            )}

          </Button>


          <div className="stylist-ai-note">

            <Sparkles size={12} />

            <span>
              Built from your saved wardrobe
            </span>

          </div>

        </aside>

      </div>


      {/* =================================================
          AI RESULT
          ================================================= */}

      {currentOutfit && (

        <section className="compact-ai-result">

          {/* RESULT HEADER */}

          <div className="compact-result-header">

            <div className="compact-result-title">

              <div className="compact-ai-label">
                <Sparkles size={12} />
                AI STYLIST RESULT
              </div>

              <h2>
                {currentOutfit.name ||
                  "Your AI Outfit"}
              </h2>

              <div className="compact-result-meta">

                {currentOutfit.occasion && (
                  <Pill>
                    {currentOutfit.occasion}
                  </Pill>
                )}

                {currentOutfit.style && (
                  <Pill>
                    {currentOutfit.style}
                  </Pill>
                )}

              </div>

            </div>


            {currentOutfit.score !==
  undefined && (

  <div className="compact-score">

    <strong>
      {currentOutfit.score}%
    </strong>

    <span>
      match
    </span>

  </div>

)}

{currentOutfit.v13Score !==
  null &&
  currentOutfit.v13Score !==
  undefined && (

  <div
    style={{
      marginTop: "8px",
      fontSize: "12px",
      opacity: 0.75,
    }}
  >
    ✨ Advanced AI score:{" "}
    <strong>
      {currentOutfit.v13Score}
    </strong>
  </div>

)}
          </div>


          {/* SAVE OUTFIT */}

          <div className="compact-save-row">

            <button
              type="button"
              className={
                saved
                  ? "compact-save-button saved"
                  : "compact-save-button"
              }
              onClick={saveOutfit}
              disabled={saving || saved}
            >

              {saving ? (
                <>
                  <Sparkles
                    size={16}
                    className="spin"
                  />

                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={16} />

                  Outfit Saved
                </>
              ) : (
                <>
                  <Heart size={16} />

                  Save Outfit
                </>
              )}

            </button>

          </div>


          {/* WHY IT WORKS */}

          {currentOutfit.explanation && (

            <div className="compact-explanation">

              <Sparkles size={14} />

              <div>

                <strong>
                  Why it works
                </strong>

                <span>
                  {currentOutfit.explanation}
                </span>

              </div>

            </div>

          )}


          {/* YOUR CLOSET */}

          {currentOutfit.items?.length > 0 && (

            <div className="compact-closet-section">

              <div className="compact-section-heading">

                <div>

                  <span>
                    YOUR CLOSET
                  </span>

                  <h3>
                    Selected pieces
                  </h3>

                </div>

                <small>
                  {currentOutfit.items.length}{" "}
                  {currentOutfit.items.length === 1
                    ? "piece"
                    : "pieces"}
                </small>

              </div>


              <div className="compact-outfit-grid">

                {currentOutfit.items.map((item) => {

                  const imageUrl =
                    getImageUrl(
                      item.image ||
                      item.imageUrl
                    );

                  const itemName =
                    getItemName(item);

                  const category =
                    formatCategory(
                      item.category
                    );

                  const ItemIcon =
                    getItemIcon(item);


                  return (

                    <div
                      className="compact-clothing-card"
                      key={item.id}
                    >

                      <div className="compact-clothing-image">

                        {imageUrl ? (

                          <img
                            src={imageUrl}
                            alt={itemName}
                          />

                        ) : (

                          <div className="compact-image-placeholder">

                            <ItemIcon
                              size={25}
                            />

                          </div>

                        )}

                        <span>
                          {category}
                        </span>

                      </div>


                      <div className="compact-clothing-info">

                        <strong>
                          {itemName}
                        </strong>

                      </div>

                    </div>

                  );

                })}

              </div>

            </div>

          )}


          {/* COMPLETE YOUR LOOK */}

          {/* COMPLETE YOUR LOOK */}



          {/* COMPLETE WARDROBE */}

      {currentOutfit.items?.length > 0 && (
  <div className="compact-complete-message">
    <Check size={14} />

    <span>
      Outfit built from your saved wardrobe.
    </span>
  </div>
)}
        </section>

      )}

    </div>
  );
}