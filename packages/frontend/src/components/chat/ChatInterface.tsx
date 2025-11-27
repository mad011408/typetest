import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from './MessageBubble';
import { AgentSelector } from './AgentSelector';
import { SettingsPanel } from './SettingsPanel';
import { ArtifactSidebar } from '../artifacts/ArtifactSidebar';
import { SearchResults } from '../search/SearchResults';
import { Send, Loader2, Trash2, Settings, RotateCcw, Plus, PanelRightOpen, Globe, Zap, Square } from 'lucide-react';
import { clearMessages, toggleSettings, resendLastMessage, toggleWebSearch, setStreaming } from '@/features/chat/chatSlice';
import { toggleSidebar } from '@/features/artifacts/artifactSlice';
import wsService from '@/services/websocket';

export const ChatInterface: React.FC = () => {
    const dispatch = useDispatch();
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, currentModel, isStreaming, sendMessage } = useChat();
    const { isSidebarOpen } = useSelector((state: RootState) => state.artifacts);
    const { search, enableWebSearch } = useSelector((state: RootState) => state.chat);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [input]);

    // Optimized auto-scroll with requestAnimationFrame for smoothness
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
    }, []);

    // Debounced scroll - only scroll after streaming pauses
    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages, search.results, scrollToBottom]);

    // Memoized message list to prevent unnecessary re-renders
    const messageList = useMemo(() => {
        return messages.map((message, index) => (
            <React.Fragment key={message.id}>
                <MessageBubble message={message} />
                {/* Show search results after user message if available */}
                {message.role === 'user' &&
                    index === messages.length - 2 &&
                    (search.isSearching || search.results.length > 0) && (
                        <SearchResults
                            query={search.query}
                            results={search.results}
                            isSearching={search.isSearching}
                        />
                    )}
            </React.Fragment>
        ));
    }, [messages, search]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        sendMessage(input);
        setInput('');
    }, [input, isStreaming, sendMessage]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Ctrl/Cmd + Enter to send
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit(e as any);
        }
    }, [handleSubmit]);

    const handleStopStreaming = useCallback(() => {
        // Disconnect and reconnect WebSocket to stop streaming
        wsService.disconnect();
        dispatch(setStreaming(false));

        // Reconnect after a short delay
        setTimeout(() => {
            wsService.connect();
        }, 500);
    }, [dispatch]);

    const handleClearChat = useCallback(() => {
        if (confirm('Are you sure you want to clear all messages?')) {
            dispatch(clearMessages());
        }
    }, [dispatch]);

    const handleResend = useCallback(() => {
        if (messages.length < 2) return;

        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMessage) {
            dispatch(resendLastMessage());
            setTimeout(() => {
                sendMessage(lastUserMessage.content);
            }, 100);
        }
    }, [messages, dispatch, sendMessage]);

    const handleNewChat = useCallback(() => {
        if (messages.length > 0 && confirm('Start a new conversation? Current chat will be cleared.')) {
            dispatch(clearMessages());
        }
    }, [messages.length, dispatch]);

    return (
        <>
            <div className={`flex flex-col h-screen bg-gray-900 transition-all duration-300 ${isSidebarOpen ? 'mr-[600px]' : ''
                }`}>
                {/* Header */}
                <div className="bg-gray-800 border-b border-gray-700 p-4">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-6 h-6 text-yellow-400" />
                                AI Development Platform
                            </h1>
                            <p className="text-sm text-gray-400">Ultra-Fast Multi-Agent System</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNewChat}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                title="New Chat (Ctrl+K)"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleClearChat}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                title="Clear Chat"
                                disabled={messages.length === 0}
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => dispatch(toggleWebSearch())}
                                className={`p-2 rounded-lg transition-colors ${enableWebSearch
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                title={enableWebSearch ? 'Web Search: ON (Perplexity Mode)' : 'Web Search: OFF'}
                            >
                                <Globe className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => dispatch(toggleSidebar())}
                                className={`p-2 rounded-lg transition-colors ${isSidebarOpen
                                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                title="Toggle Artifacts Sidebar"
                            >
                                <PanelRightOpen className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => dispatch(toggleSettings())}
                                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                title="Settings (Ctrl+,)"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <AgentSelector />
                        </div>
                    </div>
                </div>

                {/* Messages - Optimized rendering */}
                <div className="flex-1 overflow-y-auto p-4" style={{ willChange: 'scroll-position' }}>
                    <div className="max-w-5xl mx-auto space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                                    <h2 className="text-2xl font-semibold text-gray-300">
                                        Ultra-Fast AI Platform
                                    </h2>
                                </div>
                                <p className="text-gray-400 mb-4">
                                    Instant responses • Real-time search • Smooth performance
                                </p>
                                {enableWebSearch && (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm mb-8">
                                        <Globe className="w-4 h-4" />
                                        <span>Perplexity-style web search enabled</span>
                                    </div>
                                )}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                                    <div className="card">
                                        <h3 className="font-semibold text-white mb-2">⚡ Ultra Fast</h3>
                                        <p className="text-sm text-gray-400">
                                            Instant streaming responses with no delay
                                        </p>
                                    </div>
                                    <div className="card">
                                        <h3 className="font-semibold text-white mb-2">🌐 Real-time Search</h3>
                                        <p className="text-sm text-gray-400">
                                            Live web search with inline citations
                                        </p>
                                    </div>
                                    <div className="card">
                                        <h3 className="font-semibold text-white mb-2">🚀 Smooth</h3>
                                        <p className="text-sm text-gray-400">
                                            Optimized for low-end computers
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            messageList
                        )}
                        {isStreaming && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Streaming response...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="bg-gray-800 border-t border-gray-700 p-4">
                    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
                        <div className="flex gap-2 items-end">
                            {/* Multi-line Textarea */}
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message... (Ctrl+Enter to send)"
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[60px] max-h-[200px]"
                                    disabled={isStreaming}
                                    rows={1}
                                    autoFocus
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                                    {input.length} chars
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                {isStreaming ? (
                                    <button
                                        type="button"
                                        onClick={handleStopStreaming}
                                        className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        title="Stop Streaming"
                                    >
                                        <Square className="w-4 h-4" />
                                        Stop
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleResend}
                                            disabled={messages.length < 2}
                                            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                                            title="Resend last message"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Send
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                Model: <span className="text-primary-400">{currentModel}</span>
                            </span>
                            {enableWebSearch && (
                                <span className="flex items-center gap-1 text-green-400">
                                    <Globe className="w-3 h-3" />
                                    Perplexity mode active
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Settings Panel */}
            <SettingsPanel />

            {/* Artifact Sidebar */}
            <ArtifactSidebar />
        </>
    );
};
