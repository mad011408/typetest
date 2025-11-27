import { Server as SocketIOServer, Socket } from 'socket.io';
import { bonsLLM, LLMMessage } from '../config/llm.config';
import config from '../config/environment';
import { advancedSearchService } from '../services/advanced-search.service';

export const setupWebSocket = (io: SocketIOServer) => {
    io.on('connection', (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle chat messages with ULTRA-FAST parallel processing + DEEP SEARCH
        socket.on('chat:message', async (data: {
            messages: LLMMessage[];
            model?: string;
            temperature?: number;
            max_tokens?: number;
            enableWebSearch?: boolean;
        }) => {
            try {
                const { messages, model, temperature, max_tokens, enableWebSearch } = data;
                const selectedModel = model || config.bonsApi.models.claudeSonnet;

                const lastUserMessage = messages[messages.length - 1];
                const userQuery = lastUserMessage?.content || '';

                let searchResults: any[] = [];
                let searchPromise: Promise<any> | null = null;

                // ADVANCED DEEP SEARCH - 50+ results, multi-source, recursive
                if (enableWebSearch && advancedSearchService.shouldUseDeepSearch(userQuery)) {
                    socket.emit('search:start', { query: userQuery, mode: 'deep' });

                    // DEEP SEARCH with 50+ results
                    searchPromise = advancedSearchService.deepSearch(userQuery, {
                        maxResults: 50,
                        searchDepth: 'deep',
                        enableMultiSource: true,
                        recursive: true,
                        includeHidden: true
                    }).then(results => {
                        if (results.results.length > 0) {
                            searchResults = results.results;

                            // Send search results to client
                            socket.emit('search:results', {
                                query: results.query,
                                results: results.results,
                                totalResults: results.totalResults,
                                searchDepth: results.searchDepth
                            });
                        }
                        return results;
                    });
                }

                // IMMEDIATE AI RESPONSE START - Don't wait for search!
                socket.emit('chat:start', { model: selectedModel });

                // Start streaming IMMEDIATELY
                let streamStarted = false;
                const streamChunks: string[] = [];

                const streamHandler = async () => {
                    try {
                        await bonsLLM.streamChatCompletion(
                            selectedModel,
                            messages,
                            (chunk: string) => {
                                // INSTANT emission - no buffering!
                                socket.emit('chat:chunk', { content: chunk });
                                streamChunks.push(chunk);
                                streamStarted = true;
                            },
                            {
                                temperature: temperature || 0.7,
                                max_tokens: max_tokens || 50000
                            }
                        );

                        // If search completed, add citations at the end
                        if (searchPromise) {
                            await searchPromise;

                            if (searchResults.length > 0) {
                                // Add citations like Perplexity (show top 10)
                                let citations = '\n\n**Sources:**\n';
                                searchResults.slice(0, 10).forEach((result, index) => {
                                    citations += `[${index + 1}] [${result.title}](${result.url})`;
                                    if (result.source) citations += ` - ${result.source}`;
                                    citations += '\n';
                                });

                                if (searchResults.length > 10) {
                                    citations += `\n_...and ${searchResults.length - 10} more sources_\n`;
                                }

                                socket.emit('chat:chunk', { content: citations });
                            }
                        }

                        socket.emit('chat:complete');
                    } catch (error: any) {
                        console.error('Streaming error:', error);
                        socket.emit('chat:error', {
                            message: error.message || 'Streaming failed'
                        });
                    }
                };

                // Execute streaming immediately
                streamHandler();

            } catch (error: any) {
                console.error('WebSocket chat error:', error);
                socket.emit('chat:error', {
                    message: error.message || 'Failed to process message'
                });
            }
        });

        // Handle manual deep search requests
        socket.on('search:deep', async (data: { query: string; maxResults?: number }) => {
            try {
                const { query, maxResults = 50 } = data;

                socket.emit('search:start', { query, mode: 'deep' });

                const searchResults = await advancedSearchService.deepSearch(query, {
                    maxResults,
                    searchDepth: 'expert',
                    enableMultiSource: true,
                    recursive: true,
                    includeHidden: true
                });

                socket.emit('search:results', {
                    query: searchResults.query,
                    results: searchResults.results,
                    totalResults: searchResults.totalResults,
                    searchDepth: searchResults.searchDepth
                });
            } catch (error: any) {
                console.error('Deep search error:', error);
                socket.emit('search:error', {
                    message: error.message || 'Deep search failed'
                });
            }
        });

        // Handle model selection
        socket.on('models:get', () => {
            const models = bonsLLM.getAvailableModels();
            socket.emit('models:list', {
                models: [
                    {
                        id: models.claudeSonnet,
                        name: 'Claude Sonnet 4.5',
                        provider: 'Anthropic',
                        speed: 'Fast'
                    },
                    {
                        id: models.gptCodex,
                        name: 'GPT-5.1 Codex Max',
                        provider: 'OpenAI',
                        speed: 'Very Fast'
                    },
                    {
                        id: models.claudeOpus,
                        name: 'Claude Opus 4.5',
                        provider: 'Anthropic',
                        speed: 'Ultra Fast'
                    }
                ]
            });
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
