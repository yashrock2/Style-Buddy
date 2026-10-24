import React, { useEffect, useState } from "react";
import { services } from "../api";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Button } from "../components/UI";

const STYLE_OPTIONS = [
  "Casual",
  "Formal",
  "Party",
  "Streetwear",
  "Minimal",
  "Traditional",
  "Smart Casual",
  "Sporty",
];

const OCCASION_OPTIONS = [
  "College",
  "Office",
  "Casual",
  "Party",
  "Date",
  "Wedding",
  "Travel",
  "Gym",
  "Festival",
];

export default function Profile() {
  const { user } = useAuth();

  const [p, setP] = useState({
    name: "",
    email: "",
    gender: "",
    bodyType: "",
    undertone: "",
    styles: [],
    occasions: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setError("");

        const response = await services.profile.getProfile();

        if (!mounted) return;

        const profile = response.profile || {};

        setP({
          name: profile.name || "",
          email: user?.email || "",
          gender: profile.gender || "",
          bodyType: profile.bodyType || "",
          undertone: profile.undertone || "",
          styles: Array.isArray(profile.styles)
            ? profile.styles
            : [],
          occasions: Array.isArray(profile.occasions)
            ? profile.occasions
            : [],
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err.message || "Unable to load your profile."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  const update = (key, value) => {
    setP((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleArrayValue = (key, value) => {
    setP((current) => {
      const currentValues = current[key] || [];

      return {
        ...current,
        [key]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await services.profile.updateProfile({
        name: p.name || null,
        gender: p.gender || null,
        bodyType: p.bodyType || null,
        undertone: p.undertone || null,
        styles: p.styles || [],
        occasions: p.occasions || [],
        onboardingCompleted: true,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      setError(
        err.message || "Unable to save your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="PERSONALISATION"
          title="My Profile"
          description="Help StyleBuddy understand what feels like you."
        />

        <div className="form-card">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="PERSONALISATION"
        title="My Profile"
        description="Help StyleBuddy understand what feels like you."
      />

      <div className="form-card">

        {/* ABOUT YOU */}
        <div className="form-section">
          <h2>About you</h2>

          <div className="two-col">

            <label className="field">
              <span>Name</span>
              <input
                value={p.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                placeholder="Your name"
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                value={p.email}
                disabled
              />
            </label>

            <label className="field">
              <span>Gender</span>

              <select
                value={p.gender}
                onChange={(e) =>
                  update("gender", e.target.value)
                }
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>
                  Other / Prefer not to say
                </option>
              </select>
            </label>

            <label className="field">
              <span>Body type</span>

              <select
                value={p.bodyType}
                onChange={(e) =>
                  update("bodyType", e.target.value)
                }
              >
                <option value="">Select</option>
                <option>Pear</option>
<option>Hourglass</option>
<option>Rectangle</option>
<option>Apple</option>
<option>Inverted Triangle</option>
<option>
  Prefer not to say
</option>
              </select>
            </label>

            <label className="field">
              <span>Undertone</span>

              <select
                value={p.undertone}
                onChange={(e) =>
                  update("undertone", e.target.value)
                }
              >
                <option value="">Select</option>
                <option>Warm</option>
                <option>Cool</option>
                <option>Neutral</option>
              </select>
            </label>

          </div>
        </div>

        {/* STYLE PREFERENCES */}
        <div className="form-section">
          <h2>Style preferences</h2>

          <label className="field">
            <span>Preferred styles</span>

            <div className="choice-grid">
              {STYLE_OPTIONS.map((style) => {
                const selected =
                  p.styles.includes(style);

                return (
                  <button
                    type="button"
                    key={style}
                    className={
                      selected
                        ? "choice selected"
                        : "choice"
                    }
                    onClick={() =>
                      toggleArrayValue(
                        "styles",
                        style
                      )
                    }
                  >
                    {selected && "✓ "}
                    {style}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        {/* OCCASIONS */}
        <div className="form-section">
          <h2>Typical occasions</h2>

          <label className="field">
            <span>
              Where do you usually need outfit ideas?
            </span>

            <div className="choice-grid">
              {OCCASION_OPTIONS.map((occasion) => {
                const selected =
                  p.occasions.includes(occasion);

                return (
                  <button
                    type="button"
                    key={occasion}
                    className={
                      selected
                        ? "choice selected"
                        : "choice"
                    }
                    onClick={() =>
                      toggleArrayValue(
                        "occasions",
                        occasion
                      )
                    }
                  >
                    {selected && "✓ "}
                    {occasion}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <Button
          className="btn-dark"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : saved
            ? "Saved ✓"
            : "Save changes"}
        </Button>

      </div>
    </div>
  );
}