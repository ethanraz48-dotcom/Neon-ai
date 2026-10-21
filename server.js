import 'dotenv/config';
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, contextType } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    
    const systemInstruction = "You are NEON AI, a helpful and professional AI assistant.";
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
      config: { systemInstruction: systemInstruction }
    });
    
    res.json({ reply: response.text });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to generate response.' });
  }
});

app.post('/api/auth/creator', async (req, res) => {
  const { code } = req.body;
  if (code === process.env.CREATOR_CODE) {
    res.json({ success: true, role: 'creator' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid code.' });
  }
});

app.listen(port, () => {
  console.log(`NEON AI server running on port ${port}`);
});
