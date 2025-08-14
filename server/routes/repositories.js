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

// ✅ List code files in a GitHub repo
router.get('/:owner/:repo/files', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const { owner, repo } = req.params;

    // Get repository tree recursively from main branch
    const { data: refData } = await client.octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main' // adjust if default branch differs
    });

    const { data: treeData } = await client.octokit.git.getTree({
      owner,
      repo,
      tree_sha: refData.object.sha,
      recursive: 'true'
    });

    // Filter code files (common extensions)
    const codeFiles = treeData.tree
      .filter(item =>
        item.type === 'blob' &&
        /\.(js|jsx|ts|tsx|py|java|go|rb|php)$/i.test(item.path)
      )
      .map(file => ({
        path: file.path,
        sha: file.sha
      }));

    res.json(codeFiles);

  } catch (error) {
    console.error('Error listing repo files:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Generate test summaries for selected files
router.post('/generate-summaries', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const { owner, repo, files } = req.body;

    // Fetch file contents
    const fileContents = [];
    for (const file of files) {
      const { data: fileData } = await client.octokit.repos.getContent({
        owner,
        repo,
        path: file
      });

      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      fileContents.push({
        path: file,
        language: file.split('.').pop(),
        content
      });
    }

    // Detect primary repo language
    const { data: repoData } = await client.octokit.repos.get({ owner, repo });
    const primaryLanguage = repoData.language || 'JavaScript';

    // Generate summaries
    const summaries = await aiService.generateTestSummaries(fileContents, primaryLanguage);

    res.json({ summaries: JSON.parse(summaries) });

  } catch (error) {
    console.error('Error generating summaries:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Generate test code for a selected summary
router.post('/generate-code', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const { owner, repo, summary, files } = req.body;

    // Fetch file contents
    const fileContents = [];
    for (const file of files) {
      const { data: fileData } = await client.octokit.repos.getContent({
        owner,
        repo,
        path: file
      });

      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      fileContents.push({
        path: file,
        language: file.split('.').pop(),
        content
      });
    }

    // Detect primary repo language
    const { data: repoData } = await client.octokit.repos.get({ owner, repo });
    const language = repoData.language || 'JavaScript';

    // Generate test code
    const testCode = await aiService.generateTestCode(summary, fileContents, language);

    res.json({ code: testCode });

  } catch (error) {
    console.error('Error generating test code:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Create PR with generated test file(s)
router.post('/create-pr', async (req, res) => {
  try {
    const client = getClientFromSession(req);
    if (!client) {
      return res.status(401).json({ error: 'GitHub authentication required' });
    }

    const { owner, repo, branch = 'main', filePath, code } = req.body;
    const newBranch = `testcases/${Date.now()}`;

    // Get latest commit SHA of target branch
    const { data: refData } = await client.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    // Create new branch
    await client.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${newBranch}`,
      sha: refData.object.sha
    });

    // Commit the test file
    await client.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: 'Add AI-generated test cases',
      content: Buffer.from(code).toString('base64'),
      branch: newBranch
    });

    // Create PR
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
