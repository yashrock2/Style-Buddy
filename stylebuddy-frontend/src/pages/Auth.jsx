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
  Sparkles,
  Check,
  Shirt,
  ScanFace,
  WandSparkles,
  CloudSun,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

/*
 * Dynamic authentication-side visual.
 *
 * No stock/fashion photo is used here.
 * The visual is built entirely from CSS + Lucide icons so it feels
 * like a living StyleBuddy product interface rather than a static banner.
 */
function AuthStory() {
  return (
    <div className="auth-story">
      <div className="auth-story-copy">
        <div className="eyebrow">YOUR DIGITAL WARDROBE</div>

        <h1>
          Get dressed with
          <br />
          <em>more intention.</em>
        </h1>

        <p>
          Your wardrobe, understood. Your style, personalised.
        </p>
      </div>

      <div className="style-stage">
        <div className="stage-topline">
          <span>STYLEBUDDY / DAILY EDIT</span>
          <span className="stage-live"><i /> CURATED FOR YOU</span>
        </div>

        <div className="editorial-word editorial-word-one">STYLE</div>
        <div className="editorial-word editorial-word-two">YOUR WAY</div>

        <div className="look-card look-card-main">
          <div className="look-card-top">
            <span>LOOK 01</span>
            <Heart size={13} />
          </div>
          <div className="look-visual">
            <div className="garment-shape garment-top-shape" />
            <div className="garment-shape garment-bottom-shape" />
            <div className="garment-shape garment-shoe-shape" />
          </div>
          <div className="look-card-bottom">
            <div>
              <strong>Clean layers</strong>
              <span>Everyday / Relaxed</span>
            </div>
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="mini-style-card mini-card-weather">
          <CloudSun size={16} />
          <div>
            <span>TODAY</span>
            <strong>28°C</strong>
            <small>Light layers</small>
          </div>
        </div>

        <div className="mini-style-card mini-card-closet">
          <Shirt size={16} />
          <div>
            <span>FROM YOUR CLOSET</span>
            <strong>14 pieces</strong>
          </div>
        </div>

        <div className="style-ticker">
          <div>
            PERSONAL <b>✦</b> OCCASION <b>✦</b> WEATHER <b>✦</b> COLOR <b>✦</b> FIT <b>✦</b>
            PERSONAL <b>✦</b> OCCASION <b>✦</b> WEATHER <b>✦</b> COLOR <b>✦</b> FIT <b>✦</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <>
      <style>{`
        .auth-side {
          position: relative;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(circle at 76% 24%, rgba(255,255,255,.07), transparent 25%),
            radial-gradient(circle at 15% 85%, rgba(164,139,105,.07), transparent 28%),
            #151514;
        }

        .auth-side::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .22;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,.16) .55px, transparent .55px);
          background-size: 5px 5px;
          mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
        }

        .auth-side::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          left: 40%;
          top: 45%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.055);
          box-shadow:
            0 0 0 55px rgba(255,255,255,.012),
            0 0 0 110px rgba(255,255,255,.008);
          animation: stageBreath 8s ease-in-out infinite;
          pointer-events: none;
        }

        .auth-brand,
        .auth-story { position: relative; z-index: 2; }

        .auth-story {
          display: flex;
          flex-direction: column;
          flex: 1;
          justify-content: center;
          padding: 30px 0 20px;
        }

        .auth-story-copy h1 {
          margin: 10px 0 0;
          color: #fff;
          font-size: clamp(44px, 4.2vw, 68px);
          line-height: .95;
          letter-spacing: -.055em;
          font-weight: 650;
        }

        .auth-story-copy h1 em {
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -.045em;
        }

        .auth-story-copy p {
          margin: 22px 0 0;
          color: #aaa79f;
          max-width: 390px;
          line-height: 1.7;
          font-size: 14px;
        }

        .style-stage {
          position: relative;
          width: 100%;
          max-width: 700px;
          height: 365px;
          margin-top: 34px;
          border-top: 1px solid rgba(255,255,255,.1);
          overflow: hidden;
        }

        .stage-topline {
          position: relative;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          color: #68655f;
          font-size: 7px;
          letter-spacing: .18em;
        }

        .stage-live { color: #aaa69c; }
        .stage-live i {
          display: inline-block;
          width: 5px;
          height: 5px;
          margin-right: 5px;
          border-radius: 50%;
          background: #b8a990;
          animation: liveDot 2s ease-in-out infinite;
        }

        .editorial-word {
          position: absolute;
          color: rgba(255,255,255,.035);
          font-size: clamp(90px, 10vw, 155px);
          line-height: .75;
          font-weight: 700;
          letter-spacing: -.08em;
          pointer-events: none;
          white-space: nowrap;
        }

        .editorial-word-one {
          left: -12px;
          top: 63px;
          animation: wordDrift 9s ease-in-out infinite;
        }

        .editorial-word-two {
          right: -25px;
          bottom: 70px;
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 400;
          animation: wordDriftReverse 11s ease-in-out infinite;
        }

        .look-card {
          position: absolute;
          z-index: 4;
          left: 50%;
          top: 45px;
          width: 265px;
          height: 278px;
          transform: translateX(-50%) rotate(-2deg);
          padding: 14px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 18px;
          background: linear-gradient(145deg, #24231f, #1c1b19);
          box-shadow: 0 28px 60px rgba(0,0,0,.3);
          animation: cardFloat 6s ease-in-out infinite;
        }

        .look-card-top,
        .look-card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .look-card-top { color: #77736b; font-size: 7px; letter-spacing: .15em; }
        .look-card-top svg { color: #aaa59b; }

        .look-visual {
          position: relative;
          height: 198px;
          margin: 9px 0;
          overflow: hidden;
          border-radius: 12px;
          background:
            radial-gradient(circle at 50% 35%, rgba(220,210,193,.16), transparent 28%),
            linear-gradient(145deg, #2d2a25, #171614);
        }

        .look-visual::before,
        .look-visual::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.06);
        }
        .look-visual::before { width: 180px; height: 180px; left: 50%; top: 10px; transform: translateX(-50%); }
        .look-visual::after { width: 115px; height: 115px; left: 50%; top: 43px; transform: translateX(-50%); }

        .garment-shape { position: absolute; left: 50%; transform: translateX(-50%); }
        .garment-top-shape {
          top: 33px;
          width: 82px;
          height: 92px;
          background: linear-gradient(135deg, #d9d1c3, #8f887d);
          clip-path: polygon(18% 0, 38% 12%, 62% 12%, 82% 0, 100% 28%, 79% 43%, 74% 100%, 26% 100%, 21% 43%, 0 28%);
          filter: drop-shadow(0 13px 12px rgba(0,0,0,.25));
          animation: garmentFloat 4.5s ease-in-out infinite;
        }
        .garment-bottom-shape {
          top: 112px;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #57534c, #292722);
          clip-path: polygon(14% 0, 86% 0, 100% 100%, 0 100%);
          animation: garmentFloatReverse 4.5s ease-in-out infinite;
        }
        .garment-shoe-shape {
          top: 169px;
          width: 92px;
          height: 17px;
          border-radius: 30px 8px 8px 30px;
          background: #b9b1a3;
          animation: shoeFloat 4.5s ease-in-out infinite;
        }

        .look-card-bottom strong,
        .look-card-bottom span { display: block; }
        .look-card-bottom strong { color: #eeeae1; font-size: 11px; font-weight: 600; }
        .look-card-bottom span { margin-top: 3px; color: #77736b; font-size: 7px; letter-spacing: .05em; }
        .look-card-bottom > svg { color: #a49f95; }

        .mini-style-card {
          position: absolute;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 12px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 12px;
          background: rgba(29,28,25,.9);
          color: #aaa69d;
          box-shadow: 0 18px 35px rgba(0,0,0,.2);
          backdrop-filter: blur(10px);
        }
        .mini-style-card svg { color: #d0c8ba; }
        .mini-style-card span,
        .mini-style-card strong,
        .mini-style-card small { display: block; }
        .mini-style-card span { color: #68645c; font-size: 5px; letter-spacing: .13em; }
        .mini-style-card strong { margin-top: 2px; color: #e1ddd4; font-size: 12px; }
        .mini-style-card small { margin-top: 2px; color: #858077; font-size: 7px; }

        .mini-card-weather {
          left: 9%;
          top: 105px;
          animation: sideFloat 5s ease-in-out infinite;
        }
        .mini-card-closet {
          right: 7%;
          bottom: 69px;
          animation: sideFloatReverse 5.5s ease-in-out infinite;
        }

        .style-ticker {
          position: absolute;
          z-index: 3;
          left: -3%;
          right: -3%;
          bottom: 11px;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,.07);
          border-bottom: 1px solid rgba(255,255,255,.07);
          padding: 8px 0;
          color: #66625b;
          font-size: 7px;
          letter-spacing: .18em;
          white-space: nowrap;
          transform: rotate(-1.2deg);
        }
        .style-ticker div { width: max-content; animation: ticker 20s linear infinite; }
        .style-ticker b { color: #a79d8d; margin: 0 12px; }

        @keyframes stageBreath { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.65} 50%{transform:translate(-50%,-50%) scale(1.08);opacity:1} }
        @keyframes liveDot { 0%,100%{box-shadow:0 0 0 0 rgba(184,169,144,.25)} 50%{box-shadow:0 0 0 6px rgba(184,169,144,0)} }
        @keyframes wordDrift { 0%,100%{transform:translateX(0)} 50%{transform:translateX(22px)} }
        @keyframes wordDriftReverse { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-18px)} }
        @keyframes cardFloat { 0%,100%{transform:translateX(-50%) translateY(0) rotate(-2deg)} 50%{transform:translateX(-50%) translateY(-8px) rotate(-1deg)} }
        @keyframes garmentFloat { 0%,100%{transform:translateX(-50%) translateY(0) rotate(0)} 50%{transform:translateX(-50%) translateY(-4px) rotate(1deg)} }
        @keyframes garmentFloatReverse { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(3px)} }
        @keyframes shoeFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(2px)} }
        @keyframes sideFloat { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-7px) rotate(1deg)} }
        @keyframes sideFloatReverse { 0%,100%{transform:translateY(0) rotate(1deg)} 50%{transform:translateY(7px) rotate(-1deg)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        @media (max-width: 1050px) {
          .auth-story-copy h1 { font-size: 48px; }
          .style-stage { height: 345px; }
          .look-card { transform: translateX(-50%) scale(.92) rotate(-2deg); }
          .mini-card-weather { left: 2%; }
          .mini-card-closet { right: 2%; }
        }

        @media (max-width: 800px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-side { min-height: auto; padding: 28px 25px 35px; }
          .auth-story { padding-top: 35px; }
          .auth-story-copy h1 { font-size: 48px; }
          .style-stage { margin-top: 28px; height: 350px; }
          .auth-main { padding: 35px 20px; }
        }

        @media (max-width: 520px) {
          .auth-side { padding: 24px 20px 28px; }
          .auth-story-copy h1 { font-size: 42px; }
          .style-stage { height: 315px; }
          .look-card { width: 225px; height: 245px; top: 45px; }
          .look-visual { height: 165px; }
          .mini-card-weather { left: 0; top: 92px; transform: scale(.85); transform-origin: left center; }
          .mini-card-closet { right: 0; bottom: 63px; transform: scale(.85); transform-origin: right center; }
          .editorial-word { font-size: 82px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-side *, .auth-side::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-side">
          <div className="auth-brand">
            <span className="brand-mark">
              <Sparkles size={16} />
            </span>
            StyleBuddy
          </div>

          <AuthStory />
        </div>

        <div className="auth-main">
          <div className="auth-form">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

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
      <div className="eyebrow">WELCOME BACK</div>

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
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </Field>

        <div className="form-row">
          <label className="check">
            <input type="checkbox" />
            Remember me
          </label>

          <a href="#forgot">Forgot password?</a>
        </div>

        {error && <div className="form-error">{error}</div>}

        <button className="btn btn-dark full" disabled={busy}>
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
        <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

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
    ["Minimum 8 characters", password.length >= 8],
    ["Uppercase letter", /[A-Z]/.test(password)],
    ["Lowercase letter", /[a-z]/.test(password)],
    ["Number", /\d/.test(password)],
  ];

  if (verificationMode) {
    return (
      <AuthLayout>
        <div className="eyebrow">VERIFY YOUR EMAIL</div>

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
              setOtp(value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="Enter 6-digit code"
          />

          {error && <div className="form-error">{error}</div>}

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

  return (
    <AuthLayout>
      <div className="eyebrow">JOIN STYLEBUDDY</div>

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
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </Field>

        <div className="requirements">
          {checks.map(([x, ok]) => (
            <span className={ok ? "ok" : ""} key={x}>
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

        {error && <div className="form-error">{error}</div>}

        <button
          className="btn btn-dark full"
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create account"}
          <ArrowRight size={17} />
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
