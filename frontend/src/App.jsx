import { useState } from 'react'
import './App.css'
import axios from 'axios';

function App() {
const [keyword, setKeyword] = useState('');
const [jobs, setJobs] = useState([]);
const [filter, setFilter] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSearch = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setJobs([]);

  try {
    const { data } = await axios.get(import.meta.env.VITE_BACKEND_URL + '/jobs', {
      params: { search: keyword, filter: filter },
    });
    setJobs(data);
  } catch (err) {
    console.error(err);
    setError('Failed to fetch jobs.');
  } finally {
    setLoading(false);
  }
};


  return (
    <>
     <h1>AI Job Search</h1>
     <form onSubmit={handleSearch}>
      <label htmlFor="search">Search keyword: 
        <input 
          type="text" 
          id="search" 
          placeholder="e.g Senior Software Engineer" 
          onChange={(e) => setKeyword(e.target.value)} 
          value={keyword}/>
      </label>

      <label htmlFor="filter">Filter Criteria (optional): 
        <textarea
          rows="3"
          id="filter" 
          placeholder="e.g Exclude jobs that are end user support heavy" 
          onChange={(e) => setFilter(e.target.value)} 
          value={filter}
          />          
      </label>

      <button type="submit">Search</button>
     </form>
     {loading && <p>Loading...</p>}
     {error && <p>Error: {error}</p>}

     <h2>Results ({jobs.length})</h2>
     {jobs.map(job => (
      <div key={job.id} className="job-card">
        <img src={job.company_logo} alt={job.company_name} />
        <h3>{job.title}</h3>
        <p>{job.company_name}</p>
        <p>{job.location}</p>
        <p>{job.salary}</p>
        {/* accept html tags and truncate the description to 200 characters*/}
        <div dangerouslySetInnerHTML={{ __html: job.description.substring(0, 500) + '...' }} />
        <a href={job.url} target="_blank">View Posting</a>
      </div>
     ))}
    </>
  )
}

export default App
