const express = require('express');
const fetch = require('node-fetch');
const debug = require('debug')('app:server');

const app = express();

// CORS middleware - apply to all routes
app.use((req, res, next) => {
  debug(`${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Update CSP header
  res.header(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *;"
  );
  next();
});

app.get('/jokes/random', async (req, res) => {
  debug('Fetching random joke');
  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');
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
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  debug(`Server running on http://${HOST}:${PORT}`);
  console.log(`Server running on http://${HOST}:${PORT}`);
});