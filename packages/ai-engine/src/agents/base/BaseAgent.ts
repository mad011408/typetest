import axios, { AxiosInstance } from 'axios';
import { AgentConfig, AgentMessage, AgentResponse, IAgent } from './AgentInterface';

export abstract class BaseAgent implements IAgent {
    protected config: AgentConfig;
    protected llmClient: AxiosInstance;
    protected conversationHistory: AgentMessage[] = [];

    constructor(config: AgentConfig) {
        this.config = config;

        const baseUrl = process.env.BONS_API_BASE_URL || 'https://go.trybons.ai';
        const apiKey = process.env.BONS_API_KEY || '';

        this.llmClient = axios.create({
            baseURL: baseUrl,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });

        // Initialize with system prompt
        this.conversationHistory.push({
            role: 'system',
            content: config.systemPrompt
        });
    }

    get name(): string {
        return this.config.name;
    }

    get role(): string {
        return this.config.role;
    }

    getConfig(): AgentConfig {
        return this.config;
    }

    async execute(input: string, context?: any): Promise<AgentResponse> {
        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: input
            });

            // Call LLM
            const response = await this.callLLM();

            // Add assistant response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: response.content
            });

            return response;
        } catch (error: any) {
            throw new Error(`Agent ${this.name} execution failed: ${error.message}`);
        }
    }

    protected async callLLM(): Promise<AgentResponse> {
        try {
            const response = await this.llmClient.post('/v1/chat/completions', {
                model: this.config.model,
                messages: this.conversationHistory,
                temperature: this.config.temperature || 0.7,
                max_tokens: this.config.maxTokens || 2000
            });

            const content = response.data.choices[0].message.content;

            return {
                content,
                metadata: {
                    model: response.data.model,
                    tokens: response.data.usage?.total_tokens,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error: any) {
            throw new Error(`LLM call failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    clearHistory(): void {
        this.conversationHistory = [{
            role: 'system',
            content: this.config.systemPrompt
        }];
    }

    getHistory(): AgentMessage[] {
        return [...this.conversationHistory];
    }
}
