const express = require("express");
require("dotenv").config();

const { searchSimilarChunks } = require("./functions/returnSimilarity");
const { returnPrompt } = require("./functions/generatePrompt");
const { askToDeepSeak } = require("./functions/ai");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body || {};
  const similarity = await searchSimilarChunks(question);
  const context = similarity.map((item) => item.content).join("\n\n");
  const prompt = returnPrompt(question, context);
  const resp = await askToDeepSeak(prompt);
  console.log("✌️resp --->", resp);

  res.json({
    question: question || null,
    prompt: prompt,
    resp: resp,
    answer: context,
    similarity: similarity,
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
