'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function DistanceInput({ value, onChange, min = 0, max = 300 }: Props) {
  return (
    <div className="space-y-4">
      {/* Hero distance display */}
      <div className="flex items-end gap-3">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = Math.max(min, Math.min(max, Number(e.target.value)));
            onChange(v);
          }}
          className="w-36 bg-transparent text-[72px] leading-none font-display
                     text-brand-neon border-b-2 border-brand-neon/30
                     focus:border-brand-neon outline-none text-center
                     transition-colors tracking-wide pb-1"
        />
        <span className="text-brand-muted text-2xl pb-3 font-bold tracking-widest uppercase">
          m
        </span>
      </div>

      {/* Slider with neon fill */}
      <div className="relative pt-1 pb-2">
        <div className="relative h-2 rounded-full overflow-hidden bg-brand-dark">
          {/* Neon fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-brand-neon/70 rounded-full transition-all duration-150"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ margin: 0 }}
        />
        {/* Thumb visual */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-brand-neon
                     border-[3px] border-brand-black shadow-[0_0_12px_rgba(225,255,0,0.6)]
                     transition-all duration-150 pointer-events-none"
          style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 10px)` }}
        />
        {/* Distance tick labels */}
        <div className="flex justify-between mt-3 px-0.5">
          {[0, 50, 100, 150, 200, 250, 300].map((m) => (
            <button
              key={m}
              onClick={() => onChange(m)}
              className="text-[10px] text-brand-muted/60 hover:text-brand-neon
                         transition-colors font-bold tracking-wide"
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Quick ±5/±10 nudge buttons */}
      <div className="flex gap-2">
        {[-10, -5, +5, +10].map((delta) => (
          <button
            key={delta}
            onClick={() => onChange(Math.max(0, Math.min(max, value + delta)))}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide
                       bg-brand-dark/60 border border-brand-muted/15
                       text-brand-muted hover:text-brand-neon hover:border-brand-neon/30
                       transition-all active:scale-95"
          >
            {delta > 0 ? `+${delta}` : delta}m
          </button>
        ))}
      </div>
    </div>
  );
}

