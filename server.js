import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

function buildPrompt(userText) {
  return `You are a real-time bilingual subtitle assistant for business conversations in the game art industry.

The user is a business director at a game art outsourcing studio. Their meetings often involve concept art, 3D character art, environment art, rigging, animation, tech art, pipelines, engine integration, outsourcing collaboration, and production feedback.

Your task:
1. Accurately preserve the English speech content when the input is in English.
2. Provide a clear and natural Chinese translation.
3. Prioritize terminology accuracy for game art, tech art, and production workflows.
4. Keep the wording concise and suitable for real-time subtitles.
5. Do NOT add explanations, notes, or extra content.
6. You MUST output EXACTLY in the following format:

EN: [English subtitle]
CN: [Chinese subtitle]

Text: ${userText}`;
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === "string" && content.text.trim()) {
            return content.text.trim();
          }
        }
      }
    }
  }

  return "";
}

async function callOpenAI(userText) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: buildPrompt(userText)
    })
  });

  const data = await response.json();
  return { response, data };
}

app.get("/", (req, res) => {
  res.send("AI Translate Server is running");
});

app.get("/translate", async (req, res) => {
  try {
    const userText = req.query.text || "";

    if (!userText.trim()) {
      return res.status(400).send("Missing query parameter: text");
    }

    const { response, data } = await callOpenAI(userText);
    const output = extractText(data);

    if (!response.ok) {
      return res.status(response.status).send(
        `OpenAI API error:\n${JSON.stringify(data, null, 2)}`
      );
    }

    if (!output) {
      return res.status(500).send(
        `No text extracted from OpenAI response:\n${JSON.stringify(data, null, 2)}`
      );
    }

    res.send(output);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error: " + err.message);
  }
});

app.post("/translate", async (req, res) => {
  try {
    const userText = req.body.text || "";

    if (!userText.trim()) {
      return res.status(400).json({ error: "Missing body field: text" });
    }

    const { response, data } = await callOpenAI(userText);
    const output = extractText(data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: data
      });
    }

    if (!output) {
      return res.status(500).json({
        error: "No text extracted from OpenAI response",
        details: data
      });
    }

    res.json({ text: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
