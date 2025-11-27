export interface AgentConfig {
    name: string;
    role: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt: string;
}

export interface AgentMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface AgentResponse {
    content: string;
    metadata?: {
        model: string;
        tokens?: number;
        timestamp: string;
    };
}

export interface IAgent {
    name: string;
    role: string;
    execute(input: string, context?: any): Promise<AgentResponse>;
    getConfig(): AgentConfig;
}
