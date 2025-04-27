import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = 3000;

const genAI = new GoogleGenerativeAI("Your API Key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(express.json());

// Root route (Frontend UI)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gemini Chat</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(135deg, #dbeafe, #e0e7ff);
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .chat-container {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          width: 95%;
          max-width: 480px;
          height: 85%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: fadeIn 1s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .chat-header {
          background: #6366f1;
          color: #fff;
          text-align: center;
          padding: 16px;
          font-size: 1.6em;
          font-weight: 600;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f9fafb;
        }
        .message {
          margin-bottom: 15px;
          max-width: 75%;
          padding: 12px 18px;
          border-radius: 18px;
          font-size: 1em;
          line-height: 1.4;
          word-wrap: break-word;
          animation: fadeIn 0.5s ease;
        }
        .user {
          background: #dbeafe;
          align-self: flex-end;
          text-align: right;
          color: #1e293b;
          border-bottom-right-radius: 5px;
        }
        .bot {
          background: #e0e7ff;
          align-self: flex-start;
          text-align: left;
          color: #1e293b;
          border-bottom-left-radius: 5px;
        }
        .chat-input {
          display: flex;
          padding: 14px;
          background: #fff;
          border-top: 1px solid #e5e7eb;
        }
        .chat-input input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #cbd5e1;
          border-radius: 15px;
          font-size: 1em;
          background: #f9fafb;
          outline: none;
          transition: 0.3s;
        }
        .chat-input input:focus {
          border-color: #6366f1;
          background: #fff;
        }
        .chat-input button {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 12px 20px;
          margin-left: 10px;
          border-radius: 15px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1em;
          transition: background 0.3s;
        }
        .chat-input button:hover {
          background: #4f46e5;
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="chat-header">Gemini Chat</div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
          <input type="text" id="prompt" placeholder="Type something..." />
          <button id="send-btn">Send</button>
        </div>
      </div>

      <script>
        const sendBtn = document.getElementById('send-btn');
        const promptInput = document.getElementById('prompt');
        const chatMessages = document.getElementById('chat-messages');

        async function sendMessage() {
          const prompt = promptInput.value.trim();
          if (!prompt) return;

          // Show user's message
          const userMessage = document.createElement('div');
          userMessage.className = 'message user';
          userMessage.innerText = prompt;
          chatMessages.appendChild(userMessage);
          chatMessages.scrollTop = chatMessages.scrollHeight;
          promptInput.value = '';

          // Show loading dots
          const loadingMessage = document.createElement('div');
          loadingMessage.className = 'message bot';
          loadingMessage.innerText = "Typing...";
          chatMessages.appendChild(loadingMessage);
          chatMessages.scrollTop = chatMessages.scrollHeight;

          try {
            const response = await fetch(\`/generate-content?prompt=\${encodeURIComponent(prompt)}\`);
            const content = await response.text();
            loadingMessage.innerText = content;
          } catch (error) {
            loadingMessage.innerText = "Oops! Something went wrong.";
          }
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        sendBtn.addEventListener('click', sendMessage);
        promptInput.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Generate Content API Route
app.get('/generate-content', async (req, res) => {
  const prompt = req.query.prompt || "Describe Express.js in short"; // Default prompt if none provided
  try {
    const result = await model.generateContent(prompt);
    const apiResponse = result.response.text(); // Get the response text
    res.set('Content-Type', 'text/plain');
    res.send(apiResponse);
  } catch (error) {
    console.error("Error occurred: ", error); //log of error
    res.status(500).send('An error occurred while generating content.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
