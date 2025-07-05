import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import axios from 'axios';

dotenv.config();


// Dont start the server if the OPENAI_API_KEY  not set
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
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
    const { search, filter } = req.query;
    let jobs = [];

    try {
    // Check if local data should be used
    if (process.env.USE_LOCAL_DATA === 'true') {
        const response = await fs.readFile('mock_jobs.json', 'utf-8');
        jobs = JSON.parse(response);
    } else {
        // Fetch jobs from Remotive API
        const response = await axios.get(REMOTIVE_API_URL, {
            params: { search }
        });
        jobs = response.data.jobs || [];
    }

    // If no filter, return jobs immediately
    if (!filter.trim()) {
        return res.json(jobs);
    }

    // else ask for AI to filter each job
    const filteredJobs = [];

    for (const job of jobs){
        const prompt = `You are a job search assistant. Given the following job description and user criteria, determine if the job should be included. Respond only with "INCLUDE" or "EXCLUDE".\n\nJob Description:\n${job.description}\n\nUser Criteria:\n${filter}`;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4.1-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0,
            });
            // Get the answer from the LLM
            // if the answer is not "INCLUDE" or "EXCLUDE", skip the job
            const answer = (completion.choices[0].message.content || '').trim().toUpperCase();
            if (answer.startsWith('INCLUDE')) {
                filteredJobs.push(job);
            }
        } catch (llmErr) {
            // If job skipped, log the error and continue
            console.error(`LLM error for job ${job.id}:`, llmErr.message);
        }
    }

    res.json(filteredJobs);
} catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
}
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
