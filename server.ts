import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // API routes
  app.post("/api/reflect", async (req, res) => {
    const { journalEntry } = req.body;
    
    if (!journalEntry) {
        return res.status(400).json({ error: "Journal entry is required" });
    }

    try {
      const prompt = `As an empathetic, non-clinical AI reflection companion grounded in Cognitive Psychology, please provide a gentle, thoughtful reflection on the following journal entry. 

CRITICAL SAFETY PROTOCOL: If the user indicates intent for self-harm, severe abuse, or any life-threatening situation, you MUST NOT provide a standard reflection. Instead, immediately provide empathetic resources for crisis support (e.g., suicide prevention hotlines) and encourage them to seek immediate professional help.

In all other cases, do not provide medical or clinical advice. Help the user explore their thoughts with positive friction and open-ended, curious questions.

Journal entry: ${journalEntry}

Reflection:`;
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt
      });
      const reflection = result.text;
      res.json({ reflection });
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ error: "Failed to generate reflection" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
