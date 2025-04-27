import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

// Google Generative AI setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

// Initialize the Gemini API with the correct configuration
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    apiVersion: "v1"  // Specifying the API version explicitly
});

// Generate content endpoint
app.get('/generate-content', async (req, res) => {
    const prompt = req.query.prompt;
    
    if (!prompt) {
        return res.status(400).send('Prompt is required');
    }

    try {
        console.log('Generating content for prompt:', prompt);
        const result = await model.generateContent({
            contents: [{ text: prompt }]
        });
        
        const response = await result.response;
        const text = response.text();
        
        console.log('Generated response:', text);
        res.send(text);
    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).send('Error generating content: ' + error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
