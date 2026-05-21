const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// تفعيل CORS بالكامل لضمان عدم حظر الهاتف
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "الرسالة فارغة" });

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        
        // إرسال الرد بشكل صريح ومباشر
        return res.status(200).json({ reply: response.text() });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "خطأ في السيرفر أو المفتاح" });
    }
});

module.exports = app;
