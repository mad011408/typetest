import fetch from 'node-fetch';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    favicon?: string;
}

export interface WebSearchResponse {
    query: string;
    results: SearchResult[];
    timestamp: Date;
}

export class WebSearchService {
    private cache: Map<string, WebSearchResponse> = new Map();
    private cacheExpiry = 3600000; // 1 hour

    /**
     * Search the web using DuckDuckGo Instant Answer API (free, no API key needed)
     */
    async search(query: string, maxResults: number = 5): Promise<WebSearchResponse> {
        // Check cache first
        const cached = this.cache.get(query);
        if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
            console.log('Returning cached search results for:', query);
            return cached;
        }

        try {
            console.log('Performing web search for:', query);

            // Use DuckDuckGo HTML search (no API key required)
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const html = await response.text();
            const results = this.parseSearchResults(html, maxResults);

            const searchResponse: WebSearchResponse = {
                query,
                results,
                timestamp: new Date()
            };

            // Cache the results
            this.cache.set(query, searchResponse);

            return searchResponse;
        } catch (error: any) {
            console.error('Web search error:', error);

            // Return empty results on error
            return {
                query,
                results: [],
                timestamp: new Date()
            };
        }
    }

    /**
     * Parse DuckDuckGo HTML results
     */
    private parseSearchResults(html: string, maxResults: number): SearchResult[] {
        const results: SearchResult[] = [];

        try {
            // Simple regex-based parsing for DuckDuckGo results
            const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)</g;

            let match;
            let count = 0;

            while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
                const url = this.cleanUrl(match[1]);
                const title = this.cleanText(match[2]);
                const snippet = this.cleanText(match[3]);

                if (url && title) {
                    results.push({
                        title,
                        url,
                        snippet: snippet || 'No description available'
                    });
                    count++;
                }
            }
        } catch (error) {
            console.error('Error parsing search results:', error);
        }

        return results;
    }

    /**
     * Clean URL from DuckDuckGo redirect
     */
    private cleanUrl(url: string): string {
        try {
            // DuckDuckGo uses redirect URLs, extract the actual URL
            const match = url.match(/uddg=([^&]*)/);
            if (match) {
                return decodeURIComponent(match[1]);
            }
            return url;
        } catch {
            return url;
        }
    }

    /**
     * Clean HTML entities and extra whitespace from text
     */
    private cleanText(text: string): string {
        return text
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Detect if a query needs web search
     */
    shouldSearch(query: string): boolean {
        const searchKeywords = [
            'latest', 'recent', 'current', 'news', 'today',
            'what is', 'who is', 'when did', 'where is',
            'search for', 'find', 'look up',
            'price of', 'weather', 'stock',
            '2024', '2025', 'now'
        ];

        const lowerQuery = query.toLowerCase();
        return searchKeywords.some(keyword => lowerQuery.includes(keyword));
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Export singleton instance
export const webSearchService = new WebSearchService();
export default webSearchService;
