const fs = require("fs");
const path = require("path");
const { env, pipeline } = require("@huggingface/transformers");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const dataDir = path.join(__dirname, "data");
const outputFile = path.join(__dirname, "chunks-with-embeddings.json");
const cacheDir = path.join(__dirname, "..", ".cache", "huggingface");

env.cacheDir = cacheDir;

async function main() {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
  });

  console.log("Carregando modelo local de embeddings...");
  console.log(`Cache do modelo: ${cacheDir}`);

  const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".md"));

  const documents = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf-8");

    const chunks = await splitter.createDocuments(
      [content],
      [{ source: file }],
    );

    chunks.forEach((chunk, index) => {
      documents.push({
        id: `${file}-${index}`,
        source: file,
        content: chunk.pageContent,
        metadata: chunk.metadata,
      });
    });
  }

  for (const doc of documents) {
    const output = await extractor(doc.content, {
      pooling: "mean",
      normalize: true,
    });

    doc.embedding = Array.from(output.data);

    console.log(`Embedding local gerado: ${doc.id}`);
  }

  fs.writeFileSync(outputFile, JSON.stringify(documents, null, 2), "utf-8");

  console.log(`Gerados ${documents.length} chunks com embeddings locais.`);
}

main().catch((error) => {
  console.error("Falha ao executar ingestao.");
  console.error(error.message);

  if (error.cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
    console.error(
      "Nao foi possivel baixar o modelo do Hugging Face por timeout. Tente rodar yarn ingest novamente quando a conexao estabilizar.",
    );
  }

  process.exit(1);
});
