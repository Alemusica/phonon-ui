/**
 * Phonon UI - Streaming Parser
 * 
 * Parse streaming LLM output for embedded commands like:
 * [RENDER:{"type":"component","props":{...}}]
 * [ACTION:{"type":"navigate","to":"/page"}]
 * 
 * Inspired by GhostShell paper for incremental command parsing.
 */

export interface ParsedCommand {
  type: 'render' | 'action';
  data: Record<string, unknown>;
  startIndex: number;
  endIndex: number;
}

export interface StreamingParserState {
  buffer: string;
  cleanText: string;
  commands: ParsedCommand[];
  pendingCommand: string | null;
}

export interface ContentPart {
  type: 'text' | 'image' | 'video' | 'link' | 'hr';
  content?: string;
  alt?: string;
  src?: string;
  href?: string;
  title?: string;
  text?: string;
}

/**
 * Parse streaming content for [RENDER:...] and [ACTION:...] commands
 * Returns clean text + extracted commands
 */
export function parseStreamingContent(content: string): StreamingParserState {
  const state: StreamingParserState = {
    buffer: content,
    cleanText: '',
    commands: [],
    pendingCommand: null
  };

  let i = 0;
  let textStart = 0;

  while (i < content.length) {
    // Look for start of command
    if (content[i] === '[' && 
        (content.slice(i, i + 8) === '[RENDER:' || content.slice(i, i + 8) === '[ACTION:')) {
      // Flush text before command
      if (i > textStart) {
        state.cleanText += content.slice(textStart, i);
      }

      const cmdType = content.slice(i + 1, i + 7).toLowerCase() as 'render' | 'action';
      const jsonStart = i + 8;

      // Find the closing }]
      let depth = 0;
      let jsonEnd = -1;
      let inString = false;
      let escape = false;

      for (let j = jsonStart; j < content.length; j++) {
        const char = content[j];

        if (escape) {
          escape = false;
          continue;
        }

        if (char === '\\' && inString) {
          escape = true;
          continue;
        }

        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') {
            depth--;
            if (depth === 0 && content[j + 1] === ']') {
              jsonEnd = j + 1;
              break;
            }
          }
        }
      }

      if (jsonEnd > 0) {
        // Complete command found
        const jsonStr = content.slice(jsonStart, jsonEnd);
        try {
          const data = JSON.parse(jsonStr);
          state.commands.push({
            type: cmdType,
            data,
            startIndex: i,
            endIndex: jsonEnd + 1
          });
        } catch {
          // Invalid JSON, treat as text
          state.cleanText += content.slice(i, jsonEnd + 1);
        }
        i = jsonEnd + 1;
        textStart = i;
      } else {
        // Incomplete command - might be still streaming
        state.pendingCommand = content.slice(i);
        break;
      }
    } else {
      i++;
    }
  }

  // Add remaining text (but not if there's a pending command)
  if (i >= content.length && textStart < content.length && !state.pendingCommand) {
    state.cleanText += content.slice(textStart);
  } else if (textStart < i) {
    state.cleanText += content.slice(textStart, i);
  }

  return state;
}

/**
 * Parse markdown content for images, links, videos, horizontal rules
 */
export function parseMarkdownContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];

  // Regex patterns
  const hrRegex = /^(-{3,}|\*{3,})$/gm;
  const videoRegex = /!video\[([^\]]*)\]\(([^)]+)\)/g;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const simpleUrlRegex = /\b(https?:\/\/[^\s\])<]+)/g;

  interface MatchInfo {
    index: number;
    length: number;
    element: ContentPart;
  }

  const allMatches: MatchInfo[] = [];

  // Find horizontal rules
  let match;
  while ((match = hrRegex.exec(content)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      element: { type: 'hr' }
    });
  }

  // Find videos
  while ((match = videoRegex.exec(content)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      element: { type: 'video', title: match[1], src: match[2] }
    });
  }

  // Find images (skip if already matched as video)
  while ((match = imageRegex.exec(content)) !== null) {
    const alreadyMatched = allMatches.some(m => m.index === match!.index);
    if (!alreadyMatched) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        element: { type: 'image', alt: match[1], src: match[2] }
      });
    }
  }

  // Find markdown links
  while ((match = linkRegex.exec(content)) !== null) {
    const alreadyMatched = allMatches.some(m =>
      m.index === match!.index || m.index === match!.index - 1 || m.index === match!.index - 6
    );
    if (!alreadyMatched) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        element: { type: 'link', text: match[1], href: match[2] }
      });
    }
  }

  // Find simple URLs
  while ((match = simpleUrlRegex.exec(content)) !== null) {
    const alreadyMatched = allMatches.some(m =>
      match!.index >= m.index && match!.index < m.index + m.length
    );
    if (!alreadyMatched) {
      const url = match[1];
      allMatches.push({
        index: match.index,
        length: match[0].length,
        element: { type: 'link', text: url, href: url }
      });
    }
  }

  // Sort by index
  allMatches.sort((a, b) => a.index - b.index);

  let lastIndex = 0;
  for (const m of allMatches) {
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, m.index) });
    }
    parts.push(m.element);
    lastIndex = m.index + m.length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}

/**
 * YouTube URL utilities
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function isValidVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const safeHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'];
    return safeHosts.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}
