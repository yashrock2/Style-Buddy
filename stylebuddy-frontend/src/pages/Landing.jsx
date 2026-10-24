import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  CloudSun,
  MessageCircle,
  ShoppingBag,
  ScanFace,
  Heart,
  SlidersHorizontal,
  Check,
  Search,
  WandSparkles,
} from "lucide-react";

const features = [
  [
    "AI Clothing Scanner",
    "Turn everyday clothing photos into structured digital wardrobe items.",
    ScanFace,
  ],
  [
    "Digital Closet",
    "Search, filter and understand everything you already own.",
    Shirt,
  ],
  [
    "AI Personal Stylist",
    "Have a natural conversation with a stylist that knows your closet.",
    MessageCircle,
  ],
  [
    "Weather-Aware Styling",
    "Bring temperature and conditions into every recommendation.",
    CloudSun,
  ],
  [
    "Personalization",
    "Style around your preferences, colors, fit and occasions.",
    SlidersHorizontal,
  ],
  [
    "Shopping Assistant",
    "Complete the look only when your wardrobe needs something.",
    ShoppingBag,
  ],
];

const heroLooks = [
  {
    occasion: "COLLEGE DAY",
    request: "What should I wear to college?",
    style: "Casual",
    temperature: "28°C",
    match: "94%",
    items: [
      {
        name: "Blue T-shirt",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "Black Jeans",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "White Sneakers",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=85",
      },
    ],
  },
  {
    occasion: "WEEKEND",
    request: "Give me something relaxed.",
    style: "Relaxed",
    temperature: "30°C",
    match: "91%",
    items: [
      {
        name: "White Shirt",
        image:
          "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "Beige Trousers",
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "Casual Sneakers",
        image:
          "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=500&q=85",
      },
    ],
  },
  {
    occasion: "DATE NIGHT",
    request: "Create a smart casual look.",
    style: "Smart Casual",
    temperature: "27°C",
    match: "96%",
    items: [
      {
        name: "Black Shirt",
        image:
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "Dark Trousers",
        image:
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=500&q=85",
      },
      {
        name: "Loafers",
        image:
          "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=500&q=85",
      },
    ],
  },
];

export default function Landing() {
  const [lookIndex, setLookIndex] = useState(0);
  const [isBuilding, setIsBuilding] = useState(true);
  const [howProgress, setHowProgress] = useState(0);
  const [howDistance, setHowDistance] = useState(0);
  const howSectionRef = useRef(null);
  const howTrackRef = useRef(null);
  const howViewportRef = useRef(null);

  const currentLook = heroLooks[lookIndex];

  useEffect(() => {
    const buildingTimer = setTimeout(() => {
      setIsBuilding(false);
    }, 2300);

    const changeLookTimer = setTimeout(() => {
      setIsBuilding(true);

      setLookIndex((current) => {
        return (current + 1) % heroLooks.length;
      });
    }, 6000);

    return () => {
      clearTimeout(buildingTimer);
      clearTimeout(changeLookTimer);
    };
  }, [lookIndex]);

useEffect(() => {
  const section = howSectionRef.current;
  const track = howTrackRef.current;
  const viewport = howViewportRef.current;

  if (!section || !track || !viewport) return;

  let isVisible = false;
  let timer = null;
  let resumeTimer = null;
  let isUserScrolling = false;

  const clamp = (value, min = 0, max = 1) =>
    Math.min(Math.max(value, min), max);

  const updateTrackDistance = () => {
    setHowDistance(Math.max(track.scrollWidth - viewport.clientWidth, 0));
  };

  const updateManualProgress = () => {
    if (!isVisible || window.innerWidth <= 850 || isUserScrolling === false) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrollableDistance = Math.max(
      section.offsetHeight - window.innerHeight,
      1
    );

    const progress = clamp(-rect.top / scrollableDistance);
    setHowProgress(progress);
  };

  const startAutoPlay = () => {
    if (timer || !isVisible || isUserScrolling) return;

    timer = window.setInterval(() => {
      setHowProgress((current) => {
        const next = current + 0.2;
        return next >= 1 ? 0 : Number(next.toFixed(2));
      });
    }, 2600);
  };

  const stopAutoPlay = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const resumeAutoPlay = () => {
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }

    resumeTimer = window.setTimeout(() => {
      isUserScrolling = false;
      startAutoPlay();
    }, 3500);
  };

  const handleScroll = () => {
    if (!isVisible || window.innerWidth <= 850) return;

    isUserScrolling = true;
    stopAutoPlay();
    updateManualProgress();
    resumeAutoPlay();
  };

  const handleResize = () => {
    updateTrackDistance();

    if (window.innerWidth <= 850) {
      stopAutoPlay();
      return;
    }

    updateManualProgress();
    if (isVisible && !isUserScrolling) {
      startAutoPlay();
    }
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting && window.innerWidth > 850;

      if (isVisible) {
        isUserScrolling = false;
        updateTrackDistance();
        startAutoPlay();
      } else {
        stopAutoPlay();
        if (resumeTimer) {
          window.clearTimeout(resumeTimer);
          resumeTimer = null;
        }
      }
    },
    {
      threshold: 0.2,
    }
  );

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", handleResize);
  updateTrackDistance();
  observer.observe(section);

  return () => {
    stopAutoPlay();
    if (resumeTimer) {
      window.clearTimeout(resumeTimer);
    }
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", handleResize);
    observer.disconnect();
  };
}, []);
  return (
    <div className="landing">
      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>
          StyleBuddy
        </div>

        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
        </div>

        <div className="nav-actions">
          <Link to="/login" className="text-link">
            Sign in
          </Link>

          <Link
            to="/register"
            className="btn btn-dark compact"
          >
            Get started <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* =====================================================
          NEW HERO
          ===================================================== */}

      <section className="sb-hero">

        {/* background atmosphere */}
        <div className="sb-hero-glow sb-glow-one" />
        <div className="sb-hero-glow sb-glow-two" />

        <div className="sb-hero-inner">

          {/* ================= LEFT ================= */}

          <div className="sb-hero-copy">

            <div className="sb-eyebrow">
              <span className="sb-eyebrow-icon">
                <Sparkles size={13} />
              </span>

              AI-POWERED PERSONAL STYLING
            </div>

            <h1>
              Your wardrobe.
              <br />

              <em>Your style.</em>

              <br />

              <span>Made effortless.</span>
            </h1>

            <p className="sb-hero-description">
              StyleBuddy understands what you own, what you're
              dressing for, and how you want to look — then helps
              you build the outfit.
            </p>

            <div className="sb-hero-actions">

              <Link
                to="/register"
                className="sb-primary-button"
              >
                Build my closet
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/stylist"
                className="sb-secondary-button"
              >
                <Sparkles size={15} />
                Try AI Stylist
              </Link>

            </div>

            <div className="sb-proof">

              <span>
                <Check size={13} />
                Closet-first
              </span>

              <span>
                <Check size={13} />
                Weather aware
              </span>

              <span>
                <Check size={13} />
                Personalised
              </span>

            </div>

          </div>

          {/* ================= RIGHT ================= */}

          <div className="sb-hero-stage">

            {/* floating weather */}

            <div className="sb-floating-weather">

              <div className="sb-weather-icon">
                <CloudSun size={17} />
              </div>

              <div>
                <strong>{currentLook.temperature}</strong>
                <span>Light layers</span>
              </div>

            </div>

            {/* floating style match */}

            <div className="sb-floating-match">

              <span>TODAY'S LOOK</span>

              <strong>
                {currentLook.style}
              </strong>

              <div>
                <span>{currentLook.match} style match</span>
                <ArrowRight size={12} />
              </div>

            </div>

            {/* small floating sparkle */}

            <div className="sb-floating-sparkle">
              <WandSparkles size={18} />
            </div>

            {/* MAIN AI WINDOW */}

            <div className="sb-ai-window">

              {/* top bar */}

              <div className="sb-ai-top">

                <div className="sb-ai-brand">

                  <div className="sb-ai-logo">
                    <Sparkles size={15} />
                  </div>

                  <div>
                    <strong>StyleBuddy AI</strong>
                    <span>Your personal stylist</span>
                  </div>

                </div>

                <div className="sb-live">
                  <span />
                  LIVE
                </div>

              </div>

              <div className="sb-ai-line" />

              {/* user question */}

              <div className="sb-question">

                <span>YOU</span>

                <div>
                  {currentLook.request}
                </div>

              </div>

              {/* AI response */}

              <div className="sb-ai-answer">

                <div className="sb-answer-heading">

                  <div>
                    <Sparkles size={12} />
                  </div>

                  <span>
                    {isBuilding
                      ? "Styling your look..."
                      : "Your look is ready"}
                  </span>

                </div>

                {/* outfit cards */}

                <div
                  className={`sb-outfit-cards ${
                    isBuilding
                      ? "sb-building"
                      : "sb-built"
                  }`}
                >

                  {currentLook.items.map((item, index) => (
                    <div
                      className="sb-outfit-item"
                      key={`${lookIndex}-${item.name}`}
                      style={{
                        animationDelay: `${index * 0.18}s`,
                      }}
                    >

                      <div className="sb-item-image">
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      </div>

                      <span>{item.name}</span>

                    </div>
                  ))}

                </div>

                {/* context */}

                <div className="sb-context">

                  <span>
                    <CloudSun size={11} />
                    {currentLook.temperature}
                  </span>

                  <span>
                    <Shirt size={11} />
                    {currentLook.occasion}
                  </span>

                  <span>
                    <Heart size={11} />
                    {currentLook.style}
                  </span>

                </div>

                {/* result */}

                <div
                  className={`sb-result ${
                    isBuilding
                      ? "sb-result-hidden"
                      : "sb-result-visible"
                  }`}
                >

                  <div className="sb-result-check">
                    <Check size={13} />
                  </div>

                  <div>
                    <strong>
                      Perfect match
                    </strong>

                    <span>
                      Built around your wardrobe
                    </span>
                  </div>

                  <em>
                    {currentLook.match}
                  </em>

                </div>

              </div>

              {/* search */}

              <div className="sb-search">

                <Search size={14} />

                <span>
                  Ask me what to wear...
                </span>

                <div>
                  <ArrowRight size={13} />
                </div>

              </div>

            </div>

            {/* floating shopping */}

            <div className="sb-shopping">

              <div className="sb-shopping-icon">
                <ShoppingBag size={15} />
              </div>

              <div>
                <span>SMART SHOPPING</span>
                <strong>
                  Complete your look
                </strong>
              </div>

              <ArrowRight size={13} />

            </div>

          </div>

        </div>

        {/* scroll indicator */}

        <div className="sb-scroll">
          <span>SCROLL TO EXPLORE</span>

          <div>
            <i />
          </div>
        </div>

      </section>

      {/* =====================================================
          HERO-ONLY STYLES
          ===================================================== */}

      <style>{`

        /* ===================================================
           HERO
           =================================================== */

        .sb-hero {
          position: relative;
          min-height: calc(100vh - 80px);
          overflow: hidden;
          background: #f7f6f2;
          display: flex;
          align-items: center;
        }

        .sb-hero-inner {
          position: relative;
          z-index: 2;

          width: min(1360px, calc(100% - 100px));
          margin: 0 auto;

          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          align-items: center;

          gap: 60px;

          padding: 70px 0 85px;
        }

        /* ===================================================
           BACKGROUND
           =================================================== */

        .sb-hero-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }

        .sb-glow-one {
          width: 520px;
          height: 520px;

          right: 2%;
          top: -300px;

          background: rgba(221, 214, 199, 0.35);
        }

        .sb-glow-two {
          width: 420px;
          height: 420px;

          left: 22%;
          bottom: -300px;

          background: rgba(224, 220, 209, 0.28);
        }

        /* ===================================================
           LEFT
           =================================================== */

        .sb-hero-copy {
          position: relative;
          z-index: 5;
          max-width: 650px;
        }

        .sb-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;

          color: #88837a;

          font-size: 10px;
          font-weight: 600;

          letter-spacing: 0.22em;

          margin-bottom: 25px;

          animation: sbFadeUp 0.8s ease both;
        }

        .sb-eyebrow-icon {
          width: 27px;
          height: 27px;

          border: 1px solid #dedbd3;
          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #24231f;
          background: rgba(255,255,255,0.6);
        }

        .sb-hero-copy h1 {
          margin: 0;

          color: #11110f;

          font-size: clamp(58px, 6.2vw, 92px);
          line-height: 0.91;

          letter-spacing: -0.065em;
          font-weight: 650;

          animation: sbFadeUp 0.9s 0.08s ease both;
        }

        .sb-hero-copy h1 em {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.055em;
        }

        .sb-hero-copy h1 span {
          display: inline-block;
        }

        .sb-hero-description {
          max-width: 555px;

          margin: 34px 0 0;

          color: #77736c;

          font-size: 15px;
          line-height: 1.75;

          animation: sbFadeUp 0.9s 0.16s ease both;
        }

        /* ===================================================
           BUTTONS
           =================================================== */

        .sb-hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;

          margin-top: 30px;

          animation: sbFadeUp 0.9s 0.24s ease both;
        }

        .sb-primary-button,
        .sb-secondary-button {
          min-height: 52px;

          padding: 0 21px;

          border-radius: 11px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          text-decoration: none;

          font-size: 13px;
          font-weight: 600;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .sb-primary-button {
          color: white;
          background: #11110f;
        }

        .sb-primary-button:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 35px rgba(17,17,15,0.18);
        }

        .sb-secondary-button {
          color: #1b1a17;

          background: rgba(255,255,255,0.75);

          border: 1px solid #e2ded6;
        }

        .sb-secondary-button:hover {
          transform: translateY(-3px);
          background: white;
        }

        /* ===================================================
           PROOF
           =================================================== */

        .sb-proof {
          display: flex;
          flex-wrap: wrap;

          gap: 18px;

          margin-top: 25px;

          color: #98938a;

          font-size: 11px;

          animation: sbFadeUp 0.9s 0.32s ease both;
        }

        .sb-proof span {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sb-proof svg {
          color: #171714;
        }

        /* ===================================================
           RIGHT STAGE
           =================================================== */

        .sb-hero-stage {
          position: relative;

          min-height: 640px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ===================================================
           AI WINDOW
           =================================================== */

        .sb-ai-window {
          position: relative;
          z-index: 4;

          width: min(515px, 90%);

          padding: 22px;

          border-radius: 25px;

          background: rgba(255,255,255,0.88);

          border: 1px solid rgba(218,215,207,0.95);

          box-shadow:
            0 45px 100px rgba(40,36,28,0.12),
            0 10px 30px rgba(40,36,28,0.05);

          backdrop-filter: blur(20px);

          transform:
            perspective(1000px)
            rotateY(-4deg)
            rotateX(2deg);

          animation:
            sbPanelEntrance 1s 0.15s ease both,
            sbPanelFloat 6s 1.2s ease-in-out infinite;
        }

        .sb-ai-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sb-ai-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sb-ai-logo {
          width: 36px;
          height: 36px;

          border-radius: 10px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          background: #11110f;
        }

        .sb-ai-brand strong {
          display: block;

          color: #22211e;

          font-size: 13px;
        }

        .sb-ai-brand span {
          display: block;

          margin-top: 2px;

          color: #99948a;

          font-size: 9px;
        }

        .sb-live {
          display: flex;
          align-items: center;
          gap: 6px;

          color: #8e897f;

          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .sb-live span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #78a66c;

          animation: sbPulse 2s infinite;
        }

        .sb-ai-line {
          height: 1px;

          margin: 18px 0;

          background: #eae7df;
        }

        /* ===================================================
           QUESTION
           =================================================== */

        .sb-question {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .sb-question > span {
          margin-bottom: 6px;

          color: #aaa59b;

          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .sb-question > div {
          max-width: 82%;

          padding: 11px 14px;

          border-radius: 13px 13px 3px 13px;

          background: #f2f0eb;

          color: #34322e;

          font-size: 11px;
          line-height: 1.45;
        }

        /* ===================================================
           AI ANSWER
           =================================================== */

        .sb-ai-answer {
          margin-top: 20px;
        }

        .sb-answer-heading {
          display: flex;
          align-items: center;
          gap: 7px;

          color: #777269;

          font-size: 10px;
        }

        .sb-answer-heading > div {
          width: 22px;
          height: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background: #eeece6;
          color: #292823;
        }

        /* ===================================================
           OUTFIT
           =================================================== */

        .sb-outfit-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);

          gap: 9px;

          margin-top: 14px;
        }

        .sb-outfit-item {
          opacity: 0;

          transform:
            translateY(20px)
            scale(0.93);
        }

        .sb-building .sb-outfit-item {
          animation:
            sbItemBuild 0.7s ease forwards;
        }

        .sb-built .sb-outfit-item {
          animation:
            sbItemReady 0.6s ease forwards;
        }

        .sb-item-image {
          height: 112px;

          overflow: hidden;

          border-radius: 14px;

          background: #efede7;

          border: 1px solid #e3dfd7;
        }

        .sb-item-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;

          filter: saturate(0.78);

          transition:
            transform 0.4s ease,
            filter 0.4s ease;
        }

        .sb-outfit-item:hover img {
          transform: scale(1.06);
          filter: saturate(1);
        }

        .sb-outfit-item > span {
          display: block;

          margin-top: 7px;

          color: #77736b;

          font-size: 9px;
          font-weight: 600;

          text-align: center;
        }

        /* ===================================================
           CONTEXT
           =================================================== */

        .sb-context {
          display: flex;
          flex-wrap: wrap;

          gap: 6px;

          margin-top: 15px;
        }

        .sb-context span {
          display: flex;
          align-items: center;
          gap: 4px;

          padding: 6px 8px;

          border-radius: 7px;

          color: #858077;

          background: #f6f4ef;

          font-size: 8px;
        }

        /* ===================================================
           RESULT
           =================================================== */

        .sb-result {
          display: flex;
          align-items: center;

          gap: 9px;

          margin-top: 13px;

          padding: 10px 11px;

          border-radius: 10px;

          background: #f5f5f0;

          border: 1px solid #e7e4dc;

          transition:
            opacity 0.5s ease,
            transform 0.5s ease;
        }

        .sb-result-hidden {
          opacity: 0;
          transform: translateY(7px);
        }

        .sb-result-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .sb-result-check {
          width: 24px;
          height: 24px;

          flex-shrink: 0;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          color: white;
          background: #11110f;
        }

        .sb-result > div:nth-child(2) {
          flex: 1;
        }

        .sb-result strong {
          display: block;

          color: #34322e;

          font-size: 9px;
        }

        .sb-result span {
          display: block;

          margin-top: 2px;

          color: #99948b;

          font-size: 8px;
        }

        .sb-result em {
          color: #282720;

          font-family: Georgia, serif;

          font-size: 18px;

          font-style: italic;
        }

        /* ===================================================
           SEARCH
           =================================================== */

        .sb-search {
          display: flex;
          align-items: center;
          gap: 8px;

          height: 41px;

          margin-top: 16px;

          padding: 0 8px 0 12px;

          border-radius: 10px;

          background: white;

          border: 1px solid #e4e1d9;

          color: #aaa59c;

          font-size: 9px;
        }

        .sb-search > div {
          width: 27px;
          height: 27px;

          margin-left: auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          color: white;
          background: #11110f;
        }

        /* ===================================================
           FLOATING WEATHER
           =================================================== */

        .sb-floating-weather {
          position: absolute;

          z-index: 7;

          right: 1%;
          top: 62px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 12px 15px;

          border-radius: 14px;

          background: rgba(255,255,255,0.94);

          border: 1px solid #e1ded6;

          box-shadow:
            0 18px 45px rgba(30,27,21,0.09);

          animation:
            sbFloatEntrance 0.8s 0.7s ease both,
            sbGentleFloat 5s 1.5s ease-in-out infinite;
        }

        .sb-weather-icon {
          width: 31px;
          height: 31px;

          border-radius: 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f1eee7;
        }

        .sb-floating-weather strong {
          display: block;

          color: #292822;

          font-size: 13px;
        }

        .sb-floating-weather span {
          display: block;

          margin-top: 2px;

          color: #969188;

          font-size: 8px;
        }

        /* ===================================================
           MATCH CARD
           =================================================== */

        .sb-floating-match {
          position: absolute;

          z-index: 7;

          left: 0;
          bottom: 115px;

          min-width: 145px;

          padding: 15px 17px;

          border-radius: 14px;

          background: rgba(255,255,255,0.94);

          border: 1px solid #e1ded6;

          box-shadow:
            0 18px 45px rgba(30,27,21,0.09);

          animation:
            sbFloatEntrance 0.8s 0.9s ease both,
            sbGentleFloatReverse 6s 1.5s ease-in-out infinite;
        }

        .sb-floating-match > span:first-child {
          display: block;

          color: #aaa59b;

          font-size: 7px;
          letter-spacing: 0.15em;
        }

        .sb-floating-match strong {
          display: block;

          margin-top: 7px;

          color: #292822;

          font-size: 13px;
        }

        .sb-floating-match > div {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          margin-top: 6px;

          color: #8f8a81;

          font-size: 8px;
        }

        /* ===================================================
           SPARKLE
           =================================================== */

        .sb-floating-sparkle {
          position: absolute;

          z-index: 2;

          left: 9%;
          top: 150px;

          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: rgba(255,255,255,0.6);

          border: 1px solid #e0ddd5;

          color: #38362f;

          animation:
            sbSparkleFloat 5s ease-in-out infinite;
        }

        /* ===================================================
           SHOPPING CARD
           =================================================== */

        .sb-shopping {
          position: absolute;

          z-index: 7;

          right: 1%;
          bottom: 52px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 10px 12px;

          border-radius: 12px;

          color: white;
          background: #11110f;

          box-shadow:
            0 15px 35px rgba(17,17,15,0.18);

          animation:
            sbFloatEntrance 0.8s 1.1s ease both,
            sbGentleFloat 6.5s 2s ease-in-out infinite;
        }

        .sb-shopping-icon {
          width: 28px;
          height: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: rgba(255,255,255,0.1);
        }

        .sb-shopping > div:nth-child(2) {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .sb-shopping span {
          color: #aaa69d;

          font-size: 6px;
          letter-spacing: 0.14em;
        }

        .sb-shopping strong {
          font-size: 9px;
          font-weight: 500;
        }

        /* ===================================================
           SCROLL
           =================================================== */

        .sb-scroll {
          position: absolute;

          z-index: 10;

          left: 50%;
          bottom: 20px;

          transform: translateX(-50%);

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 8px;

          color: #aaa59b;

          font-size: 7px;
          letter-spacing: 0.18em;
        }

        .sb-scroll > div {
          width: 1px;
          height: 30px;

          overflow: hidden;

          background: #d7d3ca;
        }

        .sb-scroll i {
          display: block;

          width: 100%;
          height: 50%;

          background: #282721;

          animation: sbScroll 1.7s infinite;
        }

        /* ===================================================
           ANIMATIONS
           =================================================== */

        @keyframes sbFadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sbPanelEntrance {
          from {
            opacity: 0;

            transform:
              perspective(1000px)
              translateY(35px)
              rotateY(-10deg)
              rotateX(5deg)
              scale(0.95);
          }

          to {
            opacity: 1;

            transform:
              perspective(1000px)
              translateY(0)
              rotateY(-4deg)
              rotateX(2deg)
              scale(1);
          }
        }

        @keyframes sbPanelFloat {
          0%,
          100% {
            transform:
              perspective(1000px)
              translateY(0)
              rotateY(-4deg)
              rotateX(2deg);
          }

          50% {
            transform:
              perspective(1000px)
              translateY(-8px)
              rotateY(-2deg)
              rotateX(2deg);
          }
        }

        @keyframes sbItemBuild {
          0% {
            opacity: 0;
            transform:
              translateY(25px)
              scale(0.88);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }
        }

        @keyframes sbItemReady {
          from {
            opacity: 0;
            transform: scale(0.94);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes sbFloatEntrance {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.92);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sbGentleFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes sbGentleFloatReverse {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(8px);
          }
        }

        @keyframes sbSparkleFloat {
          0%,
          100% {
            transform:
              translate(0, 0)
              rotate(-4deg);
          }

          50% {
            transform:
              translate(8px, -10px)
              rotate(6deg);
          }
        }

        @keyframes sbPulse {
          0% {
            box-shadow:
              0 0 0 0 rgba(120,166,108,0.3);
          }

          70% {
            box-shadow:
              0 0 0 6px rgba(120,166,108,0);
          }

          100% {
            box-shadow:
              0 0 0 0 rgba(120,166,108,0);
          }
        }

        @keyframes sbScroll {
          0% {
            transform: translateY(-100%);
          }

          100% {
            transform: translateY(200%);
          }
        }

        /* ===================================================
           TABLET
           =================================================== */

        @media (max-width: 1050px) {

          .sb-hero-inner {
            grid-template-columns: 1fr;

            gap: 40px;

            padding-top: 55px;
          }

          .sb-hero-copy {
            max-width: 760px;
          }

          .sb-hero-stage {
            min-height: 570px;
          }

        }

        /* ===================================================
           MOBILE
           =================================================== */

        @media (max-width: 650px) {

          .sb-hero {
            min-height: auto;
          }

          .sb-hero-inner {
            width: calc(100% - 36px);

            padding: 45px 0 60px;

            gap: 35px;
          }

          .sb-hero-copy h1 {
            font-size: clamp(48px, 14vw, 67px);
          }

          .sb-hero-description {
            font-size: 14px;

            margin-top: 25px;
          }

          .sb-hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .sb-primary-button,
          .sb-secondary-button {
            width: 100%;
          }

          .sb-proof {
            gap: 11px 17px;
          }

          .sb-hero-stage {
            min-height: 520px;
          }

          .sb-ai-window {
            width: 100%;

            padding: 17px;

            border-radius: 20px;

            transform: none;

            animation:
              sbPanelEntrance 1s 0.15s ease both,
              sbMobileFloat 6s 1.2s ease-in-out infinite;
          }

          .sb-item-image {
            height: 88px;
          }

          .sb-floating-weather {
            right: -3px;
            top: 0;

            transform: scale(0.88);
          }

          .sb-floating-match {
            left: -3px;
            bottom: 65px;

            transform: scale(0.88);
          }

          .sb-shopping {
            right: -3px;
            bottom: 5px;

            transform: scale(0.88);
          }

          .sb-floating-sparkle {
            display: none;
          }

          .sb-scroll {
            display: none;
          }

        }

        @keyframes sbMobileFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }
          /* =========================================================
   DYNAMIC STYLEBUDDY FEATURE SECTION
   ========================================================= */

.sb-features {
  position: relative;
  overflow: hidden;
}

/* ---------------------------------------------------------
   INTRO
   --------------------------------------------------------- */

.sb-features-intro {
  position: relative;
}

.sb-features-intro p {
  max-width: 560px;

  margin-top: 22px;

  color: #858077;

  font-size: 14px;
  line-height: 1.7;
}

/* ---------------------------------------------------------
   GRID
   --------------------------------------------------------- */

.sb-feature-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 14px;

  margin-top: 55px;
}

/* ---------------------------------------------------------
   CARD
   --------------------------------------------------------- */

.sb-feature-card {
  position: relative;

  min-height: 430px;

  padding: 25px;

  overflow: hidden;

  border-radius: 18px;

  background: #fff;

  border: 1px solid #e4e1d9;

  display: flex;
  flex-direction: column;

  cursor: default;

  transition:
    transform 0.45s cubic-bezier(.2,.8,.2,1),
    box-shadow 0.45s ease,
    border-color 0.45s ease;

  animation: sbFeatureReveal 0.8s ease both;
}

.sb-feature-card:nth-child(1) {
  animation-delay: 0.05s;
}

.sb-feature-card:nth-child(2) {
  animation-delay: 0.1s;
}

.sb-feature-card:nth-child(3) {
  animation-delay: 0.15s;
}

.sb-feature-card:nth-child(4) {
  animation-delay: 0.2s;
}

.sb-feature-card:nth-child(5) {
  animation-delay: 0.25s;
}

.sb-feature-card:nth-child(6) {
  animation-delay: 0.3s;
}

.sb-feature-card:hover {
  transform: translateY(-8px);

  border-color: #d4d0c7;

  box-shadow:
    0 25px 55px rgba(35, 31, 25, 0.1);
}

/* ---------------------------------------------------------
   TOP
   --------------------------------------------------------- */

.sb-feature-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sb-feature-number {
  color: #aaa59b;

  font-size: 9px;

  letter-spacing: 0.12em;
}

.sb-feature-arrow {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #817c73;

  border: 1px solid #e5e1d9;

  opacity: 0;

  transform: translate(-5px, 5px);

  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    background 0.3s ease;
}

.sb-feature-card:hover .sb-feature-arrow {
  opacity: 1;

  transform: translate(0, 0);

  background: #f5f3ee;
}

/* ---------------------------------------------------------
   ICON
   --------------------------------------------------------- */

.sb-feature-icon {
  width: 50px;
  height: 50px;

  margin-top: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  color: #22211d;

  background: #f5f3ed;

  border: 1px solid #e2ded5;

  transition:
    transform 0.4s cubic-bezier(.2,.8,.2,1),
    background 0.3s ease;
}

.sb-feature-card:hover .sb-feature-icon {
  transform:
    translateY(-3px)
    rotate(-4deg);

  background: #eeece5;
}

/* ---------------------------------------------------------
   CONTENT
   --------------------------------------------------------- */

.sb-feature-content {
  position: relative;
  z-index: 3;

  margin-top: 25px;
}

.sb-feature-content h3 {
  margin: 0;

  color: #161613;

  font-size: 18px;

  letter-spacing: -0.025em;
}

.sb-feature-content p {
  max-width: 330px;

  margin: 10px 0 0;

  color: #817c73;

  font-size: 13px;

  line-height: 1.65;
}

/* ---------------------------------------------------------
   VISUAL AREA
   --------------------------------------------------------- */

.sb-feature-visual {
  position: absolute;

  left: 25px;
  right: 25px;
  bottom: 25px;

  height: 125px;

  border-radius: 14px;

  background: #f6f4ef;

  border: 1px solid #e8e4dc;

  overflow: hidden;

  transition:
    transform 0.45s ease,
    background 0.45s ease;
}

.sb-feature-card:hover .sb-feature-visual {
  transform: translateY(-3px);

  background: #f2f0ea;
}

/* =========================================================
   SCANNER
   ========================================================= */

.scanner-visual {
  display: flex;

  align-items: center;
  justify-content: center;
}

.scanner-frame {
  position: relative;

  width: 78px;
  height: 78px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #cfcac0;

  border-radius: 17px;

  color: #454139;

  animation:
    scannerPulse 3s ease-in-out infinite;
}

.scanner-frame::before,
.scanner-frame::after {
  content: "";

  position: absolute;

  width: 12px;
  height: 12px;

  border-color: #24221e;
  border-style: solid;
}

.scanner-frame::before {
  left: 7px;
  top: 7px;

  border-width: 1px 0 0 1px;
}

.scanner-frame::after {
  right: 7px;
  bottom: 7px;

  border-width: 0 1px 1px 0;
}

.scanner-line {
  position: absolute;

  left: 8px;
  right: 8px;

  height: 1px;

  background: #24221e;

  animation: scannerLine 2.3s ease-in-out infinite;
}

.scanner-tag {
  position: absolute;

  right: 13px;
  bottom: 12px;

  color: #99948b;

  font-size: 7px;

  letter-spacing: 0.12em;
}

/* =========================================================
   DIGITAL CLOSET
   ========================================================= */

.closet-visual {
  display: flex;

  align-items: center;
  justify-content: center;

  gap: 8px;
}

.mini-clothing-card {
  width: 78px;
  height: 82px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 5px;

  border-radius: 11px;

  background: white;

  border: 1px solid #e3dfd7;

  box-shadow:
    0 8px 20px rgba(30,27,21,0.05);

  transform: translateY(0);

  transition:
    transform 0.4s ease;
}

.mini-clothing-card span {
  font-size: 28px;
}

.mini-clothing-card small {
  color: #9b968d;

  font-size: 7px;

  letter-spacing: 0.1em;
}

.sb-feature-card:hover
.mini-clothing-card:nth-child(1) {
  transform: translateY(-8px) rotate(-3deg);
}

.sb-feature-card:hover
.mini-clothing-card:nth-child(2) {
  transform: translateY(4px);
}

.sb-feature-card:hover
.mini-clothing-card:nth-child(3) {
  transform: translateY(-5px) rotate(3deg);
}

/* =========================================================
   CHAT
   ========================================================= */

.chat-visual {
  display: flex;

  flex-direction: column;

  justify-content: center;

  gap: 8px;

  padding: 16px;
}

.mini-chat {
  width: fit-content;

  max-width: 75%;

  padding: 8px 11px;

  border-radius: 9px;

  font-size: 8px;

  line-height: 1.4;
}

.user-chat {
  align-self: flex-end;

  color: #3a3833;

  background: white;

  border: 1px solid #e3dfd7;

  border-radius: 9px 9px 2px 9px;
}

.ai-chat {
  display: flex;
  align-items: center;
  gap: 5px;

  color: white;

  background: #171613;

  border-radius: 9px 9px 9px 2px;

  animation: chatPulse 3s ease-in-out infinite;
}

/* =========================================================
   WEATHER
   ========================================================= */

.weather-visual {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 17px;
}

.weather-circle {
  width: 65px;
  height: 65px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #3f3c35;

  background: white;

  border: 1px solid #e2ded6;

  animation:
    weatherFloat 4s ease-in-out infinite;
}

.weather-temperature strong {
  display: block;

  color: #27251f;

  font-family: Georgia, serif;

  font-size: 27px;

  font-weight: 400;
}

.weather-temperature span {
  display: block;

  margin-top: 2px;

  color: #969188;

  font-size: 8px;
}

/* =========================================================
   PERSONALIZATION
   ========================================================= */

.preference-visual {
  display: flex;

  flex-direction: column;

  justify-content: center;

  gap: 9px;

  padding: 18px 25px;
}

.preference-row {
  display: flex;
  align-items: center;

  justify-content: space-between;

  color: #7e7970;

  font-size: 9px;
}

.preference-row i {
  width: 34px;
  height: 18px;

  position: relative;

  border-radius: 20px;

  background: #dfdcd4;
}

.preference-row i::after {
  content: "";

  position: absolute;

  width: 12px;
  height: 12px;

  top: 3px;
  left: 3px;

  border-radius: 50%;

  background: white;

  transition:
    transform 0.3s ease;
}

.preference-row .preference-active {
  background: #22211d;
}

.preference-row .preference-active::after {
  transform: translateX(16px);
}

.sb-feature-card:hover
.preference-row:nth-child(3) i::after {
  transform: translateX(16px);
}

/* =========================================================
   SHOPPING
   ========================================================= */

.shopping-visual {
  display: flex;

  align-items: center;

  justify-content: center;

  padding: 14px;
}

.shopping-product {
  width: 100%;

  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px;

  border-radius: 10px;

  background: white;

  border: 1px solid #e3dfd7;

  box-shadow:
    0 8px 22px rgba(30,27,21,0.05);

  transition:
    transform 0.35s ease;
}

.sb-feature-card:hover
.shopping-product {
  transform: translateX(5px);
}

.product-image {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: #f1efe9;

  font-size: 22px;
}

.shopping-product > div:nth-child(2) {
  flex: 1;
}

.shopping-product small {
  display: block;

  color: #aaa59b;

  font-size: 6px;

  letter-spacing: 0.12em;
}

.shopping-product strong {
  display: block;

  margin-top: 3px;

  color: #3a3833;

  font-size: 9px;
}

.shopping-product > svg {
  color: #817c73;
}

/* =========================================================
   CARD SPECIFIC HOVER
   ========================================================= */

.sb-feature-scanner:hover {
  background:
    linear-gradient(
      145deg,
      #fff,
      #faf9f6
    );
}

.sb-feature-closet:hover {
  background:
    linear-gradient(
      145deg,
      #fff,
      #f9f8f4
    );
}

.sb-feature-stylist:hover {
  background:
    linear-gradient(
      145deg,
      #fff,
      #f8f7f4
    );
}

.sb-feature-weather:hover {
  background:
    linear-gradient(
      145deg,
      #fff,
      #faf9f5
    );
}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes sbFeatureReveal {
  from {
    opacity: 0;

    transform:
      translateY(25px);
  }

  to {
    opacity: 1;

    transform:
      translateY(0);
  }
}

@keyframes scannerLine {
  0%,
  100% {
    top: 14px;
    opacity: 0.4;
  }

  50% {
    top: 62px;
    opacity: 1;
  }
}

@keyframes scannerPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.04);
  }
}

@keyframes chatPulse {
  0%,
  100% {
    transform: translateX(0);
  }

  50% {
    transform: translateX(5px);
  }
}

@keyframes weatherFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
}

/* =========================================================
   TABLET
   ========================================================= */

@media (max-width: 950px) {

  .sb-feature-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}

/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width: 600px) {

  .sb-feature-grid {
    grid-template-columns: 1fr;

    gap: 12px;

    margin-top: 40px;
  }

  .sb-feature-card {
    min-height: 400px;
  }

  .sb-features-intro p {
    font-size: 13px;
  }

}


/* =========================================================
   SCROLL STORYTELLING — HOW IT WORKS
   ========================================================= */
.sb-how-section{position:relative;height:330vh;background:#f7f6f2}.sb-how-sticky{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:70px 7vw 45px;box-sizing:border-box}.sb-how-header{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin-bottom:42px}.sb-how-header h2{margin:10px 0 0;color:#11110f;font-size:clamp(42px,5vw,70px);line-height:.95;letter-spacing:-.055em}.sb-how-header h2 em{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-style:italic}.sb-how-progress{display:flex;align-items:center;gap:10px;min-width:190px;margin-bottom:6px;color:#aaa59b;font-size:8px;letter-spacing:.12em}.sb-how-progress>div{width:120px;height:1px;overflow:hidden;background:#d9d5cd}.sb-how-progress i{display:block;height:100%;background:#1b1a17}.sb-how-viewport{width:100%;overflow:visible}.sb-how-track{display:flex;gap:18px;width:max-content;will-change:transform;transition:transform 1.15s cubic-bezier(.22,.8,.22,1)}.sb-how-card{position:relative;flex:0 0 min(58vw,760px);min-height:390px;padding:26px;border-radius:20px;background:#fff;border:1px solid #e3dfd7;box-sizing:border-box;opacity:.45;transform:scale(.94);transition:opacity .45s ease,transform .55s cubic-bezier(.2,.8,.2,1),box-shadow .45s ease;overflow:hidden}.sb-how-card.active{opacity:1;transform:scale(1);box-shadow:0 25px 65px rgba(34,30,24,.09)}.sb-how-number{display:block;color:#aaa59b;font-size:9px;letter-spacing:.15em}.sb-how-card-main{height:100%;display:flex;flex-direction:column;justify-content:space-between;gap:28px;padding-top:18px}.sb-how-card h3{margin:0;color:#171613;font-size:clamp(22px,2vw,30px);letter-spacing:-.035em}.sb-how-card p{max-width:500px;margin:9px 0 0;color:#817c73;font-size:14px;line-height:1.7}.sb-how-visual{position:relative;height:205px;border-radius:15px;background:#f5f3ed;border:1px solid #e4e0d8;overflow:hidden}.scanner-how{display:flex;align-items:center;justify-content:center}.how-scan-frame{position:relative;width:110px;height:110px;display:flex;align-items:center;justify-content:center;color:#39362f;border:1px solid #cfcac0;border-radius:22px}.how-scan-frame:before,.how-scan-frame:after{content:"";position:absolute;width:22px;height:22px;border-color:#24221e;border-style:solid}.how-scan-frame:before{top:9px;left:9px;border-width:1px 0 0 1px}.how-scan-frame:after{right:9px;bottom:9px;border-width:0 1px 1px 0}.how-scan-frame span{position:absolute;left:10px;right:10px;height:1px;background:#22211e;animation:howScanner 2.5s ease-in-out infinite}.scanner-how small{position:absolute;right:15px;bottom:14px;color:#9b968d;font-size:7px;letter-spacing:.14em}.ai-how{display:flex;align-items:center;justify-content:center}.ai-orbit{width:100px;height:100px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#292721;border:1px solid #d1cdc4;box-shadow:0 0 0 16px rgba(220,216,207,.35),0 0 0 32px rgba(220,216,207,.16);animation:howOrbit 4s ease-in-out infinite}.ai-pills{position:absolute;display:flex;gap:7px;bottom:18px}.ai-pills span{padding:6px 8px;border-radius:7px;color:#89847b;background:#fff;border:1px solid #e2ded6;font-size:7px;letter-spacing:.08em}.closet-how{display:flex;align-items:center;justify-content:center;gap:9px}.how-mini-item{width:105px;height:110px;display:flex;align-items:center;justify-content:center;border-radius:13px;color:#454139;background:#fff;border:1px solid #e1ddd5;box-shadow:0 10px 25px rgba(30,27,21,.05);transition:transform .5s ease;font-size:11px;letter-spacing:.1em}.sb-how-card:hover .how-mini-item:nth-child(1){transform:translateY(-10px) rotate(-4deg)}.sb-how-card:hover .how-mini-item:nth-child(2){transform:translateY(5px)}.sb-how-card:hover .how-mini-item:nth-child(3){transform:translateY(-7px) rotate(4deg)}.chat-how{display:flex;flex-direction:column;justify-content:center;gap:12px;padding:25px;box-sizing:border-box}.how-chat-bubble{width:fit-content;max-width:70%;padding:11px 14px;border-radius:12px;font-size:10px;line-height:1.4}.how-chat-bubble.user{align-self:flex-end;color:#3b3832;background:#fff;border:1px solid #e0dcd4;border-radius:12px 12px 3px 12px}.how-chat-bubble.ai{display:flex;align-items:center;gap:6px;color:#fff;background:#181713;border-radius:12px 12px 12px 3px;animation:howChatMove 3s ease-in-out infinite}.outfit-how{display:flex;align-items:center;justify-content:center;gap:10px}.outfit-how>div{width:105px;height:115px;display:flex;align-items:center;justify-content:center;border-radius:14px;color:#3d3931;background:#fff;border:1px solid #e0dcd4;box-shadow:0 10px 25px rgba(30,27,21,.05);transition:transform .45s ease}.outfit-how>div:nth-child(2){font-size:10px;letter-spacing:.12em}.sb-how-card:hover .outfit-how>div:nth-child(1){transform:translateY(-12px) rotate(-4deg)}.sb-how-card:hover .outfit-how>div:nth-child(2){transform:translateY(4px)}.sb-how-card:hover .outfit-how>div:nth-child(3){transform:translateY(-8px) rotate(4deg)}.how-match{position:absolute;right:20px;top:20px;padding:8px 10px;border-radius:8px;color:#fff;background:#171613;font-family:Georgia,serif;font-size:15px;font-style:italic}.sb-how-bottom{display:flex;align-items:center;justify-content:space-between;margin-top:28px;color:#8f8a81;font-size:10px;letter-spacing:.04em}.sb-how-dots{display:flex;align-items:center;gap:6px}.sb-how-dots span{width:5px;height:5px;border-radius:50%;background:#d1cdc4;transition:width .3s ease,background .3s ease}.sb-how-dots span.active{width:18px;border-radius:10px;background:#292721}@keyframes howScanner{0%,100%{top:18px}50%{top:87px}}@keyframes howOrbit{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}@keyframes howChatMove{0%,100%{transform:translateX(0)}50%{transform:translateX(8px)}}
@media(max-width:850px){.sb-how-section{height:auto}.sb-how-sticky{position:relative;height:auto;padding:70px 25px;overflow:visible}.sb-how-header{flex-direction:column;align-items:flex-start}.sb-how-progress{display:none}.sb-how-viewport{overflow:hidden}.sb-how-track{width:100%;flex-direction:column;transform:none!important}.sb-how-card{flex-basis:auto;width:100%;min-height:360px;opacity:1;transform:none}.sb-how-bottom{display:none}}@media(max-width:600px){.sb-how-sticky{padding:60px 18px}.sb-how-header h2{font-size:42px}.sb-how-card{padding:20px}.sb-how-visual{height:175px}}

      `}</style>

      {/* =====================================================
          SCROLL STORYTELLING — HOW IT WORKS
          ===================================================== */}

      <section id="how" ref={howSectionRef} className="sb-how-section">
        <div className="sb-how-sticky">
          <div className="sb-how-header">
            <div>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>From wardrobe to <em>what to wear.</em></h2>
            </div>
            <div className="sb-how-progress">
              <span>0{Math.min(Math.floor(howProgress * 5) + 1, 5)}</span>
              <div><i style={{ width: `${Math.max(howProgress * 100, 4)}%` }} /></div>
              <span>05</span>
            </div>
          </div>

          <div className="sb-how-viewport" ref={howViewportRef}>
            <div className="sb-how-track" ref={howTrackRef} style={{ transform: `translate3d(-${howProgress * howDistance}px, 0, 0)` }}>
              <article className={`sb-how-card ${howProgress < 0.2 ? "active" : ""}`}>
                <span className="sb-how-number">01</span>
                <div className="sb-how-card-main">
                  <div className="sb-how-visual scanner-how"><div className="how-scan-frame"><ScanFace size={34} /><span /></div><small>SCANNING YOUR CLOSET</small></div>
                  <div><h3>Upload your clothes</h3><p>Add photos from your gallery or camera.</p></div>
                </div>
              </article>

              <article className={`sb-how-card ${howProgress >= 0.15 && howProgress < 0.4 ? "active" : ""}`}>
                <span className="sb-how-number">02</span>
                <div className="sb-how-card-main">
                  <div className="sb-how-visual ai-how"><div className="ai-orbit"><Sparkles size={28} /></div><div className="ai-pills"><span>COLOR</span><span>FABRIC</span><span>STYLE</span></div></div>
                  <div><h3>AI understands them</h3><p>Attributes are identified automatically.</p></div>
                </div>
              </article>

              <article className={`sb-how-card ${howProgress >= 0.35 && howProgress < 0.6 ? "active" : ""}`}>
                <span className="sb-how-number">03</span>
                <div className="sb-how-card-main">
                  <div className="sb-how-visual closet-how"><div className="how-mini-item"><Shirt size={30} /></div><div className="how-mini-item"><span>DENIM</span></div><div className="how-mini-item"><Heart size={27} /></div></div>
                  <div><h3>Build your digital closet</h3><p>Your wardrobe becomes searchable and useful.</p></div>
                </div>
              </article>

              <article className={`sb-how-card ${howProgress >= 0.55 && howProgress < 0.8 ? "active" : ""}`}>
                <span className="sb-how-number">04</span>
                <div className="sb-how-card-main">
                  <div className="sb-how-visual chat-how"><div className="how-chat-bubble user">What should I wear?</div><div className="how-chat-bubble ai"><Sparkles size={11} /> Checking your closet...</div></div>
                  <div><h3>Tell StyleBuddy what you need</h3><p>Ask naturally about an occasion, item or mood.</p></div>
                </div>
              </article>

              <article className={`sb-how-card ${howProgress >= 0.75 ? "active" : ""}`}>
                <span className="sb-how-number">05</span>
                <div className="sb-how-card-main">
                  <div className="sb-how-visual outfit-how"><div><Shirt size={28} /></div><div><span>DENIM</span></div><div><ShoppingBag size={27} /></div><span className="how-match">94%</span></div>
                  <div><h3>Get a personalised outfit</h3><p>Get a look grounded in your closet and preferences.</p></div>
                </div>
              </article>
            </div>
          </div>

          <div className="sb-how-bottom">
            <span>{howProgress < 0.2 && "Turn your wardrobe into data."}{howProgress >= 0.2 && howProgress < 0.4 && "StyleBuddy learns what you own."}{howProgress >= 0.4 && howProgress < 0.6 && "Everything you own, in one place."}{howProgress >= 0.6 && howProgress < 0.8 && "Just tell StyleBuddy what you need."}{howProgress >= 0.8 && "Your wardrobe. Your next outfit."}</span>
            <div className="sb-how-dots">{[0,1,2,3,4].map((dot) => <span key={dot} className={howProgress >= dot/5 && howProgress < (dot+1)/5 ? "active" : ""} />)}</div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EXISTING FEATURES
          ===================================================== */}

      <section
  id="features"
  className="section features-section sb-features"
>
  <div className="section-intro sb-features-intro">
    <div className="eyebrow">
      THE STYLEBUDDY SYSTEM
    </div>

    <h2>
      One closet. <em>Many possibilities.</em>
    </h2>

    <p>
      Everything StyleBuddy does works together to turn your
      wardrobe into something you can actually use.
    </p>
  </div>

  <div className="sb-feature-grid">

    {/* ================= CARD 01 ================= */}

    <div className="sb-feature-card sb-feature-scanner">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          01
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <ScanFace size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>AI Clothing Scanner</h3>

        <p>
          Turn everyday clothing photos into structured
          digital wardrobe items.
        </p>
      </div>

      <div className="sb-feature-visual scanner-visual">
        <div className="scanner-frame">
          <ScanFace size={28} />

          <span className="scanner-line" />
        </div>

        <span className="scanner-tag">
          AI ANALYSING
        </span>
      </div>

    </div>


    {/* ================= CARD 02 ================= */}

    <div className="sb-feature-card sb-feature-closet">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          02
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <Shirt size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>Digital Closet</h3>

        <p>
          Search, filter and understand everything
          you already own.
        </p>
      </div>

      <div className="sb-feature-visual closet-visual">

        <div className="mini-clothing-card">
          <span>👕</span>
          <small>TOP</small>
        </div>

        <div className="mini-clothing-card mini-card-offset">
          <span>👖</span>
          <small>BOTTOM</small>
        </div>

        <div className="mini-clothing-card">
          <span>👟</span>
          <small>SHOES</small>
        </div>

      </div>

    </div>


    {/* ================= CARD 03 ================= */}

    <div className="sb-feature-card sb-feature-stylist">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          03
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <MessageCircle size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>AI Personal Stylist</h3>

        <p>
          Have a natural conversation with a stylist
          that knows your closet.
        </p>
      </div>

      <div className="sb-feature-visual chat-visual">

        <div className="mini-chat user-chat">
          What should I wear?
        </div>

        <div className="mini-chat ai-chat">
          <Sparkles size={11} />
          Let me check your closet...
        </div>

      </div>

    </div>


    {/* ================= CARD 04 ================= */}

    <div className="sb-feature-card sb-feature-weather">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          04
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <CloudSun size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>Weather-Aware Styling</h3>

        <p>
          Bring temperature and conditions into
          every recommendation.
        </p>
      </div>

      <div className="sb-feature-visual weather-visual">

        <div className="weather-circle">
          <CloudSun size={27} />
        </div>

        <div className="weather-temperature">
          <strong>28°</strong>
          <span>Light layers</span>
        </div>

      </div>

    </div>


    {/* ================= CARD 05 ================= */}

    <div className="sb-feature-card sb-feature-personalization">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          05
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <SlidersHorizontal size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>Personalization</h3>

        <p>
          Style around your preferences, colors,
          fit and occasions.
        </p>
      </div>

      <div className="sb-feature-visual preference-visual">

        <div className="preference-row">
          <span>Casual</span>
          <i className="preference-active" />
        </div>

        <div className="preference-row">
          <span>Minimal</span>
          <i className="preference-active" />
        </div>

        <div className="preference-row">
          <span>Smart casual</span>
          <i />
        </div>

      </div>

    </div>


    {/* ================= CARD 06 ================= */}

    <div className="sb-feature-card sb-feature-shopping">

      <div className="sb-feature-top">
        <span className="sb-feature-number">
          06
        </span>

        <span className="sb-feature-arrow">
          <ArrowRight size={16} />
        </span>
      </div>

      <div className="sb-feature-icon">
        <ShoppingBag size={23} />
      </div>

      <div className="sb-feature-content">
        <h3>Shopping Assistant</h3>

        <p>
          Complete the look only when your wardrobe
          genuinely needs something.
        </p>
      </div>

      <div className="sb-feature-visual shopping-visual">

        <div className="shopping-product">
          <div className="product-image">
            👟
          </div>

          <div>
            <small>STYLEBUDDY FOUND</small>
            <strong>Missing piece</strong>
          </div>

          <ArrowRight size={14} />
        </div>

      </div>

    </div>

  </div>
</section>

      {/* =====================================================
          EXISTING CTA
          ===================================================== */}

      <section className="final-cta">
        <div>
          <div className="eyebrow">
            YOUR NEXT OUTFIT STARTS HERE
          </div>

          <h2>
            Build your digital wardrobe today.
          </h2>

          <p>
            Make getting dressed the easiest part of your day.
          </p>

          <Link
            to="/register"
            className="btn btn-light"
          >
            Get started <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          EXISTING FOOTER
          ===================================================== */}

      <footer>
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={15} />
          </span>

          StyleBuddy
        </div>

        <span>AI Fashion Closet</span>

        <span>© 2026 StyleBuddy</span>
      </footer>
    </div>
  );
}