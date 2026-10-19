import { useMemo } from 'react';
import { marked } from 'marked';

// Configure marked with github-flavored markdown & line breaks
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function Markdown({ content = '', className = '' }) {
  const html = useMemo(() => {
    if (!content) return '';
    try {
      return marked.parse(content);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose-notion ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
