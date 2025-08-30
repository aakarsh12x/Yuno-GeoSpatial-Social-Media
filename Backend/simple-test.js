console.log('Starting simple test...');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const server = app.listen(5002, () => {
  console.log('Server running on port 5002');
});

// Close server after 10 seconds
setTimeout(() => {
  console.log('Closing server...');
  server.close();
  process.exit(0);
}, 10000);
