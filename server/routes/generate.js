// server/routes/generate.js
import express from 'express';
import { 
  createTestSummaryPrompt, 
  createTestCodePrompt, 
  parseAIResponse, 
  generateFallbackSummaries 
} from '../utils/helpers.js';
import AIService from '../services/aiService.js';

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

// Generate test summaries
router.post('/summaries', authenticateToken, async (req, res) => {
  try {
    const { files, repository } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        error: 'Files array is required and must not be empty' 
      });
    }

    if (!repository || !repository.full_name) {
      return res.status(400).json({ 
        error: 'Repository information is required' 
      });
    }

    // Get file contents
    const fileContents = [];
    const [owner, repoName] = repository.full_name.split('/');

    for (const file of files.slice(0, 10)) { // Limit to 10 files to avoid token limits
      try {
        const { data: fileData } = await req.client.octokit.rest.repos.getContent({
          owner,
          repo: repoName,
          path: file.path
        });

        if (fileData.type === 'file' && fileData.content) {
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          fileContents.push({
            path: file.path,
            content: content.substring(0, 3000), // Limit content for AI processing
            language: file.language,
            size: content.length
          });
        }
      } catch (error) {
        console.error(`Error fetching ${file.path}:`, error.message);
        // Continue with other files even if one fails
      }
    }

    if (fileContents.length === 0) {
      return res.status(400).json({ 
        error: 'No valid file contents could be retrieved' 
      });
    }

    let testSummaries;

    try {
      // Try to use AI service first
      const aiResponse = await AIService.generateTestSummaries(fileContents, repository.language);
      testSummaries = parseAIResponse(aiResponse, fileContents);
    } catch (aiError) {
      console.warn('AI service failed, using fallback:', aiError.message);
      // Fallback to predefined summaries
      testSummaries = generateFallbackSummaries(fileContents);
    }

    // Ensure summaries have required fields and add unique IDs
    testSummaries = testSummaries.map((summary, index) => ({
      id: summary.id || index + 1,
      title: summary.title || 'Generated Test Suite',
      description: summary.description || 'Comprehensive test suite for selected files',
      framework: summary.framework || getRecommendedFramework(repository.language),
      testCount: summary.testCount || Math.max(fileContents.length * 3, 5),
      files: summary.files || fileContents.map(f => f.path.split('/').pop()),
      category: summary.category || 'unit',
      language: repository.language
    }));

    res.json(testSummaries);

  } catch (error) {
    console.error('Error generating test summaries:', error);
    res.status(500).json({ 
      error: 'Failed to generate test summaries',
      message: error.message 
    });
  }
});

// Generate test code
router.post('/code', authenticateToken, async (req, res) => {
  try {
    const { summary, files, repository } = req.body;

    if (!summary || !summary.title) {
      return res.status(400).json({ 
        error: 'Test summary is required' 
      });
    }

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Files array is required' 
      });
    }

    let testCode;

    try {
      // Try to use AI service
      testCode = await AIService.generateTestCode(summary, files, repository.language);
    } catch (aiError) {
      console.warn('AI service failed, using template:', aiError.message);
      // Fallback to template-based generation
      testCode = generateTestTemplate(summary, files, repository.language);
    }

    const filename = `${summary.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.test.${getTestFileExtension(repository.language)}`;

    res.json({
      code: testCode,
      filename,
      framework: summary.framework,
      language: repository.language
    });

  } catch (error) {
    console.error('Error generating test code:', error);
    res.status(500).json({ 
      error: 'Failed to generate test code',
      message: error.message 
    });
  }
});

// Helper functions
function getRecommendedFramework(language) {
  const frameworks = {
    'JavaScript': 'Jest + React Testing Library',
    'TypeScript': 'Jest + React Testing Library',
    'Python': 'pytest',
    'Java': 'JUnit 5',
    'C#': 'xUnit',
    'Go': 'Go testing package',
    'PHP': 'PHPUnit',
    'Ruby': 'RSpec'
  };
  
  return frameworks[language] || 'Jest';
}

function getTestFileExtension(language) {
  const extensions = {
    'JavaScript': 'js',
    'TypeScript': 'ts',
    'Python': 'py',
    'Java': 'java',
    'C#': 'cs',
    'Go': 'go',
    'PHP': 'php',
    'Ruby': 'rb'
  };
  
  return extensions[language] || 'js';
}

function generateTestTemplate(summary, files, language) {
  const templates = {
    'JavaScript': `// ${summary.title}
    // Generated by Test Case Generator

    import React from 'react';

    describe('${summary.title}', () => {
      beforeEach(() => {
        // Setup code
      });

      afterEach(() => {
        // Cleanup code
      });

      test('should render components correctly', () => {
        // Test component rendering
        expect(true).toBe(true);
      });

      test('should handle props properly', () => {
        // Test props handling
        expect(true).toBe(true);
      });

      test('should handle user interactions', () => {
        // Test user interactions
        expect(true).toBe(true);
      });

      test('should handle error states', () => {
        // Test error handling
        expect(true).toBe(true);
      });
    });`,

    'Python': `# ${summary.title}
    # Generated by Test Case Generator

    import pytest
    import unittest

    class Test${summary.title.replace(/\s+/g, '')}(unittest.TestCase):
        
        def setUp(self):
            """Set up test fixtures before each test method."""
            pass
        
        def tearDown(self):
            """Clean up after each test method."""
            pass
        
        def test_basic_functionality(self):
            """Test basic functionality"""
            self.assertTrue(True)
        
        def test_edge_cases(self):
            """Test edge cases"""
            self.assertTrue(True)
        
        def test_error_handling(self):
            """Test error handling"""
            self.assertTrue(True)

    if __name__ == '__main__':
        unittest.main()`,

    'Java': `// ${summary.title}
    // Generated by Test Case Generator

    import org.junit.jupiter.api.Test;
    import org.junit.jupiter.api.BeforeEach;
    import org.junit.jupiter.api.AfterEach;
    import static org.junit.jupiter.api.Assertions.*;

    class ${summary.title.replace(/\s+/g, '')}Test {
        
        @BeforeEach
        void setUp() {
            // Setup code
        }
        
        @AfterEach
        void tearDown() {
            // Cleanup code
        }
        
        @Test
        void testBasicFunctionality() {
            // Test basic functionality
            assertTrue(true);
        }
        
        @Test
        void testEdgeCases() {
            // Test edge cases
            assertTrue(true);
        }
        
        @Test
        void testErrorHandling() {
            // Test error handling
            assertTrue(true);
        }
    }`
  };

  return templates[language] || templates['JavaScript'];
}

export default router;
