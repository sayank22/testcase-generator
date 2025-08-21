// server/routes/auth.js - Security improvements
import express from 'express';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';
import fetch from 'node-fetch';

const router = express.Router();

if (!global.clients) {
  global.clients = new Map();
}

// ✅ ADD: State parameter for CSRF protection
const generateState = () => crypto.randomBytes(32).toString('hex');
const stateStore = new Map(); // In production, use Redis or database

// STEP 1: Start GitHub OAuth with state parameter
router.get('/github/start', (req, res) => {
  try {
    const state = generateState();
    stateStore.set(state, { timestamp: Date.now() });
    
    // Clean up old states (prevent memory leak)
    for (const [key, value] of stateStore.entries()) {
      if (Date.now() - value.timestamp > 600000) { // 10 minutes
        stateStore.delete(key);
      }
    }

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const redirectUri = `${serverUrl}/api/auth/github/callback`;
    
    // ✅ ADD: state parameter for security
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20repo&state=${state}`;

    res.redirect(githubAuthUrl);
  } catch (error) {
    console.error('OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
});

// STEP 2: GitHub OAuth callback with state validation
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // ✅ Validate state parameter
    if (!state || !stateStore.has(state)) {
      return res.status(400).json({ error: 'Invalid or missing state parameter' });
    }
    
    // Clean up used state
    stateStore.delete(state);

    // ✅ Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const tokenResponse = await fetch(`https://github.com/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TestCaseGenerator/1.0' // ✅ Add user agent
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!tokenResponse.ok) {
      throw new Error(`GitHub API responded with ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.status(401).json({
        error: 'Failed to retrieve access token',
        details: process.env.NODE_ENV === 'development' ? tokenData : undefined
      });
    }

    const token = tokenData.access_token;

    // Get GitHub user info with timeout
    const octokit = new Octokit({ 
      auth: token,
      userAgent: 'TestCaseGenerator/1.0',
      request: { timeout: 5000 }
    });
    
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // ✅ Generate secure session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    global.clients.set(sessionId, { 
      octokit, 
      user, 
      token,
      createdAt: Date.now() // ✅ Add timestamp for cleanup
    });

    console.log(`✅ OAuth successful: ${user.login} (${sessionId.substring(0, 8)}...)`);

    // Redirect to frontend
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}?sessionId=${sessionId}&login=${encodeURIComponent(user.login)}`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const errorMsg = encodeURIComponent(error.message || 'Authentication failed');
    res.redirect(`${clientUrl}?error=${errorMsg}`);
  }
});

// ✅ ADD: Session cleanup endpoint
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = global.clients.delete(sessionId);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;