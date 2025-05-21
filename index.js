const express = require('express');
const fetch = require('node-fetch');
const debug = {
  server: require('debug')('app:server'),
  request: require('debug')('app:request'),
  response: require('debug')('app:response'),
  error: require('debug')('app:error')
};

const app = express();

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
  debug.request('Fetching random joke from external API');
  try {
    debug.request('Making request to jokeapi.dev');
    const response = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');
    
    if (!response.ok) {
      debug.error(`API error: ${response.status} - ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    debug.response(`Joke retrieved successfully: ${JSON.stringify(data, null, 2)}`);
    res.json(data);
  } catch (error) {
    debug.error(`Error fetching joke: ${error.message}`);
    debug.error(error.stack);
    res.status(500).json({ type: 'error', message: error.message });
  }
});

// Add a root route handler
app.get('/', (req, res) => {
  debug.request('Root route accessed');
  const response = { message: 'FC Joke API server is running' };
  console.log('FC1');
  debug.response(`Sending response: ${JSON.stringify(response)}`);
  console.log('FC2');
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