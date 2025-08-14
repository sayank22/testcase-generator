// server/routes/auth.js
import express from 'express';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = express.Router();

if (!global.clients) {
  global.clients = new Map();
}

// STEP 1: Start GitHub OAuth
router.get('/github/start', (req, res) => {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  const redirectUri = `${serverUrl}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20repo`;

  res.redirect(githubAuthUrl);
});

// STEP 2: GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(401).json({
        error: 'Failed to retrieve access token',
        details: tokenData
      });
    }

    const token = tokenData.access_token;

    // Get GitHub user info
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Create a sessionId and store user + octokit
    const sessionId = crypto.randomBytes(16).toString('hex');
    global.clients.set(sessionId, { octokit, user, token });

    console.log(`✅ Logged in: ${user.login} (sessionId=${sessionId})`);

    // Redirect to frontend with sessionId
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/oauth-success?sessionId=${sessionId}&login=${encodeURIComponent(user.login)}`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({
      error: 'OAuth authentication failed',
      message: error.message
    });
  }
});

// STEP 3: Logout
router.post('/logout', (req, res) => {
  try {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      global.clients.delete(sessionId);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
