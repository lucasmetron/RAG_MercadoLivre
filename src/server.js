import { searchSimilarChunks } from "./functions/returnSimilarity";
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body || {};
  const similarity = await searchSimilarChunks(question);
  console.log("similarity --->", similarity);

  res.json({
    question: question || null,
    answer: similarity,
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
