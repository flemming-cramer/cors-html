const express = require('express');
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const debug = {
  server: require('debug')('app:server'),
  request: require('debug')('app:request'),
  response: require('debug')('app:response'),
  error: require('debug')('app:error')
};

const app = express();

// Simple in-memory cache
const jokeCache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000 // 5 minutes in milliseconds
};

// Retry configuration
const RETRY_COUNT = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const FETCH_TIMEOUT = 5000; // 5 seconds timeout

// Helper function to implement exponential backoff retry
async function fetchWithRetry(url, retries = RETRY_COUNT, delay = INITIAL_RETRY_DELAY) {
  try {
    debug.request(`Attempting fetch, remaining retries: ${retries}`);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'JokeAPI/1.0',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      debug.error('Request timed out');
      throw new Error('Request timed out');
    }
    
    if (retries === 0) {
      throw error;
    }
    
    debug.error(`Fetch attempt failed, retrying in ${delay}ms`);
    debug.error(`Error details: ${error.message}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(url, retries - 1, delay * 2);
  }
}

// CORS middleware - apply to all routes
app.use((req, res, next) => {
  debug.request(`Incoming ${req.method} request to ${req.url}`);
  debug.request(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    debug.response('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // Update CSP header
  res.header(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src *;"
  );
  
  debug.response(`Set response headers: ${JSON.stringify(res.getHeaders(), null, 2)}`);
  next();
});

app.get('/jokes/random', async (req, res) => {
  debug.request('Checking cache for available joke');
  
  // Check cache first
  const now = Date.now();
  if (jokeCache.data && jokeCache.timestamp && (now - jokeCache.timestamp) < jokeCache.TTL) {
    debug.response('Returning cached joke');
    return res.json(jokeCache.data);
  }

  debug.request('Cache miss or expired, fetching new joke from external API');
  try {
    const data = await fetchWithRetry('https://v2.jokeapi.dev/joke/Programming?safe-mode');
    
    // Update cache
    jokeCache.data = data;
    jokeCache.timestamp = now;
    
    debug.response(`Joke retrieved successfully: ${JSON.stringify(data, null, 2)}`);
    res.json(data);
  } catch (error) {
    debug.error(`Error fetching joke after all retries: ${error.message}`);
    debug.error(error.stack);
    
    // If we have a cached joke, return it even if expired as a fallback
    if (jokeCache.data) {
      debug.response('Returning expired cached joke as fallback');
      return res.json(jokeCache.data);
    }
    
    res.status(500).json({ type: 'error', message: error.message });
  }
});

// Add a root route handler
app.get('/', (req, res) => {
  debug.request('Root route accessed');
  const response = { message: 'FC2 Joke API server is running' };
  debug.response(`Sending response: ${JSON.stringify(response)}`);
  res.json(response);
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  debug.server(`Server initialized with configuration:`);
  debug.server(`- Port: ${PORT}`);
  debug.server(`- Host: ${HOST}`);
  debug.server(`- Node Environment: ${process.env.NODE_ENV || 'development'}`);
  debug.server(`- Debug Namespaces: ${process.env.DEBUG || 'none'}`);
  console.log(`Server running on http://${HOST}:${PORT}`);
});