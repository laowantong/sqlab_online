// server.js - Entry point for the Express application
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

import { fileURLToPath } from 'url';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure global middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configure middlewares
import { bigIntHandler } from './middlewares/bigIntHandler.js';
app.use(bigIntHandler);

// Configure routes
import apiRoutes from './routes/apiRoutes.js';
app.use('/', apiRoutes);
import staticRoutes from './routes/staticRoutes.js';
app.use('/', staticRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: `Server error: ${err.message}`
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
