import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import closetRoutes from "./routes/closet.routes.js";
import stylistRoutes from "./routes/stylist.routes.js";
import outfitsRoutes from "./routes/outfits.routes.js";
import productsRoutes from "./routes/products.routes.js";
import shoppingRoutes from "./routes/shopping.routes.js";
const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(express.json());

app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "StyleBuddy backend is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/closet/items", closetRoutes);
app.use("/api/stylist", stylistRoutes);
app.use("/api/outfits", outfitsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/shopping", shoppingRoutes);

export default app;