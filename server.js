// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Type: { role: 'system' | 'user' | 'assistant', content: string }
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const arliResponse = await axios.post(
      'https://api.arliai.com/v1/chat/completions',
      {
        model: process.env.ARLIAI_MODEL_ID,
        messages,
        max_completion_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repetition_penalty: 1.05,
        stream: false,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ARLIAI_API_KEY}`,
        },
      }
    );

    const data = arliResponse.data;

    const assistantMessage =
      data?.choices?.[0]?.message?.content ?? '(no response from model)';

    res.json({
      reply: assistantMessage,
      raw: data, // optional, useful for debugging
    });
  } catch (err) {
    console.error('Error calling ArliAI:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to contact ArliAI',
      details: err.response?.data || err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
