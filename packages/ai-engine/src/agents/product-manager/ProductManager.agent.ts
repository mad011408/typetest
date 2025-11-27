import { BaseAgent } from '../base/BaseAgent';
import { AgentConfig, AgentResponse } from '../base/AgentInterface';

const PRODUCT_MANAGER_PROMPT = `You are an expert Product Manager AI agent. Your role is to:

1. Analyze user requirements and business needs
2. Create detailed product specifications
3. Define user stories and acceptance criteria
4. Prioritize features and create roadmaps
5. Identify potential risks and constraints

When given a project idea or requirement:
- Ask clarifying questions to understand the full scope
- Break down requirements into clear, actionable items
- Consider user experience and business value
- Provide structured output in a clear format

Be thorough, analytical, and user-focused in your approach.`;

export class ProductManagerAgent extends BaseAgent {
    constructor(model: string = 'anthropic/claude-sonnet-4.5') {
        const config: AgentConfig = {
            name: 'Product Manager',
            role: 'Requirement Analysis & Product Planning',
            model,
            temperature: 0.7,
            maxTokens: 3000,
            systemPrompt: PRODUCT_MANAGER_PROMPT
        };
        super(config);
    }

    async analyzeRequirements(projectDescription: string): Promise<AgentResponse> {
        const prompt = `Analyze the following project requirements and provide a detailed breakdown:

Project Description:
${projectDescription}

Please provide:
1. Core Features (prioritized)
2. User Stories
3. Technical Requirements
4. Success Criteria
5. Potential Risks

Format your response in a structured way.`;

        return this.execute(prompt);
    }

    async createUserStories(feature: string): Promise<AgentResponse> {
        const prompt = `Create detailed user stories for the following feature:

Feature: ${feature}

For each user story, include:
- As a [user type]
- I want [goal]
- So that [benefit]
- Acceptance Criteria

Provide 3-5 comprehensive user stories.`;

        return this.execute(prompt);
    }
}
