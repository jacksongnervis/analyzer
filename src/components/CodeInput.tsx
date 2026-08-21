'use client';

import { useState, useRef, useMemo, useEffect, KeyboardEvent } from 'react';
import { Moon, Sun, Maximize2, Copy, Check, Trash2, X, FileCode, RotateCcw } from 'lucide-react';
import { AppTheme } from '@/types';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-java';

interface CodeInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled: boolean;
  readonly theme: AppTheme;
  readonly onToggleTheme: (theme: AppTheme) => void;
  readonly onReset?: () => void;
  readonly maxLength?: number;
}

const LEADING_SPACES_REGEX = /^ +/;
const LEADING_WHITESPACE_REGEX = /^\s*/;

function getCharCountColorClass(isAtLimit: boolean, isNearLimit: boolean, isDark: boolean): string {
  if (isAtLimit) {
    return 'text-red-400 font-bold';
  }
  if (isNearLimit) {
    return isDark ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold';
  }
  if (isDark) {
    return 'text-bnt-cream/40';
  }
  return 'text-bnt-ink/40';
}

function getEditorContainerClasses(isExpanded: boolean, isDark: boolean): string {
  const baseClasses = 'w-full rounded-2xl overflow-hidden border-2 flex flex-col transition-all';
  
  let layoutClasses = 'relative min-h-[380px] h-[380px] shadow-[4px_4px_0_0_var(--brutal-border)]';
  if (isExpanded) {
    layoutClasses = 'fixed inset-3 sm:inset-6 md:inset-10 z-50 max-w-6xl mx-auto animate-editor-expand';
  }

  let themeClasses = 'border-bnt-ink bg-white';
  if (isDark) {
    themeClasses = 'border-bnt-cream/30 bg-[#282a36]';
  }

  return `${baseClasses} ${layoutClasses} ${themeClasses}`;
}

function getExpandButtonClasses(isExpanded: boolean, isDark: boolean): string {
  const base = 'p-1.5 rounded-xl border-2 cursor-pointer transition-colors';

  if (isExpanded && isDark) {
    return `${base} bg-red-950/40 border-red-400 text-red-300 hover:bg-red-900/50`;
  }
  if (isExpanded) {
    return `${base} bg-rose-50 border-rose-400 text-rose-700 hover:bg-rose-100`;
  }
  if (isDark) {
    return `${base} bg-bnt-ink border-bnt-cream/30 text-bnt-cream hover:bg-bnt-ink-deep hover:text-white shadow-[2px_2px_0_0_#faf8f4]`;
  }
  return `${base} bg-white border-bnt-ink text-bnt-ink hover:bg-emerald-50 shadow-[2px_2px_0_0_#0f172a]`;
}

export function CodeInput({ 
  value, 
  onChange, 
  disabled, 
  theme,
  onToggleTheme,
  onReset,
  maxLength = 5000 
}: Readonly<CodeInputProps>) {
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
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
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
            let spacesToRemove = 0;
            if (line.startsWith(tabSpaces)) {
              spacesToRemove = 4;
            } else {
              const matchedLeadingSpaces = LEADING_SPACES_REGEX.exec(line);
              if (matchedLeadingSpaces) {
                spacesToRemove = matchedLeadingSpaces[0].length;
              }
            }

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
      } else if (selectionStart !== selectionEnd) {
        // Tab: Multi-line indent
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
        // Tab: Single cursor: Insert 4 spaces
        const nextVal = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
        onChange(nextVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
        });
      }
      return;
    }

    // 2. Auto-Indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault();

      const textBeforeCursor = value.substring(0, selectionStart);
      const textAfterCursor = value.substring(selectionEnd);
      const currentLine = textBeforeCursor.split('\n').pop() || '';
      
      const currentIndent = LEADING_WHITESPACE_REGEX.exec(currentLine)?.[0] || '';
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
      let extraIndent = '';
      if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(')) {
        extraIndent = tabSpaces;
      }
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
          className={`text-sm font-bold flex items-center gap-2 ${
            isDark ? 'text-bnt-cream' : 'text-bnt-ink'
          }`}
        >
          <span>Cole seu código <strong className={`${isDark ? 'text-bnt-yellow' : 'text-bnt-purple'}`}>Java</strong> aqui:</span>
        </label>
        
        <span 
          className={`text-xs font-mono transition-colors ${getCharCountColorClass(isAtLimit, isNearLimit, isDark)}`}
        >
          {currentLength.toLocaleString('pt-BR')} / {maxLength.toLocaleString('pt-BR')} caracteres
        </span>
      </div>

      {/* Backdrop for Expanded Modal Mode */}
      {isExpanded && (
        <div 
          role="button"
          tabIndex={-1}
          aria-label="Fechar tela cheia"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 animate-in fade-in duration-300 ease-out cursor-pointer"
          onClick={() => setIsExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsExpanded(false);
            }
          }}
        />
      )}

      {/* Single Editor Container */}
      <div className={getEditorContainerClasses(isExpanded, isDark)}>
        {/* Editor Toolbar */}
        <div 
          className={`px-4 py-3 shrink-0 flex flex-wrap items-center justify-between gap-2 border-b-2 transition-colors select-none ${
            isDark 
              ? 'bg-bnt-ink border-bnt-cream/20' 
              : 'bg-bnt-cream border-bnt-ink/10'
          }`}
        >
          {/* Left: Window Dots & File Tag */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-bnt-pink hover:opacity-80 transition-opacity inline-block" />
              <span className="w-3 h-3 rounded-full bg-bnt-yellow hover:opacity-80 transition-opacity inline-block" />
              <span className="w-3 h-3 rounded-full bg-bnt-green hover:opacity-80 transition-opacity inline-block" />
            </div>
            
            <span 
              className={`flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-lg font-bold border-2 ${
                isDark 
                  ? 'bg-bnt-ink-deep text-bnt-cream border-bnt-cream/30' 
                  : 'bg-white text-bnt-ink border-bnt-ink'
              }`}
            >
              <FileCode className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              App.java
            </span>

            {/* Quick Actions (Copy, Restore, Clear) */}
            <div className="flex items-center gap-1.5 ml-1 flex-wrap">
              {value && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors border-2 ${
                    isDark
                      ? 'text-bnt-cream hover:text-white bg-bnt-ink border-bnt-cream/30 hover:bg-bnt-ink-deep'
                      : 'text-bnt-ink hover:text-bnt-ink bg-white border-bnt-ink hover:bg-bnt-cream'
                  }`}
                  title="Copiar código"
                >
                  {copied ? <Check className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              )}

              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={disabled}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors border-2 ${
                    isDark
                      ? 'text-emerald-300 hover:text-white bg-bnt-ink border-emerald-500/50 hover:bg-emerald-950/40'
                      : 'text-emerald-800 hover:text-emerald-950 bg-emerald-100 border-emerald-600 hover:bg-emerald-200'
                  }`}
                  title="Recarregar o código inicial do exercício"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <span>Restaurar Código</span>
                </button>
              )}

              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors border-2 ${
                    isDark
                      ? 'text-red-300 hover:text-red-200 bg-bnt-ink border-red-400/50 hover:bg-red-950/30'
                      : 'text-rose-700 hover:text-rose-800 bg-white border-rose-400 hover:bg-rose-50'
                  }`}
                  title="Limpar código"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions (Theme Toggle & Expand / Close Button) */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button — Animated Slider */}
            <div 
              className={`relative flex items-center p-0.5 rounded-full border-2 text-xs font-bold transition-colors duration-300 ${
                isDark 
                  ? 'bg-bnt-ink-deep border-bnt-cream/30' 
                  : 'bg-white border-bnt-ink'
              }`}
            >
              {/* Animated Background Slider Indicator */}
              <div
                aria-hidden="true"
                className={`absolute top-0.5 bottom-0.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-2 ${
                  isDark
                    ? 'left-0.5 w-[calc(50%-2px)] bg-emerald-600 border-bnt-cream text-white shadow-[1px_1px_0_0_#faf8f4]'
                    : 'left-[calc(50%+1px)] w-[calc(50%-2px)] bg-emerald-500 border-bnt-ink text-slate-950 shadow-[1px_1px_0_0_#0f172a]'
                }`}
              />

              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`relative z-10 flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-colors duration-200 ${
                  isDark 
                    ? 'text-white' 
                    : 'text-bnt-ink/60 hover:text-emerald-600'
                }`}
                title="Tema Escuro"
              >
                <Moon className={`w-3.5 h-3.5 transition-transform duration-300 ${isDark ? 'rotate-0 scale-100' : '-rotate-45 scale-90'}`} />
                <span className="hidden sm:inline">Escuro</span>
              </button>
              
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`relative z-10 flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-colors duration-200 ${
                  !isDark 
                    ? 'text-slate-950 font-bold' 
                    : 'text-bnt-cream/60 hover:text-bnt-cream'
                }`}
                title="Tema Claro"
              >
                <Sun className={`w-3.5 h-3.5 transition-transform duration-300 ${!isDark ? 'rotate-0 scale-100' : 'rotate-45 scale-90'}`} />
                <span className="hidden sm:inline">Claro</span>
              </button>
            </div>

            {/* Expand / Minimize / Close Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={getExpandButtonClasses(isExpanded, isDark)}
              title={isExpanded ? 'Fechar tela cheia (ESC)' : 'Expandir editor em tela cheia'}
              aria-label={isExpanded ? 'Fechar tela cheia' : 'Expandir editor em tela cheia'}
            >
              {isExpanded ? (
                <X className="w-4 h-4 text-red-400" />
              ) : (
                <Maximize2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Code Editor Body with Gutter & Live Syntax Highlighting */}
        <div className="relative flex w-full flex-1 min-h-0 overflow-hidden">
          {/* Gutter / Line Numbers Column */}
          <div
            ref={gutterRef}
            aria-hidden="true"
            className={`w-12 shrink-0 py-4 px-2 select-none text-right font-mono text-xs leading-6 overflow-hidden border-r-2 transition-colors ${
              isDark
                ? 'bg-[#21222c] text-[#6272a4] border-bnt-cream/20'
                : 'bg-slate-50 text-slate-400 border-bnt-ink/10'
            }`}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={`gutter-line-${i + 1}`}>{i + 1}</div>
            ))}
          </div>

          {/* Text Code Area Container */}
          <div className="relative flex-1 h-full overflow-hidden">
            {/* Syntax Highlighting Render Layer */}
            <pre
              ref={preRef}
              aria-hidden="true"
              className={`absolute inset-0 p-4 m-0 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-hidden pointer-events-none ${
                isDark ? 'syntax-dracula text-[#f8f8f2]' : 'syntax-light text-[#1e293b]'
              }`}
            >
              {value ? (
                <code 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightedCode + (value.endsWith('\n') ? ' ' : '') 
                  }} 
                />
              ) : (
                <span className={isDark ? 'text-bnt-cream/30' : 'text-bnt-ink/40'}>
                  {`public class OrderProcessor {
    public void process(Order order) {
        // Cole ou digite seu código Java aqui...
    }
}`}
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
                  ? 'caret-emerald-400 selection:bg-emerald-500/30' 
                  : 'caret-emerald-600 selection:bg-emerald-500/30'
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
