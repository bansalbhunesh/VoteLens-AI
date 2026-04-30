import { useState } from 'react';
import { motion } from 'framer-motion';
import MarkdownText from './MarkdownText';

function formatAge(ts) {
  if (!ts) return '';
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function ChatBubble({ message, index }) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const hasSources = !isUser && !isError && message.sources?.length > 0;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard denied */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      role="listitem"
      aria-label={`${isUser ? 'Your' : 'AI'} message`}
    >
      <div className={`flex gap-3 max-w-[84%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm mt-0.5 ${
            isUser
              ? 'bg-gradient-to-br from-accent-500 to-accent-600'
              : 'bg-gradient-to-br from-primary-500 to-primary-700'
          }`}
          aria-hidden="true"
        >
          {isUser ? '👤' : '🗳️'}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          {/* Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'bg-accent-500/20 text-surface-50 rounded-tr-md'
                : isError
                ? 'bg-danger-500/20 text-danger-400 rounded-tl-md border border-danger-500/30'
                : 'glass rounded-tl-md'
            }`}
          >
            {message.isStreaming && !message.content ? (
              message.isGrounded ? (
                <div className="flex items-center gap-2 py-1 text-success-400 text-xs" aria-label="Searching the web">
                  <span className="w-3 h-3 border-2 border-success-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Searching the web…</span>
                </div>
              ) : (
                <div className="flex gap-1.5 py-1 items-center" aria-label="AI is thinking">
                  <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
                </div>
              )
            ) : (
              <>
                {isUser
                  ? <span>{message.content}</span>
                  : <MarkdownText content={message.content} />
                }
                {message.isStreaming && message.content && (
                  <span className="inline-block w-0.5 h-4 bg-primary-400 ml-0.5 animate-pulse align-middle" />
                )}
              </>
            )}
          </div>

          {/* Sources */}
          {hasSources && (
            <div className="flex flex-wrap gap-2 pl-1">
              {message.sources.slice(0, 3).map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-surface-400 hover:text-primary-400 hover:border-primary-500/30 transition-all max-w-[200px] truncate"
                  title={s.title}
                >
                  <span className="text-[8px] opacity-60">🔗</span>
                  <span className="truncate">{s.title || (() => { try { return new URL(s.url).hostname; } catch { return s.url; } })()}</span>
                </a>
              ))}
            </div>
          )}

          {/* Metadata: timestamp + copy */}
          {!message.isStreaming && (
            <div className={`flex items-center gap-2 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {message.ts && (
                <span className="text-[10px] text-surface-700">{formatAge(message.ts)}</span>
              )}
              {!isUser && !isError && message.content && (
                <button
                  onClick={handleCopy}
                  className="text-[10px] text-surface-700 hover:text-surface-400 transition-colors tabular-nums"
                  title="Copy message"
                >
                  {copied ? '✓ copied' : 'copy'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
