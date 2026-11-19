import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Camera,
  CloudSun,
  ExternalLink,
  Moon,
  TrendingDown,
  TrendingUp,
  Waves,
  Wind,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WEBCAMS } from '@/data/christchurchFishingData';
import {
  getFutureTideEvents,
  getHourlyTideCurve,
  getMoonInfo,
  getTideHeightAt,
  type WeatherSnapshot,
} from '@/lib/marineUtils';

export function TidesWeatherTab({ weather }: { weather: WeatherSnapshot }) {
  const now = useMemo(() => new Date(), []);
  const currentTide = useMemo(() => getTideHeightAt(now), [now]);
  const nextHourTide = useMemo(() => getTideHeightAt(new Date(now.getTime() + 3600000)), [now]);
  const isRising = nextHourTide >= currentTide;

  const tideCurve = useMemo(() => getHourlyTideCurve(now), [now]);
  const futureEvents = useMemo(() => getFutureTideEvents(4, now), [now]);
  const moon = useMemo(() => getMoonInfo(now), [now]);

  return (
    <div className="space-y-4">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Current Tide (Lyttelton)</span>
              {isRising ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              )}
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{currentTide.toFixed(2)} m</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={isRising ? 'default' : 'secondary'}>
              {isRising ? 'Incoming (Rising)' : 'Outgoing (Falling)'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Christchurch Wind & Swell</span>
              <Wind className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {weather.windKmh} km/h {weather.windDir}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Est. Swell: {weather.swellM} m</span>
            <span>{weather.pressureHpa} hPa</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Air Temp & Forecast</span>
              <CloudSun className="h-4 w-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-2xl tabular-nums">{weather.tempC}°C</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground truncate">
            {weather.condition}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Moon Cycle & Solunar</span>
              <Moon className="h-4 w-4 text-indigo-400" />
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span>{moon.emoji}</span>
              <span className="truncate">{moon.phaseName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {moon.illumination}% lit · Day {moon.ageDays}
            </span>
            <Badge variant="outline" className="text-primary">
              {moon.biteRating}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tide Curve + Future Tides */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Waves className="h-4 w-4 text-primary" />
                  24-Hour Tide Curve (Lyttelton / Pegasus Bay)
                </CardTitle>
                <CardDescription>Harmonic prediction · Verify bar crossings with LINZ</CardDescription>
              </div>
              <a
                href="https://www.linz.govt.nz/sea/tides/tide-predictions"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="xs" variant="outline" className="gap-1">
                  LINZ Tides <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tideCurve} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} interval={3} />
                  <YAxis domain={[0, 2.8]} tick={{ fontSize: 11 }} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="height"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#tideFill)"
                    name="Tide (m)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming High & Low Tides (4 Days)</CardTitle>
            <CardDescription>Plan river mouth & surf sessions around slack/incoming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
              {futureEvents.slice(0, 12).map((ev, idx) => (
                <div
                  key={`${ev.dayLabel}-${ev.time}-${idx}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={ev.type === 'HIGH' ? 'default' : 'secondary'}
                      className="w-12 justify-center text-[11px]"
                    >
                      {ev.type}
                    </Badge>
                    <span className="font-medium tabular-nums">{ev.time}</span>
                    <span className="text-xs text-muted-foreground">{ev.dayLabel}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold tabular-nums">
                    {ev.height.toFixed(2)} m
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5-Day Marine Weather Forecast */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">5-Day Canterbury Marine Weather Outlook</CardTitle>
              <CardDescription>
                Source: {weather.source === 'open-meteo' ? 'Live Open-Meteo Christchurch' : 'Offline Marine Model'}
              </CardDescription>
            </div>
            <a
              href="https://www.metservice.com/marine/regions/christchurch"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="xs" variant="outline" className="gap-1">
                MetService Marine <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {weather.forecast.map((f) => (
              <div key={f.day} className="rounded-lg border bg-muted/30 p-3 text-center">
                <div className="text-xs font-semibold text-primary">{f.day}</div>
                <div className="mt-1 text-lg font-bold tabular-nums">
                  {f.highC}° / <span className="text-sm font-normal text-muted-foreground">{f.lowC}°</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Wind {f.windKmh} km/h</div>
                <div className="mt-1 truncate text-[11px] font-medium">{f.condition}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Webcams */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-primary" />
            Christchurch & Canterbury Live Webcams
          </CardTitle>
          <CardDescription>Check real-time surf, pier crowds, and harbour sea state before towing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WEBCAMS.map((cam) => (
              <div key={cam.id} className="flex flex-col justify-between rounded-xl border bg-muted/20 p-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{cam.name}</span>
                    <Badge variant={cam.status === 'LIVE' ? 'default' : 'secondary'} className="text-[10px]">
                      {cam.status}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{cam.provider}</div>
                  <p className="mt-2 text-xs">{cam.summary}</p>
                </div>
                <a href={cam.url} target="_blank" rel="noreferrer" className="mt-3">
                  <Button size="sm" variant="outline" className="w-full gap-1.5">
                    Open {cam.location.split(',')[0]} Cam <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
