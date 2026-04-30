import { motion } from 'framer-motion';
import MarkdownText from './MarkdownText';

export default function ChatBubble({ message, index }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      role="listitem"
      aria-label={`${isUser ? 'Your' : 'AI'} message`}
    >
      <div className={`flex gap-3 max-w-[82%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
            isUser
              ? 'bg-gradient-to-br from-accent-500 to-accent-600'
              : 'bg-gradient-to-br from-primary-500 to-primary-700'
          }`}
          aria-hidden="true"
        >
          {isUser ? '👤' : '🗳️'}
        </div>

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
      </div>
    </motion.div>
  );
}
