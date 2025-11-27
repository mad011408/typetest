import axios, { AxiosInstance } from 'axios';
import config from './environment';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    id: string;
    model: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export class BonsLLMClient {
    private client: AxiosInstance;
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = config.bonsApi.apiKey;
        this.baseUrl = config.bonsApi.baseUrl;

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 1600000 // 1600 seconds
        });
    }

    /**
     * Send a chat completion request to the Bons API
     */
    async chatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: {
            temperature?: number;
            max_tokens?: number;
            stream?: boolean;
        }
    ): Promise<LLMResponse> {
        try {
            const response = await this.client.post('/v1/chat/completions', {
                model,
                messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.max_tokens || 50000,
                stream: options?.stream || false
            });

            return response.data;
        } catch (error: any) {
            console.error('Bons API Error:', error.response?.data || error.message);
            throw new Error(`LLM API Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Stream chat completion (for real-time responses)
     */
    async streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        onChunk: (chunk: string) => void,
        options?: {
            temperature?: number;
            max_tokens?: number;
        }
    ): Promise<void> {
        try {
            const response = await this.client.post('/v1/chat/completions', {
                model,
                messages,
                temperature: options?.temperature || 0.7,
                max_tokens: options?.max_tokens || 50000,
                stream: true
            }, {
                responseType: 'stream'
            });

            response.data.on('data', (chunk: Buffer) => {
                const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') return;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content;
                            if (content) {
                                onChunk(content);
                            }
                        } catch (e) {
                            // Skip invalid JSON
                        }
                    }
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', resolve);
                response.data.on('error', reject);
            });
        } catch (error: any) {
            console.error('Bons API Streaming Error:', error.response?.data || error.message);
            throw new Error(`LLM Streaming Error: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Get available models
     */
    getAvailableModels() {
        return config.bonsApi.models;
    }

    /**
     * Validate API connection
     */
    async validateConnection(): Promise<boolean> {
        try {
            await this.client.get('/v1/models');
            return true;
        } catch (error) {
            console.error('Failed to connect to Bons API:', error);
            return false;
        }
    }
}

// Export singleton instance
export const bonsLLM = new BonsLLMClient();
export default bonsLLM;
