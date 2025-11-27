import React from 'react';
import { Search, ExternalLink } from 'lucide-react';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source?: string;
}

interface SearchResultsProps {
    query: string;
    results: SearchResult[];
    isSearching: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ query, results, isSearching }) => {
    if (isSearching) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-4">
                <div className="flex items-center gap-2 text-primary-400">
                    <Search className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Searching the web for "{query}"...</span>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-4">
            <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">
                    Web Search Results for "{query}"
                </span>
                <span className="text-xs text-gray-400">({results.length} results)</span>
            </div>

            <div className="space-y-3">
                {results.map((result, index) => (
                    <a
                        key={index}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-900 rounded-lg hover:bg-gray-850 transition-all group border border-gray-700 hover:border-primary-500"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                {/* Title - Colored and clickable */}
                                <h3 className="text-sm font-medium text-primary-400 group-hover:text-primary-300 truncate flex items-center gap-2">
                                    <span className="text-gray-500">[{index + 1}]</span>
                                    {result.title}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>

                                {/* Snippet */}
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {result.snippet}
                                </p>

                                {/* URL - Colored */}
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-xs text-green-400 truncate font-mono">
                                        {new URL(result.url).hostname}
                                    </p>
                                    {result.source && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded">
                                            {result.source}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};
