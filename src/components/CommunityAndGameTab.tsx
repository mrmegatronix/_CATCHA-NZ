import { useEffect, useRef, useState } from 'react';
import {
  Award,
  Gamepad2,
  MessageSquarePlus,
  Send,
  Smartphone,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { APP_NAME_IDEAS } from '@/data/christchurchFishingData';

interface CommunityPost {
  id: string;
  author: string;
  spot: string;
  title: string;
  body: string;
  time: string;
  likes: number;
}

const LEADERBOARD = [
  { rank: 1, angler: 'SumnerSam', catches: 42, topSpecies: 'Kingfish (94 cm)', xp: 2480 },
  { rank: 2, angler: 'LytteltonLou', catches: 37, topSpecies: 'Blue Moki (52 cm)', xp: 2110 },
  { rank: 3, angler: 'WaimakWes', catches: 29, topSpecies: 'Chinook Salmon (8.4 kg)', xp: 1890 },
  { rank: 4, angler: 'AkaroaAsh', catches: 24, topSpecies: 'Blue Cod (41 cm)', xp: 1520 },
  { rank: 5, angler: 'FeedTheGulls_NZ', catches: 3, topSpecies: '19x Gull Donations', xp: 940 },
];

const GAME_SPECIES = [
  { name: 'Kahawai', pts: 120, color: '#38bdf8' },
  { name: 'Blue Cod', pts: 180, color: '#0ea5e9' },
  { name: 'Rig (Dogfish)', pts: 200, color: '#94a3b8' },
  { name: 'Red Gurnard', pts: 160, color: '#f43f5e' },
  { name: 'Yellowtail Kingfish', pts: 450, color: '#eab308' },
];

export function CommunityAndGameTab({
  appName,
  onSelectAppName,
}: {
  appName: string;
  onSelectAppName: (name: string) => void;
}) {
  // Mini-game state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'bite' | 'reeling'>('idle');
  const [tension, setTension] = useState(35);
  const [reelProgress, setReelProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [lastCatch, setLastCatch] = useState('Cast a line into Pegasus Bay!');

  // Community posts
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const raw = localStorage.getItem('ctfish_posts');
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: 'p1',
              author: 'LytteltonLou',
              spot: 'Naval Point',
              title: 'Dawn kahawai school off the breakwater',
              body: 'Incoming tide at 6am was firing — 4 solid kahawai on silver hex spinners before the wind picked up.',
              time: '2h ago',
              likes: 14,
            },
            {
              id: 'p2',
              author: 'WaimakWes',
              spot: 'Waimakariri Mouth',
              title: 'River looking mint after the rain cleared',
              body: 'Clean greenish water on the incoming tide. Saw two salmon roll near the north spit.',
              time: '5h ago',
              likes: 21,
            },
          ];
    } catch {
      return [];
    }
  });
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');

  // Virtual Fishing Game timer & canvas animation
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

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Water
      const sea = ctx.createLinearGradient(0, h * 0.45, 0, h);
      sea.addColorStop(0, '#0369a1');
      sea.addColorStop(1, '#082f49');
      ctx.fillStyle = sea;
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Waves
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const y = h * 0.45 + Math.sin(x * 0.04 + tick) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Rod & Line
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(30, h * 0.72);
      ctx.lineTo(135, h * 0.32);
      ctx.stroke();

      if (gameState !== 'idle') {
        const bobX = gameState === 'reeling' ? 320 - reelProgress * 1.6 : 320;
        const bobY =
          gameState === 'bite'
            ? h * 0.48 + Math.sin(tick * 8) * 7
            : h * 0.45 + Math.sin(tick * 2) * 3;

        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(135, h * 0.32);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Bobber
        ctx.fillStyle = gameState === 'bite' ? '#ef4444' : '#f97316';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
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
        setGameState('idle');
        setReelProgress(0);
        setLastCatch(`Landed a ${caught.name}! (+${caught.pts} XP)`);
      } else {
        setReelProgress(nextProg);
      }
    }
  };

  const publishPost = () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    const next: CommunityPost = {
      id: `${Date.now()}`,
      author: 'You (Local Angler)',
      spot: 'Christchurch',
      title: postTitle.trim(),
      body: postBody.trim(),
      time: 'Just now',
      likes: 1,
    };
    const updated = [next, ...posts];
    setPosts(updated);
    setPostTitle('');
    setPostBody('');
    try {
      localStorage.setItem('ctfish_posts', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Virtual Fishing Mini-Game */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  Waitaha Cast & Reel (Mini-Game)
                </CardTitle>
                <CardDescription>Pass the time between bites — watch drag tension!</CardDescription>
              </div>
              <Badge className="font-mono text-sm">{score} XP</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-hidden rounded-xl border bg-slate-950">
              <canvas ref={canvasRef} width={480} height={210} className="h-auto w-full" />
            </div>
            <div className="text-center text-sm font-medium text-primary">{lastCatch}</div>
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
                    <span className={tension > 80 ? 'text-destructive font-bold' : ''}>{tension}%</span>
                  </div>
                  <Progress value={tension} />
                </div>
              </div>
            )}
            <Button
              onClick={handleReelTap}
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

        {/* Community Catch Scoreboard */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-amber-400" />
              Canterbury Catch Count Scoreboard
            </CardTitle>
            <CardDescription>Season leaderboard · Includes Feed the Gulls persistence XP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LEADERBOARD.map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      #{row.rank}
                    </span>
                    <div>
                      <div className="font-semibold">{row.angler}</div>
                      <div className="text-xs text-muted-foreground">{row.topSpecies}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tabular-nums">{row.catches} fish</div>
                    <div className="text-xs text-muted-foreground">{row.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Blogs & Posts + App Store / Name Ideas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Angler Blogs & Local Spot Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <Input
                placeholder="Report title (e.g. 'Elephant fish running at Brighton')"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              <Textarea
                placeholder="Share tide, bait & bite report..."
                rows={2}
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
              />
              <Button size="sm" onClick={publishPost} className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Post Report
              </Button>
            </div>

            <div className="space-y-2.5">
              {posts.map((p) => (
                <div key={p.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {p.spot}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{p.body}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {p.author} · {p.time}
                    </span>
                    <span>👍 {p.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              App Name Picker (14 Ideas) & App Store Roadmap
            </CardTitle>
            <CardDescription>Click any name to preview live branding in the header</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
              {APP_NAME_IDEAS.map((idea) => (
                <button
                  key={idea.name}
                  type="button"
                  onClick={() => onSelectAppName(idea.name)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-left text-xs transition ${
                    appName === idea.name ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{idea.name}</div>
                    <div className="text-muted-foreground">{idea.tagline}</div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {idea.style}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold">
                <Smartphone className="h-4 w-4 text-primary" />
                App Store & PWA Install Ready
              </div>
              <p className="text-muted-foreground">
                Built as a mobile-first responsive web app ready for Capacitor/PWA packaging (iOS App
                Store & Google Play) with offline species & tide caching.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Award className="h-3.5 w-3.5" /> Share via QR Code in the top bar
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
