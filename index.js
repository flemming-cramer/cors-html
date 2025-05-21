const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // Add CSP header to allow only self-hosted resources
  res.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  );
  next();
});

app.get('/jokes/random', async (req, res) => {
  try {
    const response = await fetch('https://joke-api-strict-cors.appspot.com/jokes/random');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ type: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));