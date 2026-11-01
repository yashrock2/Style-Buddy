import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  CloudSun,
  Shirt,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthCharacterExperience from "../components/AuthCharacterExperience";

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  children,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <div className="input-wrap">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />

        {children}
      </div>
    </label>
  );
}

function AuthStory() {
  return (
    <div className="auth-avatar-only">
      <AuthCharacterExperience />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');

        .auth-page {
          --ink: #151513;
          --paper: #f7f5f0;
          --cream: #ece8df;
          --sand: #ddd6c8;
          --taupe: #8d806c;
          --sage: #839174;
          --muted: #77756e;
          --line: rgba(35,33,28,.13);
          min-height: 100vh;
          min-height: 100svh;
          display: grid;
          grid-template-columns: minmax(0,1.08fr) minmax(0,1fr);
          font-family: "DM Sans", sans-serif;
          color: var(--ink);
          background: var(--paper);
          -webkit-text-size-adjust: 100%;
          overflow-x: clip;
        }
        .auth-page * { -webkit-tap-highlight-color: transparent; }

        /* ============ LEFT: CHARACTER STAGE ============ */
        .auth-page .auth-side {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          min-height: 100svh;
          padding: 0 !important;
          overflow: hidden;
          isolation: isolate;
          background: radial-gradient(ellipse at 50% 42%, #34312a 0%, #1f1e1a 52%, #10100f 100%);
        }

        .auth-page .auth-side::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: .3;
          background-image: radial-gradient(rgba(255,255,255,.4) .7px, transparent .7px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse at 50% 50%, black 20%, transparent 75%);
        }

        .auth-page .auth-side::after { display: none; }

        .auth-back { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .auth-front { position: absolute; inset: 0; z-index: 4; pointer-events: none; }

        .auth-blob { position: absolute; border-radius: 50%; filter: blur(90px); }
        .auth-blob.a { width: 380px; height: 380px; left: 50%; top: 16%; margin-left: -190px; background: #8d806c; opacity: .4; animation: authDrift 14s ease-in-out infinite; }
        .auth-blob.b { width: 280px; height: 280px; left: -6%; bottom: 8%; background: #839174; opacity: .25; animation: authDrift 18s -6s ease-in-out infinite reverse; }
        .auth-blob.c { width: 240px; height: 240px; right: -6%; top: 6%; background: #c6b393; opacity: .22; animation: authDrift 16s -3s ease-in-out infinite; }

        .auth-word {
          position: absolute;
          left: 50%; top: 46%;
          transform: translate(-50%,-50%);
          white-space: nowrap;
          font: 700 clamp(120px,17vw,260px) "DM Sans", sans-serif;
          letter-spacing: -.08em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(236,232,223,.12);
          animation: authWord 9s ease-in-out infinite;
        }

        .auth-halo {
          position: absolute; left: 50%; top: 48%;
          width: min(78%,560px); aspect-ratio: 1;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(236,232,223,.28), rgba(141,128,108,.16) 48%, transparent 70%);
          animation: authBreathe 6s ease-in-out infinite;
        }

        .auth-ring {
          position: absolute; left: 50%; top: 48%;
          border-radius: 50%;
          border: 1px dashed rgba(236,232,223,.28);
          animation: authSpin 38s linear infinite;
        }
        .auth-ring.one { width: min(72%,520px); aspect-ratio: 1; margin: calc(min(72%,520px) / -2) 0 0 calc(min(72%,520px) / -2); }
        .auth-ring.two { width: min(92%,680px); aspect-ratio: 1; margin: calc(min(92%,680px) / -2) 0 0 calc(min(92%,680px) / -2); border-style: solid; border-color: rgba(236,232,223,.08); animation-duration: 60s; animation-direction: reverse; }
        .auth-ring i {
          position: absolute; top: -6px; left: 50%;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--cream); box-shadow: 0 0 22px rgba(236,232,223,.8);
        }
        .auth-ring.two i { background: #9fb08c; box-shadow: 0 0 22px #9fb08c; top: auto; bottom: 14%; left: 8%; }

        .auth-particles i {
          position: absolute; bottom: -10px;
          width: 4px; height: 4px; border-radius: 50%;
          background: #fff; opacity: 0;
          animation: authRise linear infinite;
        }
        .auth-particles i:nth-child(3n) { background: var(--sand); width: 5px; height: 5px; }
        .auth-particles i:nth-child(4n) { background: #c6b393; }

        .auth-avatar-only {
          position: absolute; inset: 0; z-index: 2;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
          filter: drop-shadow(0 40px 50px rgba(0,0,0,.45));
        }
        .auth-avatar-only > *,
        .auth-avatar-only canvas,
        .auth-avatar-only > * canvas { display: block; width: 100% !important; height: 100% !important; }

        /* floating glass cards */
        .auth-card {
          position: absolute;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 16px;
          background: rgba(255,255,255,.09);
          color: #fff;
          backdrop-filter: blur(16px);
          box-shadow: 0 18px 50px rgba(0,0,0,.3);
        }
        .auth-card-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 11px; color: var(--ink); background: var(--cream); }
        .auth-card small { display: block; margin-bottom: 3px; color: #bdb7a8; font-size: 10px; }
        .auth-card strong { display: block; font-size: 13px; font-weight: 600; }
        .auth-card.c1 { top: 13%; left: 7%; animation: authFloat 5s ease-in-out infinite; }
        .auth-card.c2 { top: 30%; right: 6%; animation: authFloat 6s .8s ease-in-out infinite; }
        .auth-card.c2 .auth-card-icon { background: var(--sand); }
        .auth-card.c3 { bottom: 24%; left: 6%; animation: authFloat 7s .4s ease-in-out infinite; }
        .auth-score { color: var(--cream); font: italic 500 24px "Playfair Display", serif; margin-left: 6px; }

        .auth-brand {
          position: absolute; top: 28px; left: 32px;
          display: flex; align-items: center; gap: 10px;
          color: #fff; text-decoration: none; pointer-events: auto;
          font: 700 19px "DM Sans", sans-serif; letter-spacing: -.05em;
        }
        .auth-brand-mark {
          width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%;
          color: var(--ink); background: var(--cream);
        }

        .auth-caption { position: absolute; left: 32px; right: 32px; bottom: 30px; color: #fff; }
        .auth-caption h2 { margin: 0 0 6px; font: 500 clamp(26px,2.8vw,38px) "Playfair Display", serif; letter-spacing: -.03em; }
        .auth-caption h2 em { color: #c6b393; }
        .auth-caption p { margin: 0; color: #bdb7a8; font-size: 14px; }
        .auth-swatches { display: flex; gap: 8px; margin-top: 16px; }
        .auth-swatches span {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.35);
          animation: authPop 3.6s ease-in-out infinite;
        }
        .auth-swatches span:nth-child(1) { background: #d8d4c9; }
        .auth-swatches span:nth-child(2) { background: #343a43; animation-delay: .3s; }
        .auth-swatches span:nth-child(3) { background: #839174; animation-delay: .6s; }
        .auth-swatches span:nth-child(4) { background: #b8aa96; animation-delay: .9s; }
        .auth-swatches span:nth-child(5) { background: #8a2c4a; animation-delay: 1.2s; }

        /* ============ RIGHT: FORM ============ */
        .auth-page .auth-main {
          position: relative; z-index: 1; min-width: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 48px clamp(22px,5vw,72px);
          background:
            radial-gradient(circle at 100% 0%, rgba(221,214,200,.6), transparent 45%),
            radial-gradient(circle at 0% 100%, rgba(236,232,223,.8), transparent 45%),
            var(--paper);
        }
        .auth-page .auth-form { width: 100%; max-width: 470px; animation: authRise2 .9s cubic-bezier(.2,.7,.2,1) both; }

        .auth-page .eyebrow {
          display: inline-block; margin-bottom: 16px; padding: 7px 14px;
          border-radius: 999px; background: #fff; border: 1px solid var(--line);
          color: var(--taupe); font-size: 11px; font-weight: 700; letter-spacing: .12em;
        }
        .auth-page h1 {
          margin: 0; font: 700 clamp(34px,3.6vw,48px) "DM Sans", sans-serif;
          letter-spacing: -.06em; line-height: 1.02; color: var(--ink);
        }
        .auth-page .auth-sub { margin: 14px 0 26px; color: var(--muted); font-size: 15px; line-height: 1.6; }
        .auth-page .auth-sub strong { color: var(--ink); word-break: break-word; }

        .auth-page .field { display: block; margin-bottom: 18px; }
        .auth-page .field > span { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: var(--ink); }
        .auth-page .input-wrap { position: relative; }
        .auth-page .input-wrap input {
          width: 100%; height: 56px; padding: 0 50px 0 18px;
          font: 500 15px "DM Sans", sans-serif; color: var(--ink);
          border: 1.5px solid var(--line); border-radius: 14px; background: #fff; outline: none;
          -webkit-appearance: none; appearance: none;
          transition: border-color .25s, box-shadow .25s, transform .25s;
        }
        .auth-page .input-wrap input::placeholder { color: #aaa69b; }
        .auth-page .input-wrap input:hover { border-color: rgba(35,33,28,.3); }
        .auth-page .input-wrap input:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 5px rgba(141,128,108,.2), 0 12px 30px rgba(48,42,32,.1);
          transform: translateY(-1px);
        }
        .auth-page .input-wrap input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #ece8df inset;
          -webkit-text-fill-color: var(--ink);
        }
        .auth-page .password-btn {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; display: grid; place-items: center;
          border: 0; border-radius: 12px; background: transparent; color: var(--muted); cursor: pointer;
          transition: background .2s, color .2s;
        }
        .auth-page .password-btn:hover { background: var(--cream); color: var(--ink); }

        .auth-page .requirements { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 20px; }
        .auth-page .requirements span {
          display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px;
          border: 1px solid var(--line); border-radius: 999px; background: #fff;
          color: #8d8a80; font-size: 12px; transition: all .35s cubic-bezier(.2,.7,.2,1);
        }
        .auth-page .requirements span svg { opacity: .5; transition: transform .35s; }
        .auth-page .requirements span.ok {
          color: #fff; border-color: transparent; background: var(--sage);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(131,145,116,.4);
        }
        .auth-page .requirements span.ok svg { opacity: 1; transform: scale(1.25) rotate(-8deg); }

        .auth-page .form-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 2px 0 22px; font-size: 13px; }
        .auth-page .form-row a { color: var(--ink); text-decoration: none; font-weight: 600; }
        .auth-page .form-row a:hover { text-decoration: underline; }
        .auth-page .check { display: flex; align-items: center; gap: 8px; color: var(--muted); cursor: pointer; }
        .auth-page .check input { width: 16px; height: 16px; accent-color: var(--ink); }

        .auth-page .form-error {
          margin: 0 0 16px; padding: 13px 16px; border-radius: 14px;
          background: #fbeeea; border: 1px solid #efc7bb; color: #a5301d; font-size: 13px;
          animation: authShake .45s;
        }

        .auth-page .btn {
          min-height: 56px; padding: 0 26px;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          border-radius: 14px; font: 600 15px "DM Sans", sans-serif; cursor: pointer;
          transition: transform .3s, box-shadow .3s, background .3s, opacity .3s;
        }
        .auth-page .btn.full { width: 100%; }
        .auth-page .btn svg { transition: transform .3s; }
        .auth-page .btn:hover:not(:disabled) svg { transform: translateX(4px); }
        .auth-page .btn-dark {
          border: 0; color: #fff; background: var(--ink);
          box-shadow: 0 14px 34px rgba(21,21,19,.25);
        }
        .auth-page .btn-dark:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 20px 44px rgba(21,21,19,.35); }
        .auth-page .btn-dark:disabled { opacity: .5; cursor: not-allowed; }
        .auth-page .btn-outline { color: var(--ink); background: #fff; border: 1.5px solid var(--line); }
        .auth-page .btn-outline:hover { transform: translateY(-3px); background: var(--cream); box-shadow: 0 14px 30px rgba(48,42,32,.1); }

        .auth-page .divider { display: flex; align-items: center; gap: 14px; margin: 22px 0; color: #aaa69b; font-size: 12px; }
        .auth-page .divider:before,.auth-page .divider:after { content: ""; flex: 1; height: 1px; background: var(--line); }

        .auth-page .auth-switch { margin: 24px 0 0; text-align: center; color: var(--muted); font-size: 14px; }
        .auth-page .auth-switch a,.auth-page .text-button {
          padding: 0; border: 0; background: none; cursor: pointer;
          color: var(--ink); font: 700 14px "DM Sans", sans-serif; text-decoration: underline; text-underline-offset: 3px;
        }

        /* ============ KEYFRAMES ============ */
        @keyframes authFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-50px,40px); } }
        @keyframes authBreathe { 0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .9; } 50% { transform: translate(-50%,-50%) scale(1.1); opacity: 1; } }
        @keyframes authWord { 0%,100% { transform: translate(-50%,-50%); } 50% { transform: translate(-50%,-55%); } }
        @keyframes authRise { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: .9; } 100% { transform: translateY(-105vh); opacity: 0; } }
        @keyframes authRise2 { from { opacity: 0; transform: translateY(34px); } to { opacity: 1; transform: none; } }
        @keyframes authPop { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-6px) scale(1.12); } }
        @keyframes authShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 1000px) {
          .auth-card.c3 { display: none; }
        }

        @media (max-width: 800px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-page .auth-side { min-height: 0; height: 330px; }
          .auth-card.c2,.auth-card.c3,.auth-caption { display: none; }
          .auth-card.c1 { top: auto; bottom: 6%; left: 5%; transform: scale(.86); transform-origin: left bottom; }
          .auth-brand { top: 18px; left: 18px; }
          .auth-word { font-size: 42vw; }

          .auth-page .auth-main { padding: 28px 18px calc(40px + env(safe-area-inset-bottom)); align-items: flex-start; }
          .auth-page .auth-form { max-width: none; }
          .auth-page h1 { font-size: 32px; }
          .auth-page .auth-sub { font-size: 14px; margin-bottom: 22px; }

          /* 16px stops iPhones from zooming in when an input is tapped */
          .auth-page .input-wrap input { font-size: 16px; height: 54px; }
          .auth-page .requirements span { font-size: 11.5px; padding: 6px 10px; }
        }

        @media (max-width: 520px) {
          .auth-page .auth-side { height: 290px; }
          .auth-card.c1 { display: none; }
        }

        @media (hover: none) {
          .auth-page .btn-dark:hover:not(:disabled),
          .auth-page .btn-outline:hover { transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-page *,.auth-page *:before,.auth-page *:after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="auth-page">

        {/* LEFT SIDE: 3D CHARACTER + ANIMATED STAGE */}
        <div className="auth-side">

          {/* background layers */}
          <div className="auth-back">
            <span className="auth-blob a" />
            <span className="auth-blob b" />
            <span className="auth-blob c" />
            <span className="auth-word">STYLE</span>
            <span className="auth-halo" />
            <span className="auth-ring one"><i /></span>
            <span className="auth-ring two"><i /></span>

            <div className="auth-particles">
              {[...Array(14)].map((_, i) => (
                <i
                  key={i}
                  style={{
                    left: `${(i * 37 + 8) % 100}%`,
                    animationDelay: `${i * -1.7}s`,
                    animationDuration: `${9 + (i % 5) * 2.5}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* the character */}
          <AuthStory />

          {/* foreground layers */}
          <div className="auth-front">
            <Link to="/" className="auth-brand">
              <span className="auth-brand-mark">
                <Sparkles size={16} />
              </span>
              StyleBuddy
            </Link>

            <div className="auth-card c1">
              <span className="auth-card-icon">
                <CloudSun size={18} />
              </span>
              <span>
                <small>Dress for the day</small>
                <strong>Weather-aware looks</strong>
              </span>
            </div>

            <div className="auth-card c2">
              <span className="auth-card-icon">
                <Shirt size={18} />
              </span>
              <span>
                <small>Your digital closet</small>
                <strong>Every piece, organised</strong>
              </span>
            </div>

            <div className="auth-card c3">
              <span>
                <small>Outfit match</small>
                <strong>Smart casual</strong>
              </span>
              <span className="auth-score">96%</span>
            </div>

            <div className="auth-caption">
              <h2>
                Your closet, <em>understood.</em>
              </h2>
              <p>Outfits built around the clothes you already own.</p>
              <div className="auth-swatches">
                <span /><span /><span /><span /><span />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE: EXISTING AUTHENTICATION FORM */}
        <div className="auth-main">
          <div className="auth-form">
            {children}
          </div>
        </div>

      </div>
    </>
  );
}

// ============================================
// LOGIN PAGE
// ============================================

export function Login() {
  const { signIn } = useAuth();

  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout>

      <div className="eyebrow">
        WELCOME BACK
      </div>

      <h1>Sign in to StyleBuddy</h1>

      <p className="auth-sub">
        Pick up where your wardrobe left off.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          setBusy(true);
          setError("");

          try {
            await signIn({
              email,
              password,
            });

            nav(loc.state?.from || "/dashboard");

          } catch (e) {
            setError(e.message);

          } finally {
            setBusy(false);
          }
        }}
      >

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Your password"
        >

          <button
            type="button"
            className="password-btn"
            onClick={() => setShow(!show)}
          >
            {show
              ? <EyeOff size={17} />
              : <Eye size={17} />
            }
          </button>

        </Field>

        <div className="form-row">

          <label className="check">
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#forgot">
            Forgot password?
          </a>

        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          className="btn btn-dark full"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
          <ArrowRight size={17} />
        </button>

      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button className="btn btn-outline full">
        Continue with Google
      </button>

      <p className="auth-switch">
        New to StyleBuddy?{" "}
        <Link to="/register">
          Create an account
        </Link>
      </p>

    </AuthLayout>
  );
}

// ============================================
// REGISTER PAGE
// ============================================

export function Register() {
  const {
    signUp,
    verifyEmail,
    signIn,
  } = useAuth();

  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [otp, setOtp] = useState("");

  const [verificationMode, setVerificationMode] =
    useState(false);

  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checks = [
    [
      "Minimum 8 characters",
      password.length >= 8,
    ],
    [
      "Uppercase letter",
      /[A-Z]/.test(password),
    ],
    [
      "Lowercase letter",
      /[a-z]/.test(password),
    ],
    [
      "Number",
      /\d/.test(password),
    ],
  ];

  // ==========================================
  // EMAIL VERIFICATION SCREEN
  // ==========================================

  if (verificationMode) {
    return (
      <AuthLayout>

        <div className="eyebrow">
          VERIFY YOUR EMAIL
        </div>

        <h1>Check your email</h1>

        <p className="auth-sub">
          We sent a 6-digit verification code to{" "}
          <strong>{email}</strong>.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            setBusy(true);
            setError("");

            try {
              await verifyEmail({
                userId: localStorage.getItem(
                  "stylebuddy_current_user_id"
                ),
                otp,
              });

              await signIn({
                email,
                password,
              });

              nav("/onboarding");

            } catch (e) {
              setError(e.message);

            } finally {
              setBusy(false);
            }
          }}
        >

          <Field
            label="Verification code"
            value={otp}
            onChange={(value) =>
              setOtp(
                value.replace(/\D/g, "").slice(0, 6)
              )
            }
            placeholder="Enter 6-digit code"
          />

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="btn btn-dark full"
            disabled={busy || otp.length !== 6}
          >
            {busy ? "Verifying…" : "Verify email"}
            <ArrowRight size={17} />
          </button>

        </form>

        <p className="auth-switch">
          Wrong email?{" "}

          <button
            type="button"
            className="text-button"
            onClick={() => {
              setVerificationMode(false);
              setError("");
              setOtp("");
            }}
          >
            Go back
          </button>

        </p>

      </AuthLayout>
    );
  }

  // ==========================================
  // REGISTRATION FORM
  // ==========================================

  return (
    <AuthLayout>

      <div className="eyebrow">
        JOIN STYLEBUDDY
      </div>

      <h1>Create your account</h1>

      <p className="auth-sub">
        Your personal stylist starts with your wardrobe.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (password !== confirm) {
            setError("Passwords do not match.");
            return;
          }

          if (!checks.every((x) => x[1])) {
            setError(
              "Please meet all password requirements."
            );
            return;
          }

          setBusy(true);
          setError("");

          try {
            const data = await signUp({
              name,
              email,
              password,
            });

            localStorage.setItem(
              "stylebuddy_current_user_id",
              data.userId
            );

            setVerificationMode(true);

          } catch (e) {
            setError(e.message);

          } finally {
            setBusy(false);
          }
        }}
      >

        <Field
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Your name"
        />

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          type={show ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Create a strong password"
        >

          <button
            type="button"
            className="password-btn"
            onClick={() => setShow(!show)}
          >
            {show
              ? <EyeOff size={17} />
              : <Eye size={17} />
            }
          </button>

        </Field>

        <div className="requirements">

          {checks.map(([x, ok]) => (
            <span
              className={ok ? "ok" : ""}
              key={x}
            >
              <Check size={13} />
              {x}
            </span>
          ))}

        </div>

        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat password"
        />

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          className="btn btn-dark full"
          disabled={busy}
        >
          {busy
            ? "Creating account…"
            : "Create account"
          }

          <ArrowRight size={17} />
        </button>

      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login">
          Sign in
        </Link>
      </p>

    </AuthLayout>
  );
}