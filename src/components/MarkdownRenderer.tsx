import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Pre-process LaTeX delims: convert \[ \] to $$ $$ and \( \) to $ $ if present
  const normalizedContent = (content || '')
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  return (
    <div className={`prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed overflow-x-auto ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-slate-700 dark:text-slate-200 text-left rtl:text-right" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200" {...props} />
          ),
          p: ({ node, children, ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
              {children}
            </p>
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...props} />
            ) : (
              <code className="block bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto text-xs font-mono my-2" {...props} />
            ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
