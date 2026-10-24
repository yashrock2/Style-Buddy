import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Search,
  CloudSun,
  Trash2,
  ExternalLink
} from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>

        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}

export function Button({
  children,
  className = "",
  ...p
}) {
  return (
    <button
      className={`btn ${className}`}
      {...p}
    >
      {children}
    </button>
  );
}

export function LoadingState({
  text = "Loading..."
}) {
  return (
    <div className="state">
      <LoaderCircle
        className="spin"
        size={25}
      />

      <span>{text}</span>
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry
}) {
  return (
    <div className="state error">
      <AlertCircle size={24} />

      <div>
        <strong>{message}</strong>

        {onRetry && (
          <button
            className="text-btn"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action
}) {
  return (
    <div className="empty-state">
      {icon}

      <h3>{title}</h3>

      <p>{text}</p>

      {action}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search..."
}) {
  return (
    <div className="searchbox">
      <Search size={17} />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
      />
    </div>
  );
}

export function Pill({
  children
}) {
  return (
    <span className="pill">
      {children}
    </span>
  );
}

export function WeatherCard({
  weather
}) {
  return (
    <div className="weather-card">
      <div className="weather-icon">
        <CloudSun />
      </div>

      <div>
        <div className="muted">
          {weather.city}
        </div>

        <strong>
          {weather.temperature}°C
        </strong>

        <div>
          {weather.condition}
        </div>

        <small>
          {weather.recommendation}
        </small>
      </div>
    </div>
  );
}

export function OutfitCard({
  outfit,
  onOpen,
  onDelete
}) {
  return (
    <article
      className="outfit-card"
      onClick={onOpen}
    >
      <img
        src={outfit.image}
        alt={outfit.name}
      />

      <div className="outfit-body">
        <div className="outfit-title">
          <h3>{outfit.name}</h3>

          {outfit.score && (
            <span>
              {outfit.score}%
            </span>
          )}
        </div>

        <div className="muted">
          {outfit.occasion} · {outfit.style}
        </div>

        <div className="card-actions">
          {onDelete && (
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function Confidence({
  confidence = {}
}) {
  return (
    <div className="confidence-grid">
      {Object.entries(confidence).map(
        ([k, v]) => (
          <div key={k}>
            <span>
              {k.replaceAll("_", " ")}
            </span>

            <b>{v}%</b>

            <div className="bar">
              <i
                style={{
                  width: `${v}%`
                }}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function ProductCard({ p }) {
  const category =
    p?.article_type ||
    p?.subcategory ||
    p?.category ||
    "Fashion";

  const details = [
    p?.color,
    category,
    p?.fabric
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="product-card">

      <div className="product-image-placeholder">
        <div className="product-placeholder-icon">
          ✦
        </div>

        <span>
          StyleBuddy
        </span>
      </div>

      <div className="product-info">

        {p?.match !== undefined && (
          <span className="match">
            {p.match}% MATCH
          </span>
        )}

        <h3>
          {p?.name || "Fashion Product"}
        </h3>

        <div className="muted">
          {details || "Fashion item"}
        </div>

        {p?.occasion && (
          <small className="product-meta">
            {p.occasion}
          </small>
        )}

        {p?.formality && (
          <small className="product-meta">
            {p.formality}
          </small>
        )}

        <strong>
          Product from StyleBuddy catalog
        </strong>

        {p?.product_url ? (
          <button className="btn btn-outline full">
            <ExternalLink size={15} />
            View Product
          </button>
        ) : (
          <button
            className="btn btn-outline full"
            disabled
          >
            Catalog Item
          </button>
        )}

      </div>
    </article>
  );
}

export function Toast({
  children
}) {
  return (
    <div className="toast">
      <CheckCircle2 size={17} />
      {children}
    </div>
  );
}