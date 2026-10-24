import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Plus,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  Shirt,
  CloudSun,
  Heart,
  WandSparkles,
} from "lucide-react";

import { services } from "../api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import {
  PageHeader,
  WeatherCard,
  OutfitCard,
  LoadingState,
} from "../components/UI";


/* =========================================================
   HELPERS
   ========================================================= */

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");


function getImageUrl(image) {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${API_ORIGIN}${image}`;
  }

  return `${API_ORIGIN}/${image}`;
}


function getFirstName(name) {
  if (!name) return "there";

  return name
    .trim()
    .split(/\s+/)[0];
}


function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}


function getItemName(item) {
  return (
    item?.articleType ||
    item?.article_type ||
    item?.name ||
    item?.subcategory ||
    item?.category ||
    "Wardrobe piece"
  );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

export default function Dashboard() {
  const { user } = useAuth();

  const {
    closet,
    setCloset,
  } = useApp();

  const [weather, setWeather] = useState(null);
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [heroIndex, setHeroIndex] = useState(0);
  const [quickActionIndex, setQuickActionIndex] = useState(0);


  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [
          closetItems,
          weatherData,
          savedOutfits,
        ] = await Promise.all([
          services.closet.getItems(),
          services.weather.getWeather(),
          services.outfit.getSaved(),
        ]);

        setCloset(closetItems || []);
        setWeather(weatherData);
        setOutfits(savedOutfits || []);
      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [setCloset]);


  /* =======================================================
     ROTATING HERO CONTENT
     ======================================================= */

  const heroSlides = useMemo(() => {
    const count = closet.length;

    return [
      {
        eyebrow: "YOUR WARDROBE",
        title: "Style starts",
        accent: "with what you own.",
        description:
          count > 0
            ? `${count} pieces in your digital closet. Let StyleBuddy turn them into your next look.`
            : "Build your digital closet and let StyleBuddy turn your wardrobe into complete looks.",
        icon: Shirt,
      },

      {
        eyebrow: "TODAY'S STYLE",
        title: "A better outfit",
        accent: "is one click away.",
        description:
          "Tell StyleBuddy where you're going, what you're doing, or simply let it create something for you.",
        icon: Sparkles,
      },

      {
        eyebrow: "AI PERSONAL STYLIST",
        title: "Your closet.",
        accent: "Your possibilities.",
        description:
          "Explore new combinations from the clothes you already own, with your style and today's conditions in mind.",
        icon: WandSparkles,
      },
    ];
  }, [closet.length]);


  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((current) =>
        (current + 1) % heroSlides.length
      );
    }, 4500);

    return () => clearInterval(timer);
  }, [heroSlides.length]);


  const activeSlide =
    heroSlides[heroIndex];

  const ActiveIcon =
    activeSlide.icon;


  /* =======================================================
     REAL CLOSET ITEMS FOR HERO
     ======================================================= */

  const heroClosetItems = useMemo(() => {
    return closet
      .filter(
        (item) =>
          item?.image ||
          item?.imageUrl
      )
      .slice(0, 4);
  }, [closet]);


  /* =======================================================
     DYNAMIC QUICK ACTIONS
     ======================================================= */

  const quickActions = useMemo(() => {
    const firstItem = closet?.[0];

    const firstItemName =
      firstItem?.articleType ||
      firstItem?.article_type ||
      firstItem?.name ||
      firstItem?.subcategory ||
      firstItem?.category ||
      "your wardrobe";

    return [
      {
        title: "Add clothes",
        description:
          closet.length > 0
            ? `${closet.length} pieces already added. Keep building your wardrobe.`
            : "Start building your digital wardrobe.",
        icon: Plus,
        to: "/closet?upload=1",
        label: "GROW YOUR CLOSET",
      },
      {
        title: "Ask AI Stylist",
        description:
          closet.length > 0
            ? `Ask StyleBuddy what to wear with ${firstItemName}.`
            : "Get personalised outfit recommendations.",
        icon: MessageCircle,
        to: "/stylist",
        label: "PERSONAL STYLE",
      },
      {
        title: "Create outfit",
        description:
          closet.length > 0
            ? "Build a complete look from pieces you already own."
            : "Start with an occasion and create your first look.",
        icon: Sparkles,
        to: "/outfit-generator",
        label: "CREATE A LOOK",
      },
      {
        title: "Shop the look",
        description:
          closet.length > 0
            ? "Find pieces that genuinely complete your wardrobe."
            : "Discover pieces to start your wardrobe.",
        icon: ShoppingBag,
        to: "/shop",
        label: "SMART SHOPPING",
      },
    ];
  }, [closet]);


  useEffect(() => {
    const timer = setInterval(() => {
      setQuickActionIndex((current) =>
        (current + 1) % quickActions.length
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [quickActions.length]);


  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="page">
        <LoadingState
          text="Loading your StyleBuddy dashboard..."
        />
      </div>
    );
  }


  /* =======================================================
     DASHBOARD
     ======================================================= */

  return (
    <div className="page">

      {/* ===================================================
          PAGE HEADER
          =================================================== */}

      <PageHeader
        eyebrow="YOUR STYLE SPACE"
        title={`${getGreeting()}, ${getFirstName(
          user?.name
        )}.`}
        description="Your wardrobe, your style, your next look."
      />


      {/* ===================================================
          NEW DYNAMIC HERO
          =================================================== */}

      <section className="sb-dashboard-hero">

        {/* BACKGROUND DECORATION */}

        <div className="sb-hero-glow sb-glow-one" />
        <div className="sb-hero-glow sb-glow-two" />


        {/* LEFT CONTENT */}

        <div className="sb-hero-content">

          <div
            key={`eyebrow-${heroIndex}`}
            className="sb-hero-eyebrow sb-slide-in"
          >
            <span className="sb-live-dot" />
            {activeSlide.eyebrow}
          </div>


          <div
            key={`title-${heroIndex}`}
            className="sb-slide-in"
          >
            <h2 className="sb-dashboard-hero-title">
              {activeSlide.title}
              <br />
              <em>{activeSlide.accent}</em>
            </h2>

            <p className="sb-dashboard-hero-description">
              {activeSlide.description}
            </p>
          </div>


          {/* CTA */}

          <div className="sb-hero-actions">

            <Link
              to="/outfit-generator"
              className="sb-primary-hero-button"
            >
              <span>
                Generate today's look
              </span>

              <ArrowUpRight size={17} />
            </Link>

            <Link
              to="/stylist"
              className="sb-secondary-hero-button"
            >
              <Sparkles size={15} />
              Ask AI Stylist
            </Link>

          </div>


          {/* HERO META */}

          <div className="sb-hero-meta">

            <div>
              <strong>
                {closet.length}
              </strong>

              <span>
                pieces in closet
              </span>
            </div>

            <div className="sb-meta-divider" />

            <div>
              <strong>
                {outfits.length}
              </strong>

              <span>
                saved looks
              </span>
            </div>

            <div className="sb-meta-divider" />

            <div>
              <strong>
                92%
              </strong>

              <span>
                style match
              </span>
            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT VISUAL STAGE
            ================================================= */}

        <div className="sb-hero-visual">

          {/* MAIN CIRCLE */}

          <div className="sb-style-orbit">

            <div className="sb-orbit-ring ring-one" />
            <div className="sb-orbit-ring ring-two" />


            <div className="sb-style-center">

              <div className="sb-center-icon">
                <ActiveIcon size={25} />
              </div>

              <span>
                STYLEBUDDY
              </span>

              <strong>
                {activeSlide.eyebrow
                  .replace("AI PERSONAL STYLIST", "AI STYLIST")
                  .replace("YOUR WARDROBE", "YOUR CLOSET")
                  .replace("TODAY'S STYLE", "TODAY'S LOOK")}
              </strong>

              <small>
                PERSONALIZED FOR YOU
              </small>

            </div>

          </div>


          {/* REAL CLOSET IMAGE CARDS */}

          {heroClosetItems.map(
            (item, index) => {

              const image = getImageUrl(
                item.image ||
                item.imageUrl
              );

              return (
                <div
                  key={
                    item.id ||
                    `${index}-${getItemName(item)}`
                  }
                  className={`sb-floating-garment garment-${index + 1}`}
                >

                  {image ? (
                    <img
                      src={image}
                      alt={getItemName(item)}
                    />
                  ) : (
                    <Shirt size={20} />
                  )}

                  <div className="sb-garment-label">
                    {getItemName(item)}
                  </div>

                </div>
              );
            }
          )}


          {/* WEATHER FLOATING CARD */}

          {weather && (
            <div className="sb-floating-weather-card">

              <div className="sb-weather-mini-icon">
                <CloudSun size={19} />
              </div>

              <div>
                <span>
                  TODAY
                </span>

                <strong>
                  Weather aware
                </strong>

                <small>
                  Your outfit adapts to the day.
                </small>
              </div>

            </div>
          )}


          {/* STYLE MATCH CARD */}

          <div className="sb-floating-match-card">

            <div className="sb-match-top">
              <span>
                STYLE MATCH
              </span>

              <Heart size={14} />
            </div>

            <strong>
              92%
            </strong>

            <div className="sb-match-bar">
              <span />
            </div>

            <small>
              Based on your style
            </small>

          </div>


          {/* ROTATING LABEL */}

          <div className="sb-orbit-label">
            <span>WARDROBE</span>
            <b>✦</b>
            <span>STYLE</span>
            <b>✦</b>
            <span>AI</span>
            <b>✦</b>
            <span>PERSONAL</span>
          </div>

        </div>

      </section>


      {/* =================================================
          HERO DOTS
          ================================================= */}

      <div className="sb-hero-pagination">

        {heroSlides.map(
          (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                setHeroIndex(index)
              }
              className={
                index === heroIndex
                  ? "active"
                  : ""
              }
              aria-label={`Show hero ${index + 1}`}
            />
          )
        )}

      </div>


      {/* =========================================
          REAL DASHBOARD STATS
          ========================================= */}

      <div className="stats-row">

        <div>
          <span>
            Closet items
          </span>

          <strong>
            {closet.length}
          </strong>
        </div>


        <div>
          <span>
            Outfits created
          </span>

          <strong>
            —
          </strong>
        </div>


        <div>
          <span>
            Saved looks
          </span>

          <strong>
            {outfits.length}
          </strong>
        </div>


        <div>
          <span>
            Style match
          </span>

          <strong>
            92%
          </strong>
        </div>

      </div>


      {/* =========================================
          DYNAMIC QUICK ACTIONS
          ========================================= */}

      <section className="sb-quick-section">

        <div className="sb-quick-heading">

          <div>
            <div className="eyebrow">
              QUICK ACTIONS
            </div>

            <h2>
              What do you want to do?
            </h2>

            <p>
              Your wardrobe is ready. Choose where you want to start.
            </p>
          </div>

          <div className="sb-quick-status">
            <span className="sb-status-dot" />
            STYLEBUDDY READY
          </div>

        </div>


        <div className="sb-quick-grid">

          {quickActions.map((action, index) => {

            const Icon = action.icon;

            const isActive =
              index === quickActionIndex;

            return (
              <Link
                key={action.title}
                to={action.to}
                className={`sb-quick-card ${
                  isActive ? "is-active" : ""
                }`}
                onMouseEnter={() =>
                  setQuickActionIndex(index)
                }
              >

                <div className="sb-quick-card-top">

                  <span className="sb-quick-number">
                    0{index + 1}
                  </span>

                  <span className="sb-quick-label">
                    {action.label}
                  </span>

                </div>


                <div className="sb-quick-icon">
                  <Icon size={22} />
                </div>


                <div className="sb-quick-content">

                  <h3>
                    {action.title}
                  </h3>

                  <p>
                    {action.description}
                  </p>

                </div>


                <div className="sb-quick-arrow">
                  <ArrowUpRight size={18} />
                </div>


                <div className="sb-quick-progress">

                  <span
                    className={
                      isActive
                        ? "running"
                        : ""
                    }
                  />

                </div>

              </Link>
            );
          })}

        </div>


        <div className="sb-quick-pagination">

          {quickActions.map((action, index) => (

            <button
              key={action.title}
              type="button"
              className={
                index === quickActionIndex
                  ? "active"
                  : ""
              }
              onClick={() =>
                setQuickActionIndex(index)
              }
              aria-label={`Show ${action.title}`}
            />

          ))}

        </div>

      </section>


      {/* =========================================
          SAVED LOOKS
          ========================================= */}

      <section>

        <div className="section-head">

          <div>

            <div className="eyebrow">
              RECENTLY CREATED
            </div>

            <h2>
              Your saved looks
            </h2>

          </div>


          <Link
            to="/outfits"
            className="text-link"
          >
            View all
            <ArrowUpRight size={15} />
          </Link>

        </div>


        {outfits.length > 0 ? (

          <div className="outfit-grid">

            {outfits
              .slice(0, 3)
              .map((outfit) => (

                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                />

              ))}

          </div>

        ) : (

          <div
            style={{
              padding: "32px 0",
              color: "#777",
            }}
          >
            You haven't saved any looks yet.
          </div>

        )}

      </section>


      {/* =================================================
          DASHBOARD HERO STYLES
          ================================================= */}

      <style>{`

        /* ================================================
           HERO
           ================================================ */

        .sb-dashboard-hero {
          position: relative;
          min-height: 500px;
          margin-top: 28px;
          overflow: hidden;
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 80% 20%,
              rgba(205, 191, 165, .24),
              transparent 32%
            ),
            radial-gradient(
              circle at 20% 90%,
              rgba(235, 225, 210, .75),
              transparent 34%
            ),
            #eeeae1;
          border: 1px solid rgba(0,0,0,.06);
          display: grid;
          grid-template-columns: 1.02fr .98fr;
        }


        .sb-hero-content {
          position: relative;
          z-index: 5;
          padding: 62px 48px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }


        .sb-hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #777065;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .18em;
          margin-bottom: 22px;
        }


        .sb-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #171717;
          animation: sbPulse 2s infinite;
        }


        .sb-dashboard-hero-title {
          max-width: 620px;
          margin: 0;
          color: #151515;
          font-size: clamp(44px, 5vw, 72px);
          line-height: .94;
          letter-spacing: -.055em;
          font-weight: 700;
        }


        .sb-dashboard-hero-title em {
          font-family: Georgia, "Times New Roman", serif;
          font-weight: 400;
          letter-spacing: -.045em;
        }


        .sb-dashboard-hero-description {
          max-width: 510px;
          margin: 24px 0 0;
          color: #77736c;
          font-size: 15px;
          line-height: 1.65;
        }


        /* ================================================
           BUTTONS
           ================================================ */

        .sb-hero-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
          flex-wrap: wrap;
        }


        .sb-primary-hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 50px;
          padding: 0 20px;
          border-radius: 13px;
          background: #111;
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }


        .sb-primary-hero-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,0,0,.15);
        }


        .sb-secondary-hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 50px;
          padding: 0 17px;
          border: 1px solid rgba(0,0,0,.1);
          border-radius: 13px;
          background: rgba(255,255,255,.48);
          color: #222;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          backdrop-filter: blur(10px);
          transition:
            background .25s ease,
            transform .25s ease;
        }


        .sb-secondary-hero-button:hover {
          background: rgba(255,255,255,.8);
          transform: translateY(-2px);
        }


        /* ================================================
           META
           ================================================ */

        .sb-hero-meta {
          display: flex;
          align-items: center;
          gap: 22px;
          margin-top: 40px;
        }


        .sb-hero-meta div:not(.sb-meta-divider) {
          display: flex;
          flex-direction: column;
        }


        .sb-hero-meta strong {
          color: #171717;
          font-size: 18px;
          line-height: 1;
        }


        .sb-hero-meta span {
          margin-top: 5px;
          color: #89847c;
          font-size: 9px;
          letter-spacing: .08em;
          text-transform: uppercase;
        }


        .sb-meta-divider {
          width: 1px;
          height: 28px;
          background: rgba(0,0,0,.1);
        }


        /* ================================================
           VISUAL
           ================================================ */

        .sb-hero-visual {
          position: relative;
          min-height: 500px;
          overflow: hidden;
        }


        .sb-hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(1px);
          pointer-events: none;
        }


        .sb-glow-one {
          width: 320px;
          height: 320px;
          right: 7%;
          top: 10%;
          background: rgba(255,255,255,.6);
        }


        .sb-glow-two {
          width: 230px;
          height: 230px;
          left: 5%;
          bottom: -30px;
          background: rgba(198,185,163,.2);
        }


        /* ================================================
           ORBIT
           ================================================ */

        .sb-style-orbit {
          position: absolute;
          width: 310px;
          height: 310px;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
        }


        .sb-orbit-ring {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(0,0,0,.1);
          border-radius: 50%;
        }


        .ring-one {
          animation: sbRotate 18s linear infinite;
        }


        .ring-two {
          inset: 28px;
          border-style: dashed;
          animation: sbRotateReverse 24s linear infinite;
        }


        .sb-style-center {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 170px;
          height: 170px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: rgba(255,255,255,.68);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow:
            0 25px 60px rgba(70,63,51,.12),
            inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(15px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }


        .sb-center-icon {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #151515;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 11px;
        }


        .sb-style-center span {
          color: #9a948a;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .2em;
        }


        .sb-style-center strong {
          margin-top: 6px;
          color: #171717;
          font-size: 11px;
          letter-spacing: .08em;
        }


        .sb-style-center small {
          margin-top: 7px;
          color: #aaa49a;
          font-size: 6px;
          letter-spacing: .14em;
        }


        /* ================================================
           FLOATING GARMENTS
           ================================================ */

        .sb-floating-garment {
          position: absolute;
          z-index: 4;
          width: 82px;
          height: 104px;
          padding: 6px;
          border-radius: 15px;
          background: rgba(255,255,255,.74);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 20px 35px rgba(0,0,0,.1);
          backdrop-filter: blur(12px);
          overflow: hidden;
          animation: sbFloat 5s ease-in-out infinite;
        }


        .sb-floating-garment img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 10px;
        }


        .sb-garment-label {
          position: absolute;
          left: 7px;
          right: 7px;
          bottom: 7px;
          padding: 4px 5px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          border-radius: 6px;
          background: rgba(255,255,255,.84);
          color: #333;
          font-size: 6px;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }


        .garment-1 {
          left: 8%;
          top: 15%;
        }


        .garment-2 {
          right: 7%;
          top: 13%;
          animation-delay: -1.4s;
        }


        .garment-3 {
          left: 11%;
          bottom: 19%;
          animation-delay: -2.2s;
        }


        .garment-4 {
          right: 11%;
          bottom: 17%;
          animation-delay: -3.1s;
        }


        /* ================================================
           WEATHER
           ================================================ */

        .sb-floating-weather-card {
          position: absolute;
          z-index: 6;
          left: 5%;
          bottom: 7%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 13px;
          border-radius: 13px;
          background: rgba(24,23,21,.92);
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,.18);
          animation: sbFloatReverse 5.5s ease-in-out infinite;
        }


        .sb-weather-mini-icon {
          width: 33px;
          height: 33px;
          border-radius: 10px;
          background: rgba(255,255,255,.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ddd4c5;
        }


        .sb-floating-weather-card span,
        .sb-floating-weather-card strong,
        .sb-floating-weather-card small {
          display: block;
        }


        .sb-floating-weather-card span {
          color: #8e8980;
          font-size: 6px;
          letter-spacing: .15em;
        }


        .sb-floating-weather-card strong {
          margin-top: 3px;
          color: #eeeae2;
          font-size: 10px;
        }


        .sb-floating-weather-card small {
          margin-top: 2px;
          color: #858078;
          font-size: 7px;
        }


        /* ================================================
           MATCH CARD
           ================================================ */

        .sb-floating-match-card {
          position: absolute;
          z-index: 6;
          right: 5%;
          bottom: 8%;
          width: 105px;
          padding: 13px;
          border-radius: 14px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 20px 40px rgba(0,0,0,.09);
          backdrop-filter: blur(14px);
          animation: sbFloat 5s ease-in-out infinite;
          animation-delay: -2s;
        }


        .sb-match-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }


        .sb-match-top span {
          color: #888177;
          font-size: 6px;
          letter-spacing: .13em;
          font-weight: 700;
        }


        .sb-match-top svg {
          color: #7b7469;
        }


        .sb-floating-match-card strong {
          display: block;
          margin-top: 6px;
          font-size: 25px;
          letter-spacing: -.05em;
        }


        .sb-match-bar {
          height: 4px;
          margin-top: 7px;
          border-radius: 99px;
          background: rgba(0,0,0,.08);
          overflow: hidden;
        }


        .sb-match-bar span {
          display: block;
          width: 92%;
          height: 100%;
          border-radius: inherit;
          background: #171717;
        }


        .sb-floating-match-card small {
          display: block;
          margin-top: 6px;
          color: #99938a;
          font-size: 7px;
        }


        /* ================================================
           TICKER
           ================================================ */

        .sb-orbit-label {
          position: absolute;
          z-index: 2;
          left: 5%;
          right: 5%;
          bottom: 2.5%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          color: #aaa399;
          font-size: 6px;
          font-weight: 700;
          letter-spacing: .2em;
        }


        .sb-orbit-label b {
          color: #6d675e;
        }


        /* ================================================
           PAGINATION
           ================================================ */

        .sb-hero-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin: 13px 0 25px;
        }


        .sb-hero-pagination button {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #d2cec6;
          cursor: pointer;
          transition:
            width .25s ease,
            background .25s ease;
        }


        .sb-hero-pagination button.active {
          width: 24px;
          border-radius: 99px;
          background: #171717;
        }


        /* ================================================
           ANIMATIONS
           ================================================ */

        .sb-slide-in {
          animation: sbSlideIn .55s ease both;
        }


        @keyframes sbSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        @keyframes sbFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-9px) rotate(1deg);
          }
        }


        @keyframes sbFloatReverse {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(8px) rotate(-1deg);
          }
        }


        @keyframes sbRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }


        @keyframes sbRotateReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }


        @keyframes sbPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(20,20,20,.15);
          }

          50% {
            box-shadow: 0 0 0 6px rgba(20,20,20,0);
          }
        }


        /* ================================================
           DYNAMIC QUICK ACTIONS
           ================================================ */

        .sb-quick-section {
          margin-top: 62px;
          margin-bottom: 70px;
        }


        .sb-quick-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 25px;
        }


        .sb-quick-heading h2 {
          margin: 5px 0 0;
        }


        .sb-quick-heading p {
          margin: 9px 0 0;
          color: #888177;
          font-size: 13px;
        }


        .sb-quick-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 999px;
          background: rgba(255,255,255,.55);
          color: #8a847b;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          white-space: nowrap;
        }


        .sb-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #171717;
          animation: sbQuickPulse 2s infinite;
        }


        .sb-quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }


        .sb-quick-card {
          position: relative;
          min-height: 225px;
          padding: 22px;
          overflow: hidden;

          display: flex;
          flex-direction: column;

          border: 1px solid rgba(0,0,0,.08);
          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.95),
              rgba(246,243,237,.8)
            );

          color: #171717;
          text-decoration: none;

          transition:
            transform .35s cubic-bezier(.2,.8,.2,1),
            box-shadow .35s ease,
            border-color .35s ease,
            background .35s ease;
        }


        .sb-quick-card:hover {
          transform: translateY(-7px);
          border-color: rgba(0,0,0,.16);
          box-shadow: 0 20px 45px rgba(35,30,22,.10);
        }


        .sb-quick-card.is-active {
          transform: translateY(-5px);

          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(255,255,255,.9),
              transparent 30%
            ),
            #e9e4da;

          border-color: rgba(0,0,0,.14);

          box-shadow: 0 18px 40px rgba(35,30,22,.09);
        }


        .sb-quick-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }


        .sb-quick-number {
          color: #aaa49b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
        }


        .sb-quick-label {
          color: #a19a90;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .16em;
        }


        .sb-quick-icon {
          width: 48px;
          height: 48px;

          margin-top: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: #f0ede7;
          border: 1px solid rgba(0,0,0,.06);

          transition:
            transform .35s ease,
            background .35s ease;
        }


        .sb-quick-card.is-active .sb-quick-icon {
          background: #171717;
          color: #fff;
          transform: rotate(-4deg) scale(1.06);
        }


        .sb-quick-card:hover .sb-quick-icon {
          transform: translateY(-2px) rotate(-3deg);
        }


        .sb-quick-content {
          margin-top: auto;
          padding-top: 22px;
          padding-right: 20px;
        }


        .sb-quick-content h3 {
          margin: 0;
          color: #171717;
          font-size: 17px;
          line-height: 1.2;
          letter-spacing: -.025em;
        }


        .sb-quick-content p {
          margin: 8px 0 0;
          max-width: 220px;
          color: #817b72;
          font-size: 11px;
          line-height: 1.55;
        }


        .sb-quick-arrow {
          position: absolute;
          right: 19px;
          bottom: 22px;

          width: 30px;
          height: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: rgba(0,0,0,.05);
          color: #555;

          transition:
            transform .3s ease,
            background .3s ease,
            color .3s ease;
        }


        .sb-quick-card:hover .sb-quick-arrow,
        .sb-quick-card.is-active .sb-quick-arrow {
          transform: translate(2px,-2px);
          background: #171717;
          color: #fff;
        }


        .sb-quick-progress {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: rgba(0,0,0,.04);
        }


        .sb-quick-progress span {
          display: block;
          width: 0;
          height: 100%;
          background: #171717;
        }


        .sb-quick-progress span.running {
          animation: sbQuickProgress 3s linear forwards;
        }


        .sb-quick-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          margin-top: 15px;
        }


        .sb-quick-pagination button {
          width: 6px;
          height: 6px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #d3cec5;
          cursor: pointer;

          transition:
            width .25s ease,
            background .25s ease;
        }


        .sb-quick-pagination button.active {
          width: 24px;
          border-radius: 99px;
          background: #171717;
        }


        @keyframes sbQuickProgress {
          from {
            width: 0;
          }

          to {
            width: 100%;
          }
        }


        @keyframes sbQuickPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(20,20,20,.15);
          }

          50% {
            box-shadow: 0 0 0 6px rgba(20,20,20,0);
          }
        }


        /* ================================================
           RESPONSIVE
           ================================================ */

        @media (max-width: 1000px) {

          .sb-dashboard-hero {
            grid-template-columns: 1fr;
          }


          .sb-hero-content {
            padding-bottom: 30px;
          }


          .sb-hero-visual {
            min-height: 390px;
          }


          .sb-style-orbit {
            top: 50%;
          }

        }


        @media (max-width: 620px) {

          .sb-quick-heading {
            align-items: flex-start;
            flex-direction: column;
          }


          .sb-quick-status {
            display: none;
          }


          .sb-quick-grid {
            grid-template-columns: 1fr;
          }


          .sb-quick-card {
            min-height: 190px;
          }


          .sb-dashboard-hero {
            min-height: auto;
            border-radius: 22px;
          }


          .sb-hero-content {
            padding: 38px 25px 25px;
          }


          .sb-dashboard-hero-title {
            font-size: 43px;
          }


          .sb-dashboard-hero-description {
            font-size: 13px;
          }


          .sb-hero-meta {
            gap: 13px;
          }


          .sb-hero-meta span {
            font-size: 7px;
          }


          .sb-hero-visual {
            min-height: 360px;
          }


          .sb-style-orbit {
            width: 230px;
            height: 230px;
          }


          .sb-style-center {
            width: 135px;
            height: 135px;
          }


          .sb-floating-garment {
            width: 64px;
            height: 82px;
          }


          .sb-floating-weather-card {
            transform: scale(.82);
            transform-origin: bottom left;
          }


          .sb-floating-match-card {
            transform: scale(.82);
            transform-origin: bottom right;
          }


          .garment-1 {
            left: 3%;
          }


          .garment-2 {
            right: 3%;
          }


          .garment-3 {
            left: 6%;
          }


          .garment-4 {
            right: 6%;
          }

        }

      `}</style>

    </div>
  );
}