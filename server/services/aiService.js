// server/services/aiService.js
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

class AIService {
  constructor() {
    this.gemini = null;
    this.initializeGemini();
  }

  initializeGemini() {
    try {
      if (process.env.GEMINI_API_KEY) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('✅ Gemini AI service initialized');
      } else {
        console.warn('⚠️ Gemini API key not found, AI generation disabled');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  /**
   * Generate structured test case summaries from code files
   */
  async generateTestSummaries(fileContents, primaryLanguage) {
    if (!this.model) {
      throw new Error('Gemini AI service not available');
    }

    const files = fileContents.map(f => `${f.path} (${f.language})`).join(', ');

    const prompt = `
Analyze the following ${primaryLanguage} code files and generate 3-4 test case summaries:

Files: ${files}

Code samples:
${fileContents.map(f => `// ${f.path}\n${f.content.substring(0, 500)}...`).join('\n\n')}

For each test summary, provide:
1. Title (concise description)
2. Description (what will be tested)
3. Recommended testing framework
4. Estimated number of test cases
5. Files that will be covered
6. Category: unit, integration, or e2e

Format as **pure JSON array**, like:
[
  {
    "title": "Component Rendering Tests",
    "description": "Tests for component mounting, props, and basic functionality",
    "framework": "Jest + React Testing Library",
    "testCount": 8,
    "files": ["Header.jsx", "Dashboard.jsx"],
    "category": "unit"
  }
]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const rawContent = result.response.text().trim();

      try {
        return JSON.parse(rawContent);
      } catch {
        console.warn("⚠️ Could not parse AI response as JSON, returning raw text");
        return rawContent;
      }
    } catch (error) {
      console.error('❌ Gemini API error in generateTestSummaries:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  /**
   * Generate runnable test code based on a summary
   */
  async generateTestCode(summary, files, language) {
    if (!this.model) {
      throw new Error('Gemini AI service not available');
    }

    const codeSamples = files
      .filter(f => summary.files.includes(f.path))
      .map(f => `// ${f.path}\n${f.content.substring(0, 500)}...`)
      .join("\n\n");

    const prompt = `
Generate comprehensive test code for "${summary.title}" using ${summary.framework}.

Test Summary:
- Description: ${summary.description}
- Framework: ${summary.framework}
- Test Count: ${summary.testCount}
- Files: ${summary.files.join(', ')}
- Language: ${language}

Relevant code:
${codeSamples}

Requirements:
1. Generate actual runnable test code
2. Include proper imports and setup
3. Cover positive and negative test cases
4. Include mocking where appropriate
5. Follow ${language} testing best practices
6. Include comments explaining test logic
7. Make tests realistic and meaningful

Return **only** the complete test file content, no explanations or markdown formatting.
`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('❌ Gemini API error in generateTestCode:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  isAvailable() {
    return !!this.model;
  }
}

export default new AIService();
