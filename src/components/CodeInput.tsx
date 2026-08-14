'use client';

import { useState, useRef, useMemo, useEffect, KeyboardEvent } from 'react';
import { Moon, Sun, Maximize2, Minimize2, Coffee, Copy, Check, Trash2, X } from 'lucide-react';
import { AppTheme } from '@/types';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  theme: AppTheme;
  onToggleTheme: (theme: AppTheme) => void;
  maxLength?: number;
}

export function CodeInput({ 
  value, 
  onChange, 
  disabled, 
  theme,
  onToggleTheme,
  maxLength = 5000 
}: CodeInputProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const currentLength = value.length;
  const isNearLimit = currentLength > maxLength * 0.85;
  const isAtLimit = currentLength >= maxLength;
  const isDark = theme === 'dark';

  // Highlight Java code with Prism
  const highlightedCode = useMemo(() => {
    if (!value) return '';
    try {
      const grammar = Prism.languages.java || Prism.languages.clike;
      return Prism.highlight(value, grammar, 'java');
    } catch {
      return value;
    }
  }, [value]);

  // Line numbers calculation
  const lineCount = useMemo(() => {
    return Math.max(1, value.split('\n').length);
  }, [value]);

  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (gutterRef.current) {
        gutterRef.current.scrollTop = scrollTop;
      }
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value, isExpanded]);

  // Lock body scroll and listen for Escape key when expanded in modal mode
  useEffect(() => {
    if (!isExpanded) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDownEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDownEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDownEsc);
    };
  }, [isExpanded]);

  // Focus textarea when opening expanded mode
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isExpanded]);

  // IDE Keyboard Handling (Tab, Auto-Indent, Auto-Pairs, Backspace)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const tabSpaces = '    '; // 4 spaces for Java standard

    // 1. Tab & Shift+Tab (Indent / Unindent)
    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const linesBefore = value.substring(0, selectionStart).split('\n');
        const startLineIdx = linesBefore.length - 1;
        const allLines = value.split('\n');
        const linesSelected = value.substring(selectionStart, selectionEnd).split('\n');
        const endLineIdx = startLineIdx + linesSelected.length - 1;

        let charsRemovedBeforeStart = 0;
        let totalCharsRemoved = 0;

        const newLines = allLines.map((line, idx) => {
          if (idx >= startLineIdx && idx <= endLineIdx) {
            const spacesToRemove = line.startsWith(tabSpaces) 
              ? 4 
              : line.match(/^ +/)?.[0].length || 0;
            const toRemove = Math.min(4, spacesToRemove);

            if (toRemove > 0) {
              if (idx === startLineIdx) charsRemovedBeforeStart = toRemove;
              totalCharsRemoved += toRemove;
              return line.substring(toRemove);
            }
          }
          return line;
        });

        const nextVal = newLines.join('\n');
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = Math.max(0, selectionStart - charsRemovedBeforeStart);
          textarea.selectionEnd = Math.max(0, selectionEnd - totalCharsRemoved);
        });
      } else {
        // Tab: Indent
        if (selectionStart !== selectionEnd) {
          // Multi-line indent
          const linesBefore = value.substring(0, selectionStart).split('\n');
          const startLineIdx = linesBefore.length - 1;
          const allLines = value.split('\n');
          const linesSelected = value.substring(selectionStart, selectionEnd).split('\n');
          const endLineIdx = startLineIdx + linesSelected.length - 1;

          const newLines = allLines.map((line, idx) => {
            if (idx >= startLineIdx && idx <= endLineIdx) {
              return tabSpaces + line;
            }
            return line;
          });

          const nextVal = newLines.join('\n');
          onChange(nextVal);

          requestAnimationFrame(() => {
            textarea.selectionStart = selectionStart + 4;
            textarea.selectionEnd = selectionEnd + (endLineIdx - startLineIdx + 1) * 4;
          });
        } else {
          // Single cursor: Insert 4 spaces
          const nextVal = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
          onChange(nextVal);

          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
          });
        }
      }
      return;
    }

    // 2. Auto-Indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault();

      const textBeforeCursor = value.substring(0, selectionStart);
      const textAfterCursor = value.substring(selectionEnd);
      const currentLine = textBeforeCursor.split('\n').pop() || '';
      
      const currentIndent = currentLine.match(/^\s*/)?.[0] || '';
      const trimmedLine = currentLine.trimEnd();

      // Check if pressing Enter between { and }
      if (trimmedLine.endsWith('{') && textAfterCursor.startsWith('}')) {
        const nextVal = textBeforeCursor + '\n' + currentIndent + tabSpaces + '\n' + currentIndent + textAfterCursor;
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + currentIndent.length + 4;
        });
        return;
      }

      // Check if opening brace ends line
      const extraIndent = trimmedLine.endsWith('{') || trimmedLine.endsWith('(') ? tabSpaces : '';
      const newIndent = currentIndent + extraIndent;

      const nextVal = textBeforeCursor + '\n' + newIndent + textAfterCursor;
      onChange(nextVal);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1 + newIndent.length;
      });
      return;
    }

    // 3. Auto-Closing Pairs
    const pairs: Record<string, string> = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'"
    };

    if (pairs[e.key]) {
      const openChar = e.key;
      const closeChar = pairs[e.key];

      if (selectionStart !== selectionEnd) {
        e.preventDefault();
        const selected = value.substring(selectionStart, selectionEnd);
        const nextVal = value.substring(0, selectionStart) + openChar + selected + closeChar + value.substring(selectionEnd);
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = selectionStart + 1;
          textarea.selectionEnd = selectionEnd + 1;
        });
        return;
      } else {
        // Skip over close char if already next
        if ((openChar === '"' || openChar === "'") && value.charAt(selectionStart) === openChar) {
          e.preventDefault();
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
          });
          return;
        }

        e.preventDefault();
        const nextVal = value.substring(0, selectionStart) + openChar + closeChar + value.substring(selectionEnd);
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        });
        return;
      }
    }

    // Skip closing character when typing it
    if (['}', ')', ']', '"', "'"].includes(e.key)) {
      if (selectionStart === selectionEnd && value.charAt(selectionStart) === e.key) {
        e.preventDefault();
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
        });
        return;
      }
    }

    // 4. Backspace on empty pairs
    if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart > 0) {
      const prevChar = value.charAt(selectionStart - 1);
      const nextChar = value.charAt(selectionStart);

      if (
        (prevChar === '{' && nextChar === '}') ||
        (prevChar === '(' && nextChar === ')') ||
        (prevChar === '[' && nextChar === ']') ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'")
      ) {
        e.preventDefault();
        const nextVal = value.substring(0, selectionStart - 1) + value.substring(selectionStart + 1);
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 1;
        });
      }
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Label and Character Count Header */}
      <div className="flex justify-between items-center px-1 select-none">
        <label 
          htmlFor="code-input" 
          className={`text-sm font-medium flex items-center gap-2 ${
            isDark ? 'text-zinc-200' : 'text-slate-700'
          }`}
        >
          <span>Cole seu código <strong className="text-amber-400 font-semibold">Java</strong> aqui:</span>
        </label>
        
        <span 
          className={`text-xs font-mono transition-colors ${
            isAtLimit 
              ? 'text-red-400 font-semibold' 
              : isNearLimit 
              ? 'text-yellow-400' 
              : isDark ? 'text-zinc-500' : 'text-slate-400'
          }`}
        >
          {currentLength.toLocaleString('pt-BR')} / {maxLength.toLocaleString('pt-BR')} caracteres
        </span>
      </div>

      {/* Backdrop for Expanded Modal Mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-in fade-in duration-300 ease-out"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Single Editor Container (Animates smoothly expanding into full screen) */}
      <div 
        className={`w-full rounded-xl overflow-hidden border flex flex-col ${
          isExpanded 
            ? 'fixed inset-3 sm:inset-6 md:inset-10 z-50 max-w-6xl mx-auto shadow-2xl shadow-black/90 animate-editor-expand' 
            : 'relative min-h-[380px] h-[380px] shadow-lg'
        } ${
          isDark 
            ? 'border-zinc-800 bg-zinc-950 shadow-black/60' 
            : 'border-slate-300 bg-white shadow-slate-200/60'
        }`}
      >
        {/* Editor Toolbar */}
        <div 
          className={`px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-2 border-b transition-colors select-none ${
            isDark 
              ? 'bg-zinc-900 border-zinc-800' 
              : 'bg-slate-100 border-slate-300'
          }`}
        >
          {/* Left: Window Dots & File Tag */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors inline-block" />
            </div>
            
            <span 
              className={`flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded font-medium ${
                isDark 
                  ? 'bg-zinc-950 text-zinc-300 border border-zinc-800' 
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              App.java
            </span>

            {/* Quick Actions (Clear, Copy) */}
            {value && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    isDark
                      ? 'text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700'
                      : 'text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300'
                  }`}
                  title="Copiar código"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                    isDark
                      ? 'text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40'
                      : 'text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                  }`}
                  title="Limpar código"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Actions (Theme Toggle & Expand / Close Button) */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <div 
              className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
                isDark 
                  ? 'bg-zinc-950 border-zinc-800' 
                  : 'bg-white border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  isDark 
                    ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tema Escuro"
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Escuro</span>
              </button>
              
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                  !isDark 
                    ? 'bg-amber-500 text-white font-semibold shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Tema Claro"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Claro</span>
              </button>
            </div>

            {/* Expand / Minimize / Close Button (Icon Only) */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? isExpanded 
                    ? 'bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100' 
                  : isExpanded 
                    ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={isExpanded ? 'Fechar tela cheia (ESC)' : 'Expandir editor em tela cheia'}
              aria-label={isExpanded ? 'Fechar tela cheia' : 'Expandir editor em tela cheia'}
            >
              {isExpanded ? (
                <X className="w-4 h-4 text-red-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Code Editor Body with Gutter (Line numbers) & Live Syntax Highlighting */}
        <div className="relative flex w-full flex-1 min-h-0 overflow-hidden">
          {/* Gutter / Line Numbers Column */}
          <div
            ref={gutterRef}
            aria-hidden="true"
            className={`w-12 shrink-0 py-4 px-2 select-none text-right font-mono text-xs leading-6 overflow-hidden border-r transition-colors ${
              isDark
                ? 'bg-zinc-950/90 text-zinc-600 border-zinc-800/80'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1}>{i + 1}</div>
            ))}
          </div>

          {/* Text Code Area Container */}
          <div className="relative flex-1 h-full overflow-hidden">
            {/* Syntax Highlighting Render Layer */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className={`absolute inset-0 p-4 m-0 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-hidden pointer-events-none ${
                isDark ? 'syntax-dracula text-zinc-100' : 'syntax-light text-slate-800'
              }`}
            >
              {value ? (
                <code 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightedCode + (value.endsWith('\n') ? ' ' : '') 
                  }} 
                />
              ) : (
                <span className={isDark ? 'text-zinc-600' : 'text-slate-400'}>
                  {`public class OrderProcessor {\n    public void process(Order order) {\n        // Cole ou digite seu código Java aqui...\n    }\n}`}
                </span>
              )}
            </pre>

            {/* Interactive Textarea Layer */}
            <textarea
              ref={textareaRef}
              id="code-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              disabled={disabled}
              maxLength={maxLength}
              className={`absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 bg-transparent text-transparent whitespace-pre-wrap break-words resize-none focus:outline-none overflow-y-auto ${
                isDark 
                  ? 'caret-amber-400 selection:bg-amber-400/30' 
                  : 'caret-amber-600 selection:bg-amber-500/30'
              } disabled:opacity-50`}
              spellCheck="false"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
