import { Request, Response } from 'express';
import { bonsLLM, LLMMessage } from '../config/llm.config';
import config from '../config/environment';

export class ChatController {
    /**
     * Send a message to the LLM
     */
    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { messages, model, temperature, max_tokens } = req.body;

            if (!messages || !Array.isArray(messages)) {
                res.status(400).json({
                    success: false,
                    error: 'Messages array is required'
                });
                return;
            }

            // Default to Claude Sonnet if no model specified
            const selectedModel = model || config.bonsApi.models.claudeSonnet;

            const response = await bonsLLM.chatCompletion(
                selectedModel,
                messages as LLMMessage[],
                { temperature, max_tokens }
            );

            res.json({
                success: true,
                data: {
                    message: response.choices[0].message.content,
                    model: response.model,
                    usage: response.usage
                }
            });
        } catch (error: any) {
            console.error('Chat error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to process message'
            });
        }
    }

    /**
     * Get available models
     */
    async getModels(req: Request, res: Response): Promise<void> {
        try {
            const models = bonsLLM.getAvailableModels();

            res.json({
                success: true,
                data: {
                    models: [
                        {
                            id: models.claudeSonnet,
                            name: 'Claude Sonnet 4.5',
                            provider: 'Anthropic',
                            description: 'Balanced performance and speed'
                        },
                        {
                            id: models.gptCodex,
                            name: 'GPT-5.1 Codex Max',
                            provider: 'OpenAI',
                            description: 'Advanced code generation'
                        },
                        {
                            id: models.claudeOpus,
                            name: 'Claude Opus 4.5',
                            provider: 'Anthropic',
                            description: 'Maximum capability and reasoning'
                        }
                    ]
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch models'
            });
        }
    }

    /**
     * Validate API connection
     */
    async validateConnection(req: Request, res: Response): Promise<void> {
        try {
            const isValid = await bonsLLM.validateConnection();

            res.json({
                success: true,
                data: {
                    connected: isValid,
                    baseUrl: config.bonsApi.baseUrl
                }
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Connection validation failed'
            });
        }
    }
}
