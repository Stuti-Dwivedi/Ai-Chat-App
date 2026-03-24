import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Chat from "../models/Chat.js";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function detectSentiment(text) {
  const lower = text.toLowerCase();

  const negativeWords = [
    "sad",
    "angry",
    "problem",
    "pain",
    "depressed",
    "bad",
    "hate",
    "tension",
    "stress",
    "issue",
    "error",
    "fail"
  ];

  const positiveWords = [
    "happy",
    "good",
    "great",
    "love",
    "awesome",
    "excellent",
    "thank",
    "success",
    "nice"
  ];

  const hasNegative = negativeWords.some((word) => lower.includes(word));
  const hasPositive = positiveWords.some((word) => lower.includes(word));

  if (hasNegative) return "Negative";
  if (hasPositive) return "Positive";
  return "Neutral";
}

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

const prompt = `
You are a highly intelligent multilingual AI assistant.

IMPORTANT RULES:
1. Detect the user's language automatically.
2. ALWAYS reply in the SAME language and SAME tone/style as the user.
3. If user writes in:
   - Hindi → reply in Hindi
   - Hinglish → reply in Hinglish
   - Bhojpuri style → reply in Bhojpuri style
   - Marathi → reply in Marathi
   - English → reply in English
4. Match the user's tone:
   - Casual → casual reply
   - Formal → formal reply

5. If user writes like:
   "ka ho", "haal ba", "kya haal hai"
   → reply in same local style

6. Give accurate, helpful, human-like answers.

7. Examples:
User: ka ho
AI: Thik ba, tu bata ka haal ba?

User: हाल चाल कैसे हैं
AI: सब बढ़िया है, आप बताइए?

User: how are you
AI: I'm doing great! How about you?

User: काय चाललंय
AI: सगळं छान चाललंय, तुमचं काय?

User question: ${question}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const answer = response.text || "No response generated.";
    const sentiment = detectSentiment(question);

    const savedChat = await Chat.create({
      question,
      answer,
      sentiment,
    });

    res.status(200).json({
      success: true,
      data: savedChat,
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while generating AI response",
      error: error.message,
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch chat history",
      error: error.message,
    });
  }
});

export default router;