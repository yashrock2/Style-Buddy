import app from "./app.js";
import { env } from "./config/env.js";

const PORT = process.env.PORT || env.port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 StyleBuddy backend running on port ${PORT}`);
});