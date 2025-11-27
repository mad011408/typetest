import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Message, Model, ChatSettings } from '@/types/chat.types';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

export interface SearchState {
    query: string;
    results: SearchResult[];
    isSearching: boolean;
}

interface ExtendedChatState extends ChatState {
    search: SearchState;
    enableWebSearch: boolean;
}

const initialState: ExtendedChatState = {
    messages: [],
    currentModel: 'anthropic/claude-sonnet-4.5',
    availableModels: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    settings: {
        systemPrompt: 'You are a helpful AI assistant with access to real-time web search.',
        temperature: 0.7,
        maxTokens: 50000,
        apiConfig: {
            baseUrl: 'https://go.trybons.ai',
            apiKey: '',
            customModels: [],
            useCustomConfig: false
        }
    },
    showSettings: false,
    search: {
        query: '',
        results: [],
        isSearching: false
    },
    enableWebSearch: true
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        updateLastMessage: (state, action: PayloadAction<string>) => {
            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content += action.payload;
            }
        },
        resendLastMessage: (state) => {
            if (state.messages.length > 0 && state.messages[state.messages.length - 1].role === 'assistant') {
                state.messages.pop();
            }
        },
        setModels: (state, action: PayloadAction<Model[]>) => {
            state.availableModels = action.payload;
        },
        setCurrentModel: (state, action: PayloadAction<string>) => {
            state.currentModel = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setStreaming: (state, action: PayloadAction<boolean>) => {
            state.isStreaming = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearMessages: (state) => {
            state.messages = [];
            state.search = { query: '', results: [], isSearching: false };
        },
        updateSettings: (state, action: PayloadAction<Partial<ChatSettings>>) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        toggleSettings: (state) => {
            state.showSettings = !state.showSettings;
        },
        setSearching: (state, action: PayloadAction<{ query: string }>) => {
            state.search.isSearching = true;
            state.search.query = action.payload.query;
            state.search.results = [];
        },
        setSearchResults: (state, action: PayloadAction<{ query: string; results: SearchResult[] }>) => {
            state.search.isSearching = false;
            state.search.query = action.payload.query;
            state.search.results = action.payload.results;
        },
        clearSearch: (state) => {
            state.search = { query: '', results: [], isSearching: false };
        },
        toggleWebSearch: (state) => {
            state.enableWebSearch = !state.enableWebSearch;
        }
    }
});

export const {
    addMessage,
    updateLastMessage,
    resendLastMessage,
    setModels,
    setCurrentModel,
    setLoading,
    setStreaming,
    setError,
    clearMessages,
    updateSettings,
    toggleSettings,
    setSearching,
    setSearchResults,
    clearSearch,
    toggleWebSearch
} = chatSlice.actions;

export default chatSlice.reducer;
