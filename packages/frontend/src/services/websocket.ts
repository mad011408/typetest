import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { addMessage, updateLastMessage, setStreaming, setError, setSearching, setSearchResults } from '@/features/chat/chatSlice';

class WebSocketService {
    private socket: Socket | null = null;
    private url: string;

    constructor() {
        this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    }

    connect(): void {
        if (this.socket?.connected) return;

        this.socket = io(this.url, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupListeners();
    }

    private setupListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        // Search events
        this.socket.on('search:start', (data: { query: string }) => {
            console.log('Search started:', data.query);
            store.dispatch(setSearching({ query: data.query }));
        });

        this.socket.on('search:results', (data: { query: string; results: any[] }) => {
            console.log('Search results received:', data.results.length);
            store.dispatch(setSearchResults({
                query: data.query,
                results: data.results
            }));
        });

        this.socket.on('search:error', (data: { message: string }) => {
            console.error('Search error:', data.message);
            store.dispatch(setError(data.message));
        });

        // Chat events
        this.socket.on('chat:start', (data: { model: string }) => {
            console.log('Chat started with model:', data.model);
            store.dispatch(setStreaming(true));

            // Add empty assistant message that will be filled with chunks
            store.dispatch(addMessage({
                id: Date.now().toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            }));
        });

        this.socket.on('chat:chunk', (data: { content: string }) => {
            store.dispatch(updateLastMessage(data.content));
        });

        this.socket.on('chat:complete', () => {
            console.log('Chat completed');
            store.dispatch(setStreaming(false));
        });

        this.socket.on('chat:error', (data: { message: string }) => {
            console.error('Chat error:', data.message);
            store.dispatch(setError(data.message));
            store.dispatch(setStreaming(false));
        });

        this.socket.on('models:list', (data: { models: any[] }) => {
            console.log('Available models:', data.models);
        });
    }

    sendMessage(messages: any[], model?: string, options?: any): void {
        if (!this.socket?.connected) {
            console.error('WebSocket not connected');
            return;
        }

        // Get web search setting from store
        const state = store.getState();
        const enableWebSearch = state.chat.enableWebSearch;

        this.socket.emit('chat:message', {
            messages,
            model,
            enableWebSearch,
            ...options
        });
    }

    performSearch(query: string, maxResults: number = 5): void {
        if (!this.socket?.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.socket.emit('search:query', { query, maxResults });
    }

    getModels(): void {
        if (!this.socket?.connected) {
            console.error('WebSocket not connected');
            return;
        }

        this.socket.emit('models:get');
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const wsService = new WebSocketService();
export default wsService;
