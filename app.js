import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security and performance middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize Google Generative AI
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.9,
  }
});

// API endpoint with improved error handling
app.get('/generate-content', async (req, res) => {
  try {
    const { prompt = "Describe Express.js in short", maxTokens } = req.query;
    
    if (typeof prompt !== 'string' || prompt.length > 1000) {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    const generationConfig = {};
    if (maxTokens) {
      generationConfig.maxOutputTokens = parseInt(maxTokens, 10);
    }

    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    const text = response.text();

    // Set appropriate headers
    res.set({
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    });
    
    res.send(text);
  } catch (error) {
    console.error('Error generating content:', error);
    
    const statusCode = error.message.includes('API key') ? 401 : 
                      error.message.includes('prompt') ? 400 : 500;
    
    res.status(statusCode).json({ 
      error: 'Error generating content',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Serve static files
app.use(express.static('public', {
  maxAge: '1d' // Cache static assets for 1 day
}));

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});