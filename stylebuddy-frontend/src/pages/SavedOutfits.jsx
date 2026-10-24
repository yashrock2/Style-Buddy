import React, { useEffect, useState } from "react";
import { Heart, Trash2, Eye, X } from "lucide-react";
import { services } from "../api";
import {
  PageHeader,
  LoadingState,
  EmptyState,
  Button,
  Pill
} from "../components/UI";

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/uploads/")) {
    return `http://localhost:5000${image}`;
  }

  return image;
}

function normalizeOutfit(saved) {
  const data = saved?.data || saved?.outfit || saved || {};

  const rawItems = Array.isArray(data.items)
    ? data.items
    : [];

  const items = rawItems.map((item, index) => ({
    ...item,
    id: item.id || `saved-item-${index}`,
    image: getImageUrl(item.image || item.imageUrl),
    name:
      item.name ||
      item.articleType ||
      item.category ||
      "Clothing item"
  }));

  return {
    id: saved?.id || data.id,
    name: data.name || "Saved Outfit",
    score: data.score ?? null,
    occasion: data.occasion || "Casual",
    style: data.style || "Smart Casual",
    weather: data.weather || "Automatic",
    explanation:
      data.explanation ||
      "A personalized outfit created from your StyleBuddy wardrobe.",
    items,
    image:
      getImageUrl(data.image) ||
      getImageUrl(items[0]?.image),
    missingItems: Array.isArray(data.missingItems)
      ? data.missingItems
      : [],
    shoppingRequired: Boolean(data.shoppingRequired)
  };
}

export default function SavedOutfits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [error, setError] = useState("");

  const loadSavedOutfits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await services.outfit.getSaved();

      console.log("Saved outfits API response:", response);

      const savedList =
        Array.isArray(response)
          ? response
          : response?.outfits ||
            response?.items ||
            response?.savedOutfits ||
            [];

      const normalized = savedList.map(normalizeOutfit);

      setItems(normalized);
    } catch (err) {
      console.error("Failed to load saved outfits:", err);
      setError(
        err?.message || "Unable to load your saved outfits."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedOutfits();
  }, []);

  const deleteOutfit = async (id) => {
    try {
      await services.outfit.delete(id);

      setItems((current) =>
        current.filter((outfit) => outfit.id !== id)
      );

      if (selectedOutfit?.id === id) {
        setSelectedOutfit(null);
      }
    } catch (err) {
      console.error("Failed to delete outfit:", err);
      alert("Unable to delete this outfit. Please try again.");
    }
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="YOUR COLLECTION"
        title="Saved Outfits"
        description="Looks worth remembering, ready to wear again."
      />

      {loading ? (
        <LoadingState text="Loading saved looks…" />
      ) : error ? (
        <div className="state error">
          <div>
            <strong>{error}</strong>
            <br />
            <button
              className="text-btn"
              onClick={loadSavedOutfits}
            >
              Try again
            </button>
          </div>
        </div>
      ) : items.length ? (
        <div className="outfit-grid">
          {items.map((outfit) => (
            <article
              key={outfit.id}
              className="outfit-card saved-outfit-card"
            >
              <div
                className="saved-outfit-image-wrap"
                onClick={() => setSelectedOutfit(outfit)}
              >
                {outfit.image ? (
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="saved-outfit-main-image"
                  />
                ) : outfit.items.length ? (
                  <div className="saved-outfit-collage">
                    {outfit.items.slice(0, 4).map((item) => (
                      <img
                        key={item.id}
                        src={item.image}
                        alt={item.name}
                        className="saved-collage-image"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="saved-outfit-no-image">
                    <Heart size={32} />
                  </div>
                )}

                {outfit.score !== null && (
                  <span className="saved-score">
                    {outfit.score}% match
                  </span>
                )}
              </div>

              <div className="outfit-body">
                <div className="outfit-title">
                  <h3>{outfit.name}</h3>
                </div>

                <div className="muted">
                  {outfit.occasion} · {outfit.style}
                </div>

                <div className="saved-outfit-actions">
                  <Button
                    className="btn-outline"
                    onClick={() => setSelectedOutfit(outfit)}
                  >
                    <Eye size={15} />
                    View
                  </Button>

                  <button
                    className="icon-btn"
                    onClick={() => deleteOutfit(outfit.id)}
                    aria-label="Delete outfit"
                    title="Delete outfit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart size={30} />}
          title="No saved looks yet"
          text="Generate an outfit and save the ones you love."
        />
      )}

      {selectedOutfit && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedOutfit(null)}
        >
          <div
            className="modal saved-outfit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedOutfit(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="eyebrow">
              SAVED AI OUTFIT
            </div>

            <div className="saved-modal-header">
              <div>
                <h2>{selectedOutfit.name}</h2>

                <div className="pill-row">
                  <Pill>{selectedOutfit.occasion}</Pill>
                  <Pill>{selectedOutfit.style}</Pill>

                  {selectedOutfit.weather &&
                    selectedOutfit.weather !== "Automatic" && (
                      <Pill>{selectedOutfit.weather}</Pill>
                    )}
                </div>
              </div>

              {selectedOutfit.score !== null && (
                <div className="saved-modal-score">
                  <strong>
                    {selectedOutfit.score}%
                  </strong>
                  <span>style match</span>
                </div>
              )}
            </div>

            {selectedOutfit.explanation && (
              <p className="saved-modal-explanation">
                {selectedOutfit.explanation}
              </p>
            )}

            <div className="saved-items-title">
              <h3>Items in this outfit</h3>
              <span>
                {selectedOutfit.items.length} items
              </span>
            </div>

            {selectedOutfit.items.length ? (
              <div className="saved-items-grid">
                {selectedOutfit.items.map((item) => (
                  <div
                    className="saved-item-card"
                    key={item.id}
                  >
                    <div className="saved-item-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <Heart size={24} />
                      )}
                    </div>

                    <div className="saved-item-info">
                      <strong>{item.name}</strong>

                      <span>
                        {item.category ||
                          item.articleType ||
                          "Clothing"}
                      </span>

                      {item.color && (
                        <span>{item.color}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="saved-empty-items">
                No clothing items were stored with this outfit.
              </div>
            )}

            {selectedOutfit.shoppingRequired &&
              selectedOutfit.missingItems.length > 0 && (
                <div className="saved-missing-section">
                  <h3>Complete Your Look</h3>

                  <p>
                    Some items were missing from your
                    wardrobe when this outfit was created.
                  </p>

                  {selectedOutfit.missingItems.map(
                    (item, index) => (
                      <div
                        className="saved-missing-item"
                        key={index}
                      >
                        <span>
                          {item.title ||
                            item.category ||
                            item.query ||
                            "Missing item"}
                        </span>

                        {item.amazonUrl && (
                          <a
                            href={item.amazonUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                          >
                            Shop
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

            <div className="saved-modal-footer">
              <Button
                className="btn-dark"
                onClick={() => setSelectedOutfit(null)}
              >
                Done
              </Button>

              <button
                className="text-btn danger-text"
                onClick={() =>
                  deleteOutfit(selectedOutfit.id)
                }
              >
                <Trash2 size={15} />
                Delete outfit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}