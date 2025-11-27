export interface ParsedContent {
    type: 'text' | 'code';
    content: string;
    language?: string;
}

/**
 * Parse message content to extract code blocks
 * Supports markdown code blocks with language specification
 */
export function parseMessageContent(content: string): ParsedContent[] {
    const parts: ParsedContent[] = [];

    // Regex to match code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
            const textContent = content.substring(lastIndex, match.index).trim();
            if (textContent) {
                parts.push({
                    type: 'text',
                    content: textContent
                });
            }
        }

        // Add code block
        const language = match[1] || 'plaintext';
        const code = match[2].trim();
        parts.push({
            type: 'code',
            content: code,
            language
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
        const textContent = content.substring(lastIndex).trim();
        if (textContent) {
            parts.push({
                type: 'text',
                content: textContent
            });
        }
    }

    // If no code blocks found, return entire content as text
    if (parts.length === 0) {
        parts.push({
            type: 'text',
            content: content
        });
    }

    return parts;
}

/**
 * Detect language from code content if not specified
 */
export function detectLanguage(code: string): string {
    // Simple heuristics for language detection
    if (code.includes('function') || code.includes('const') || code.includes('let')) {
        if (code.includes('import React') || code.includes('useState')) {
            return 'tsx';
        }
        return 'javascript';
    }
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
        return 'python';
    }
    if (code.includes('public class') || code.includes('public static void')) {
        return 'java';
    }
    if (code.includes('#include') || code.includes('int main')) {
        return 'cpp';
    }
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('CREATE TABLE')) {
        return 'sql';
    }
    if (code.includes('<html') || code.includes('<div')) {
        return 'html';
    }
    if (code.includes('{') && code.includes(':') && code.includes('}')) {
        return 'json';
    }

    return 'plaintext';
}
