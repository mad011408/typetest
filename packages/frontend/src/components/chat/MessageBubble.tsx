import React, { useState, memo } from 'react';
import { Message } from '@/types/chat.types';
import { User, Bot, Copy, Check } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { parseMessageContent } from '@/utils/messageParser';

interface MessageBubbleProps {
    message: Message;
}

// Memoized component - only re-renders if message changes
export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Parse message content to extract code blocks
    const parsedContent = parseMessageContent(message.content);

    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div className="relative max-w-3xl">
                <div
                    className={`rounded-lg p-4 ${isUser
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                >
                    {message.agent && (
                        <div className="text-xs font-semibold mb-1 opacity-75">
                            {message.agent}
                        </div>
                    )}

                    {/* Render parsed content - optimized */}
                    <div className="prose prose-invert max-w-none">
                        {parsedContent.map((part, index) => {
                            if (part.type === 'code') {
                                return (
                                    <CodeBlock
                                        key={index}
                                        code={part.content}
                                        language={part.language}
                                    />
                                );
                            } else {
                                // Process inline citations like Perplexity [1], [2]
                                const contentWithCitations = part.content.replace(
                                    /\[(\d+)\]/g,
                                    '<sup class="text-primary-400 font-semibold cursor-pointer hover:text-primary-300">[$1]</sup>'
                                );

                                return (
                                    <div
                                        key={index}
                                        className="whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: contentWithCitations }}
                                    />
                                );
                            }
                        })}
                    </div>

                    <div className="text-xs opacity-50 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                </div>

                {/* Copy entire message button */}
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded bg-gray-700 hover:bg-gray-600"
                    title="Copy entire message"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                    )}
                </button>
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if content actually changed
    return prevProps.message.content === nextProps.message.content &&
        prevProps.message.id === nextProps.message.id;
});

MessageBubble.displayName = 'MessageBubble';
