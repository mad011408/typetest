import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setActiveArtifact, removeArtifact, updateArtifact, closeSidebar } from '@/features/artifacts/artifactSlice';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Download, Copy, Check, Edit2, Eye } from 'lucide-react';

export const ArtifactSidebar: React.FC = () => {
    const dispatch = useDispatch();
    const { artifacts, activeArtifactId, isSidebarOpen } = useSelector(
        (state: RootState) => state.artifacts
    );

    const [isEditing, setIsEditing] = useState(false);
    const [editedCode, setEditedCode] = useState('');
    const [copied, setCopied] = useState(false);

    const activeArtifact = artifacts.find(a => a.id === activeArtifactId);

    const handleCopy = async () => {
        if (!activeArtifact) return;
        try {
            await navigator.clipboard.writeText(activeArtifact.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = () => {
        if (!activeArtifact) return;

        const blob = new Blob([activeArtifact.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeArtifact.title}.${getFileExtension(activeArtifact.language)}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEdit = () => {
        if (!activeArtifact) return;
        setEditedCode(activeArtifact.code);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!activeArtifact) return;
        dispatch(updateArtifact({ id: activeArtifact.id, code: editedCode }));
        setIsEditing(false);
    };

    const getFileExtension = (language: string): string => {
        const extensions: Record<string, string> = {
            javascript: 'js',
            typescript: 'ts',
            tsx: 'tsx',
            jsx: 'jsx',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            html: 'html',
            css: 'css',
            json: 'json',
            sql: 'sql',
            bash: 'sh',
            shell: 'sh'
        };
        return extensions[language] || 'txt';
    };

    if (!isSidebarOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-screen w-[600px] bg-gray-900 border-l border-gray-700 flex flex-col z-40 shadow-2xl">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Artifacts</h2>
                    <button
                        onClick={() => dispatch(closeSidebar())}
                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto">
                    {artifacts.map((artifact) => (
                        <button
                            key={artifact.id}
                            onClick={() => dispatch(setActiveArtifact(artifact.id))}
                            className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${artifact.id === activeArtifactId
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {artifact.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {activeArtifact && (
                <>
                    {/* Toolbar */}
                    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono uppercase">
                                {activeArtifact.language}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                                {new Date(activeArtifact.timestamp).toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-3 py-1.5 rounded bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                        title="Edit code"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                        title="Copy code"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                        title="Download file"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => dispatch(removeArtifact(activeArtifact.id))}
                                        className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                                        title="Remove artifact"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Code Display/Editor */}
                    <div className="flex-1 overflow-auto">
                        {isEditing ? (
                            <textarea
                                value={editedCode}
                                onChange={(e) => setEditedCode(e.target.value)}
                                className="w-full h-full bg-gray-950 text-gray-100 p-4 font-mono text-sm focus:outline-none resize-none"
                                spellCheck={false}
                            />
                        ) : (
                            <SyntaxHighlighter
                                language={activeArtifact.language}
                                style={vscDarkPlus}
                                showLineNumbers={true}
                                wrapLines={true}
                                customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    background: '#0a0a0a',
                                    fontSize: '0.875rem',
                                    lineHeight: '1.5',
                                    height: '100%'
                                }}
                                lineNumberStyle={{
                                    minWidth: '3em',
                                    paddingRight: '1em',
                                    color: '#858585',
                                    userSelect: 'none'
                                }}
                            >
                                {activeArtifact.code}
                            </SyntaxHighlighter>
                        )}
                    </div>
                </>
            )}

            {artifacts.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No artifacts yet</p>
                        <p className="text-sm mt-1">Code artifacts will appear here</p>
                    </div>
                </div>
            )}
        </div>
    );
};
