import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
  })
);

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.get('/', (req, res) => {
  res.send('NEON AI server is running!');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Please provide a message.'
      });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured.'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message
    });

    res.json({
      reply: response.text ?? ''
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      error: 'AI request failed. Please try again.'
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NEON AI server running on port ${PORT}`);
});
