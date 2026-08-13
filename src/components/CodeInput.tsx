interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export function CodeInput({ value, onChange, disabled }: CodeInputProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <label htmlFor="code-input" className="text-sm font-medium text-zinc-300">
        Cole seu código sujo aqui:
      </label>
      <textarea
        id="code-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="function doSomething(a,b) { ... }"
        className="w-full h-64 p-4 font-mono text-sm bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-50 resize-y"
        spellCheck="false"
      />
    </div>
  );
}
