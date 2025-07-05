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
        const response = await axios.get(process.env.REMOTIVE_API_URL, {
            params: { search, filter }
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
            // Ask LLM to filter the job description
            const response = await openai.responses.create({
                model: 'gpt-4.1-mini',
                input: prompt,
                temperature: 0,
              });
              const answer = (response.output_text || '')
                .trim()
                .toUpperCase();
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
