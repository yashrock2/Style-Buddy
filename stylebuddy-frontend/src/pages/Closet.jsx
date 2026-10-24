import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  SlidersHorizontal,
  UploadCloud,
  X,
  Trash2,
} from "lucide-react";

import { services } from "../api";
import { useApp } from "../context/AppContext";

import {
  PageHeader,
  SearchBox,
  LoadingState,
  EmptyState,
  Button,
  Toast,
} from "../components/UI";

import ClothingCard from "../components/ClothingCard";
import UploadGallery from "../components/UploadGallery";
import AIAnalysis from "../components/AIAnalysis";


const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");


function normalizeItem(item) {
  let image =
    item.image ||
    item.imageUrl ||
    "";

  if (
    image &&
    !image.startsWith("http")
  ) {
    image =
      `${API_ORIGIN}${
        image.startsWith("/")
          ? ""
          : "/"
      }${image}`;
  }

  return {
    ...item,

    image,

    name:
      item.name ||
      item.articleType ||
      "Clothing item",

    article_type:
      item.article_type ||
      item.articleType ||
      "",

    category:
      item.category || "",

    color:
      item.color || "",

    fabric:
      item.fabric || "",

    pattern:
      item.pattern || "",
  };
}


export default function Closet() {
  const {
    closet,
    setCloset,
  } = useApp();


  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [q, setQ] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [showUpload, setShowUpload] =
    useState(false);

  const [analysisItems, setAnalysisItems] =
    useState([]);

  const [toast, setToast] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // Item waiting for delete confirmation
  const [itemToDelete, setItemToDelete] =
    useState(null);

  // Prevent multiple delete clicks
  const [deleting, setDeleting] =
    useState(false);


  const [params] =
    useSearchParams();


  /* =========================================================
     LOAD CLOSET
     ========================================================= */

  useEffect(() => {
    async function loadCloset() {
      try {
        setLoading(true);
        setError("");

        const items =
          await services.closet.getItems();

        setCloset(
          (items || []).map(
            normalizeItem
          )
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to load your wardrobe."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCloset();

    if (params.get("upload")) {
      setShowUpload(true);
    }
  }, [setCloset, params]);


  /* =========================================================
     FILTER CLOSET
     ========================================================= */

  const filtered = useMemo(() => {
  const selectedCategory = category.trim().toLowerCase();
  const searchQuery = q.trim().toLowerCase();

  return closet.filter((item) => {
    const itemCategory = String(
      item.category || ""
    )
      .trim()
      .toLowerCase();

    const matchesCategory =
      selectedCategory === "all" ||
      itemCategory === selectedCategory;

    const searchableText = `
      ${item.name || ""}
      ${item.article_type || ""}
      ${item.color || ""}
      ${item.fabric || ""}
      ${item.style || ""}
      ${item.category || ""}
    `.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      searchableText.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });
}, [closet, q, category]);


  /* =========================================================
     UPLOAD CLOTHES
     ========================================================= */

  const handleUpload = async (
    files
  ) => {
    if (!files.length) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadedItems = [];

      for (const file of files) {
        const savedItem =
          await services.closet.uploadItem(
            file
          );

        uploadedItems.push(
          normalizeItem(savedItem)
        );
      }

      setCloset((current) => [
        ...uploadedItems,
        ...current,
      ]);

      setShowUpload(false);

      setAnalysisItems(
        uploadedItems
      );

      setToastMessage(
        "Items added to your digital closet."
      );

      setToast(true);

      setTimeout(() => {
        setToast(false);
      }, 2500);
    } catch (err) {
      setError(
        err.message ||
          "Unable to upload your clothing."
      );
    } finally {
      setUploading(false);
    }
  };


  /* =========================================================
     CONFIRM DELETE
     ========================================================= */

  const confirmDelete = async () => {
    if (!itemToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await services.closet.deleteItem(
        itemToDelete.id
      );

      // Remove the item immediately
      // from the frontend closet state.
      setCloset((current) =>
        current.filter(
          (closetItem) =>
            closetItem.id !==
            itemToDelete.id
        )
      );

      // Close confirmation modal.
      setItemToDelete(null);

      // Show success toast.
      setToastMessage(
        "Item removed from your closet."
      );

      setToast(true);

      setTimeout(() => {
        setToast(false);
      }, 2500);
    } catch (err) {
      setError(
        err.message ||
          "Unable to remove this clothing item."
      );
    } finally {
      setDeleting(false);
    }
  };


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="page">

      <PageHeader
        eyebrow="YOUR DIGITAL WARDROBE"
        title="My Closet"
        description={`${closet.length || 0} pieces, ready to be styled.`}
        action={
          <Button
            className="btn-dark"
            onClick={() =>
              setShowUpload(true)
            }
            disabled={uploading}
          >
            <UploadCloud size={17} />
            Add clothes
          </Button>
        }
      />


      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      {loading ? (
        <LoadingState
          text="Loading your wardrobe..."
        />
      ) : (
        <>
          {/* =================================================
              TOOLBAR
              ================================================= */}

          <div className="toolbar">

            <SearchBox
              value={q}
              onChange={setQ}
              placeholder="Search your wardrobe..."
            />


            <div className="category-tabs">
              {[
                "All",
                "Tops",
                "Bottoms",
                "Dresses",
                "Footwear",
                "Accessories",
              ].map(
                (itemCategory) => (
                  <button
                    className={
                      category ===
                      itemCategory
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setCategory(
                        itemCategory
                      )
                    }
                    key={itemCategory}
                  >
                    {itemCategory}
                  </button>
                )
              )}
            </div>


            <button
              className="filter-btn"
            >
              <SlidersHorizontal
                size={17}
              />
              Filters
            </button>

          </div>


          {/* =================================================
              CLOTHING GRID
              ================================================= */}

          {filtered.length ? (
            <div className="clothing-grid">

              {filtered.map((item) => (
                <ClothingCard
                  item={item}
                  key={item.id}

                  onClick={() =>
                    (window.location.href =
                      `/closet/${item.id}`)
                  }

                  onDelete={(itemToRemove) => {
                    setItemToDelete(
                      itemToRemove
                    );
                  }}
                />
              ))}

            </div>
          ) : (
            <EmptyState
              icon={
                <UploadCloud size={30} />
              }
              title="Your closet is empty"
              text="Upload your first clothing item and let StyleBuddy build your digital wardrobe."
              action={
                <Button
                  className="btn-dark"
                  onClick={() =>
                    setShowUpload(true)
                  }
                >
                  Upload first item
                </Button>
              }
            />
          )}

        </>
      )}


      {/* =====================================================
          UPLOAD MODAL
          ===================================================== */}

      {showUpload && (
        <div className="modal-backdrop">

          <div className="modal large">

            <button
              className="modal-close"
              onClick={() =>
                !uploading &&
                setShowUpload(false)
              }
              disabled={uploading}
            >
              <X />
            </button>


            {uploading && (
              <div className="form-section">

                <h2>
                  Uploading your clothes...
                </h2>

                <p>
                  Please wait while
                  StyleBuddy saves your
                  clothing images.
                </p>

              </div>
            )}


            {!uploading && (
              <UploadGallery
                onUpload={
                  handleUpload
                }
              />
            )}

          </div>

        </div>
      )}


      {/* =====================================================
          AI ANALYSIS MODAL
          ===================================================== */}

      {analysisItems.length > 0 && (
        <div className="modal-backdrop">

          <div className="modal large ai-analysis-modal">

            <button
              className="modal-close"
              onClick={() =>
                setAnalysisItems([])
              }
            >
              <X />
            </button>


            <AIAnalysis
              results={
                analysisItems
              }
              onComplete={() =>
                setAnalysisItems([])
              }
            />

          </div>

        </div>
      )}


      {/* =====================================================
          DELETE CONFIRMATION MODAL
          ===================================================== */}

      {itemToDelete && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!deleting) {
              setItemToDelete(null);
            }
          }}
        >

          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              maxWidth: "420px",
              width: "calc(100% - 32px)",
              padding: "30px",
            }}
          >

            {/* Delete icon */}

            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "18px",
                background:
                  "#f5f5f5",
              }}
            >
              <Trash2
                size={22}
              />
            </div>


            {/* Heading */}

            <h2
              style={{
                margin:
                  "0 0 8px",
              }}
            >
              Remove from your closet?
            </h2>


            {/* Description */}

            <p
              style={{
                margin:
                  "0 0 8px",
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              Are you sure you want
              to remove{" "}
              <strong>
                {itemToDelete.name ||
                  "this clothing item"}
              </strong>
              ?
            </p>


            <p
              style={{
                margin:
                  "0 0 26px",
                color: "#999",
                fontSize: "13px",
              }}
            >
              This action cannot
              be undone.
            </p>


            {/* Buttons */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
              }}
            >

              <Button
                onClick={() =>
                  setItemToDelete(
                    null
                  )
                }
                disabled={deleting}
              >
                Cancel
              </Button>


              <Button
                className="btn-dark"
                onClick={
                  confirmDelete
                }
                disabled={deleting}
              >
                <Trash2 size={15} />

                {deleting
                  ? "Removing..."
                  : "Remove item"}
              </Button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          TOAST
          ===================================================== */}

      {toast && (
        <Toast>
          {toastMessage}
        </Toast>
      )}

    </div>
  );
}