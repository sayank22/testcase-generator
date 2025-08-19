// routes/pr.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * Middleware to ensure user is authenticated via GitHub OAuth
 * Assumes you store the GitHub token in req.session.githubToken or req.user.access_token
 */
function requireGitHubAuth(req, res, next) {
  const token = req.session?.githubToken || req.user?.access_token;
  if (!token) {
    return res.status(401).json({ error: "GitHub authentication required" });
  }
  req.githubToken = token;
  next();
}

// ✅ Fetch all PRs for a repo
router.get("/:owner/:repo", requireGitHubAuth, async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${req.githubToken}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching PRs:", err);
    res.status(500).json({ error: "Server error fetching PRs" });
  }
});

// ✅ Fetch single PR details
router.get("/:owner/:repo/:prNumber", requireGitHubAuth, async (req, res) => {
  const { owner, repo, prNumber } = req.params;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${req.githubToken}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `GitHub API error: ${response.statusText}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching PR details:", err);
    res.status(500).json({ error: "Server error fetching PR details" });
  }
});

// ✅ Create a new PR
router.post("/create", requireGitHubAuth, async (req, res) => {
  const { owner, repo, title, head, base, body } = req.body;

  if (!owner || !repo || !title || !head || !base) {
    return res.status(400).json({ error: "owner, repo, title, head, and base are required" });
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${req.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, head, base, body }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `GitHub API error: ${errText}` });
    }

    const data = await response.json();
    res.status(201).json(data);
  } catch (err) {
    console.error("Error creating PR:", err);
    res.status(500).json({ error: "Server error creating PR" });
  }
});

export default router;
