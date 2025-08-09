// server/routes/repositories.js
import express from 'express';
import { getLanguageFromExtension } from '../utils/helpers.js';

const router = express.Router();

// Middleware to check authentication
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const client = global.clients.get(token);

  if (!client) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.client = client;
  next();
};

// Get user repositories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: repos } = await req.client.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 50,
      type: 'owner'
    });

    const formattedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      language: repo.language,
      private: repo.private,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
      description: repo.description
    }));

    res.json(formattedRepos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      message: error.message 
    });
  }
});

// Get repository files
router.get('/:owner/:repo/files', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    // Get repository info first
    const { data: repoInfo } = await req.client.octokit.rest.repos.get({
      owner,
      repo
    });

    // Get file tree
    const { data: tree } = await req.client.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: repoInfo.default_branch,
      recursive: true
    });

    // Filter for code files only
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.vue', '.svelte'];
    const excludePaths = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__', '.venv', 'vendor'];

    const codeFiles = tree.tree
      .filter(item => {
        if (item.type !== 'blob') return false;

        // Check if file has a code extension
        const hasCodeExtension = codeExtensions.some(ext => item.path.endsWith(ext));
        if (!hasCodeExtension) return false;

        // Exclude common build/dependency directories
        const isExcluded = excludePaths.some(excludePath => 
          item.path.includes(excludePath)
        );
        if (isExcluded) return false;

        // Exclude test files for now (we're generating tests)
        if (item.path.includes('.test.') || item.path.includes('.spec.')) return false;

        return true;
      })
      .map(file => ({
        path: file.path,
        type: file.type,
        sha: file.sha,
        language: getLanguageFromExtension(file.path),
        size: file.size
      }))
      .sort((a, b) => a.path.localeCompare(b.path));

    res.json(codeFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repository files',
      message: error.message 
    });
  }
});

// Get specific file content
router.get('/:owner/:repo/files/:path(*)', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Get the full path after /files/

    const { data: file } = await req.client.octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });

    if (file.type !== 'file') {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    const content = Buffer.from(file.content, 'base64').toString('utf-8');

    res.json({ path, content });
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({
      error: 'Failed to fetch file content',
      message: error.message
    });
  }
});

export default router;
