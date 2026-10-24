import React, { useState } from "react";
import {
  Heart,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { Pill } from "./UI";

export default function ClothingCard({
  item,
  onClick,
  onDelete,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu((current) => !current);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);

    if (onDelete) {
      onDelete(item);
    }
  };

  return (
    <article
      className="clothing-card"
      onClick={onClick}
    >
      <div className="cloth-image">
        <img
          src={item.image}
          alt={item.name || "Clothing item"}
        />

        <button
          className="favorite"
          onClick={(e) =>
            e.stopPropagation()
          }
          aria-label="Favorite"
        >
          <Heart size={17} />
        </button>
      </div>

      <div className="cloth-body">
        <div className="cloth-name">
          <h3>
            {item.name || "Clothing item"}
          </h3>

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={handleMenuClick}
              aria-label="More options"
              style={{
                border: "none",
                background: "transparent",
                padding: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
              }}
            >
              <MoreHorizontal size={17} />
            </button>

            {showMenu && (
              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                style={{
                  position: "absolute",
                  right: 0,
                  top: "32px",
                  zIndex: 20,
                  minWidth: "170px",
                  background: "#fff",
                  border: "1px solid #e8e8e8",
                  borderRadius: "10px",
                  padding: "5px",
                  boxShadow:
                    "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "none",
                    background: "transparent",
                    padding: "9px 10px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                  }}
                >
                  <Trash2 size={15} />
                  Remove from closet
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pill-row">
          {item.category && (
            <Pill>{item.category}</Pill>
          )}

          {item.color && (
            <Pill>{item.color}</Pill>
          )}
        </div>

        {(item.article_type ||
          item.fabric ||
          item.pattern) && (
          <p>
            {item.article_type || ""}
            {item.article_type &&
            item.fabric
              ? " · "
              : ""}
            {item.fabric || ""}
            {item.pattern
              ? ` · ${item.pattern}`
              : ""}
          </p>
        )}
      </div>
    </article>
  );
}