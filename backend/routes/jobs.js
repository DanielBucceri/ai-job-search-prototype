import { Router } from 'express';
import fs from 'fs/promises';
import axios from 'axios';

export default function jobsRouter(openai) {
  const router = Router();

  // Test route to confirm server is reachable
  router.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Job Search API is running' });
  });

  // Route to get jobs from Remotive or local mock file
  router.get('/jobs', async (req, res) => {
    const { search, filter } = req.query;
    let jobs = [];

    try {
    // Check if local data should be used
      if (process.env.USE_LOCAL_DATA == true) {
        const response = await fs.readFile('data.json', 'utf-8');
        jobs = JSON.parse(response);
        console.log('pulling from local data');

        // Simple keyword local data filtering
        if (search?.trim()) {
          const searchLower = search.toLowerCase();
          jobs = jobs.filter((job) => job.title.toLowerCase().includes(searchLower)
                || job.company_name.toLowerCase().includes(searchLower)
                || job.description.toLowerCase().includes(searchLower));
        }
      } else {
        // Fetch jobs from Remotive API
        const response = await axios.get(process.env.REMOTIVE_API_URL, {
          params: { search, filter }
        });
        console.log('pulling from Remotive API');
        jobs = response.data.jobs || [];
      }

      // If no filter, return jobs immediately
      if (!filter.trim()) {
        return res.json(jobs);
      }
      // else ask for AI to filter each job
      const filteredJobs = [];

      for (const job of jobs) {
        const prompt = `You are a job search assistant. Given the following job description and user criteria, determine if the job should be included. Respond only with "INCLUDE" or "EXCLUDE".\n\nJob Description:\n${job.description}\n\nUser Criteria:\n${filter}`;

        try {
          // Ask LLM to filter the job description
          const response = await openai.responses.create({
            model: 'gpt-4.1-mini',
            input: prompt,
            temperature: 0
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

      return res.json(filteredJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  return router;
}
