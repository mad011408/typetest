import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const chatAPI = {
    sendMessage: async (messages: any[], model?: string) => {
        const response = await api.post('/chat/message', { messages, model });
        return response.data;
    },

    getModels: async () => {
        const response = await api.get('/chat/models');
        return response.data;
    },

    validateConnection: async () => {
        const response = await api.post('/chat/validate');
        return response.data;
    }
};

export default api;
