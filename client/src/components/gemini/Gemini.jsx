import React, { useState } from 'react';
import './Gemini.css';

function Gemini() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    try {
      // Dynamically set API URL depending on the environment (production or development)
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? '/generate'  // Production: same domain, no need for full URL
          : 'http://localhost:5000/generate'; // Development

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Error: Unable to fetch the AI response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>AI Text Generator</h1>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
        </form>
        {response && <div className="output"><strong>Response:</strong> {response}</div>}
      </div>
    </div>
  );
}

export default Gemini;
