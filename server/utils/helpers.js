/**
 * Get programming language from file extension
 */
export function getLanguageFromExtension(filePath = '') {
  if (!filePath || typeof filePath !== 'string') return 'Unknown';
  const parts = filePath.split('.');
  if (parts.length < 2) return 'Unknown';
  const extension = parts.pop().toLowerCase();

  const languageMap = {
    js: 'JavaScript', jsx: 'JavaScript',
    ts: 'TypeScript', tsx: 'TypeScript',
    py: 'Python', java: 'Java',
    cpp: 'C++', c: 'C', cs: 'C#',
    php: 'PHP', rb: 'Ruby', go: 'Go',
    rs: 'Rust', swift: 'Swift', kt: 'Kotlin',
    vue: 'Vue', svelte: 'Svelte'
  };
  return languageMap[extension] || 'Unknown';
}

/**
 * Create AI prompt for test summaries
 */
export function createTestSummaryPrompt(fileContents, primaryLanguage) {
  const files = fileContents.map(f => `${f.path} (${f.language})`).join(', ');

  return `Analyze the following ${primaryLanguage} code files and generate 3-5 test case summaries:

Files: ${files}

Code samples:
${fileContents
  .map(f => `// ${f.path}\n${f.content.substring(0, 500)}...`)
  .join('\n\n')}

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
export function createTestCodePrompt(summary, files, language) {
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
export function parseAIResponse(response, fileContents) {
  try {
    let cleanResponse = response.trim();

    // Strip markdown JSON code block wrappers if present
    cleanResponse = cleanResponse.replace(/```json|```/g, '').trim();

    let jsonMatch;
    if (cleanResponse.startsWith('[') && cleanResponse.endsWith(']')) {
      jsonMatch = cleanResponse;
    } else {
      const match = cleanResponse.match(/\[[\s\S]*\]/);
      if (match) jsonMatch = match[0];
    }

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // No fallback, return empty array if parsing fails
    return [];
  } catch (error) {
    console.warn('Warning: Error parsing AI response ->', error.message);
    return [];
  }
}
