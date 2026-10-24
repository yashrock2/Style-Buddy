import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  Heart,
  ShoppingBag,
  Share2,
} from "lucide-react";

import { services } from "../api";
import { useApp } from "../context/AppContext";
import {
  PageHeader,
  Button,
  Pill,
  Toast,
} from "../components/UI";

export default function OutfitGenerator() {
  const [params] = useSearchParams();

  const {
    currentOutfit,
    setCurrentOutfit,
  } = useApp();

  const [occasion, setOccasion] =
    useState("Casual");

  const [style, setStyle] =
    useState("Smart Casual");

  const [weather, setWeather] =
    useState("Automatic");

  const [busy, setBusy] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const generate = async () => {
    setBusy(true);

    try {
      const r =
        await services.stylist.recommend({
          occasion,
          style,
          weather,
          starting_item:
            params.get("item") || null,
        });

      // Backend returns { success, outfit }
      // so store the actual outfit object.
      setCurrentOutfit(
        r.outfit || r
      );
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!currentOutfit) return;

    await services.outfit.save(
      currentOutfit
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="OUTFIT GENERATOR"
        title="Build the perfect look."
        description="Choose the context. Let StyleBuddy handle the combinations."
      />

      <div className="generator-grid">
        <div className="generator-card">

          <div className="control-block">
            <label>Occasion</label>

            <div className="choice-grid small">
              {[
                "Casual",
                "College",
                "Office",
                "Party",
                "Date",
                "Wedding",
                "Travel",
                "Gym",
                "Festival",
                "Custom",
              ].map((x) => (
                <button
                  className={
                    occasion === x
                      ? "choice selected"
                      : "choice"
                  }
                  onClick={() =>
                    setOccasion(x)
                  }
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <label>Style</label>

            <div className="choice-grid small">
              {[
                "Casual",
                "Formal",
                "Party",
                "Traditional",
                "Streetwear",
                "Minimal",
                "Smart Casual",
              ].map((x) => (
                <button
                  className={
                    style === x
                      ? "choice selected"
                      : "choice"
                  }
                  onClick={() =>
                    setStyle(x)
                  }
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <label>Weather</label>

            <select
              value={weather}
              onChange={(e) =>
                setWeather(e.target.value)
              }
            >
              <option>
                Automatic
              </option>

              <option>
                Hot & sunny
              </option>

              <option>
                Warm & cloudy
              </option>

              <option>
                Cool
              </option>

              <option>
                Rainy
              </option>
            </select>
          </div>

          <Button
            className="btn-dark full generate-btn"
            onClick={generate}
            disabled={busy}
          >
            <Sparkles size={18} />

            {busy
              ? "Generating your look…"
              : "Generate Outfit"}
          </Button>
        </div>

        <div className="generator-side">
          {currentOutfit ? (
            <div className="result-board">

              <div className="eyebrow">
                YOUR AI-GENERATED LOOK
              </div>

              <div className="result-title">
                <h2>
                  {currentOutfit.name}
                </h2>

                <div className="score-big">
                  {currentOutfit.score}%

                  <small>
                    style match
                  </small>
                </div>
              </div>

              <div className="board-items">
                {currentOutfit.items?.map(
                  (i) => (
                    <div key={i.id}>
                      <img
                        src={i.image}
                        alt={i.name}
                      />

                      <span>
                        {i.category}
                      </span>

                      <b>
                        {i.name}
                      </b>
                    </div>
                  )
                )}
              </div>

              <div className="why">
                <h3>
                  Why this works
                </h3>

                <p>
                  {currentOutfit.explanation}
                </p>
              </div>

              <div className="result-actions">

                <Button
                  className="btn-dark"
                  onClick={save}
                >
                  <Heart size={16} />
                  Save Outfit
                </Button>

                <Button
                  className="btn-outline"
                  onClick={generate}
                >
                  <RefreshCw size={16} />
                  Show Another
                </Button>

                <Button
                  className="btn-outline"
                >
                  <ShoppingBag size={16} />
                  Shop Missing Items
                </Button>

                <button className="icon-btn bordered">
                  <Share2 size={17} />
                </button>

              </div>
            </div>
          ) : (
            <div className="empty-generator">

              <div className="ai-orb">
                <Sparkles />
              </div>

              <h2>
                Your next look is waiting.
              </h2>

              <p>
                Set the occasion and style,
                then generate a wardrobe-first
                outfit.
              </p>

            </div>
          )}
        </div>
      </div>

      {saved && (
        <Toast>
          Outfit saved to your collection.
        </Toast>
      )}
    </div>
  );
}