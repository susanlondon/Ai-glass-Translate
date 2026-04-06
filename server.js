import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/**
 * POST接口（给AI眼镜/设备用）
 */
app.post("/translate", async (req, res) => {
  try {
    const userText = req.body.text || "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are a real-time bilingual subtitle assistant for business conversations in the game art industry.

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

Text: ${userText}`
      })
    });

    const data = await response.json();
    const output = data.output?.[0]?.content?.[0]?.text || "";

    res.json({ text: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * 首页（解决 Cannot GET /）
 */
app.get("/", (req, res) => {
  res.send("AI Translate Server is running");
});

/**
 * GET接口（浏览器测试用）
 */
app.get("/translate", async (req, res) => {
  try {
    const userText = req.query.text || "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are a real-time bilingual subtitle assistant for business conversations in the game art industry.

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

Text: ${userText}`
      })
    });

    const data = await response.json();
    const output = data.output?.[0]?.content?.[0]?.text || "";

    res.send(output);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

/**
 * 端口（Railway必须）
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
