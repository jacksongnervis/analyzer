import { Code2 } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-center gap-3 py-8 bg-zinc-900 border-b border-zinc-800">
      <Code2 className="w-8 h-8 text-emerald-400" />
      <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
        Clean Code <span className="text-emerald-400">Analyzer</span>
      </h1>
    </header>
  );
}
