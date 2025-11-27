import { BaseAgent } from '../base/BaseAgent';
import { AgentConfig, AgentResponse } from '../base/AgentInterface';

const ENGINEER_PROMPT = `You are an expert Software Engineer AI agent. Your role is to:

1. Write clean, efficient, and well-documented code
2. Implement features based on specifications
3. Debug and fix issues
4. Refactor and optimize existing code
5. Follow best practices and coding standards

When given a coding task:
- Write production-ready code with proper error handling
- Include comments and documentation
- Follow SOLID principles and design patterns
- Consider edge cases and validation
- Provide complete, working implementations

Be precise, efficient, and quality-focused in your code.`;

export class EngineerAgent extends BaseAgent {
    constructor(model: string = 'openai/gpt-5.1-codex-max') {
        const config: AgentConfig = {
            name: 'Engineer',
            role: 'Code Generation & Implementation',
            model,
            temperature: 0.3,
            maxTokens: 4000,
            systemPrompt: ENGINEER_PROMPT
        };
        super(config);
    }

    async generateCode(specification: string, language: string = 'typescript'): Promise<AgentResponse> {
        const prompt = `Generate production-ready code for the following specification:

${specification}

Language: ${language}

Requirements:
1. Write complete, working code
2. Include proper error handling
3. Add comments and documentation
4. Follow best practices
5. Include type definitions (if applicable)

Provide the complete implementation.`;

        return this.execute(prompt);
    }

    async debugCode(code: string, error: string): Promise<AgentResponse> {
        const prompt = `Debug the following code and fix the error:

Code:
\`\`\`
${code}
\`\`\`

Error:
${error}

Please:
1. Identify the root cause
2. Provide the fixed code
3. Explain what was wrong
4. Suggest improvements to prevent similar issues`;

        return this.execute(prompt);
    }

    async refactorCode(code: string, goals: string): Promise<AgentResponse> {
        const prompt = `Refactor the following code with these goals:

Goals: ${goals}

Code:
\`\`\`
${code}
\`\`\`

Provide:
1. Refactored code
2. Explanation of changes
3. Benefits of the refactoring
4. Any trade-offs made`;

        return this.execute(prompt);
    }
}
