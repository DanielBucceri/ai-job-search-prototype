import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import axios from 'axios';

dotenv.config();

console.log('PORT:', process.env.PORT);

// Dont start the server if the OPENAI_API_KEY  not set
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not set corectly!');
}

const PORT = process.env.PORT || 5000;
const REMOTIVE_API_URL = 'https://remotive.com/api/remote-jobs';

// Init OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();

// Allow requests from the frontend only
app.use(cors({origin: process.env.FRONTEND_URL}));

app.use(express.json());

// Test route to confirm server is running
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Job Search API is running' });
});

// Route to get jobs from Remotive or local mock file
app.get('/jobs', async (req, res) => {
    try {
        const response = await axios.get(REMOTIVE_API_URL);
        const jobs = response.data.jobs;
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
