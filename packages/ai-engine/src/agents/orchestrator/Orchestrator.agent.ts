import { ProductManagerAgent } from '../product-manager/ProductManager.agent';
import { ArchitectAgent } from '../architect/Architect.agent';
import { EngineerAgent } from '../engineer/Engineer.agent';
import { AgentResponse } from '../base/AgentInterface';

export interface OrchestratorResult {
    phase: string;
    agent: string;
    response: AgentResponse;
}

export class OrchestratorAgent {
    private pmAgent: ProductManagerAgent;
    private architectAgent: ArchitectAgent;
    private engineerAgent: EngineerAgent;

    constructor() {
        this.pmAgent = new ProductManagerAgent();
        this.architectAgent = new ArchitectAgent();
        this.engineerAgent = new EngineerAgent();
    }

    /**
     * Execute a complete development workflow
     */
    async executeWorkflow(projectDescription: string): Promise<OrchestratorResult[]> {
        const results: OrchestratorResult[] = [];

        try {
            // Phase 1: Requirements Analysis
            console.log('Phase 1: Analyzing requirements...');
            const requirements = await this.pmAgent.analyzeRequirements(projectDescription);
            results.push({
                phase: 'Requirements Analysis',
                agent: 'Product Manager',
                response: requirements
            });

            // Phase 2: Architecture Design
            console.log('Phase 2: Designing architecture...');
            const architecture = await this.architectAgent.designArchitecture(requirements.content);
            results.push({
                phase: 'Architecture Design',
                agent: 'Architect',
                response: architecture
            });

            // Phase 3: Code Generation
            console.log('Phase 3: Generating code...');
            const code = await this.engineerAgent.generateCode(architecture.content);
            results.push({
                phase: 'Code Generation',
                agent: 'Engineer',
                response: code
            });

            return results;
        } catch (error: any) {
            throw new Error(`Workflow execution failed: ${error.message}`);
        }
    }

    /**
     * Route a query to the appropriate agent
     */
    async routeQuery(query: string, agentType?: string): Promise<AgentResponse> {
        const lowerQuery = query.toLowerCase();

        // Auto-detect agent if not specified
        if (!agentType) {
            if (lowerQuery.includes('requirement') || lowerQuery.includes('feature') || lowerQuery.includes('user story')) {
                agentType = 'pm';
            } else if (lowerQuery.includes('architecture') || lowerQuery.includes('design') || lowerQuery.includes('database')) {
                agentType = 'architect';
            } else if (lowerQuery.includes('code') || lowerQuery.includes('implement') || lowerQuery.includes('debug')) {
                agentType = 'engineer';
            } else {
                agentType = 'pm'; // Default to PM
            }
        }

        switch (agentType.toLowerCase()) {
            case 'pm':
            case 'product-manager':
                return this.pmAgent.execute(query);

            case 'architect':
                return this.architectAgent.execute(query);

            case 'engineer':
            case 'developer':
                return this.engineerAgent.execute(query);

            default:
                throw new Error(`Unknown agent type: ${agentType}`);
        }
    }

    /**
     * Get all available agents
     */
    getAgents() {
        return [
            this.pmAgent.getConfig(),
            this.architectAgent.getConfig(),
            this.engineerAgent.getConfig()
        ];
    }
}
