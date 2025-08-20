// server/routes/repositories.js
import express from 'express';
import { Buffer } from 'buffer';
import aiService from '../services/aiService.js';

const router = express.Router();

// ✅ Helper to get authenticated Octokit from sessionId
function getClientFromSession(req) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  return global.clients.get(sessionId);
}

// ✅ 1. List authenticated user's repositories
router.get('/', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const { data: repos } = await client.octokit.repos.listForAuthenticatedUser({
      visibility: 'all',
      affiliation: 'owner,collaborator',
      per_page: 100
    });

    // Keep GitHub field names so frontend works directly
    const formatted = repos.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,   // 👈 frontend expects this
      private: r.private,
      language: r.language,
      default_branch: r.default_branch,
      html_url: r.html_url,
      owner: { login: r.owner.login } // 👈 for clarity
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 2. List code files in a repo
router.get('/:owner/:repo/files', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) return res.status(401).json({ error: 'GitHub authentication required' });

    const { owner, repo } = req.params;

    // Get repo default branch dynamically
    const { data: repoData } = await client.octokit.repos.get({ owner, repo });
    const branch = repoData.default_branch;

    const { data: refData } = await client.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    const { data: treeData } = await client.octokit.git.getTree({
      owner,
      repo,
      tree_sha: refData.object.sha,
      recursive: 'true'
    });

    const codeFiles = treeData.tree
      .filter(item =>
        item.type === 'blob' &&
        /\.(js|jsx|ts|tsx|py|java|go|rb|php)$/i.test(item.path)
      )
      .map(file => ({ path: file.path, sha: file.sha }));

    res.json(codeFiles);

  } catch (error) {
    console.error('Error listing repo files:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 3. Generate test summaries
router.post('/generate-summaries', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) return res.status(401).json({ error: 'GitHub authentication required' });

    const { owner, repo, files } = req.body;

    const fileContents = [];
    for (const file of files) {
      const { data: fileData } = await client.octokit.repos.getContent({ owner, repo, path: file });
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      fileContents.push({ path: file, language: file.split('.').pop(), content });
    }

    const { data: repoData } = await client.octokit.repos.get({ owner, repo });
    const primaryLanguage = repoData.language || 'JavaScript';

    const rawSummaries = await aiService.generateTestSummaries(fileContents, primaryLanguage);

    // 🧹 Clean up AI output before parsing
    let cleanText = rawSummaries.trim();
    cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let summaries;
    try {
      summaries = JSON.parse(cleanText);
    } catch (err) {
      console.error("⚠️ Could not parse AI response as JSON", err);
      summaries = [{ error: "Invalid AI response", raw: cleanText }];
    }

    res.json({ summaries });
  } catch (error) {
    console.error('Error generating summaries:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 4. Generate test code
router.post('/generate-code', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) return res.status(401).json({ error: 'GitHub authentication required' });

    const { owner, repo, summary, files } = req.body;

    const fileContents = [];
    for (const file of files) {
      const { data: fileData } = await client.octokit.repos.getContent({ owner, repo, path: file });
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      fileContents.push({ path: file, language: file.split('.').pop(), content });
    }

    const { data: repoData } = await client.octokit.repos.get({ owner, repo });
    const language = repoData.language || 'JavaScript';

    const testCode = await aiService.generateTestCode(summary, fileContents, language);

    res.json({ code: testCode });
  } catch (error) {
    console.error('Error generating test code:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 5. Create PR
router.post('/create-pr', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) return res.status(401).json({ error: 'GitHub authentication required' });

    const { owner, repo, branch = 'main', filePath, code } = req.body;
    const newBranch = `testcases/${Date.now()}`;

    const { data: refData } = await client.octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });

    await client.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: refData.object.sha
    });

    await client.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'Add AI-generated test cases',
      content: Buffer.from(code).toString('base64'),
      branch: newBranch
    });

    const { data: pr } = await client.octokit.pulls.create({
      owner,
      repo,
      title: 'AI-generated test cases',
      head: newBranch,
      base: branch,
      body: 'This PR adds AI-generated test cases.'
    });

    res.json({ success: true, prUrl: pr.html_url });
  } catch (error) {
    console.error('Error creating PR:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
