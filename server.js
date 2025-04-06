// Import required libraries
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Configure middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Serve static files from the React app's dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the React app
app.get(/(.*)/, (_req, res) => {
  const pathToIndex = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(pathToIndex);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});