import { useEffect, useState } from 'react';

export function BlinkingClock({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hh = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const mm = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const ss = parts.find((p) => p.type === 'second')?.value ?? '00';

  const dateStr = now.toLocaleDateString('en-NZ', {
    timeZone: 'Pacific/Auckland',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="flex items-center gap-2 whitespace-nowrap tabular-nums">
      <span className="font-mono text-sm font-semibold tracking-tight sm:text-base">
        {hh}
        <span className="colon-blink text-primary">:</span>
        {mm}
        {!compact && (
          <>
            <span className="colon-blink text-primary">:</span>
            {ss}
          </>
        )}
      </span>
      {!compact && (
        <span className="hidden text-xs text-muted-foreground xl:inline whitespace-nowrap">
          NZT · {dateStr}
        </span>
      )}
    </div>
  );
}
