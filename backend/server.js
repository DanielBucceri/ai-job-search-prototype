import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import jobsRouter from './routes/jobs.js';

dotenv.config();


// Dont start the server if the OPENAI_API_KEY  not set
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    throw new Error('OpenAI API key not set corectly!');
}

const PORT = process.env.PORT || 5000;

// Init OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Allow requests from the frontend only
app.use(cors({origin: process.env.FRONTEND_URL}));

app.use(express.json());

// Route to get jobs from Remotive or local mock file
app.use('/', jobsRouter(openai));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
