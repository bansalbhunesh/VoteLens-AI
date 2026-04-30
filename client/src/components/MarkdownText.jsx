/** Handles inline bold, italic, code within a single line. */
export function parseLine(text) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-primary-300">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic text-surface-300">{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-white/10 px-1 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

/** Converts common markdown patterns to JSX without a library dependency. */
export default function MarkdownText({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`ul-${key}`} className="list-disc pl-5 mb-2 space-y-0.5">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed">{parseLine(item)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
  };

  lines.forEach((line, i) => {
    if (line.startsWith('### ')) {
      flushList(i);
      elements.push(<h4 key={i} className="font-bold text-surface-50 mt-3 mb-1 text-sm">{parseLine(line.slice(4))}</h4>);
    } else if (line.startsWith('## ')) {
      flushList(i);
      elements.push(<h3 key={i} className="font-bold text-surface-50 mt-3 mb-1">{parseLine(line.slice(3))}</h3>);
    } else if (/^[-*] /.test(line)) {
      listBuffer.push(line.slice(2));
    } else if (line.trim() === '') {
      flushList(i);
      if (elements.length > 0) elements.push(<div key={i} className="h-1.5" />);
    } else {
      flushList(i);
      elements.push(<p key={i} className={`text-sm leading-relaxed mb-1 ${className}`}>{parseLine(line)}</p>);
    }
  });
  flushList('end');

  return <>{elements}</>;
}
