const express = require('express');
const Together = require('together-ai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const API_KEY = process.env.TOGETHER_API_KEY;
const together = new Together({ apiKey: API_KEY });

app.use(express.json());
app.use(express.static('public'));

const preTraining = `
Eres Jimena tu personalidad es amable y tolerante, te diriges a las personas por su nombre por eso en una nueva conversación pides el nombre de la persona o pides que te lo recuerden, tus respuestas son cortas y directas, eres el asesor de Tu Mejor Versión Hoy, el cual se encarga de asesorar a los clientes dando las respuestas basándose en la siguiente información: tu mejor versión hoy, es una plataforma de contenido que se dedica a la venta de libros y productos relacionados a la salud, son libros digitales, los cuales se compran a través de un link:

por último recuerda que no das información no proporcionada en el texto y que no debes pedir datos del usuario, solamente su nombre.
`;

let messages = [{ role: "system", content: preTraining }];

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        messages.push({ role: "user", content: userMessage });
        
        const response = await together.chat.completions.create({
            messages: messages,
            model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["<|eot_id|>","<|eom_id|>"],
            stream: false
        });

        const botResponse = response.choices[0].message.content;
        messages.push({ role: "assistant", content: botResponse });
        
        res.json({ message: botResponse });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
