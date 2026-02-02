const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash" 
        });

        // 1. Safe prompt construction - Changed 'const text' to 'let text'
        let conversation = "";
        if (Array.isArray(messages)) {
            conversation = messages.map(m => {
                const role = m.role === 'model' ? 'AI' : 'User';
                let text = ""; // FIXED: Use 'let' instead of 'const'
                
                if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
                    text = m.parts[0].text;
                } else {
                    text = m.content || m.text || "";
                }
                return `${role}: ${text}`;
            }).join("\n");
        } else {
            conversation = String(messages);
        }

        // 2. Stringify objects so AI can read them correctly
        const finalPrompt = `
        ACT AS: An expert DSA (Data Structures & Algorithms) Tutor.
        
        CONTEXT:
        Problem Title: ${title}
        Problem Desc: ${description}
        Test Cases: ${JSON.stringify(testCases)}
        User's Current Code: ${JSON.stringify(startCode)}

        USER CONVERSATION HISTORY:
        ${conversation}

        GUIDELINES:
        1. Do NOT give the direct full code solution unless explicitly asked.
        2. Give hints, logic explanation, or find bugs in their current code.
        3. Keep response short and concise (max 150 words).
        `;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const responseText = response.text();

        res.status(200).json({ message: responseText });

    } catch (err) {
        console.error("AI Error Detailed:", err);
        
        if (err.status === 429) {
            return res.status(429).json({ message: "AI is busy. Please try again in a minute." });
        }
        
        // Return the actual error message to help debugging if needed
        res.status(500).json({ message: "AI Assistant error: " + err.message });
    }
}

module.exports = solveDoubt;