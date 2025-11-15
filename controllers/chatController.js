import axios from "axios";
export const handleChatController = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({
            error: "Message is required"
        });

        // OpenAI API Request
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a friendly e-commerce support assistant." },
                    { role: "user", content: message },
                ],
            },
            {
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
            }
        );
        const reply = response.data.choices[0].message.content;
        return res.status(200).json({
            result: reply
        });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to process chat"
        });
    };
};
