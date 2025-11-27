import fetch from 'node-fetch';

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    source?: string;
    relevance?: number;
}

export interface WebSearchResponse {
    query: string;
    results: SearchResult[];
    timestamp: Date;
    searchDepth: 'surface' | 'deep' | 'expert';
    totalResults: number;
}

export interface DeepSearchOptions {
    maxResults?: number;
    searchDepth?: 'surface' | 'deep' | 'expert';
    enableMultiSource?: boolean;
    recursive?: boolean;
    includeHidden?: boolean;
}

export class AdvancedWebSearchService {
    private cache: Map<string, WebSearchResponse> = new Map();
    private cacheExpiry = 3600000; // 1 hour

    /**
     * ADVANCED DEEP SEARCH - Multiple sources, recursive, up to 50+ results
     */
    async deepSearch(
        query: string,
        options: DeepSearchOptions = {}
    ): Promise<WebSearchResponse> {
        const {
            maxResults = 50,
            searchDepth = 'deep',
            enableMultiSource = true,
            recursive = true,
            includeHidden = true
        } = options;

        console.log(`🔍 Deep Search: "${query}" | Depth: ${searchDepth} | Max: ${maxResults}`);

        // Check cache first
        const cacheKey = `${query}-${searchDepth}-${maxResults}`;
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp.getTime() < this.cacheExpiry) {
            console.log('✅ Returning cached deep search results');
            return cached;
        }

        let allResults: SearchResult[] = [];

        try {
            // MULTI-SOURCE SEARCH
            if (enableMultiSource) {
                console.log('🌐 Searching multiple sources...');

                const searches = [
                    this.searchDuckDuckGo(query, maxResults),
                    this.searchBing(query, Math.floor(maxResults / 2)),
                    this.searchStackOverflow(query, 10)
                ];

                if (includeHidden) {
                    searches.push(this.searchGitHub(query, 10));
                    searches.push(this.searchReddit(query, 10));
                }

                const results = await Promise.allSettled(searches);

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        allResults = allResults.concat(result.value);
                        console.log(`✅ Source ${index + 1}: ${result.value.length} results`);
                    }
                });
            } else {
                // Single source (DuckDuckGo)
                allResults = await this.searchDuckDuckGo(query, maxResults);
            }

            // RECURSIVE SEARCH if not enough results
            if (recursive && allResults.length < 10) {
                console.log('🔄 Recursive search: Trying alternative queries...');
                const alternativeQueries = this.generateAlternativeQueries(query);

                for (const altQuery of alternativeQueries.slice(0, 3)) {
                    const moreResults = await this.searchDuckDuckGo(altQuery, 20);
                    allResults = allResults.concat(moreResults);

                    if (allResults.length >= maxResults) break;
                }
            }

            // SMART FILTERING & RANKING
            const filteredResults = this.filterAndRankResults(allResults, query);
            const topResults = filteredResults.slice(0, maxResults);

            const searchResponse: WebSearchResponse = {
                query,
                results: topResults,
                timestamp: new Date(),
                searchDepth,
                totalResults: topResults.length
            };

            // Cache the results
            this.cache.set(cacheKey, searchResponse);

            console.log(`✅ Deep search complete: ${topResults.length} results found`);
            return searchResponse;

        } catch (error: any) {
            console.error('❌ Deep search error:', error);
            return {
                query,
                results: [],
                timestamp: new Date(),
                searchDepth,
                totalResults: 0
            };
        }
    }

    /**
     * Search DuckDuckGo (Primary source)
     */
    private async searchDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
        try {
            const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const html = await response.text();
            return this.parseDuckDuckGoResults(html, maxResults);
        } catch (error) {
            console.error('DuckDuckGo search error:', error);
            return [];
        }
    }

    /**
     * Search Bing (Secondary source)
     */
    private async searchBing(query: string, maxResults: number): Promise<SearchResult[]> {
        try {
            const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const html = await response.text();
            return this.parseBingResults(html, maxResults);
        } catch (error) {
            console.error('Bing search error:', error);
            return [];
        }
    }

    /**
     * Search StackOverflow (Technical queries)
     */
    private async searchStackOverflow(query: string, maxResults: number): Promise<SearchResult[]> {
        try {
            const searchUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow`;

            const response = await fetch(searchUrl);
            const data: any = await response.json();

            return (data.items || []).slice(0, maxResults).map((item: any) => ({
                title: item.title,
                url: item.link,
                snippet: item.body_markdown?.substring(0, 200) || 'StackOverflow question',
                source: 'StackOverflow',
                relevance: item.score
            }));
        } catch (error) {
            console.error('StackOverflow search error:', error);
            return [];
        }
    }

    /**
     * Search GitHub (Code & repositories)
     */
    private async searchGitHub(query: string, maxResults: number): Promise<SearchResult[]> {
        try {
            const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            const data: any = await response.json();

            return (data.items || []).slice(0, maxResults).map((item: any) => ({
                title: item.full_name,
                url: item.html_url,
                snippet: item.description || 'GitHub repository',
                source: 'GitHub',
                relevance: item.stargazers_count
            }));
        } catch (error) {
            console.error('GitHub search error:', error);
            return [];
        }
    }

    /**
     * Search Reddit (Community discussions)
     */
    private async searchReddit(query: string, maxResults: number): Promise<SearchResult[]> {
        try {
            const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${maxResults}`;

            const response = await fetch(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const data: any = await response.json();

            return (data.data?.children || []).map((item: any) => ({
                title: item.data.title,
                url: `https://reddit.com${item.data.permalink}`,
                snippet: item.data.selftext?.substring(0, 200) || item.data.title,
                source: 'Reddit',
                relevance: item.data.score
            }));
        } catch (error) {
            console.error('Reddit search error:', error);
            return [];
        }
    }

    /**
     * Parse DuckDuckGo HTML results
     */
    private parseDuckDuckGoResults(html: string, maxResults: number): SearchResult[] {
        const results: SearchResult[] = [];

        try {
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
                        snippet: snippet || 'No description available',
                        source: 'DuckDuckGo'
                    });
                    count++;
                }
            }
        } catch (error) {
            console.error('Error parsing DuckDuckGo results:', error);
        }

        return results;
    }

    /**
     * Parse Bing HTML results
     */
    private parseBingResults(html: string, maxResults: number): SearchResult[] {
        const results: SearchResult[] = [];

        try {
            const resultRegex = /<h2><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h2>[\s\S]*?<p>([^<]*)<\/p>/g;

            let match;
            let count = 0;

            while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
                results.push({
                    title: this.cleanText(match[2]),
                    url: match[1],
                    snippet: this.cleanText(match[3]),
                    source: 'Bing'
                });
                count++;
            }
        } catch (error) {
            console.error('Error parsing Bing results:', error);
        }

        return results;
    }

    /**
     * Generate alternative search queries for recursive search
     */
    private generateAlternativeQueries(query: string): string[] {
        const alternatives: string[] = [];

        // Add quotes for exact match
        alternatives.push(`"${query}"`);

        // Add site-specific searches
        alternatives.push(`${query} site:stackoverflow.com`);
        alternatives.push(`${query} site:github.com`);
        alternatives.push(`${query} site:reddit.com`);

        // Add related terms
        alternatives.push(`${query} tutorial`);
        alternatives.push(`${query} guide`);
        alternatives.push(`${query} documentation`);
        alternatives.push(`${query} example`);

        return alternatives;
    }

    /**
     * Filter and rank results by relevance
     */
    private filterAndRankResults(results: SearchResult[], query: string): SearchResult[] {
        // Remove duplicates
        const uniqueResults = results.filter((result, index, self) =>
            index === self.findIndex(r => r.url === result.url)
        );

        // Calculate relevance score
        const scoredResults = uniqueResults.map(result => {
            let score = 0;

            const queryLower = query.toLowerCase();
            const titleLower = result.title.toLowerCase();
            const snippetLower = result.snippet.toLowerCase();

            // Title match (highest weight)
            if (titleLower.includes(queryLower)) score += 10;

            // Snippet match
            if (snippetLower.includes(queryLower)) score += 5;

            // Source preference
            if (result.source === 'StackOverflow') score += 3;
            if (result.source === 'GitHub') score += 2;

            // Existing relevance score
            if (result.relevance) score += Math.min(result.relevance / 100, 5);

            return { ...result, relevance: score };
        });

        // Sort by relevance
        return scoredResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    }

    /**
     * Clean URL from redirects
     */
    private cleanUrl(url: string): string {
        try {
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
     * Clean HTML entities and whitespace
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
     * Detect if query needs deep search
     */
    shouldUseDeepSearch(query: string): boolean {
        const deepSearchKeywords = [
            'hidden', 'obscure', 'rare', 'find', 'search for',
            'deep', 'advanced', 'technical', 'specific',
            'how to find', 'where can i', 'looking for'
        ];

        const lowerQuery = query.toLowerCase();
        return deepSearchKeywords.some(keyword => lowerQuery.includes(keyword));
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

// Export singleton instance
export const advancedSearchService = new AdvancedWebSearchService();
export default advancedSearchService;
