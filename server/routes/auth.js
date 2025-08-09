// server/routes/auth.js
import express from 'express';
import { Octokit } from '@octokit/rest';

const router = express.Router();

// GitHub Authentication
router.post('/github', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'GitHub token is required' });
    }

    const octokit = new Octokit({ auth: token });

    // Verify token by getting user info
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Store client in global map
    global.clients.set(token, { octokit, user });

    res.json({
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email
      }
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(401).json({
      error: 'Invalid GitHub token',
      message: error.message
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      global.clients.delete(token);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
