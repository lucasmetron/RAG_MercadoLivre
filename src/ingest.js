const fs = require("fs");
const path = require("path");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const dataDir = path.join(__dirname, "data");
const outputFile = path.join(__dirname, "chunks.json");

async function main() {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 150,
  });

  const files = fs.readdirSync(dataDir).filter((file) => file.endsWith(".md"));

  const allChunks = [];

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const chunks = await splitter.createDocuments(
      [content],
      [{ source: file }],
    );

    chunks.forEach((chunk, index) => {
      allChunks.push({
        id: `${file}-${index}`,
        source: file,
        content: chunk.pageContent,
        metadata: chunk.metadata,
      });
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(allChunks, null, 2), "utf-8");

  console.log(`Criados ${allChunks.length} chunks em ${outputFile}`);
}

main();
