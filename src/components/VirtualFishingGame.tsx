import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Fish, Gamepad2, Trophy } from 'lucide-react';
import { BlinkingClock } from '@/components/BlinkingClock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const GAME_SPECIES = [
  { name: 'Kahawai', pts: 120, color: '#38bdf8' },
  { name: 'Blue Cod', pts: 180, color: '#0ea5e9' },
  { name: 'Rig (Dogfish)', pts: 200, color: '#94a3b8' },
  { name: 'Red Gurnard', pts: 160, color: '#f43f5e' },
  { name: 'Yellowtail Kingfish', pts: 450, color: '#eab308' },
];

export function VirtualFishingGame({ standalone = false }: { standalone?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'bite' | 'reeling'>('idle');
  const [tension, setTension] = useState(35);
  const [reelProgress, setReelProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [lastCatch, setLastCatch] = useState('Cast a line into Pegasus Bay!');

  useEffect(() => {
    if (gameState !== 'waiting') return;
    const delay = 1400 + Math.random() * 2400;
    const t = setTimeout(() => {
      setGameState('bite');
      setLastCatch('FISH ON! Tap REEL NOW!');
    }, delay);
    return () => clearTimeout(t);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'reeling') return;
    const id = setInterval(() => {
      setTension((prev) => {
        const next = Math.max(0, prev - 4);
        if (next === 0) {
          setGameState('idle');
          setLastCatch('Line went slack — fish spat the hook! Fed the gulls.');
        }
        return next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let anim = 0;
    let tick = 0;
    const draw = () => {
      tick += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      sky.addColorStop(0, '#000f21');
      sky.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Sun / Moon glow
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.beginPath();
      ctx.arc(w * 0.82, h * 0.18, 28, 0, Math.PI * 2);
      ctx.fill();

      const sea = ctx.createLinearGradient(0, h * 0.45, 0, h);
      sea.addColorStop(0, '#0284c7');
      sea.addColorStop(1, '#031427');
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const y = h * 0.45 + Math.sin(x * 0.04 + tick) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Rod & Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(32, h * 0.78);
      ctx.lineTo(155, h * 0.3);
      ctx.stroke();

      if (gameState !== 'idle') {
        const bobX = gameState === 'reeling' ? w * 0.72 - reelProgress * 1.8 : w * 0.72;
        const bobY =
          gameState === 'bite'
            ? h * 0.5 + Math.sin(tick * 8) * 8
            : h * 0.45 + Math.sin(tick * 2) * 3;

        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(155, h * 0.3);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        ctx.fillStyle = gameState === 'bite' ? '#ef4444' : '#f97316';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      anim = requestAnimationFrame(draw);
    };
    anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [gameState, reelProgress]);

  const handleReelTap = () => {
    if (gameState === 'idle') {
      setGameState('waiting');
      setReelProgress(0);
      setTension(40);
      setLastCatch('Line cast! Watching the swell...');
      return;
    }
    if (gameState === 'bite') {
      setGameState('reeling');
      setTension(55);
      setReelProgress(20);
      return;
    }
    if (gameState === 'reeling') {
      const nextTension = tension + 14;
      if (nextTension > 96) {
        setGameState('idle');
        setLastCatch('SNAP! Line broke from too much drag!');
        return;
      }
      const nextProg = reelProgress + 22;
      setTension(nextTension);
      if (nextProg >= 100) {
        const caught = GAME_SPECIES[Math.floor(Math.random() * GAME_SPECIES.length)];
        setScore((s) => s + caught.pts);
        setCaughtCount((c) => c + 1);
        setGameState('idle');
        setReelProgress(0);
        setLastCatch(`Landed a ${caught.name}! (+${caught.pts} XP)`);
      } else {
        setReelProgress(nextProg);
      }
    }
  };

  const openNewTab = () => {
    const url = `${window.location.origin}${window.location.pathname}?game=1`;
    window.open(url, '_blank', 'noopener');
  };

  const content = (
    <Card className={standalone ? 'mx-auto w-full max-w-3xl border-cyan-500/30' : ''}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gamepad2 className="h-5 w-5 text-primary" />
              Waitaha Cast &amp; Reel
            </CardTitle>
            <CardDescription>Virtual Canterbury fishing mini-game — balance drag tension!</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-mono">
              <Trophy className="h-3.5 w-3.5 text-amber-400" /> {caughtCount} Fish
            </Badge>
            <Badge className="font-mono text-sm">{score} XP</Badge>
            {!standalone && (
              <Button size="xs" variant="outline" onClick={openNewTab} className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" /> New Tab
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="overflow-hidden rounded-xl border bg-slate-950">
          <canvas
            ref={canvasRef}
            width={standalone ? 720 : 480}
            height={standalone ? 360 : 210}
            className="h-auto w-full"
          />
        </div>
        <div className="text-center text-sm font-semibold text-primary">{lastCatch}</div>
        {gameState === 'reeling' && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="mb-1 flex justify-between">
                <span>Reel Progress</span>
                <span>{reelProgress}%</span>
              </div>
              <Progress value={reelProgress} />
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span>Line Tension</span>
                <span className={tension > 80 ? 'font-bold text-destructive' : ''}>{tension}%</span>
              </div>
              <Progress value={tension} />
            </div>
          </div>
        )}
        <Button
          onClick={handleReelTap}
          size="lg"
          variant={gameState === 'bite' ? 'destructive' : 'default'}
          className="w-full font-bold"
        >
          {gameState === 'idle' && 'Cast Line'}
          {gameState === 'waiting' && 'Waiting for Bite...'}
          {gameState === 'bite' && 'HOOK SET — TAP TO REEL!'}
          {gameState === 'reeling' && 'TAP TO REEL IN!'}
        </Button>
      </CardContent>
    </Card>
  );

  if (!standalone) return content;

  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950">
            <Fish className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-extrabold">Catch&apos;a Arcade</span>
        </div>
        <BlinkingClock />
      </div>
      {content}
    </div>
  );
}
