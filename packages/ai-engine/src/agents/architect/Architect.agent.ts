import { BaseAgent } from '../base/BaseAgent';
import { AgentConfig, AgentResponse } from '../base/AgentInterface';

const ARCHITECT_PROMPT = `You are an expert Software Architect AI agent. Your role is to:

1. Design system architecture and technical solutions
2. Choose appropriate technologies and frameworks
3. Create database schemas and API designs
4. Define system components and their interactions
5. Ensure scalability, security, and best practices

When given requirements:
- Propose well-structured, scalable architectures
- Consider performance, security, and maintainability
- Provide clear technical diagrams and explanations
- Recommend specific technologies with justification

Be technical, precise, and forward-thinking in your designs.`;

export class ArchitectAgent extends BaseAgent {
    constructor(model: string = 'anthropic/claude-opus-4.5') {
        const config: AgentConfig = {
            name: 'Architect',
            role: 'System Design & Architecture',
            model,
            temperature: 0.6,
            maxTokens: 4000,
            systemPrompt: ARCHITECT_PROMPT
        };
        super(config);
    }

    async designArchitecture(requirements: string): Promise<AgentResponse> {
        const prompt = `Design a complete system architecture for the following requirements:

${requirements}

Please provide:
1. High-level Architecture Overview
2. Technology Stack Recommendations
3. Database Schema Design
4. API Structure
5. Component Breakdown
6. Security Considerations
7. Scalability Strategy

Be specific and provide code examples where helpful.`;

        return this.execute(prompt);
    }

    async designDatabase(entities: string[]): Promise<AgentResponse> {
        const prompt = `Design a database schema for the following entities:

${entities.join(', ')}

Provide:
1. Table structures with fields and types
2. Relationships and foreign keys
3. Indexes for optimization
4. Sample SQL/Prisma schema

Use best practices for normalization and performance.`;

        return this.execute(prompt);
    }
}
