const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// قراءة المفتاح المخفي من بيئة العمل السريّة
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "الرسالة فارغة" });

    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(message);
        const response = await result.response;
        return res.json({ reply: response.text() });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ error: "الرجاء الانتظار دقيقة (تجاوز حد الضغط الحركي للرسائل)." });
        }
        return res.status(500).json({ error: "خطأ داخلي في السيرفر المعالج." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`السيرفر يعمل على المنفذ: ${PORT}`));

