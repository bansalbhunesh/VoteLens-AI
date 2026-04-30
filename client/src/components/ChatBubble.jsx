import { motion } from 'framer-motion';
import MarkdownText from './MarkdownText';

export default function ChatBubble({ message, index }) {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const hasSources = !isUser && !isError && message.sources?.length > 0;

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

        <div className="flex flex-col gap-2 min-w-0">
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
              <div className="flex gap-1.5 py-1 items-center" aria-label="AI is thinking">
                <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-primary-400 rounded-full" />
              </div>
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

          {/* Sources (grounded responses) */}
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
                  <span className="truncate">{s.title || new URL(s.url).hostname}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
