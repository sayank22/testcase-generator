// server/services/aiService.js
class AIService {
  constructor() {
    this.openai = null;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    try {
      // Only initialize if OpenAI API key is provided
      if (process.env.OPENAI_API_KEY) {
        const { OpenAI } = require('openai');
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI service initialized');
      } else {
        console.log('⚠️  OpenAI API key not found, using fallback generation');
      }
    } catch (error) {
      console.warn('⚠️  Failed to initialize OpenAI:', error.message);
    }
  }

  async generateTestSummaries(fileContents, primaryLanguage) {
    if (!this.openai) {
      throw new Error('OpenAI service not available');
    }

    const files = fileContents.map(f => `${f.path} (${f.language})`).join(', ');
    
    const prompt = `Analyze the following ${primaryLanguage} code files and generate 3-4 test case summaries:

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
}]

Return only the JSON array, no additional text.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  async generateTestCode(summary, files, language) {
    if (!this.openai) {
      throw new Error('OpenAI service not available');
    }

    const prompt = `Generate comprehensive test code for "${summary.title}" using ${summary.framework}.

Test Summary:
- Description: ${summary.description}
- Framework: ${summary.framework}
- Test Count: ${summary.testCount}
- Files: ${summary.files.join(', ')}
- Language: ${language}

Requirements:
1. Generate actual runnable test code
2. Include proper imports and setup
3. Cover positive and negative test cases
4. Include mocking where appropriate
5. Follow ${language} testing best practices
6. Include comments explaining test logic
7. Make tests realistic and meaningful

Generate complete test file with proper structure for ${language}.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI service failed: ${error.message}`);
    }
  }

  isAvailable() {
    return !!this.openai;
  }
}

module.exports = new AIService();