import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatHistory, HistoryState } from '@/types/history.types';

const STORAGE_KEY = 'chat_histories';

// Load from localStorage
const loadHistories = (): ChatHistory[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

// Save to localStorage
const saveHistories = (histories: ChatHistory[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
    } catch (error) {
        console.error('Failed to save histories:', error);
    }
};

const initialState: HistoryState = {
    histories: loadHistories(),
    currentHistoryId: null,
    isLoading: false
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        saveCurrentChat: (state, action: PayloadAction<{ messages: any[]; model: string }>) => {
            const { messages, model } = action.payload;

            if (messages.length === 0) return;

            const title = messages[0]?.content?.substring(0, 50) || 'New Chat';
            const now = new Date();

            if (state.currentHistoryId) {
                // Update existing
                const history = state.histories.find(h => h.id === state.currentHistoryId);
                if (history) {
                    history.messages = messages;
                    history.model = model;
                    history.updatedAt = now;
                }
            } else {
                // Create new
                const newHistory: ChatHistory = {
                    id: Date.now().toString(),
                    title,
                    messages,
                    model,
                    createdAt: now,
                    updatedAt: now
                };
                state.histories.unshift(newHistory);
                state.currentHistoryId = newHistory.id;
            }

            saveHistories(state.histories);
        },
        loadHistory: (state, action: PayloadAction<string>) => {
            state.currentHistoryId = action.payload;
        },
        deleteHistory: (state, action: PayloadAction<string>) => {
            state.histories = state.histories.filter(h => h.id !== action.payload);
            if (state.currentHistoryId === action.payload) {
                state.currentHistoryId = null;
            }
            saveHistories(state.histories);
        },
        clearAllHistory: (state) => {
            state.histories = [];
            state.currentHistoryId = null;
            localStorage.removeItem(STORAGE_KEY);
        },
        newChat: (state) => {
            state.currentHistoryId = null;
        }
    }
});

export const {
    saveCurrentChat,
    loadHistory,
    deleteHistory,
    clearAllHistory,
    newChat
} = historySlice.actions;

export default historySlice.reducer;
