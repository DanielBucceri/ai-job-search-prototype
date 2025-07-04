import { useState } from 'react'
import './App.css'
import axios from 'axios';

function App() {
const [keyword, setKeyword] = useState('');
const [jobs, setJobs] = useState([]);
const [filter, setFilter] = useState('');


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
    </>
  )
}

export default App
