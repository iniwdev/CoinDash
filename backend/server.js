require("dotenv").config();
const express = require("express");
const cors = require("cors");

console.log("GROQ_API_KEY loaded:", Boolean(process.env.GROQ_API_KEY));
console.log("OPENAI_API_KEY loaded:", Boolean(process.env.OPENAI_API_KEY));

const aiRoutes = require("./routes/aiRoutes");
const newsRoutes = require("./routes/newsRoutes");
const marketRoutes = require("./routes/marketRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/ai", aiRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/market", marketRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("AI route available at /api/ai/chat");
  console.log("News route available at /api/news?coin={coinName}");
});