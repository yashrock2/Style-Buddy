import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Shirt,
  CloudSun,
  MessageCircle,
  ShoppingBag,
  ScanFace,
  SlidersHorizontal,
  Check,
  ArrowUpRight,
  Layers3,
  Heart,
  LayoutGrid,
  Plus,
} from "lucide-react";
import StylistCharacter from "../components/StylistCharacterTemp.jsx";

const features = [
  {
    number: "01",
    title: "Scan your wardrobe",
    description: "Turn clothing photos into organised, searchable wardrobe pieces.",
    detail: "AI CLOTHING SCANNER",
    Icon: ScanFace,
  },
  {
    number: "02",
    title: "Know what you own",
    description: "Keep every outfit, category and favourite piece in one digital closet.",
    detail: "YOUR DIGITAL CLOSET",
    Icon: Shirt,
  },
  {
    number: "03",
    title: "Meet your personal stylist",
    description: "Ask what to wear and get suggestions that start with your wardrobe.",
    detail: "CONVERSATIONAL AI",
    Icon: MessageCircle,
  },
  {
    number: "04",
    title: "Dress for the day",
    description: "Bring weather, occasion and your personal style into each look.",
    detail: "WEATHER-AWARE OUTFITS",
    Icon: CloudSun,
  },
  {
    number: "05",
    title: "Make it your own",
    description: "Recommendations adapt to your preferred colours, fits and aesthetics.",
    detail: "PERSONAL STYLE PROFILE",
    Icon: SlidersHorizontal,
  },
  {
    number: "06",
    title: "Shop with intention",
    description: "Discover the missing piece only when your closet needs one.",
    detail: "CONSIDERED SHOPPING",
    Icon: ShoppingBag,
  },
];

const looks = [
  {
    occasion: "COLLEGE DAY",
    request: "What should I wear to college?",
    style: "Everyday casual",
    temperature: "28°",
    match: "94%",
    items: ["Relaxed tee", "Straight denim", "Everyday sneakers"],
    colors: ["#d8d4c9", "#343a43", "#e8e5dd"],
  },
  {
    occasion: "WEEKEND PLANS",
    request: "Give me something relaxed.",
    style: "Quiet comfort",
    temperature: "30°",
    match: "91%",
    items: ["Linen shirt", "Easy trousers", "Minimal sneakers"],
    colors: ["#e8dfce", "#b8aa96", "#dedbd2"],
  },
  {
    occasion: "DINNER PLANS",
    request: "Make it smart, not too formal.",
    style: "Smart casual",
    temperature: "27°",
    match: "96%",
    items: ["Dark shirt", "Tailored trousers", "Leather loafers"],
    colors: ["#292a2b", "#5a5149", "#3c332d"],
  },
];

const steps = [
  ["01", "Add what you own", "Upload clothing photos and let StyleBuddy organise the details."],
  ["02", "Build your closet", "Create a searchable wardrobe that reflects your real clothes."],
  ["03", "Tell us the plan", "Share the occasion, weather or mood you are dressing for."],
  ["04", "Get your look", "Receive a personalised outfit built around your own pieces."],
];

const ticker = [
  "Your wardrobe",
  "Smarter outfits",
  "Personal style",
  "Weather-aware looks",
  "Mindful shopping",
  "Dress with intent",
];

const categories = [
  "Shirts",
  "T-shirts",
  "Shorts",
  "Trousers",
  "Kurtas",
  "Jackets",
  "Footwear",
  "Accessories",
];

const faqs = [
  [
    "Do I need to upload my whole wardrobe first?",
    "No. Start with a few pieces and add more whenever you like. Suggestions get better as your closet grows.",
  ],
  [
    "Will StyleBuddy only push me to buy new clothes?",
    "No. Outfits are built from what you already own first. Shopping suggestions appear only when your closet is missing something.",
  ],
  [
    "How does it know what to suggest for the day?",
    "You share the occasion or mood, and StyleBuddy factors in the weather and your style profile.",
  ],
  [
    "Can I save looks I love?",
    "Yes. Save outfits to come back to them any time from your saved outfits.",
  ],
];

export default function Landing() {
  const [lookIndex, setLookIndex] = useState(0);
  const [isBuilding, setIsBuilding] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const currentLook = looks[lookIndex];

  // Scroll reveal animations
  useEffect(() => {
    const revealNodes = document.querySelectorAll(".sb-reveal");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -45px 0px",
      }
    );

    revealNodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  // Scroll-controlled 3D process carousel
  useEffect(() => {
    const section = document.querySelector(".sb-process");
    if (!section) return;

    let frame = 0;

    const updateCarousel = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const scrollDistance = section.offsetHeight - window.innerHeight;

        if (scrollDistance <= 0) return;

        const progress = Math.max(
          0,
          Math.min(0.999, -rect.top / scrollDistance)
        );

        setActiveStep(
          Math.min(
            steps.length - 1,
            Math.floor(progress * steps.length)
          )
        );
      });
    };

    window.addEventListener("scroll", updateCarousel, { passive: true });
    window.addEventListener("resize", updateCarousel);
    updateCarousel();

    return () => {
      window.removeEventListener("scroll", updateCarousel);
      window.removeEventListener("resize", updateCarousel);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Existing rotating outfit preview
  useEffect(() => {
    const buildTimer = window.setTimeout(
      () => setIsBuilding(false),
      1500
    );

    const nextTimer = window.setTimeout(() => {
      setIsBuilding(true);
      setLookIndex((current) => (current + 1) % looks.length);
    }, 5500);

    return () => {
      window.clearTimeout(buildTimer);
      window.clearTimeout(nextTimer);
    };
  }, [lookIndex]);

  return (
    <div className="sb-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');

        .sb-page {
          --ink: #151513;
          --ink-2: #23211c;
          --paper: #f7f5f0;
          --cream: #ece8df;
          --sand: #ddd6c8;
          --taupe: #8d806c;
          --sage: #839174;
          --muted: #77756e;
          --line: rgba(35,33,28,.12);
          color: var(--ink);
          background: var(--paper);
          font-family: "DM Sans", sans-serif;
          overflow-x: clip;
          -webkit-text-size-adjust: 100%;
        }
        .sb-page * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .sb-page h1,.sb-page h2,.sb-page h3 { font-family: "DM Sans", sans-serif; font-weight: 700; }
        .sb-page em { font-family: "Playfair Display", serif; font-weight: 500; letter-spacing: -.03em; }
        /* Keep the 3D character responsive on small screens */
.sb-character-wrap,
.sb-character-canvas {
  box-sizing: border-box;
  min-width: 0;
}

.sb-character-canvas canvas {
  display: block;
  max-width: 100%;
}

        /* NAV */
        .sb-nav {
          position: absolute; top: 0; left: 0; right: 0; z-index: 30;
          height: 86px; padding: 0 clamp(22px,5vw,72px);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sb-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 700; letter-spacing: -.05em; color: var(--ink); text-decoration: none; }
        .sb-brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--ink); }
        .sb-nav-links { display: flex; gap: 4px; padding: 5px; border: 1px solid var(--line); border-radius: 999px; background: rgba(255,255,255,.6); backdrop-filter: blur(12px); }
        .sb-nav-links a { padding: 9px 18px; border-radius: 999px; color: #5f5d56; font-size: 13px; text-decoration: none; transition: background .25s, color .25s; }
        .sb-nav-links a:hover { background: var(--ink); color: #fff; }
        .sb-nav-actions { display: flex; align-items: center; gap: 20px; }
        .sb-signin { color: #5f5d56; font-size: 13px; text-decoration: none; transition: color .2s; }
        .sb-signin:hover { color: var(--ink); }

        .sb-nav-cta,.sb-button-dark,.sb-button-light {
          min-height: 52px; padding: 0 26px;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          border-radius: 14px; text-decoration: none; font-size: 14px; font-weight: 600;
          transition: transform .3s, box-shadow .3s, background .3s;
        }
        .sb-nav-cta { min-height: 44px; padding: 0 20px; font-size: 13px; }
        .sb-nav-cta,.sb-button-dark { color: #fff; background: var(--ink); }
        .sb-button-light { color: var(--ink); background: #fff; border: 1px solid var(--line); }
        .sb-nav-cta:hover,.sb-button-dark:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(21,21,19,.25); }
        .sb-button-light:hover { transform: translateY(-3px); background: var(--cream); }
        .sb-button-dark svg,.sb-button-light svg,.sb-nav-cta svg { transition: transform .3s; }
        .sb-button-dark:hover svg,.sb-button-light:hover svg,.sb-nav-cta:hover svg { transform: translateX(4px); }

        /* HERO */
        .sb-hero {
          min-height: 100vh; min-height: 100svh; position: relative; isolation: isolate; overflow: hidden;
          display: grid; grid-template-columns: minmax(0,.95fr) minmax(0,1.05fr); align-items: center;
          padding: 110px clamp(22px,5vw,72px) 56px;
          background: radial-gradient(ellipse at 74% 46%, #e6e1d6 0%, transparent 48%), linear-gradient(115deg, #fbfaf7, #f4f1ea 55%, #ece8df);
        }
        .sb-hero:before {
          content: ""; position: absolute; inset: 0; z-index: -1; opacity: .3; pointer-events: none;
          background-image: radial-gradient(#8e887b .65px, transparent .65px); background-size: 20px 20px;
          mask-image: linear-gradient(90deg, transparent, black 70%, transparent);
        }
        .sb-hero-copy { position: relative; z-index: 6; max-width: 620px; }
        .sb-kicker { display: inline-flex; align-items: center; gap: 9px; margin-bottom: 26px; padding: 8px 16px; border: 1px solid var(--line); border-radius: 999px; background: #fff; color: #5f5d56; font-size: 12px; font-weight: 500; }
        .sb-kicker-line { width: 8px; height: 8px; border-radius: 50%; background: var(--sage); animation: sbPulse 2s infinite; }
        .sb-hero h1 { margin: 0; font-size: clamp(54px,6.8vw,100px); line-height: .94; letter-spacing: -.07em; animation: sbRise 1s cubic-bezier(.2,.7,.2,1) both; }
        .sb-hero h1 em { color: var(--taupe); }
        .sb-hero-lede { max-width: 470px; margin: 26px 0 0; color: var(--muted); font-size: 16px; line-height: 1.75; animation: sbRise 1s .15s cubic-bezier(.2,.7,.2,1) both; }
        .sb-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; animation: sbRise 1s .3s cubic-bezier(.2,.7,.2,1) both; }
        .sb-proof { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: 28px; color: #7c786d; font-size: 13px; animation: sbRise 1s .45s both; }
        .sb-proof span { display: flex; align-items: center; gap: 7px; }
        .sb-proof svg { color: var(--sage); }
        .sb-hero-note { display: flex; align-items: center; gap: 10px; margin-top: 40px; color: #8c877d; font-size: 13px; animation: sbRise 1s .6s both; }
        .sb-hero-note:before { content: ""; width: 38px; height: 1px; background: #c5beb1; }

        /* STAGE: character on a soft glow */
        .sb-stage {
          --sb-char-x: clamp(-160px, -8vw, 0px);
          --sb-shift: calc(var(--sb-char-x) + clamp(0px, 7vw, 140px));
          position: relative; height: min(88vh,860px); min-height: 650px;
          display: flex; align-items: center; justify-content: center;
        }
        .sb-stage:before {
          content: "STYLE"; position: absolute; left: 50%; top: 46%;
          translate: var(--sb-shift) 0;
          transform: translate(-50%,-50%); white-space: nowrap;
          font: 700 clamp(120px,18vw,280px) "DM Sans", sans-serif; letter-spacing: -.08em;
          color: transparent; -webkit-text-stroke: 1px rgba(35,33,28,.1);
          animation: sbTextFloat 9s ease-in-out infinite;
        }
        .sb-stage-halo {
          position: absolute; width: min(48vw,640px); aspect-ratio: 1; border-radius: 50%;
          translate: var(--sb-shift) 0;
          background: radial-gradient(circle, rgba(255,255,255,.95), rgba(221,214,200,.55) 50%, transparent 72%);
          animation: sbBreathe 6s ease-in-out infinite;
        }
        .sb-stage-ring {
          position: absolute; width: min(44vw,580px); aspect-ratio: 1; border-radius: 50%;
          translate: var(--sb-shift) 0;
          border: 1px dashed rgba(91,82,67,.35);
          animation: sbSpin 40s linear infinite;
        }
        .sb-stage-ring:after { content: ""; position: absolute; top: -6px; left: 50%; width: 12px; height: 12px; border-radius: 50%; background: var(--ink); }
        .sb-stage-floor {
          position: absolute; bottom: 3%; width: min(26vw,340px); height: 34px; border-radius: 50%;
          translate: var(--sb-shift) 0;
          background: radial-gradient(ellipse, rgba(35,33,28,.28), transparent 70%);
          filter: blur(6px);
        }
        .sb-character-wrap {
          position: absolute; inset: 0; z-index: 3;
          display: flex; justify-content: center; align-items: center; pointer-events: none;
          translate: var(--sb-char-x) 0;
          transform: scale(1.1); transform-origin: 50% 100%;
          filter: drop-shadow(0 30px 40px rgba(21,21,19,.22));
        }
        .sb-character-wrap .sb-character-canvas { width: 100%; height: 100%; min-height: 640px; }
        .sb-stage-index { position: absolute; right: 0; top: 14%; z-index: 4; color: #a19a8d; font-size: 10px; letter-spacing: .2em; writing-mode: vertical-rl; }

        .sb-float-card { position: absolute; z-index: 5; display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid rgba(255,255,255,.9); border-radius: 16px; background: rgba(255,255,255,.82); box-shadow: 0 18px 50px rgba(48,42,32,.12); backdrop-filter: blur(14px); }
        .sb-float-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: #fff; background: var(--ink); }
        .sb-float-card small { display: block; margin-bottom: 3px; color: #a09a8e; font-size: 9px; letter-spacing: .12em; }
        .sb-float-card strong { display: block; color: var(--ink); font-size: 13px; font-weight: 600; }
        .sb-float-weather { top: 13%; left: 0; animation: sbFloat 5s ease-in-out infinite; }
        .sb-float-style { right: 0; bottom: 30%; animation: sbFloat 6s .7s ease-in-out infinite; }
        .sb-style-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--sage); box-shadow: 0 0 0 5px rgba(131,145,116,.2); }

        .sb-look-panel { position: absolute; z-index: 6; left: 0; bottom: 3%; width: min(340px,78%); padding: 18px; border: 1px solid rgba(255,255,255,.9); border-radius: 20px; background: rgba(255,255,255,.9); backdrop-filter: blur(18px); box-shadow: 0 26px 70px rgba(48,42,32,.16); animation: sbFloat 7s .3s ease-in-out infinite; }
        .sb-look-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .sb-look-label { color: #9b9589; font-size: 9px; font-weight: 700; letter-spacing: .14em; }
        .sb-look-live { display: flex; align-items: center; gap: 6px; color: #7d8a6e; font-size: 9px; letter-spacing: .1em; }
        .sb-look-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); animation: sbPulse 1.6s infinite; }
        .sb-look-question { margin: 14px 0 13px; color: var(--ink); font: 500 19px "Playfair Display", serif; }
        .sb-look-items { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; transition: opacity .4s; }
        .sb-look-item { min-width: 0; }
        .sb-look-swatch { height: 52px; border-radius: 11px; border: 1px solid rgba(0,0,0,.06); transition: background .35s, transform .35s; }
        .sb-look-item:hover .sb-look-swatch { transform: translateY(-3px); }
        .sb-look-item span { display: block; margin-top: 7px; overflow: hidden; color: #77736b; font-size: 10px; white-space: nowrap; text-overflow: ellipsis; }
        .sb-look-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); color: #8a857b; font-size: 10px; }
        .sb-look-score { color: var(--ink); font: italic 500 22px "Playfair Display", serif; }
        .sb-look-loading { opacity: .4; }

        /* TICKER */
        .sb-marquee { padding: 20px 0; overflow: hidden; background: var(--ink); }
        .sb-marquee-track { display: flex; width: max-content; animation: sbTicker 30s linear infinite; }
        .sb-marquee-track span { display: flex; align-items: center; gap: 36px; padding-right: 36px; color: var(--cream); font: italic 500 22px "Playfair Display", serif; white-space: nowrap; }
        .sb-marquee-track span:after { content: "✳"; color: var(--taupe); font: 14px "DM Sans", sans-serif; }
        .sb-marquee:hover .sb-marquee-track { animation-play-state: paused; }

        /* SECTIONS */
        .sb-section { padding: 115px clamp(22px,5vw,72px); }
        .sb-section-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 30px; max-width: 1300px; margin: 0 auto 52px; }
        .sb-section-kicker { margin-bottom: 16px; color: var(--taupe); font-size: 13px; font-weight: 600; }
        .sb-section h2 { max-width: 700px; margin: 0; font-size: clamp(36px,4.8vw,64px); line-height: 1; letter-spacing: -.06em; }
        .sb-section h2 em { color: var(--taupe); }
        .sb-section-intro { max-width: 360px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.75; }

        /* CLOSET CATEGORIES */
        .sb-cats { padding: 70px clamp(22px,5vw,72px) 0; max-width: 1444px; margin: 0 auto; }
        .sb-cats-title { margin: 0 0 22px; color: var(--muted); font-size: 14px; }
        .sb-cat-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .sb-cat { padding: 12px 22px; border: 1px solid var(--line); border-radius: 999px; background: #fff; color: #4a483f; font-size: 14px; font-weight: 500; transition: transform .3s, background .3s, color .3s; cursor: default; }
        .sb-cat:hover { transform: translateY(-4px) rotate(-1.5deg); background: var(--ink); color: #fff; }

        /* FEATURE GRID */
        .sb-feature-grid { display: grid; grid-template-columns: repeat(12,1fr); gap: 16px; max-width: 1300px; margin: 0 auto; }
        .sb-feature-card:nth-child(1) { grid-column: span 7; }
        .sb-feature-card:nth-child(2) { grid-column: span 5; }
        .sb-feature-card:nth-child(3) { grid-column: span 5; }
        .sb-feature-card:nth-child(4) { grid-column: span 7; }
        .sb-feature-card:nth-child(5) { grid-column: span 6; }
        .sb-feature-card:nth-child(6) { grid-column: span 6; }
        .sb-feature-card { position: relative; min-height: 290px; padding: 28px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; border: 1px solid var(--line); border-radius: 26px; background: #fff; transition: transform .45s cubic-bezier(.2,.7,.2,1), box-shadow .45s, background .45s, color .45s; }
        .sb-feature-card:before { content: ""; position: absolute; width: 300px; height: 300px; right: -90px; top: -120px; border-radius: 50%; background: radial-gradient(circle, var(--cream), transparent 70%); transition: transform .6s; }
        .sb-feature-card:hover { transform: translateY(-8px) rotate(-.5deg); background: var(--ink); color: #fff; box-shadow: 0 30px 70px rgba(21,21,19,.25); }
        .sb-feature-card:hover:before { transform: scale(1.7) translate(-30px,30px); background: radial-gradient(circle, rgba(141,128,108,.4), transparent 70%); }
        .sb-feature-meta { position: absolute; top: 26px; left: 28px; right: 28px; display: flex; justify-content: space-between; color: #aaa396; font-size: 12px; }
        .sb-feature-icon { position: absolute; top: 56px; left: 28px; width: 54px; height: 54px; display: grid; place-items: center; border-radius: 16px; color: var(--ink); background: var(--cream); transition: transform .45s, background .45s; }
        .sb-feature-card:hover .sb-feature-icon { transform: rotate(-10deg) scale(1.12); background: #fff; }
        .sb-feature-card h3 { position: relative; margin: 0 0 9px; font-size: 25px; letter-spacing: -.04em; }
        .sb-feature-card p { position: relative; max-width: 340px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7; transition: color .45s; }
        .sb-feature-card:hover p { color: #cfcabd; }
        .sb-feature-watermark { position: absolute; right: 22px; bottom: 16px; color: #f1efe9; transform: rotate(-12deg); transition: transform .6s, color .6s; }
        .sb-feature-card:hover .sb-feature-watermark { transform: rotate(8deg) scale(1.2); color: rgba(255,255,255,.07); }

        /* DASHBOARD PREVIEW */
        .sb-preview-wrap { max-width: 1300px; margin: 0 auto; perspective: 1600px; }
        .sb-preview { display: grid; grid-template-columns: 210px 1fr; min-height: 430px; overflow: hidden; border: 1px solid var(--line); border-radius: 26px; background: var(--paper); box-shadow: 0 50px 100px rgba(48,42,32,.18); transform: rotateX(4deg); transition: transform .8s cubic-bezier(.2,.7,.2,1); }
        .sb-preview:hover { transform: rotateX(0deg) translateY(-6px); }
        .sb-pv-side { padding: 22px 14px; border-right: 1px solid var(--line); background: #fbfaf7; }
        .sb-pv-brand { display: flex; align-items: center; gap: 9px; margin: 0 8px 24px; font-weight: 700; letter-spacing: -.04em; }
        .sb-pv-brand span { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--ink); }
        .sb-pv-item { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; padding: 11px 12px; border-radius: 12px; color: #77756e; font-size: 13px; }
        .sb-pv-item.on { color: #fff; background: var(--ink); }
        .sb-pv-main { padding: 26px; }
        .sb-pv-main h4 { margin: 0 0 4px; font-size: 28px; letter-spacing: -.05em; }
        .sb-pv-main > p { margin: 0 0 20px; color: var(--muted); font-size: 13px; }
        .sb-pv-hero { display: grid; grid-template-columns: 1.1fr 1fr; gap: 18px; padding: 22px; border-radius: 20px; background: var(--cream); }
        .sb-pv-hero strong { display: block; margin-bottom: 10px; font-size: 24px; line-height: 1.05; letter-spacing: -.05em; }
        .sb-pv-hero strong em { color: var(--taupe); }
        .sb-pv-btn { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; padding: 10px 16px; border-radius: 10px; color: #fff; background: var(--ink); font-size: 12px; font-weight: 600; }
        .sb-pv-tiles { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .sb-pv-tile { aspect-ratio: .8; border-radius: 12px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; color: var(--taupe); animation: sbFloat 5s ease-in-out infinite; }
        .sb-pv-tile:nth-child(2) { animation-delay: -1.4s; } .sb-pv-tile:nth-child(3) { animation-delay: -2.8s; }
        .sb-pv-tile:nth-child(4) { animation-delay: -.7s; } .sb-pv-tile:nth-child(5) { animation-delay: -2.1s; } .sb-pv-tile:nth-child(6) { animation-delay: -3.5s; }

        /* 3D HOW IT WORKS (light, matches the rest of the page) */
        .sb-process {
          height: 350vh; padding: 0; position: relative; color: var(--ink);
          background: linear-gradient(180deg, var(--paper) 0%, var(--cream) 18%, var(--cream) 82%, var(--paper) 100%);
        }
        .sb-process:before {
          content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .35;
          background-image: radial-gradient(#8e887b .65px, transparent .65px); background-size: 22px 22px;
          mask-image: radial-gradient(ellipse at 50% 40%, black 10%, transparent 70%);
        }
        .sb-process-inner { position: sticky; top: 0; height: 100vh; height: 100svh; min-height: 650px; margin: 0; padding: 65px clamp(22px,7vw,130px); overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
        .sb-process .sb-section-kicker { color: var(--taupe); }
        .sb-process .sb-section-head { max-width: none; margin: 0 0 22px; }
        .sb-process .sb-section-head h2 { color: var(--ink); }
        .sb-process .sb-section-head h2 em { color: var(--taupe); }
        .sb-process .sb-section-intro { color: var(--muted); }
        .sb-carousel-stage { height: 440px; position: relative; perspective: 1300px; display: flex; align-items: center; justify-content: center; transform-style: preserve-3d; }
        .sb-step-card {
          position: absolute; width: min(540px,65vw); height: 365px; padding: 27px;
          border: 1px solid var(--line); border-radius: 26px;
          background: linear-gradient(145deg, #ffffff, #f6f3ec);
          display: flex; flex-direction: column; justify-content: space-between;
          transform-style: preserve-3d; overflow: hidden; will-change: transform, opacity;
          box-shadow: 0 18px 50px rgba(48,42,32,.08);
          transition: transform .85s cubic-bezier(.2,.75,.2,1), opacity .85s ease, filter .85s ease, box-shadow .85s ease;
        }
        .sb-step-card::before { content: ""; position: absolute; width: 350px; height: 350px; border-radius: 50%; top: -150px; right: -100px; pointer-events: none; background: radial-gradient(circle, rgba(141,128,108,.2), transparent 70%); }
        .sb-step-card.active { border-color: rgba(21,21,19,.4); box-shadow: 0 34px 80px rgba(48,42,32,.22); }
        .sb-step-card.side { filter: saturate(.7); opacity: .75; }
        .sb-step-top { display: flex; justify-content: space-between; align-items: center; color: #9b9589; font-size: 11px; letter-spacing: .12em; }
        .sb-step-visual { position: relative; display: grid; place-items: center; height: 175px; margin: 13px 0; border-radius: 18px; background: linear-gradient(135deg, #f1ede4, #e2ddd0); overflow: hidden; }
        .sb-step-visual::before,.sb-step-visual::after { content: ""; position: absolute; width: 180px; height: 180px; border: 1px solid rgba(35,33,28,.18); border-radius: 50%; animation: sbPing 3s ease-out infinite; }
        .sb-step-visual::after { width: 230px; height: 230px; animation-delay: 1.2s; }
        .sb-step-visual-icon { z-index: 1; width: 84px; height: 84px; display: grid; place-items: center; border-radius: 50%; color: var(--cream); background: var(--ink); box-shadow: 0 14px 30px rgba(21,21,19,.25); }
        .sb-step-bottom h3 { margin: 0 0 8px; color: var(--ink); font-size: 27px; letter-spacing: -.05em; }
        .sb-step-bottom p { max-width: 400px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
        .sb-process-progress { position: absolute; left: clamp(22px,7vw,130px); right: clamp(22px,7vw,130px); bottom: 30px; height: 3px; border-radius: 3px; background: var(--sand); }
        .sb-process-progress-fill { height: 100%; border-radius: 3px; background: var(--ink); transition: width .5s ease; }
        .sb-process-counter { position: absolute; right: clamp(22px,7vw,130px); bottom: 42px; color: var(--taupe); font: 600 13px "DM Sans", sans-serif; letter-spacing: .12em; }

        /* PERSONAL */
        .sb-personal { display: grid; grid-template-columns: 1fr 1fr; gap: 8%; align-items: center; max-width: 1300px; margin: 0 auto; }
        .sb-personal-art { min-height: 460px; position: relative; display: grid; place-items: center; border-radius: 32px; overflow: hidden; background: radial-gradient(circle at 50% 45%, #2e2b25, #151513 72%); }
        .sb-personal-art:before,.sb-personal-art:after { content: ""; position: absolute; width: 280px; aspect-ratio: 1; border: 1px dashed rgba(255,255,255,.22); border-radius: 50%; animation: sbSpin 18s linear infinite; }
        .sb-personal-art:after { width: 380px; animation-duration: 26s; animation-direction: reverse; }
        .sb-personal-monogram { position: relative; z-index: 1; color: rgba(236,232,223,.16); font: italic 500 230px/1 "Playfair Display", serif; animation: sbMonogram 7s ease-in-out infinite; }
        .sb-personal-tag { position: absolute; z-index: 2; padding: 11px 16px; border: 1px solid rgba(255,255,255,.25); border-radius: 999px; background: rgba(255,255,255,.1); color: #f1ede3; font-size: 12px; backdrop-filter: blur(10px); animation: sbTagFloat 5.5s ease-in-out infinite; }
        .sb-personal-tag.one { top: 19%; left: 8%; }
        .sb-personal-tag.two { right: 8%; top: 38%; animation-delay: -1.8s; }
        .sb-personal-tag.three { left: 14%; bottom: 14%; animation-delay: -3.4s; }
        .sb-personal-copy h2 { margin: 0; font-size: clamp(36px,4.4vw,58px); line-height: 1.02; letter-spacing: -.06em; }
        .sb-personal-copy h2 em { color: var(--taupe); }
        .sb-personal-copy p { max-width: 460px; margin: 22px 0 0; color: var(--muted); font-size: 15px; line-height: 1.8; }
        .sb-personal-points { display: grid; gap: 14px; margin: 26px 0 32px; color: #4a483f; font-size: 14px; }
        .sb-personal-points span { display: flex; align-items: center; gap: 11px; }
        .sb-personal-points svg { flex: none; padding: 4px; width: 24px; height: 24px; border-radius: 50%; color: #fff; background: var(--sage); }

        /* FAQ */
        .sb-faq { max-width: 860px; margin: 0 auto; display: grid; gap: 12px; }
        .sb-faq details { border: 1px solid var(--line); border-radius: 20px; background: #fff; transition: background .3s, box-shadow .3s; }
        .sb-faq details[open] { background: var(--cream); box-shadow: 0 18px 40px rgba(48,42,32,.08); }
        .sb-faq summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; list-style: none; cursor: pointer; font-size: 17px; font-weight: 600; letter-spacing: -.02em; }
        .sb-faq summary::-webkit-details-marker { display: none; }
        .sb-faq summary svg { flex: none; padding: 5px; width: 28px; height: 28px; border-radius: 50%; color: #fff; background: var(--ink); transition: transform .4s; }
        .sb-faq details[open] summary svg { transform: rotate(135deg); }
        .sb-faq details p { margin: 0; padding: 0 26px 24px; max-width: 640px; color: var(--muted); font-size: 15px; line-height: 1.75; animation: sbRise .5s both; }

        /* CTA + FOOTER */
        .sb-cta { position: relative; padding: 120px 24px; overflow: hidden; text-align: center; color: #f8f6f0; background: #1b1a17; }
        .sb-cta:before { content: ""; position: absolute; width: 620px; height: 620px; left: 50%; top: -420px; transform: translateX(-50%); border: 1px solid rgba(255,255,255,.12); border-radius: 50%; box-shadow: 0 0 0 60px rgba(255,255,255,.025), 0 0 0 120px rgba(255,255,255,.018); animation: sbBreathe2 7s ease-in-out infinite; }
        .sb-cta-content { position: relative; max-width: 720px; margin: 0 auto; }
        .sb-cta-kicker { color: #b8ad99; font-size: 13px; font-weight: 600; }
        .sb-cta h2 { margin: 18px 0 16px; font-size: clamp(40px,6vw,78px); line-height: .98; letter-spacing: -.065em; }
        .sb-cta p { margin: 0 auto 32px; max-width: 440px; color: #b5b1a7; font-size: 16px; line-height: 1.7; }
        .sb-cta .sb-button-light { min-height: 56px; padding: 0 32px; font-size: 15px; border: 0; }
        .sb-footer { min-height: 90px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px clamp(22px,5vw,72px); color: #89847a; background: #12110f; font-size: 12px; }
        .sb-footer .sb-brand { color: #f6f3ec; font-size: 17px; }
        .sb-footer .sb-brand-mark { color: var(--ink); background: #f4f0e7; }

        /* KEYFRAMES */
        @keyframes sbFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes sbRise { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: none; } }
        @keyframes sbSpin { to { transform: rotate(360deg); } }
        @keyframes sbPulse { 0% { box-shadow: 0 0 0 0 rgba(131,145,116,.55); } 70%,100% { box-shadow: 0 0 0 10px rgba(131,145,116,0); } }
        @keyframes sbBreathe { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes sbBreathe2 { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.06); } }
        @keyframes sbTextFloat { 0%,100% { transform: translate(-50%,-50%); } 50% { transform: translate(-50%,-54%); } }
        @keyframes sbTicker { to { transform: translateX(-50%); } }
        @keyframes sbPing { 0% { transform: scale(.6); opacity: .8; } 100% { transform: scale(1.3); opacity: 0; } }
        @keyframes sbMonogram { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-14px) rotate(3deg) scale(1.04); } }
        @keyframes sbTagFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        /* SCROLL REVEALS */
        .sb-reveal { opacity: 0; transform: translate3d(0,40px,0); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); transition-delay: var(--sb-delay,0ms); will-change: opacity, transform; }
        .sb-reveal.is-visible { opacity: 1; transform: none; }
        .sb-reveal-left { transform: translate3d(-48px,0,0); }
        .sb-reveal-right { transform: translate3d(48px,0,0); }

        /* TABLET */
        @media(max-width:1050px) {
          .sb-hero { grid-template-columns: 1fr; padding-top: 110px; }
          .sb-stage { --sb-char-x: 0px; --sb-shift: 0px; height: 700px; }
          .sb-nav-links { display: none; }
          .sb-feature-card:nth-child(n) { grid-column: span 6; }
          .sb-preview { grid-template-columns: 1fr; }
          .sb-pv-side { display: none; }
        }

        /* PHONE */
        @media(max-width:650px) {
          /* nav */
          .sb-nav { height: 64px; padding: 0 16px; }
          .sb-brand { font-size: 17px; }
          .sb-brand-mark { width: 30px; height: 30px; }
          .sb-nav-actions { gap: 12px; }
          .sb-signin { font-size: 12px; }
          .sb-nav-cta { min-height: 38px; padding: 0 14px; font-size: 12px; }
          .sb-nav-cta svg { display: none; }

          /* hero: text first, then character, then outfit card */
          .sb-hero { min-height: auto; display: flex; flex-direction: column; gap: 6px; padding: 84px 18px 28px; }
          .sb-hero h1 { font-size: clamp(42px, 13vw, 64px); }
          .sb-hero-lede { font-size: 15px; margin-top: 20px; }
          .sb-hero-actions { display: grid; grid-template-columns: 1fr; margin-top: 24px; }
          .sb-hero-actions a { width: 100%; }
          .sb-proof { margin-top: 22px; }
          .sb-hero-note { display: none; }

          .sb-stage {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: auto;
  min-height: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
}

.sb-character-wrap {
  position: relative;
  inset: auto;
  flex: 0 0 480px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 480px;
  translate: 0 0;
  transform: none;
  transform-origin: center bottom;
  overflow: hidden;
}

.sb-character-wrap .sb-character-canvas {
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0;
  height: 100% !important;
  min-height: 0;
  overflow: hidden;
}

.sb-character-wrap .sb-character-canvas canvas {
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  transform: translateX(-55px);
}
          .sb-stage:before { top: 240px; font-size: 34vw; translate: 0 0; }
          .sb-stage-halo,.sb-stage-ring { top: 240px; left: 50%; translate: -50% -50%; width: 88vw; }
          .sb-stage-floor { top: 462px; bottom: auto; left: 50%; translate: -50% 0; width: 58vw; }
          
          
          .sb-stage-index,.sb-float-weather,.sb-float-style { display: none; }
          .sb-look-panel { position: relative; left: auto; bottom: auto; width: calc(100% - 36px); margin: 8px 18px 0; padding: 14px; animation: none; }
          .sb-look-question { font-size: 17px; }

          /* ticker, sections, headings */
          .sb-marquee { padding: 14px 0; }
          .sb-marquee-track span { font-size: 18px; gap: 24px; padding-right: 24px; }
          .sb-section { padding: 72px 18px; }
          .sb-section-head { display: block; margin-bottom: 32px; }
          .sb-section h2 { font-size: clamp(32px, 9.5vw, 44px); }
          .sb-section-intro { margin-top: 16px; font-size: 14px; }
          .sb-cats { padding: 48px 18px 0; }
          .sb-cat { padding: 10px 16px; font-size: 13px; }

          /* features */
          .sb-feature-grid { gap: 12px; }
          .sb-feature-card:nth-child(n) { grid-column: span 12; min-height: 230px; padding: 22px; border-radius: 22px; }
          .sb-feature-meta { top: 22px; left: 22px; right: 22px; }
          .sb-feature-icon { top: 50px; left: 22px; width: 48px; height: 48px; }
          .sb-feature-card h3 { font-size: 22px; }

          /* dashboard preview */
          .sb-preview { transform: none; grid-template-columns: 1fr; min-height: 0; border-radius: 22px; }
          .sb-pv-side { display: none; }
          .sb-pv-main { padding: 18px; }
          .sb-pv-main h4 { font-size: 22px; }
          .sb-pv-hero { grid-template-columns: 1fr; padding: 16px; }
          .sb-pv-hero strong { font-size: 20px; }

          /* how it works */
          .sb-process { height: 300vh; }
          .sb-process-inner { min-height: 570px; padding: 35px 18px 55px; }
          .sb-process .sb-section-head { display: block; margin-bottom: 8px; }
          .sb-process .sb-section-head h2 { font-size: clamp(30px, 9vw, 44px); }
          .sb-process .sb-section-intro { display: none; }
          .sb-carousel-stage { height: 370px; }
          .sb-step-card { width: 76vw; max-width: 390px; height: 315px; padding: 19px; }
          .sb-step-visual { height: 135px; }
          .sb-step-visual-icon { width: 68px; height: 68px; }
          .sb-step-bottom h3 { font-size: 21px; }
          .sb-step-bottom p { font-size: 12px; }
          .sb-process-progress { left: 18px; right: 18px; bottom: 23px; }
          .sb-process-counter { right: 18px; bottom: 36px; }

          /* personal, faq, cta, footer */
          .sb-personal { grid-template-columns: 1fr; gap: 32px; }
          .sb-personal-art { min-height: 300px; border-radius: 24px; }
          .sb-personal-monogram { font-size: 140px; }
          .sb-personal-tag { font-size: 11px; padding: 9px 13px; }
          .sb-personal-copy .sb-button-dark { width: 100%; }
          .sb-faq summary { padding: 18px; font-size: 15px; }
          .sb-faq details p { padding: 0 18px 20px; font-size: 14px; }
          .sb-cta { padding: 84px 20px; }
          .sb-cta .sb-button-light { width: 100%; }
          .sb-footer { flex-wrap: wrap; justify-content: center; text-align: center; padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); }
          .sb-footer > span { width: 100%; }
        }

        /* TOUCH SCREENS: don't let hover effects stick after a tap */
        @media (hover: none) {
          .sb-feature-card:hover { transform: none; background: #fff; color: var(--ink); box-shadow: none; }
          .sb-feature-card:hover p { color: var(--muted); }
          .sb-feature-card:hover .sb-feature-icon { transform: none; background: var(--cream); }
          .sb-cat:hover { transform: none; background: #fff; color: #4a483f; }
          .sb-preview:hover { transform: none; }
        }

        @media(prefers-reduced-motion:reduce) {
          .sb-page *,.sb-page *:before,.sb-page *:after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
          .sb-reveal { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav className="sb-nav">
        <Link to="/" className="sb-brand">
          <span className="sb-brand-mark">
            <Sparkles size={16} />
          </span>
          StyleBuddy
        </Link>

        <div className="sb-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#personal">Your style</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="sb-nav-actions">
          <Link to="/login" className="sb-signin">
            Sign in
          </Link>

          <Link to="/register" className="sb-nav-cta">
            Get started <ArrowUpRight size={15} />
          </Link>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <section className="sb-hero">
          <div className="sb-hero-copy">
            <div className="sb-kicker">
              <span className="sb-kicker-line" />
              Your AI stylist is online
            </div>

            <h1>
              Your closet.
              <br />
              Your style.
              <br />
              <em>One smart move.</em>
            </h1>

            <p className="sb-hero-lede">
              Meet the personal stylist that understands your wardrobe.
              Discover combinations, dress for the day and make every piece count.
            </p>

            <div className="sb-hero-actions">
              <Link to="/register" className="sb-button-dark">
                Build my digital closet <ArrowRight size={16} />
              </Link>

              <Link to="/stylist" className="sb-button-light">
                <Sparkles size={15} /> Talk to your stylist
              </Link>
            </div>

            <div className="sb-proof">
              <span>
                <Check size={14} /> Built around what you own
              </span>

              <span>
                <Check size={14} /> Personalised suggestions
              </span>
            </div>

            <div className="sb-hero-note">
              Less guessing. More getting dressed.
            </div>
          </div>

          {/* 3D STYLIST */}
          <div
            className="sb-stage"
            aria-label="Interactive 3D StyleBuddy stylist"
          >
            <div className="sb-stage-halo" />
            <div className="sb-stage-ring" />
            <div className="sb-stage-floor" />

            <div className="sb-character-wrap">
              <StylistCharacter />
            </div>

            <span className="sb-stage-index">
              STYLEBUDDY / YOUR PERSONAL STYLIST
            </span>

            {/* WEATHER CARD */}
            <div className="sb-float-card sb-float-weather">
              <span className="sb-float-icon">
                <CloudSun size={18} />
              </span>

              <span>
                <small>THE DAY AHEAD</small>
                <strong>Weather-aware looks</strong>
              </span>
            </div>

            {/* STYLE PROFILE CARD */}
            <div className="sb-float-card sb-float-style">
              <span className="sb-style-dot" />

              <span>
                <small>YOUR STYLE PROFILE</small>
                <strong>Personalised to you</strong>
              </span>
            </div>

            {/* OUTFIT PREVIEW */}
            <div className="sb-look-panel">
              <div className="sb-look-top">
                <span className="sb-look-label">
                  A LOOK FROM YOUR STYLIST
                </span>

                <span className="sb-look-live">
                  <i /> LIVE PREVIEW
                </span>
              </div>

              <div className="sb-look-question">
                {currentLook.request}
              </div>

              <div
                className={`sb-look-items ${
                  isBuilding ? "sb-look-loading" : ""
                }`}
              >
                {currentLook.items.map((item, index) => (
                  <div
                    className="sb-look-item"
                    key={`${lookIndex}-${item}`}
                  >
                    <div
                      className="sb-look-swatch"
                      style={{
                        background: currentLook.colors[index],
                      }}
                    />

                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="sb-look-footer">
                <span>
                  {currentLook.occasion} · {currentLook.temperature}C ·{" "}
                  {currentLook.style}
                </span>

                <span className="sb-look-score">
                  {isBuilding ? "···" : currentLook.match}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SCROLLING TICKER */}
        <div className="sb-marquee" aria-hidden="true">
          <div className="sb-marquee-track">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>

        {/* CLOSET CATEGORIES */}
        <div className="sb-cats sb-reveal">
          <p className="sb-cats-title">
            Every kind of piece, in one closet:
          </p>
          <div className="sb-cat-row">
            {categories.map((cat) => (
              <span className="sb-cat" key={cat}>
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="sb-section">
          <div className="sb-section-head sb-reveal">
            <div>
              <div className="sb-section-kicker">
                The StyleBuddy system
              </div>

              <h2>
                Everything your wardrobe needs.
                <br />
                <em>Nothing it doesn't.</em>
              </h2>
            </div>

            <p className="sb-section-intro">
              One connected experience to organise what you own, understand
              your style and make getting dressed feel effortless.
            </p>
          </div>

          <div className="sb-feature-grid">
            {features.map(({ number, title, description, Icon }) => (
              <article
                className="sb-feature-card sb-reveal"
                style={{ "--sb-delay": `${Number(number) * 75}ms` }}
                key={number}
              >
                <div className="sb-feature-meta">
                  <span>{number} / 06</span>
                  <ArrowUpRight size={16} />
                </div>

                <div className="sb-feature-icon">
                  <Icon size={24} />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>

                <div className="sb-feature-watermark">
                  <Layers3 size={96} strokeWidth={0.7} />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section className="sb-section" style={{ paddingTop: 0 }}>
          <div className="sb-section-head sb-reveal">
            <div>
              <div className="sb-section-kicker">Your style space</div>
              <h2>
                A home for <em>every look.</em>
              </h2>
            </div>
            <p className="sb-section-intro">
              Your closet, AI stylist, saved outfits and shopping ideas,
              all in one calm dashboard.
            </p>
          </div>

          <div className="sb-preview-wrap sb-reveal">
            <div className="sb-preview" aria-hidden="true">
              <div className="sb-pv-side">
                <div className="sb-pv-brand">
                  <span>
                    <Sparkles size={13} />
                  </span>
                  StyleBuddy
                </div>
                <div className="sb-pv-item on">
                  <LayoutGrid size={15} /> Dashboard
                </div>
                <div className="sb-pv-item">
                  <Shirt size={15} /> My Closet
                </div>
                <div className="sb-pv-item">
                  <MessageCircle size={15} /> AI Stylist
                </div>
                <div className="sb-pv-item">
                  <Heart size={15} /> Saved Outfits
                </div>
                <div className="sb-pv-item">
                  <ShoppingBag size={15} /> Shop the Look
                </div>
              </div>

              <div className="sb-pv-main">
                <h4>Good morning.</h4>
                <p>Your wardrobe, your style, your next look.</p>

                <div className="sb-pv-hero">
                  <div>
                    <strong>
                      A better outfit
                      <br />
                      <em>is one click away.</em>
                    </strong>
                    <span className="sb-pv-btn">
                      <Sparkles size={13} /> Style me
                    </span>
                    <span className="sb-pv-btn" style={{ marginLeft: 8, color: "#151513", background: "#fff" }}>
                      <Plus size={13} /> Add clothes
                    </span>
                  </div>

                  <div className="sb-pv-tiles">
                    <span className="sb-pv-tile"><Shirt size={22} /></span>
                    <span className="sb-pv-tile"><Layers3 size={22} /></span>
                    <span className="sb-pv-tile"><ShoppingBag size={22} /></span>
                    <span className="sb-pv-tile"><Heart size={22} /></span>
                    <span className="sb-pv-tile"><CloudSun size={22} /></span>
                    <span className="sb-pv-tile"><Sparkles size={22} /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CINEMATIC 3D HOW IT WORKS */}
        <section id="how" className="sb-process">
          <div className="sb-process-inner">
            <div className="sb-section-kicker">
              The StyleBuddy experience
            </div>

            <div className="sb-section-head">
              <h2>
                From wardrobe
                <br />
                to <em>your signature style.</em>
              </h2>

              <p className="sb-section-intro">
                Scroll through the journey from your real wardrobe to an outfit that feels like you.
              </p>
            </div>

            <div className="sb-carousel-stage">
              {steps.map(([number, title, description], index) => {
                const offset = index - activeStep;
                const isActive = index === activeStep;
                const StepIcons = [
                  ScanFace,
                  Shirt,
                  MessageCircle,
                  Sparkles,
                ];
                const StepIcon = StepIcons[index];

                return (
                  <article
                    key={number}
                    className={`sb-step-card ${
                      isActive ? "active" : ""
                    } ${
                      Math.abs(offset) === 1 ? "side" : ""
                    }`}
                    style={{
                      transform: `
                        translateX(${offset * 390}px)
                        translateZ(${isActive ? 0 : -180}px)
                        rotateY(${offset * -32}deg)
                        scale(${isActive ? 1 : 0.78})
                      `,
                      opacity: Math.abs(offset) > 1 ? 0 : 1,
                      zIndex: 10 - Math.abs(offset),
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                    aria-hidden={!isActive}
                  >
                    <div className="sb-step-top">
                      <span>STYLEBUDDY / PROCESS</span>
                      <span>{number} / 04</span>
                    </div>

                    <div className="sb-step-visual">
                      <div className="sb-step-visual-icon">
                        <StepIcon size={36} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div className="sb-step-bottom">
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="sb-process-counter">
              0{activeStep + 1} / 04
            </div>

            <div className="sb-process-progress">
              <div
                className="sb-process-progress-fill"
                style={{
                  width: `${
                    ((activeStep + 1) / steps.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* PERSONAL WARDROBE SECTION */}
        <section id="personal" className="sb-section">
          <div className="sb-personal">
            <div className="sb-personal-art sb-reveal sb-reveal-left">
              <div className="sb-personal-monogram">S</div>

              <span className="sb-personal-tag one">
                Your wardrobe, understood
              </span>

              <span className="sb-personal-tag two">
                Style that feels like you
              </span>

              <span className="sb-personal-tag three">
                Made for real life
              </span>
            </div>

            <div className="sb-personal-copy sb-reveal sb-reveal-right">
              <div className="sb-section-kicker">
                Not just another outfit app
              </div>

              <h2>
                Good style starts with <em>what you have.</em>
              </h2>

              <p>
                StyleBuddy puts your own wardrobe first. Instead of starting
                with endless products, it helps you see new combinations in
                the clothes already hanging in your closet — then helps you
                fill genuine gaps.
              </p>

              <div className="sb-personal-points">
                <span>
                  <Check size={14} />
                  Recommendations grounded in your closet
                </span>

                <span>
                  <Check size={14} />
                  Suggestions shaped around your preferences
                </span>

                <span>
                  <Check size={14} />
                  Shopping only when it adds value
                </span>
              </div>

              <Link to="/stylist" className="sb-button-dark">
                Meet your AI stylist <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="sb-section" style={{ paddingTop: 0 }}>
          <div className="sb-section-head sb-reveal" style={{ maxWidth: 860 }}>
            <div>
              <div className="sb-section-kicker">Good to know</div>
              <h2>
                Questions, <em>answered.</em>
              </h2>
            </div>
          </div>

          <div className="sb-faq sb-reveal">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={18} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="sb-cta">
          <div className="sb-cta-content sb-reveal">
            <div className="sb-cta-kicker">
              Your wardrobe, with a little more intelligence
            </div>

            <h2>
              Make every outfit
              <br />
              <em>feel intentional.</em>
            </h2>

            <p>
              Start with the clothes you already own. Let StyleBuddy help
              with the rest.
            </p>

            <Link to="/register" className="sb-button-light">
              Create your closet <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="sb-footer">
        <Link to="/" className="sb-brand">
          <span className="sb-brand-mark">
            <Sparkles size={14} />
          </span>
          StyleBuddy
        </Link>

        <span>AI fashion closet · Your style, made personal</span>
        <span>© 2026 StyleBuddy</span>
      </footer>
    </div>
  );
}