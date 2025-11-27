import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { updateSettings, toggleSettings } from '@/features/chat/chatSlice';
import { X, Plus, Trash2, Key, Globe, Zap } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
    const dispatch = useDispatch();
    const { settings, showSettings } = useSelector((state: RootState) => state.chat);

    const [localSettings, setLocalSettings] = useState(settings);
    const [newModel, setNewModel] = useState({ id: '', name: '', provider: '' });

    const handleSave = () => {
        dispatch(updateSettings(localSettings));
        dispatch(toggleSettings());
    };

    const handleAddModel = () => {
        if (newModel.id && newModel.name) {
            setLocalSettings({
                ...localSettings,
                apiConfig: {
                    ...localSettings.apiConfig,
                    customModels: [...localSettings.apiConfig.customModels, newModel]
                }
            });
            setNewModel({ id: '', name: '', provider: '' });
        }
    };

    const handleRemoveModel = (modelId: string) => {
        setLocalSettings({
            ...localSettings,
            apiConfig: {
                ...localSettings.apiConfig,
                customModels: localSettings.apiConfig.customModels.filter(m => m.id !== modelId)
            }
        });
    };

    if (!showSettings) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        Advanced Settings
                    </h2>
                    <button
                        onClick={() => dispatch(toggleSettings())}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Custom API Configuration */}
                    <div className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary-400" />
                                Custom API Configuration
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localSettings.apiConfig.useCustomConfig}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        apiConfig: { ...localSettings.apiConfig, useCustomConfig: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm text-gray-300">Use Custom API</span>
                            </label>
                        </div>

                        {localSettings.apiConfig.useCustomConfig && (
                            <div className="space-y-4">
                                {/* Base URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        API Base URL
                                    </label>
                                    <input
                                        type="text"
                                        value={localSettings.apiConfig.baseUrl}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            apiConfig: { ...localSettings.apiConfig, baseUrl: e.target.value }
                                        })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://api.openai.com/v1"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Examples: OpenAI, Azure OpenAI, local LLM endpoints
                                    </p>
                                </div>

                                {/* API Key */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        API Key
                                    </label>
                                    <input
                                        type="password"
                                        value={localSettings.apiConfig.apiKey}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            apiConfig: { ...localSettings.apiConfig, apiKey: e.target.value }
                                        })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="sk-..."
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Your API key is stored locally and never sent to our servers
                                    </p>
                                </div>

                                {/* Custom Models */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Custom Models
                                    </label>

                                    {/* Existing Models */}
                                    <div className="space-y-2 mb-3">
                                        {localSettings.apiConfig.customModels.map((model) => (
                                            <div
                                                key={model.id}
                                                className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                                            >
                                                <div>
                                                    <p className="text-white font-medium">{model.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {model.id} • {model.provider}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveModel(model.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Model */}
                                    <div className="border border-gray-700 rounded-lg p-3 space-y-2">
                                        <p className="text-sm text-gray-300 font-medium">Add New Model</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                value={newModel.id}
                                                onChange={(e) => setNewModel({ ...newModel, id: e.target.value })}
                                                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="Model ID"
                                            />
                                            <input
                                                type="text"
                                                value={newModel.name}
                                                onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                                                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="Display Name"
                                            />
                                            <input
                                                type="text"
                                                value={newModel.provider}
                                                onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                                                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="Provider"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddModel}
                                            disabled={!newModel.id || !newModel.name}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Model
                                        </button>
                                    </div>

                                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mt-3">
                                        <p className="text-xs text-blue-300">
                                            <strong>Examples:</strong><br />
                                            • OpenAI: gpt-4, gpt-3.5-turbo<br />
                                            • Anthropic: claude-3-opus, claude-3-sonnet<br />
                                            • Azure: your-deployment-name<br />
                                            • Local: llama-2-70b, mistral-7b
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* System Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            System Prompt
                        </label>
                        <textarea
                            value={localSettings.systemPrompt}
                            onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[120px]"
                            placeholder="Enter system prompt..."
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            This message sets the behavior and personality of the AI assistant.
                        </p>
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Temperature: {localSettings.temperature}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={localSettings.temperature}
                            onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Precise (0)</span>
                            <span>Balanced (1)</span>
                            <span>Creative (2)</span>
                        </div>
                    </div>

                    {/* Max Tokens */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Max Tokens
                        </label>
                        <input
                            type="number"
                            value={localSettings.maxTokens}
                            onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            min="100"
                            max="50000"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Maximum length of the response (100-50000 tokens)
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={handleSave}
                        className="btn-primary flex-1"
                    >
                        Save Settings
                    </button>
                    <button
                        onClick={() => dispatch(toggleSettings())}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
