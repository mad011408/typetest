import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '@/features/chat/chatSlice';
import artifactReducer from '@/features/artifacts/artifactSlice';
import historyReducer from '@/features/history/historySlice';

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        artifacts: artifactReducer,
        history: historyReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['history/saveCurrentChat', 'history/loadHistory'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt'],
                // Ignore these paths in the state
                ignoredPaths: ['history.histories']
            }
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
