import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { services } from "../api";

const groups = [
  [
    "Gender",
    ["Male", "Female", "Other / Prefer not to say"],
  ],

  [
    "Style",
    [
      "Casual",
      "Formal",
      "Party",
      "Streetwear",
      "Minimal",
      "Traditional",
      "Smart Casual",
      "Sporty",
    ],
  ],

  [
    "Body Type",
    [
      "Pear",
      "Hourglass",
      "Rectangle",
      "Apple",
      "Inverted Triangle",
      "Prefer not to say",
    ],
  ],

  [
    "Undertone",
    ["Warm", "Cool", "Neutral"],
  ],

  [
    "Typical occasions",
    [
      "College",
      "Office",
      "Casual",
      "Party",
      "Date",
      "Wedding",
      "Travel",
      "Gym",
      "Festival",
    ],
  ],
];

export default function Onboarding() {
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState({});
  const [multi, setMulti] = useState([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [g, opts] = groups[step];

  const choose = (option) => {
    setSelected((current) => ({
      ...current,
      [g]: option,
    }));
  };

  const handleContinue = async () => {
    setError("");

    if (g !== "Typical occasions" && !selected[g]) {
      setError(`Please select your ${g.toLowerCase()}.`);
      return;
    }

    if (g === "Typical occasions" && multi.length === 0) {
      setError("Please select at least one occasion.");
      return;
    }

    if (step < groups.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final step — save everything to PostgreSQL.
    setBusy(true);

    try {
      await services.profile.updateProfile({
        gender: selected["Gender"] || null,

        styles: selected["Style"]
          ? [selected["Style"]]
          : [],

        bodyType:
          selected["Body Type"] || null,

        undertone:
          selected["Undertone"] || null,

        occasions: multi,

        onboardingCompleted: true,
      });

      nav("/dashboard");
    } catch (e) {
      setError(
        e.message ||
          "Unable to save your profile."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="onboard">
      <div className="onboard-top">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={16} />
          </span>

          StyleBuddy
        </div>

        <button
          className="text-btn"
          onClick={() => nav("/dashboard")}
        >
          Skip for now
        </button>
      </div>

      <div className="onboard-card">
        <div className="progress">
          <i
            style={{
              width: `${
                ((step + 1) / groups.length) * 100
              }%`,
            }}
          />
        </div>

        <div className="eyebrow">
          LET'S PERSONALISE
        </div>

        <h1>{g}</h1>

        <p>
          {g === "Style"
            ? "Choose the aesthetics you naturally gravitate toward."
            : g === "Typical occasions"
            ? "Where do you usually need outfit ideas?"
            : g === "Body Type"
            ? "Choose the body shape that best describes your proportions."
            : g === "Undertone"
            ? "Choose your skin undertone to improve colour recommendations."
            : "This helps StyleBuddy make better recommendations for you."}
        </p>

        <div className="choice-grid">
          {opts.map((option) => {
            const isSelected =
              selected[g] === option ||
              multi.includes(option);

            return (
              <button
                className={
                  isSelected
                    ? "choice selected"
                    : "choice"
                }
                key={option}
                onClick={() =>
                  g === "Typical occasions"
                    ? setMulti((current) =>
                        current.includes(option)
                          ? current.filter(
                              (x) => x !== option
                            )
                          : [...current, option]
                      )
                    : choose(option)
                }
              >
                {isSelected && (
                  <Check size={16} />
                )}

                {option}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <div className="onboard-footer">
          <span>
            Step {step + 1} of {groups.length}
          </span>

          <button
            className="btn btn-dark"
            onClick={handleContinue}
            disabled={busy}
          >
            {busy
              ? "Saving..."
              : step < groups.length - 1
              ? "Continue"
              : "Finish setup"}

            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}