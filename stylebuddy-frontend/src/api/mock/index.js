import { mockUser, mockCloset, mockOutfits, mockProducts } from "./data";

// Development-only persistence layer. This simulates a small backend database
// in the browser so accounts, sessions, closet items, outfits and profile data
// survive refreshes and browser restarts. It is NOT production authentication.
const DB_KEY = "stylebuddy_mock_db_v2";
const ACCESS_KEY = "stylebuddy_access_token";
const REFRESH_KEY = "stylebuddy_refresh_token";
const USER_KEY = "stylebuddy_current_user_id";

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const emailOf = (email) => String(email || "").trim().toLowerCase();

function readDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  // Seed one demo account on first run. New registrations are stored alongside it.
  const seed = {
    users: [{
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      password: "Stylebuddy123",
      profile: { ...mockUser },
      closet: mockCloset,
      outfits: mockOutfits,
      createdAt: new Date().toISOString()
    }]
  };
  writeDB(seed);
  return seed;
}

function writeDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function currentUserId() {
  return localStorage.getItem(USER_KEY);
}

function currentUser(db = readDB()) {
  return db.users.find((u) => u.id === currentUserId()) || null;
}

function publicUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return { ...safe, ...safe.profile };
}

function makeToken(userId, type) {
  return `mock-${type}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function requireUser() {
  const db = readDB();
  const user = currentUser(db);
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  return { db, user };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });
}

export const mockAuthApi = {
  async login({ email, password }) {
    await delay();
    const db = readDB();
    const user = db.users.find((u) => emailOf(u.email) === emailOf(email));
    if (!user || user.password !== password) {
      throw new Error("Incorrect email or password.");
    }
    localStorage.setItem(ACCESS_KEY, makeToken(user.id, "access"));
    localStorage.setItem(REFRESH_KEY, makeToken(user.id, "refresh"));
    localStorage.setItem(USER_KEY, user.id);
    return { access_token: localStorage.getItem(ACCESS_KEY), refresh_token: localStorage.getItem(REFRESH_KEY), token_type: "bearer", user: publicUser(user) };
  },

  async register({ name, email, password }) {
    await delay();
    const db = readDB();
    if (db.users.some((u) => emailOf(u.email) === emailOf(email))) {
      throw new Error("An account with this email already exists. Please sign in.");
    }
    const user = {
      id: `u-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
      name: String(name || "").trim(),
      email: emailOf(email),
      password,
      profile: { ...mockUser, id: undefined, name: String(name || "").trim(), email: emailOf(email), preferredStyles: [], preferredColors: [], avoidedColors: [], favouriteOccasions: [] },
      closet: [],
      outfits: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    localStorage.setItem(ACCESS_KEY, makeToken(user.id, "access"));
    localStorage.setItem(REFRESH_KEY, makeToken(user.id, "refresh"));
    localStorage.setItem(USER_KEY, user.id);
    return { access_token: localStorage.getItem(ACCESS_KEY), refresh_token: localStorage.getItem(REFRESH_KEY), token_type: "bearer", user: publicUser(user) };
  },

  async me() {
    await delay(100);
    const { user } = requireUser();
    return publicUser(user);
  },

  async refresh() {
    await delay(100);
    const { user } = requireUser();
    const access = makeToken(user.id, "access");
    const refresh = makeToken(user.id, "refresh");
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    return { access_token: access, refresh_token: refresh, token_type: "bearer", user: publicUser(user) };
  },

  async logout() {
    await delay(100);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export const mockClosetApi = {
  async getItems() { await delay(); return requireUser().user.closet || []; },
  async getItem(id) { await delay(100); return requireUser().user.closet.find((x) => x.id === id); },

  async analyze(file) {
    await delay(1300);
    const image = await fileToDataUrl(file);
    return {
      category: "Tops", article_type: "Tshirts", color: "White", pattern: "Plain", fabric: "Cotton",
      sleeve: "Short Sleeve", neckline: "Round", fit: "Regular", length: null, details: [],
      image, name: file.name.replace(/\.[^.]+$/, "")
    };
  },

  async createItem(payload) {
    await delay();
    const { db, user } = requireUser();
    const item = { id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString(), ...payload };
    user.closet = [item, ...(user.closet || [])];
    writeDB(db);
    return item;
  },

  async updateItem(id, payload) {
    await delay();
    const { db, user } = requireUser();
    const index = user.closet.findIndex((x) => x.id === id);
    if (index < 0) throw new Error("Garment not found.");
    user.closet[index] = { ...user.closet[index], ...payload, updatedAt: new Date().toISOString() };
    writeDB(db);
    return user.closet[index];
  },

  async deleteItem(id) {
    await delay();
    const { db, user } = requireUser();
    user.closet = user.closet.filter((x) => x.id !== id);
    writeDB(db);
  }
};

function recommendation(user, payload = {}) {
  const closet = user.closet || [];
  const tops = closet.filter((x) => x.category === "Tops");
  const bottoms = closet.filter((x) => x.category === "Bottoms");
  const footwear = closet.filter((x) => x.category === "Footwear");
  const items = [tops[0], bottoms[0], footwear[0]].filter(Boolean);
  const fallback = mockCloset.filter((x) => !items.some((i) => i.id === x.id));
  const chosen = items.length >= 2 ? items : [...items, ...fallback].slice(0, 3);
  return {
    id: `outfit-${Date.now()}`, name: "Your Easy Everyday Look", occasion: payload.occasion || "Casual",
    style: payload.style || "Smart Casual", score: 92, items: chosen,
    explanation: "This look starts with pieces already in your closet and keeps the palette balanced for an effortless result."
  };
}

export const mockStylistApi = {
  async recommend(payload) { await delay(900); return recommendation(requireUser().user, payload); },
  async chat({ message }) { await delay(650); return { message: `For “${message}”, I’d start with pieces you already own and keep the palette balanced. Want me to build the full look?` }; },
  async showAnother(payload) { await delay(700); return recommendation(requireUser().user, { ...payload, style: payload.style === "Minimal" ? "Casual" : "Minimal" }); }
};

export const mockOutfitApi = {
  async getSaved() { await delay(); return requireUser().user.outfits || []; },
  async save(payload) {
    await delay();
    const { db, user } = requireUser();
    const outfit = { ...payload, id: `o-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: new Date().toISOString() };
    user.outfits = [outfit, ...(user.outfits || [])];
    writeDB(db);
    return outfit;
  },
  async delete(id) {
    await delay();
    const { db, user } = requireUser();
    user.outfits = user.outfits.filter((x) => x.id !== id);
    writeDB(db);
  }
};

export const mockProductApi = {
  async getProducts() { await delay(); return mockProducts; },
  async getProduct(id) { await delay(100); return mockProducts.find((p) => p.id === id); }
};

export const mockProfileApi = {
  async getProfile() { await delay(); return requireUser().user.profile || {}; },
  async updateProfile(payload) {
    await delay();
    const { db, user } = requireUser();
    user.profile = { ...(user.profile || {}), ...payload, name: payload.name || user.name, email: user.email };
    user.name = user.profile.name;
    writeDB(db);
    return user.profile;
  }
};

export const mockWeatherApi = {
  async getWeather() { await delay(250); return { temperature: 28, condition: "Partly Cloudy", city: "Mumbai", recommendation: "Light layers recommended" }; }
};
