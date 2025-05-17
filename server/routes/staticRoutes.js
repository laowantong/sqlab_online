import express from 'express';
import path from 'path';
const router = express.Router();

// Route for home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Serve a 204 No Content Response to avoid an obnoxious error in Safari's console
router.get('/favicon.ico', (req, res) => res.status(204).end());  

export default router;
