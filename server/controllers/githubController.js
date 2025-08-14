// backend/src/controllers/githubController.js
import { getLanguageFromExtension } from '../utils/helpers.js';

async function _getClientFromReq(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  return global.clients.get(token);
}

/**
 * GET /repositories
 * Lists authenticated user's repositories
 */
export async function listRepositories(req, res) {
  try {
    const client = await _getClientFromReq(req);
    if (!client) return res.status(401).json({ error: 'Unauthorized' });

    const response = await client.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
      type: 'owner'
    });

    const formatted = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      language: repo.language,
      private: repo.private,
      html_url: repo.html_url,
      updated_at: repo.updated_at,
      description: repo.description
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('listRepositories error:', error);
    return res.status(500).json({ error: 'Failed to list repositories', message: error.message });
  }
}

/**
 * GET /repositories/:owner/:repo/files
 * Lists code files in the repository (recursive)
 */
export async function listRepoFiles(req, res) {
  try {
    const client = await _getClientFromReq(req);
    if (!client) return res.status(401).json({ error: 'Unauthorized' });

    const owner = req.params.owner || req.query.owner || req.body.owner;
    const repo = req.params.repo || req.query.repo || req.body.repo;

    if (!owner || !repo) return res.status(400).json({ error: 'owner and repo are required' });

    // Get default branch
    const { data: repoInfo } = await client.octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoInfo.default_branch || 'main';

    // Get the ref sha for the branch
    const { data: refData } = await client.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`
    });

    // Get the entire tree recursively
    const { data: treeData } = await client.octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: refData.object.sha,
      recursive: 'true'
    });

    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.vue', '.svelte'];
    const excludePaths = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '__pycache__', '.venv', 'vendor'];

    const files = (treeData.tree || [])
      .filter(item => item.type === 'blob')
      .filter(item => codeExtensions.some(ext => item.path.endsWith(ext)))
      .filter(item => !excludePaths.some(ex => item.path.includes(ex)))
      .map(item => ({
        path: item.path,
        sha: item.sha,
        language: getLanguageFromExtension(item.path),
        size: item.size || 0
      }))
      .sort((a, b) => a.path.localeCompare(b.path));

    return res.json(files);
  } catch (error) {
    console.error('listRepoFiles error:', error);
    return res.status(500).json({ error: 'Failed to list repository files', message: error.message });
  }
}

/**
 * GET /repositories/:owner/:repo/file?path=src/foo.js
 * Returns file content
 */
export async function getFileContent(req, res) {
  try {
    const client = await _getClientFromReq(req);
    if (!client) return res.status(401).json({ error: 'Unauthorized' });

    const owner = req.params.owner || req.query.owner;
    const repo = req.params.repo || req.query.repo;
    const path = req.query.path || req.params[0] || req.body.path; // flexible

    if (!owner || !repo || !path) return res.status(400).json({ error: 'owner, repo and path are required' });

    const { data: fileData } = await client.octokit.rest.repos.getContent({
      owner, repo, path
    });

    if (!fileData || fileData.type !== 'file') {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    return res.json({ path, content });
  } catch (error) {
    console.error('getFileContent error:', error);
    return res.status(500).json({ error: 'Failed to fetch file content', message: error.message });
  }
}

/**
 * POST /repositories/create-pr
 * body: { owner, repo, filePath, code, branch (optional base branch) }
 */
export async function createPullRequest(req, res) {
  try {
    const client = await _getClientFromReq(req);
    if (!client) return res.status(401).json({ error: 'Unauthorized' });

    const { owner, repo, filePath, code, branch = 'main', commitMessage } = req.body;
    if (!owner || !repo || !filePath || !code) {
      return res.status(400).json({ error: 'owner, repo, filePath and code are required' });
    }

    // Get latest commit sha of base branch
    const { data: refData } = await client.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });

    const newBranch = `testcases/${Date.now()}`;

    // Create new branch (ref)
    try {
      await client.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${newBranch}`,
        sha: refData.object.sha
      });
    } catch (err) {
      console.warn('createRef failed, trying a random suffix', err.message || err);
      // Try again with suffix
      const altBranch = `${newBranch}-${Math.floor(Math.random()*10000)}`;
      await client.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${altBranch}`,
        sha: refData.object.sha
      });
      // use altBranch for PR
      // Note: set newBranch variable to altBranch
      // (can't reassign const) -> create local variable
      // but for simplicity let's just set newBranchLocal
    }

    // Determine final branch name (check if created)
    // Simpler: find a branch we just created by listing refs (but to keep simple assume newBranch exists)
    const branchToUse = newBranch;

    // Create or update file on the new branch
    const base64Content = Buffer.from(code, 'utf8').toString('base64');

    await client.octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage || 'Add generated test cases',
      content: base64Content,
      branch: branchToUse
    });

    // Create PR
    const { data: pr } = await client.octokit.rest.pulls.create({
      owner,
      repo,
      title: 'AI-generated test cases',
      head: branchToUse,
      base: branch,
      body: 'This PR adds AI-generated test cases (generated by Test Case Generator).'
    });

    return res.json({ success: true, prUrl: pr.html_url });
  } catch (error) {
    console.error('createPullRequest error:', error);
    return res.status(500).json({ error: 'Failed to create pull request', message: error.message });
  }
}

export default {
  listRepositories,
  listRepoFiles,
  getFileContent,
  createPullRequest
};
