const express = require('express');
const fetch = require('node-fetch');
const debug = require('debug')('app:server');

const app = express();

app.use((req, res, next) => {
  debug(`${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Update CSP header to be less restrictive for development
  res.header(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  );
  next();
});

app.get('/jokes/random', async (req, res) => {
  debug('Fetching random joke');
  try {
    const response = await fetch('https://joke-api-strict-cors.appspot.com/jokes/random');
    if (!response.ok) {
      debug(`API error: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    debug('Successfully retrieved joke');
    res.json(data);
  } catch (error) {
    debug(`Error: ${error.message}`);
    res.status(500).json({ type: 'error', message: error.message });
  }
});

// Add a root route handler
app.get('/', (req, res) => {
  debug('Root route accessed');
  res.json({ message: 'Joke API server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  debug(`Server running on http://localhost:${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});