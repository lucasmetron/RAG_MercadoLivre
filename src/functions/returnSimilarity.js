const fs = require("fs");
const path = require("path");
const { env, pipeline } = require("@huggingface/transformers");

const chunksFile = path.join(__dirname, "..", "chunks-with-embeddings.json");
const cacheDir = path.join(__dirname, "..", "..", ".cache", "huggingface");

env.cacheDir = cacheDir;

function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchSimilarChunks(question, limit = 3) {
  const chunks = JSON.parse(fs.readFileSync(chunksFile, "utf-8"));

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );

  const output = await extractor(question, {
    pooling: "mean",
    normalize: true,
  });

  const questionEmbedding = Array.from(output.data);

  const rankedChunks = chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(questionEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return rankedChunks;
}

async function main() {
  const results = await searchSimilarChunks("posso cancelar meu pedido?", 3);

  console.log(
    results.map((result) => ({
      id: result.id,
      source: result.source,
      score: result.score,
      content: result.content.slice(0, 200),
    })),
  );
}

main();
