# StyleBuddy — AI Fashion Closet

A production-oriented React + Vite frontend for StyleBuddy. The UI is designed to connect to an existing AI/ML backend without rebuilding the recommendation engine.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env`:

```text
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_API=true
```

Set `VITE_USE_MOCK_API=false` when the real backend is ready.

## API architecture

All backend communication is centralized under `src/api/`:

- `client.js` — fetch client and Bearer token handling
- `auth.js` — register/login/refresh/me/logout
- `closet.js` — garment analysis and closet CRUD
- `stylist.js` — recommendations/chat/show-another
- `outfits.js` — saved outfit operations
- `products.js` — shopping catalog
- `profile.js` — personalization
- `weather.js` — weather

Mock implementations live under `src/api/mock/` and are selected centrally by `src/api/index.js`. Components do not contain mock data or scattered fetch calls.

## JWT

Production authentication expects:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

The client attaches:

```text
Authorization: Bearer <access_token>
```

Refresh-token handling is isolated in `src/api/client.js`. For a production deployment, use secure backend-managed refresh cookies where appropriate; this frontend keeps the contract adaptable.

## Connect the AI backend

The main integration points are:

- Garment analysis: `closetApi.analyze(file)` → `POST /api/garments/analyze`
- Save garment: `closetApi.createItem(payload)` → `POST /api/closet/items`
- AI recommendation: `stylistApi.recommend(payload)` → `POST /api/stylist/recommend`
- Conversational stylist: `stylistApi.chat(payload)` → `POST /api/stylist/chat`
- Show another: `stylistApi.showAnother(payload)` → `POST /api/stylist/show-another`

The frontend deliberately does not implement or alter classification, preprocessing, scoring, or V13.2 recommendation logic.

## Clothing upload

`src/components/UploadGallery.jsx` supports:

- desktop file picker
- mobile gallery
- camera capture where supported
- drag/drop
- multiple JPG/JPEG/PNG/WEBP files

The selected files are passed to the analysis service.

## V13.2

The frontend treats the recommendation response as authoritative. Put the real V13.2 endpoint behind `stylistApi.recommend()` and map the backend response to the UI model there if necessary.

## Pages

Public:
- Landing
- Login
- Register

Protected:
- Onboarding
- Dashboard
- My Closet
- Garment Details
- AI Stylist
- Outfit Generator
- Saved Outfits
- Shop
- Profile
- Settings

## Notes

Mock mode is intentionally isolated for development and presentation. It is not production authentication and does not replace signed JWT authentication.

## Mock account persistence

When `VITE_USE_MOCK_API=true`, the development app now persists its simulated backend database in browser `localStorage`.

It persists:

- registered accounts and login credentials (development only)
- current login/session
- each user's closet items and uploaded images
- saved outfits
- profile/personalisation changes

This means a user can register, add clothes, refresh the page, close/reopen the browser, and sign back in later with the same email/password and still see that user's closet and saved data.

A demo account is seeded on first use:

```text
Email: vinayak@example.com
Password: Stylebuddy123
```

The seeded demo closet is also persisted after first initialization.

**Security note:** browser-local mock credentials are only for development/demo mode. Never use this storage model for production authentication. With `VITE_USE_MOCK_API=false`, login/session/closet persistence comes from your real backend and database.
