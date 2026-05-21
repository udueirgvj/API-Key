const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// إعدادات CORS للسماح لصفحة GitHub Pages بالاتصال بالسيرفر
app.use(cors({
    origin: '*'
}));
app.use(express.json());

// التأكد من وجود المفتاح في Vercel
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
}

// نقطة الاتصال بالشات
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "الرسالة فارغة" });
    }

    try {
        // تهيئة المكتبة والنموذج بشكل متوافق تماماً مع Vercel
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        return res.json({ reply: text });

    } catch (error) {
        console.error("Error:", error);
        if (error.status === 429) {
            return res.status(429).json({ error: "تجاوزت حد الرسائل، انتظر دقيقة وحاول مجدداً." });
        }
        return res.status(500).json({ error: "حدث خطأ داخل السيرفر أثناء معالجة النص." });
    }
});

// تصدير التطبيق ليعمل كـ Serverless Function على Vercel
module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
