import { useState } from 'react';
import {
  Award,
  MessageSquarePlus,
  Send,
  Smartphone,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { VirtualFishingGame } from '@/components/VirtualFishingGame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export function CommunityAndGameTab({
  appName,
  onSelectAppName,
}: {
  appName: string;
  onSelectAppName: (name: string) => void;
}) {
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
        <div className="lg:col-span-6">
          <VirtualFishingGame />
        </div>

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
              Angler Blogs &amp; Local Spot Reports
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
              App Name Picker (14 Ideas) &amp; App Store Roadmap
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

            <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold">
                <Smartphone className="h-4 w-4 text-primary" />
                App Store &amp; PWA Install Ready
              </div>
              <p className="text-muted-foreground">
                Built as a mobile-first responsive web app ready for Capacitor/PWA packaging (iOS App
                Store &amp; Google Play) with offline species &amp; tide caching.
              </p>
              <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Award className="h-3.5 w-3.5" /> Share via QR Code in the top bar
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
