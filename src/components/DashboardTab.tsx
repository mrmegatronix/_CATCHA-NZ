import {
  ArrowRight,
  Camera,
  CloudSun,
  Compass,
  Fish,
  Gamepad2,
  MapPin,
  Moon,
  Radar,
  Radio,
  ShieldAlert,
  Trophy,
  Video,
  Waves,
  Wind,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AIS_VESSELS,
  CHRISTCHURCH_SPOTS,
  NZ_SPECIES_CHART,
  WEBCAMS,
  type FishingSpot,
} from '@/data/christchurchFishingData';
import {
  getFutureTideEvents,
  getMoonInfo,
  getTideHeightAt,
  type WeatherSnapshot,
} from '@/lib/marineUtils';

interface DashboardTabProps {
  selectedSpot: FishingSpot;
  weather: WeatherSnapshot;
  userCoords: { lat: number; lng: number } | null;
  onNavigateTab: (tab: string) => void;
  onSelectSpot: (spot: FishingSpot) => void;
}

export function DashboardTab({
  selectedSpot,
  weather,
  userCoords,
  onNavigateTab,
  onSelectSpot,
}: DashboardTabProps) {
  const now = new Date();
  const currentTide = getTideHeightAt(now);
  const nextTide = getTideHeightAt(new Date(now.getTime() + 3600000));
  const isRising = nextTide >= currentTide;
  const upcomingEvents = getFutureTideEvents(1, now);
  const nextEvent = upcomingEvents[0];
  const moon = getMoonInfo(now);

  let catchCount = 2;
  try {
    const raw = localStorage.getItem('ctfish_catches');
    if (raw) catchCount = JSON.parse(raw).length;
  } catch {
    // ignore
  }

  return (
    <div className="space-y-4">
      {/* Hero Summary Banner */}
      <Card className="border-cyan-500/30 bg-gradient-to-br from-card via-card to-cyan-950/30">
        <CardContent className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                ACTIVE SPOT
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                {selectedSpot.solunarRating}% SOLUNAR
              </Badge>
              <Badge variant="secondary" className="text-[11px] uppercase">
                {selectedSpot.biteStatus} BITE
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl truncate">
              {selectedSpot.name}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {selectedSpot.area} · Depth {selectedSpot.depthRange} · Best: {selectedSpot.bestTide}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button onClick={() => onNavigateTab('spots')} className="gap-1.5">
              <Compass className="h-4 w-4" /> Open Live Map
            </Button>
            <Button variant="outline" onClick={() => onNavigateTab('catch')} className="gap-1.5">
              <Video className="h-4 w-4 text-primary" /> Catcha Cam
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Spot Switcher Strip (Mobile & Desktop friendly) */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHRISTCHURCH_SPOTS.slice(0, 6).map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={s.id === selectedSpot.id ? 'default' : 'outline'}
            onClick={() => onSelectSpot(s)}
            className="shrink-0 gap-1.5 whitespace-nowrap"
          >
            <MapPin className="h-3.5 w-3.5" />
            {s.name.split(' (')[0]}
          </Button>
        ))}
      </div>

      {/* All-Module Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* 1. Map & GPS Module */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Interactive Map &amp; Ramps</span>
              <Compass className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-lg">13 Canterbury Spots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="font-mono text-muted-foreground">
              {userCoords
                ? `GPS Locked: ${userCoords.lat}, ${userCoords.lng}`
                : `Target: ${selectedSpot.lat}, ${selectedSpot.lng}`}
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedSpot.targetSpecies.slice(0, 3).map((sp) => (
                <Badge key={sp} variant="secondary" className="text-[10px]">
                  {sp}
                </Badge>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('spots')}
              className="w-full justify-between"
            >
              <span>Map, Ramps &amp; Laws</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 2. Tides & Moon Module */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Tides &amp; Moon Cycle</span>
              <Waves className="h-4 w-4 text-cyan-400" />
            </CardDescription>
            <CardTitle className="font-mono text-lg tabular-nums">
              {currentTide.toFixed(2)} m · {isRising ? 'Rising ↑' : 'Falling ↓'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>
                Next {nextEvent?.type ?? 'HIGH'}: {nextEvent?.time ?? '--:--'} ({nextEvent?.height ?? '--'}m)
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-2.5 py-1.5">
              <span className="flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-indigo-400" />
                {moon.emoji} {moon.phaseName}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {moon.biteRating}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('tides')}
              className="w-full justify-between"
            >
              <span>7-Day Tides &amp; {WEBCAMS.length} Cams</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 3. Detailed Marine Weather Module */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Marine Weather Intel</span>
              <CloudSun className="h-4 w-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="font-mono text-lg tabular-nums">
              {weather.tempC}°C · {weather.windDir} {weather.windKmh} km/h
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs">
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              <div className="rounded bg-muted/40 px-2 py-1">
                <span className="text-muted-foreground">Gusts: </span>
                {weather.gustKmh} km/h
              </div>
              <div className="rounded bg-muted/40 px-2 py-1">
                <span className="text-muted-foreground">Swell: </span>
                {weather.swellM}m ({weather.swellPeriodS}s)
              </div>
              <div className="rounded bg-muted/40 px-2 py-1">
                <span className="text-muted-foreground">SST: </span>
                {weather.sstC}°C
              </div>
              <div className="rounded bg-muted/40 px-2 py-1">
                <span className="text-muted-foreground">Press: </span>
                {weather.pressureHpa} hPa
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('tides')}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-1">
                <Wind className="h-3.5 w-3.5" /> Full Hourly Forecast
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 4. Catch Log, AR ID & Species Chart */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Catch Log &amp; Fish ID</span>
              <Fish className="h-4 w-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-lg">{catchCount} Logged Catches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="text-muted-foreground">
              {NZ_SPECIES_CHART.length} NZ/Canterbury species with MPI min sizes, AR ruler &amp; AI camera matcher.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('catch')}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" /> Log Catch or ID Fish
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 5. Catcha Cam Recorder */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Catcha Cam Recorder</span>
              <Video className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-lg">Live Fish Cam HUD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="text-muted-foreground">
              Record reel-in clips with live GPS, NZT clock &amp; tide telemetry overlay (.webm export).
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('catch')}
              className="w-full justify-between"
            >
              <span>Open Catcha Cam</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 6. SOS, VHF & Tsunami Watcher */}
        <Card className="flex flex-col justify-between border-destructive/30">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Safety, SOS &amp; Tsunami</span>
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </CardDescription>
            <CardTitle className="text-lg text-emerald-400">Zone NZ563 Clear</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between font-mono text-muted-foreground">
              <span>111 · *500 · Ch 16/63</span>
              <Radio className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onNavigateTab('safety')}
              className="w-full justify-between"
            >
              <span>SOS, VHF &amp; Tsunami</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 7. 3D Ocean Vessel Radar */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>3D Vessel &amp; Boat Finder</span>
              <Radar className="h-4 w-4 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-lg">{AIS_VESSELS.length} AIS Vessels Tracked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="text-muted-foreground">
              Live Lyttelton &amp; Pegasus Bay 3D sector radar with wake wash alerts &amp; depth contours.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('safety')}
              className="w-full justify-between"
            >
              <span>Launch 3D Radar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        {/* 8. Virtual Fishing Game & Community */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Community &amp; Mini-Game</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-lg">Scoreboard &amp; Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="text-muted-foreground">
              Play Waitaha Cast &amp; Reel, post spot reports, and pick from 14 app names.
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigateTab('safety')}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-1">
                <Gamepad2 className="h-3.5 w-3.5" /> Play &amp; Scoreboard
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
