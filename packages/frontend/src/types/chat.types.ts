export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    agent?: string;
}

export interface Model {
    id: string;
    name: string;
    provider: string;
}

export interface CustomModel {
    id: string;
    name: string;
    provider: string;
    maxTokens?: number;
}

export interface APIConfig {
    baseUrl: string;
    apiKey: string;
    customModels: CustomModel[];
    useCustomConfig: boolean;
}

export interface ChatSettings {
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    apiConfig: APIConfig;
}

export interface ChatState {
    messages: Message[];
    currentModel: string;
    availableModels: Model[];
    isLoading: boolean;
    isStreaming: boolean;
    error: string | null;
    settings: ChatSettings;
    showSettings: boolean;
}
