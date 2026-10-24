import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Heart,
  Trash2,
  Sparkles,
} from "lucide-react";

import { services } from "../api";

import {
  Button,
  Confidence,
  LoadingState,
  Pill,
} from "../components/UI";

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");


export default function GarmentDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let mounted = true;

    async function loadItem() {
      try {
        setLoading(true);
        setError("");

       const garment =
  await services.closet.getItem(id);

if (mounted) {
  let image =
    garment?.image ||
    garment?.imageUrl ||
    "";

  if (
    image &&
    !image.startsWith("http")
  ) {
    image = `${API_ORIGIN}${
      image.startsWith("/")
        ? ""
        : "/"
    }${image}`;
  }

  setItem({
    ...garment,
    image,
  });
}
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              "Unable to load this clothing item."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadItem();

    return () => {
      mounted = false;
    };
  }, [id]);


  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        `Remove "${
          item?.name || "this item"
        }" from your closet?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await services.closet.deleteItem(id);

      nav("/closet");
    } catch (err) {
      setError(
        err.message ||
          "Unable to remove this clothing item."
      );
    }
  };


  if (loading) {
    return (
      <div className="page">
        <LoadingState
          text="Loading clothing details..."
        />
      </div>
    );
  }


  if (error) {
    return (
      <div className="page">
        <button
          className="back-btn"
          onClick={() => nav("/closet")}
        >
          <ArrowLeft size={17} />
          Back to closet
        </button>

        <div className="form-error">
          {error}
        </div>
      </div>
    );
  }


  if (!item) {
    return (
      <div className="page">
        <button
          className="back-btn"
          onClick={() => nav("/closet")}
        >
          <ArrowLeft size={17} />
          Back to closet
        </button>

        <div className="form-error">
          This clothing item could not be found.
        </div>
      </div>
    );
  }


  const attrs = [
  "category",
  "articleType",
  "color",
  "pattern",
  "fabric",
  "sleeve",
  "neckline",
  "fit",
  "length",
  "style",
  "occasion",
];


  return (
    <div className="page">

      <button
        className="back-btn"
        onClick={() => nav("/closet")}
      >
        <ArrowLeft size={17} />
        Back to closet
      </button>


      <div className="detail-layout">

        <div className="detail-image">
          <img
            src={item.image}
            alt={
              item.name ||
              "Clothing item"
            }
          />
        </div>


        <div className="detail-copy">

          <div className="eyebrow">
            GARMENT DETAIL
          </div>


          <h1>
            {item.name}
          </h1>


          <div className="pill-row">

            {item.category && (
              <Pill>
                {item.category}
              </Pill>
            )}

            {item.articleType && (
              <Pill>
                {item.articleType}
              </Pill>
            )}

          </div>


          <div className="attribute-list">

            {attrs.map((key) => {

              const rawValue = item[key];

const value =
  Array.isArray(rawValue)
    ? rawValue.join(", ")
    : rawValue &&
      typeof rawValue === "object"
    ? JSON.stringify(rawValue)
    : rawValue;


              return (
                <div key={key}>

                  <span>
                    {key.replaceAll(
                      "_",
                      " "
                    )}
                  </span>

                  <strong>
                    {value || "—"}
                  </strong>

                </div>
              );
            })}

          </div>


          <div className="detail-section">

            <h3>
              <Sparkles size={16} />
              AI Confidence
            </h3>

           <Confidence
  confidence={
    item.confidence?.ai ||
    item.confidence ||
    {}
  }
/>

          </div>


          <div className="detail-actions">

            <Button
              className="btn-dark"
              onClick={() =>
                nav(
                  `/outfit-generator?item=${item.id}`
                )
              }
            >
              <Sparkles size={17} />
              Generate outfit
            </Button>


            <button
              className="icon-btn bordered"
              aria-label="Favorite"
            >
              <Heart />
            </button>


            <button
              className="icon-btn bordered danger"
              onClick={handleDelete}
              aria-label="Remove from closet"
            >
              <Trash2 />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}