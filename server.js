import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/translate", async (req, res) => {
  const userText = req.body.text || req.body.input || "";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: `You are a real-time bilingual subtitle assistant for business conversations in the game art industry.

The user is a business director at a game art outsourcing studio. Their meetings often involve game art production, concept art, 3D character art, 3D environment art, rigging, animation, tech art, engine integration, art pipelines, outsourcing collaboration, production feedback, asset naming, folders, repositories, implementation, and review discussions.

Your task:
1. Accurately preserve the English speech content when the input is in English.
2. Provide a clear and natural Chinese translation.
3. Prioritize terminology accuracy for game art, tech art, production, and outsourcing contexts.
4. Keep the wording concise and suitable for real-time subtitles.
5. Do not add explanations, notes, or summaries.
6. Output in exactly this format:

EN: [English subtitle]
CN: [Chinese subtitle]

Text: ${userText}`
    })
  });

  const data = await response.json();
  const output = data.output?.[0]?.content?.[0]?.text || "";

  res.json({
    text: output
  });
});

app.listen(3000, () => {
  console.log("Server running");
});
