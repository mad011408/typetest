import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentModel } from '@/features/chat/chatSlice';
import { ChevronDown } from 'lucide-react';

export const AgentSelector: React.FC = () => {
    const dispatch = useDispatch();
    const { currentModel, availableModels } = useSelector((state: RootState) => state.chat);

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setCurrentModel(e.target.value));
    };

    return (
        <div className="relative">
            <select
                value={currentModel}
                onChange={handleModelChange}
                className="appearance-none bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
                {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name} ({model.provider})
                        </option>
                    ))
                ) : (
                    <>
                        <option value="anthropic/claude-sonnet-4.5">Claude Sonnet 4.5</option>
                        <option value="openai/gpt-5.1-codex-max">GPT-5.1 Codex Max</option>
                        <option value="anthropic/claude-opus-4.5">Claude Opus 4.5</option>
                    </>
                )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
};
