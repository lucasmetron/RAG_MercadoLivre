const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/ask", (req, res) => {
  const { question } = req.body || {};
  console.log("✌️question --->", question);

  res.json({
    question: question || null,
    answer: "funcionandooooooooooo!",
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
