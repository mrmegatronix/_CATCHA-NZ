import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mic, Radio, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function VhfRadioDialog() {
  const [channel, setChannel] = useState<'16' | '63'>('63');
  const [transmitting, setTransmitting] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let anim = 0;
    let phase = 0;
    const draw = () => {
      phase += transmitting ? 0.25 : 0.06;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#031427';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = transmitting ? '#f97316' : '#22d3ee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x += 4) {
        const amp = transmitting ? 18 : 3;
        const y = h / 2 + Math.sin(x * 0.08 + phase) * amp * Math.cos(x * 0.02);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      anim = requestAnimationFrame(draw);
    };
    anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [transmitting]);

  const playRadioTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(channel === '16' ? 1200 : 880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // ignore if audio blocked
    }
  };

  const triggerPtt = () => {
    setTransmitting(true);
    playRadioTone();
    setTimeout(() => {
      setTransmitting(false);
      setLastCheck(
        `Ch ${channel} Echo OK (${new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}) — Coastguard Canterbury Repeater Loud & Clear`
      );
    }, 1100);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span>VHF Check</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            VHF Marine Radio Diagnostic
          </DialogTitle>
          <DialogDescription>
            Canterbury Coastguard repeater &amp; distress frequency check
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={channel === '63' ? 'default' : 'outline'}
              onClick={() => setChannel('63')}
              className="flex-col h-auto py-2"
            >
              <span className="font-mono text-base font-bold">CH 63</span>
              <span className="text-[10px] opacity-80">Coastguard Canterbury</span>
            </Button>
            <Button
              variant={channel === '16' ? 'destructive' : 'outline'}
              onClick={() => setChannel('16')}
              className="flex-col h-auto py-2"
            >
              <span className="font-mono text-base font-bold">CH 16</span>
              <span className="text-[10px] opacity-80">Distress &amp; Calling</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border bg-[#031427] p-2">
            <div className="mb-1 flex items-center justify-between px-1 font-mono text-[11px] text-slate-400">
              <span>{channel === '16' ? '156.800 MHz' : '156.175 MHz (RPT)'}</span>
              <Badge variant={transmitting ? 'destructive' : 'secondary'} className="text-[10px]">
                {transmitting ? 'TX ACTIVE' : 'RX STANDBY'}
              </Badge>
            </div>
            <canvas ref={canvasRef} width={360} height={64} className="h-16 w-full rounded" />
          </div>

          <Button
            onClick={triggerPtt}
            disabled={transmitting}
            className="w-full gap-2 bg-orange-500 font-bold text-white hover:bg-orange-600"
          >
            <Mic className="h-4 w-4" />
            {transmitting ? 'TRANSMITTING TEST...' : `PRESS TO TRANSMIT (PTT) — CH ${channel}`}
          </Button>

          {lastCheck && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{lastCheck}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Volume2 className="h-3.5 w-3.5" /> Squelch: Auto
            </span>
            <span>Call *500 for Trip Reports</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
