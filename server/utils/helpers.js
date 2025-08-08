// server/utils/helpers.js

/**
 * Get programming language from file extension
 */
function getLanguageFromExtension(filePath) {
  const extension = filePath.split('.').pop().toLowerCase();
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'vue': 'Vue',
    'svelte': 'Svelte'
  };
  return languageMap[extension] || 'Unknown';
}

/**
 * Create AI prompt for test summaries
 */
function createTestSummaryPrompt(fileContents, primaryLanguage) {
  const files = fileContents.map(f => `${f.path} (${f.language})`).join(', ');
  
  return `Analyze the following ${primaryLanguage} code files and generate 3-5 test case summaries:

Files: ${files}

Code samples:
${fileContents.map(f => `// ${f.path}\n${f.content.substring(0, 500)}...`).join('\n\n')}

For each test summary, provide:
1. Title (concise description)
2. Description (what will be tested)
3. Recommended testing framework
4. Estimated number of test cases
5. Files that will be covered

Format as JSON array with this structure:
[{
  "title": "Component Rendering Tests",
  "description": "Tests for component mounting, props, and basic functionality",
  "framework": "Jest + React Testing Library",
  "testCount": 8,
  "files": ["Header.jsx", "Dashboard.jsx"],
  "category": "unit"
}]`;
}

/**
 * Create AI prompt for test code generation
 */
function createTestCodePrompt(summary, files, language) {
  return `Generate comprehensive test code for "${summary.title}" using ${summary.framework}.

Test Summary:
- Description: ${summary.description}
- Framework: ${summary.framework}
- Test Count: ${summary.testCount}
- Files: ${summary.files.join(', ')}

Requirements:
1. Generate actual runnable test code
2. Include proper imports and setup
3. Cover positive and negative test cases
4. Include mocking where appropriate
5. Follow ${language} testing best practices
6. Include comments explaining test logic

Generate complete test file with proper structure.`;
}

/**
 * Parse AI response and extract test summaries
 */
function parseAIResponse(response, fileContents) {
  try {
    // Clean the response and try to extract JSON
    const cleanResponse = response.trim();
    let jsonMatch;
    
    // Try to find JSON array in the response
    if (cleanResponse.startsWith('[') && cleanResponse.endsWith(']')) {
      jsonMatch = cleanResponse;
    } else {
      jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonMatch = jsonMatch[0];
      }
    }
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    
    // Fallback if parsing fails
    return generateFallbackSummaries(fileContents);
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return generateFallbackSummaries(fileContents);
  }
}

/**
 * Generate fallback test summaries when AI is not available
 */
function generateFallbackSummaries(fileContents) {
  const summaries = [];
  const languages = [...new Set(fileContents.map(f => f.language))];
  
  // Component/UI Tests for JavaScript/TypeScript
  if (languages.includes('JavaScript') || languages.includes('TypeScript')) {
    const jsFiles = fileContents.filter(f => f.language === 'JavaScript' || f.language === 'TypeScript');
    
    summaries.push({
      id: 1,
      title: 'Component Unit Tests',
      description: 'Test React components for proper rendering, props handling, and user interactions',
      framework: 'Jest + React Testing Library',
      testCount: jsFiles.length * 4,
      files: jsFiles.map(f => f.path.split('/').pop()),
      category: 'unit'
    });

    summaries.push({
      id: 2,
      title: 'Hook and Utility Tests',
      description: 'Test custom hooks, utility functions, and helper methods',
      framework: 'Jest',
      testCount: jsFiles.length * 2,
      files: jsFiles.filter(f => f.path.includes('hook') || f.path.includes('util')).map(f => f.path.split('/').pop()),
      category: 'unit'
    });
  }
  
  // Python Tests
  if (languages.includes('Python')) {
    const pyFiles = fileContents.filter(f => f.language === 'Python');
    
    summaries.push({
      id: summaries.length + 1,
      title: 'Python Unit Tests',
      description: 'Unit tests for Python functions, classes, and modules',
      framework: 'pytest',
      testCount: pyFiles.length * 5,
      files: pyFiles.map(f => f.path.split('/').pop()),
      category: 'unit'
    });
  }
  
  // Java Tests
  if (languages.includes('Java')) {
    const javaFiles = fileContents.filter(f => f.language === 'Java');
    
    summaries.push({
      id: summaries.length + 1,
      title: 'Java Unit Tests',
      description: 'JUnit tests for Java classes and methods',
      framework: 'JUnit 5',
      testCount: javaFiles.length * 4,
      files: javaFiles.map(f => f.path.split('/').pop()),
      category: 'unit'
    });
  }
  
  // Integration Tests (for all languages)
  summaries.push({
    id: summaries.length + 1,
    title: 'Integration Tests',
    description: 'End-to-end integration tests for the application workflow',
    framework: getIntegrationFramework(languages),
    testCount: Math.min(fileContents.length, 8),
    files: fileContents.slice(0, 5).map(f => f.path.split('/').pop()),
    category: 'integration'
  });

  // API Tests (if applicable)
  const hasApiFiles = fileContents.some(f => 
    f.path.includes('api') || 
    f.path.includes('service') || 
    f.path.includes('controller')
  );
  
  if (hasApiFiles) {
    summaries.push({
      id: summaries.length + 1,
      title: 'API Tests',
      description: 'API endpoint testing, request/response validation, and error handling',
      framework: getApiTestFramework(languages),
      testCount: fileContents.filter(f => 
        f.path.includes('api') || 
        f.path.includes('service')
      ).length * 3,
      files: fileContents.filter(f => 
        f.path.includes('api') || 
        f.path.includes('service')
      ).map(f => f.path.split('/').pop()),
      category: 'integration'
    });
  }
  
  return summaries.slice(0, 4); // Return max 4 summaries
}

/**
 * Get integration testing framework based on languages
 */
function getIntegrationFramework(languages) {
  if (languages.includes('JavaScript') || languages.includes('TypeScript')) {
    return 'Cypress';
  } else if (languages.includes('Python')) {
    return 'Selenium + pytest';
  } else if (languages.includes('Java')) {
    return 'Selenium + JUnit';
  }
  return 'Selenium';
}

/**
 * Get API testing framework based on languages
 */
function getApiTestFramework(languages) {
  if (languages.includes('JavaScript') || languages.includes('TypeScript')) {
    return 'Jest + Supertest';
  } else if (languages.includes('Python')) {
    return 'pytest + requests';
  } else if (languages.includes('Java')) {
    return 'RestAssured + JUnit';
  }
  return 'Postman/Newman';
}

/**
 * Validate file content for test generation
 */
function isValidCodeFile(filePath, content) {
  // Check file size (not too large)
  if (content.length > 50000) {
    return false;
  }
  
  // Check if it's a minified file
  const lines = content.split('\n');
  if (lines.length < 5 && content.length > 1000) {
    return false; // Likely minified
  }
  
  // Check for common non-testable patterns
  const excludePatterns = [
    /\.min\./,
    /bundle\./,
    /vendor\//,
    /node_modules\//,
    /\.generated\./
  ];
  
  return !excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Extract functions/classes from code for better test generation
 */
function extractCodeStructure(content, language) {
  const structure = {
    functions: [],
    classes: [],
    exports: []
  };
  
  try {
    switch (language) {
      case 'JavaScript':
      case 'TypeScript':
        return extractJSStructure(content);
      case 'Python':
        return extractPythonStructure(content);
      case 'Java':
        return extractJavaStructure(content);
      default:
        return structure;
    }
  } catch (error) {
    console.warn('Failed to extract code structure:', error.message);
    return structure;
  }
}

/**
 * Extract JavaScript/TypeScript structure
 */
function extractJSStructure(content) {
  const structure = { functions: [], classes: [], exports: [] };
  
  // Simple regex patterns for extraction
  const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*:\s*(?:async\s+)?function)/g;
  const classPattern = /class\s+(\w+)/g;
  const exportPattern = /export\s+(?:default\s+)?(?:function\s+(\w+)|class\s+(\w+)|const\s+(\w+))/g;
  
  let match;
  
  // Extract functions
  while ((match = functionPattern.exec(content)) !== null) {
    const funcName = match[1] || match[2] || match[3];
    if (funcName && !structure.functions.includes(funcName)) {
      structure.functions.push(funcName);
    }
  }
  
  // Extract classes
  while ((match = classPattern.exec(content)) !== null) {
    structure.classes.push(match[1]);
  }
  
  // Extract exports
  while ((match = exportPattern.exec(content)) !== null) {
    const exportName = match[1] || match[2] || match[3];
    if (exportName) {
      structure.exports.push(exportName);
    }
  }
  
  return structure;
}

/**
 * Extract Python structure
 */
function extractPythonStructure(content) {
  const structure = { functions: [], classes: [], exports: [] };
  
  const functionPattern = /def\s+(\w+)/g;
  const classPattern = /class\s+(\w+)/g;
  
  let match;
  
  while ((match = functionPattern.exec(content)) !== null) {
    structure.functions.push(match[1]);
  }
  
  while ((match = classPattern.exec(content)) !== null) {
    structure.classes.push(match[1]);
  }
  
  return structure;
}

/**
 * Extract Java structure
 */
function extractJavaStructure(content) {
  const structure = { functions: [], classes: [], exports: [] };
  
  const methodPattern = /(?:public|private|protected)\s+(?:static\s+)?(?:\w+\s+)*(\w+)\s*\(/g;
  const classPattern = /(?:public\s+)?class\s+(\w+)/g;
  
  let match;
  
  while ((match = methodPattern.exec(content)) !== null) {
    const methodName = match[1];
    if (methodName && !['class', 'interface', 'enum'].includes(methodName)) {
      structure.functions.push(methodName);
    }
  }
  
  while ((match = classPattern.exec(content)) !== null) {
    structure.classes.push(match[1]);
  }
  
  return structure;
}

/**
 * Generate test file name based on source file
 */
function generateTestFileName(sourceFile, language) {
  const baseName = sourceFile.replace(/\.[^/.]+$/, ''); // Remove extension
  const extension = getTestFileExtension(language);
  
  // Handle different naming conventions
  if (baseName.includes('/')) {
    const parts = baseName.split('/');
    const fileName = parts.pop();
    return `${parts.join('/')}/__tests__/${fileName}.test.${extension}`;
  }
  
  return `${baseName}.test.${extension}`;
}

/**
 * Get test file extension for language
 */
function getTestFileExtension(language) {
  const extensions = {
    'JavaScript': 'js',
    'TypeScript': 'ts',
    'Python': 'py',
    'Java': 'java',
    'C#': 'cs',
    'Go': 'go',
    'PHP': 'php',
    'Ruby': 'rb',
    'C++': 'cpp',
    'C': 'c'
  };
  
  return extensions[language] || 'js';
}

/**
 * Sanitize input for AI prompts
 */
function sanitizeForPrompt(text) {
  // Remove or escape potentially problematic characters
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .substring(0, 5000); // Limit length
}

/**
 * Format test summary for display
 */
function formatTestSummary(summary) {
  return {
    ...summary,
    title: summary.title || 'Generated Test Suite',
    description: summary.description || 'Automated test cases',
    framework: summary.framework || 'Jest',
    testCount: Math.max(summary.testCount || 1, 1),
    files: Array.isArray(summary.files) ? summary.files : [],
    category: summary.category || 'unit'
  };
}

module.exports = {
  getLanguageFromExtension,
  createTestSummaryPrompt,
  createTestCodePrompt,
  parseAIResponse,
  generateFallbackSummaries,
  getIntegrationFramework,
  getApiTestFramework,
  isValidCodeFile,
  extractCodeStructure,
  generateTestFileName,
  getTestFileExtension,
  sanitizeForPrompt,
  formatTestSummary
};