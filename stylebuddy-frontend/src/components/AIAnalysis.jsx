import React from "react";
import {
  Sparkles,
  Check,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

import { Button } from "./UI";

const formatLabel = (value) => {
  if (!value) return "Not detected";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function ConfidenceBar({ value }) {
  if (value === null || value === undefined) {
    return null;
  }

  const percentage = Math.max(
    0,
    Math.min(100, Number(value))
  );

  return (
    <div className="ai-confidence">
      <div className="ai-confidence-track">
        <div
          className="ai-confidence-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span>{percentage.toFixed(0)}%</span>
    </div>
  );
}

function AttributeCard({
  label,
  value,
  confidence,
  needsConfirmation,
}) {
  return (
    <div className="ai-attribute-card">
      <div className="ai-attribute-top">
        <span className="ai-attribute-label">
          {label}
        </span>

        {needsConfirmation ? (
          <span className="ai-warning">
            <AlertTriangle size={13} />
            Confirm
          </span>
        ) : (
          <span className="ai-confirmed">
            <Check size={13} />
            AI detected
          </span>
        )}
      </div>

      <strong>{formatLabel(value)}</strong>

      {confidence !== null &&
        confidence !== undefined && (
          <ConfidenceBar value={confidence} />
        )}
    </div>
  );
}

function PredictionList({ predictions }) {
  if (!predictions?.length) {
    return null;
  }

  return (
    <div className="ai-predictions">
      <div className="ai-predictions-title">
        <ChevronDown size={15} />
        Top AI predictions
      </div>

      {predictions.map((prediction, index) => (
        <div
          className="ai-prediction"
          key={`${prediction.index}-${index}`}
        >
          <span>
            {formatLabel(prediction.label)}
          </span>

          <span>
            {Number(prediction.confidence).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function GarmentAnalysis({ item }) {
  const ai = item?.details?.ai;

  if (!ai) {
    return (
      <div className="ai-empty-analysis">
        <Sparkles size={20} />

        <div>
          <strong>AI analysis unavailable</strong>

          <p>
            This clothing item does not have AI
            analysis data yet.
          </p>
        </div>
      </div>
    );
  }

  const category = ai.category;
  const articleType = ai.articleType;
  const color = ai.color;
  const pattern = ai.pattern;
  const fabric = ai.fabric;

  const needsConfirmation =
    ai?.articleType?.needsConfirmation ||
    ai?.color?.needsConfirmation ||
    ai?.pattern?.needsConfirmation ||
    ai?.fabric?.needsConfirmation;

  return (
    <div className="ai-analysis-card">
      <div className="ai-analysis-card-header">
        <div className="ai-analysis-title">
          <div className="ai-analysis-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <div className="eyebrow">
              STYLEBUDDY AI
            </div>

            <h3>AI Clothing Analysis</h3>
          </div>
        </div>

        <span className="ai-status-badge">
          <span className="ai-status-dot" />
          Analysis complete
        </span>
      </div>

      {needsConfirmation && (
        <div className="ai-confirmation-banner">
          <AlertTriangle size={17} />

          <div>
            <strong>
              Some attributes need your confirmation
            </strong>

            <p>
              StyleBuddy is less confident about one
              or more detected attributes. You can
              review them before using this item for
              styling.
            </p>
          </div>
        </div>
      )}

      <div className="ai-attributes-grid">
        <AttributeCard
          label="Category"
          value={category?.value}
          confidence={category?.confidencePercent}
          needsConfirmation={false}
        />

        <AttributeCard
          label="Article Type"
          value={articleType?.value}
          confidence={articleType?.confidencePercent}
          needsConfirmation={
            articleType?.needsConfirmation
          }
        />

        <AttributeCard
          label="Color"
          value={color?.value}
          confidence={color?.confidencePercent}
          needsConfirmation={
            color?.needsConfirmation
          }
        />

        <AttributeCard
          label="Fabric"
          value={fabric?.value}
          confidence={fabric?.confidencePercent}
          needsConfirmation={
            fabric?.needsConfirmation
          }
        />

        <AttributeCard
          label="Pattern"
          value={
            pattern?.value ||
            `AI class #${pattern?.index ?? "—"}`
          }
          confidence={pattern?.confidencePercent}
          needsConfirmation={
            pattern?.needsConfirmation
          }
        />
      </div>

      <div className="ai-predictions-grid">
        <PredictionList
          predictions={category?.top3}
        />

        <PredictionList
          predictions={articleType?.top3}
        />

        <PredictionList
          predictions={color?.top3}
        />

        <PredictionList
          predictions={fabric?.top3}
        />

        {pattern?.top3?.length > 0 && (
          <div className="ai-predictions">
            <div className="ai-predictions-title">
              <ChevronDown size={15} />
              Pattern model predictions
            </div>

            {pattern.top3.map(
              (prediction, index) => (
                <div
                  className="ai-prediction"
                  key={`${prediction.index}-${index}`}
                >
                  <span>
                    Pattern class #{prediction.index}
                  </span>

                  <span>
                    {Number(
                      prediction.confidence
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {pattern?.labelMappingVerified === false && (
        <div className="ai-info-note">
          <Sparkles size={15} />

          <span>
            Pattern classification is currently shown
            as a model class because its label mapping
            has not yet been verified.
          </span>
        </div>
      )}

      <div className="ai-analysis-footer">
        <div>
          <span>AI status</span>

          <strong>
            {ai?.aiStatus?.needsConfirmation
              ? "Review recommended"
              : "Ready for styling"}
          </strong>
        </div>

        <Button
          className="btn-dark"
          onClick={() => onComplete?.(item)}
        >
          Done
          <Check size={16} />
        </Button>
      </div>
    </div>
  );
}

export default function AIAnalysis({
  results = [],
  onComplete,
}) {
  return (
    <div className="analysis-wrap">
      <div className="analysis-head">
        <div className="ai-orb">
          <Sparkles />
        </div>

        <div>
          <div className="eyebrow">
            STYLEBUDDY AI
          </div>

          <h1>Your garments are ready</h1>

          <p>
            StyleBuddy analyzed your clothing using
            the AI models connected to your wardrobe.
          </p>
        </div>
      </div>

      <div className="analysis-progress">
        {[
          "Detecting garment type",
          "Understanding color",
          "Identifying pattern",
          "Analyzing fabric",
          "Saving AI attributes",
        ].map((step) => (
          <div
            className="analysis-step done"
            key={step}
          >
            <span>
              <Check size={13} />
            </span>

            {step}
          </div>
        ))}
      </div>

      <div className="analysis-results">
        <div className="analysis-results-heading">
          <div>
            <div className="eyebrow">
              AI RESULTS
            </div>

            <h2>
              Review your AI-detected attributes
            </h2>

            <p>
              {results.length}{" "}
              {results.length === 1
                ? "garment was"
                : "garments were"}{" "}
              analyzed successfully.
            </p>
          </div>
        </div>

        {results.map((item, index) => (
          <div
            className="ai-garment-result"
            key={item.id || index}
          >
            <div className="ai-garment-image">
              <img
                src={item.image}
                alt={
                  item.name ||
                  item.articleType ||
                  "Clothing item"
                }
              />
            </div>

            <GarmentAnalysis item={item} />
          </div>
        ))}

        {!results.length && (
          <div className="ai-empty-analysis">
            <Sparkles size={20} />

            <div>
              <strong>
                No analysis results found
              </strong>

              <p>
                Upload a clothing item to see its AI
                analysis.
              </p>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <Button
            className="btn-dark"
            onClick={() => onComplete?.(results)}
          >
            Done — continue to my closet
            <Check size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}