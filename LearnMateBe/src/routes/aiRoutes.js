const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

router.post("/explain-question", async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid questions array" });
    }

    const explanations = [];

    for (let q of questions) {
      const prompt = `Giải thích câu hỏi trắc nghiệm sau bằng **tiếng Việt**, ngắn gọn và dễ hiểu:
Câu hỏi: ${q.text}
Các lựa chọn: ${q.options.join(", ")}
Đáp án đúng: ${q.correctAnswer}
Chỉ cung cấp giải thích ngắn, súc tích.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const explanation = response.candidates?.[0]?.content || "";

      explanations.push({
        questionId: q.id,
        explanation,
      });
    }

    res.json({ success: true, explanations });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate explanations" });
  }
});

module.exports = router;
