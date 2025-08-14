// backend/src/routes/generate.js
import express from 'express';
import { generateSummaries, generateCode } from '../controllers/generateController.js';

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = global.clients.get(token);
  if (!client) return res.status(401).json({ error: 'Unauthorized' });
  req.client = client;
  next();
};

router.post('/summaries', authenticateToken, generateSummaries);
router.post('/code', authenticateToken, generateCode);

export default router;
