import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { addMessage, setModels } from '@/features/chat/chatSlice';
import wsService from '@/services/websocket';
import { chatAPI } from '@/services/api';
import { Message } from '@/types/chat.types';

export const useChat = () => {
    const dispatch = useDispatch();
    const { messages, currentModel, availableModels, isStreaming, isLoading, settings } = useSelector(
        (state: RootState) => state.chat
    );
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect WebSocket
        wsService.connect();
        setIsConnected(wsService.isConnected());

        // Fetch available models
        fetchModels();

        return () => {
            wsService.disconnect();
        };
    }, []);

    const fetchModels = async () => {
        try {
            const response = await chatAPI.getModels();
            if (response.success) {
                dispatch(setModels(response.data.models));
            }
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    };

    const sendMessage = (content: string) => {
        // Add user message to state
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };
        dispatch(addMessage(userMessage));

        // Prepare messages for API with system prompt
        const apiMessages = [
            { role: 'system', content: settings.systemPrompt },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content }
        ];

        // Send via WebSocket for streaming
        wsService.sendMessage(apiMessages, currentModel, {
            temperature: settings.temperature,
            max_tokens: settings.maxTokens
        });
    };

    return {
        messages,
        currentModel,
        availableModels,
        isStreaming,
        isLoading,
        isConnected,
        sendMessage,
        fetchModels
    };
};
