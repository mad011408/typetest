import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { addArtifact } from '@/features/artifacts/artifactSlice';
import { Artifact } from '@/types/artifact.types';

interface CodeBlockProps {
    code: string;
    language?: string;
    title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'javascript', title }) => {
    const dispatch = useDispatch();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const handleOpenInSidebar = () => {
        const artifact: Artifact = {
            id: Date.now().toString(),
            title: title || `${language} code`,
            language,
            code,
            timestamp: new Date()
        };
        dispatch(addArtifact(artifact));
    };

    return (
        <div className="relative group my-4">
            {/* Language label and action buttons */}
            <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-lg border border-gray-700 border-b-0">
                <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenInSidebar}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors text-xs text-gray-300"
                        title="Open in sidebar"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors text-xs text-gray-300"
                        title="Copy code"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code with syntax highlighting and line numbers */}
            <div className="rounded-b-lg overflow-hidden border border-gray-700 border-t-0">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    showLineNumbers={true}
                    wrapLines={true}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: '#1e1e1e',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                    }}
                    lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1em',
                        color: '#858585',
                        userSelect: 'none'
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
