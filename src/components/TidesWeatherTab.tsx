import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Camera,
  CloudSun,
  Droplets,
  ExternalLink,
  Eye,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
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
      {/* Top Marine KPI Row */}
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
            <CardTitle className="font-mono text-2xl tabular-nums">{currentTide.toFixed(2)} m</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs">
            <Badge variant={isRising ? 'default' : 'secondary'}>
              {isRising ? 'Incoming (Rising)' : 'Outgoing (Falling)'}
            </Badge>
            <span className="font-mono text-muted-foreground">SST {weather.sstC}°C</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Wind, Gusts &amp; Swell</span>
              <Wind className="h-4 w-4 text-primary" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">
              {weather.windKmh} <span className="text-sm font-normal text-muted-foreground">km/h {weather.windDir}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Gusts {weather.gustKmh} km/h</span>
            <span>
              Swell {weather.swellM}m @ {weather.swellPeriodS}s {weather.swellDir}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Air Temp &amp; Pressure</span>
              <CloudSun className="h-4 w-4 text-amber-400" />
            </CardDescription>
            <CardTitle className="font-mono text-2xl tabular-nums">
              {weather.tempC}°C{' '}
              <span className="text-xs font-normal text-muted-foreground">
                (Feels {weather.feelsLikeC}°C)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{weather.pressureHpa} hPa</span>
            <span>UV {weather.uvIndex} · {weather.humidityPct}% RH</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
              <span>Moon Cycle &amp; Daylight</span>
              <Moon className="h-4 w-4 text-indigo-400" />
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <span>{moon.emoji}</span>
              <span className="truncate">{moon.phaseName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-mono">
              ☀ {weather.sunrise}–{weather.sunset}
            </span>
            <Badge variant="outline" className="text-primary">
              {moon.biteRating}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Weather Telemetry Strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Thermometer className="h-3.5 w-3.5 text-amber-400" /> Sea Surface Temp
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.sstC}°C</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Droplets className="h-3.5 w-3.5 text-cyan-400" /> Humidity
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.humidityPct}%</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-emerald-400" /> Visibility
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.visibilityKm} km</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sun className="h-3.5 w-3.5 text-yellow-400" /> UV Index
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.uvIndex}</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sunrise className="h-3.5 w-3.5 text-orange-400" /> First Light / Sunrise
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.sunrise}</div>
        </div>
        <div className="rounded-xl border bg-card p-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Sunset className="h-3.5 w-3.5 text-rose-400" /> Sunset
          </div>
          <div className="mt-1 font-mono text-base font-bold">{weather.sunset}</div>
        </div>
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
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tideCurve} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tideFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
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
                    stroke="#22d3ee"
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
            <CardTitle className="text-base">Upcoming High &amp; Low Tides (4 Days)</CardTitle>
            <CardDescription>Plan river mouth &amp; surf sessions around slack/incoming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid max-h-60 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
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
                    <span className="font-mono font-medium tabular-nums">{ev.time}</span>
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

      {/* Hourly Wind/Temp Chart + 5-Day Marine Weather Forecast */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">12-Hour Wind, Gusts &amp; Temp Outlook</CardTitle>
            <CardDescription>
              Source: {weather.source === 'open-meteo' ? 'Live Open-Meteo Christchurch + Marine' : 'Offline Marine Model'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weather.hourly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="gustKmh" fill="#f97316" opacity={0.35} name="Gusts (km/h)" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="windKmh" stroke="#22d3ee" strokeWidth={2} name="Wind (km/h)" />
                  <Line type="monotone" dataKey="tempC" stroke="#fbbf24" strokeWidth={2} name="Temp (°C)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-6">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">5-Day Canterbury Marine Outlook</CardTitle>
                <CardDescription>High/Low °C, max wind &amp; rain chance</CardDescription>
              </div>
              <a
                href="https://www.metservice.com/marine/regions/christchurch"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="xs" variant="outline" className="gap-1">
                  MetService <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {weather.forecast.map((f) => (
                <div key={f.day} className="rounded-lg border bg-muted/30 p-2.5 text-center">
                  <div className="text-xs font-semibold text-primary">{f.day}</div>
                  <div className="mt-1 font-mono text-base font-bold tabular-nums">
                    {f.highC}°/{f.lowC}°
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{f.windKmh} km/h</div>
                  <div className="text-[11px] text-cyan-400">{f.rainPct}% rain</div>
                  <div className="mt-1 truncate text-[10px] font-medium">{f.condition}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Webcams */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-primary" />
            Christchurch &amp; Canterbury Live Webcams
          </CardTitle>
          <CardDescription>Check real-time surf, pier crowds, and harbour sea state before towing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WEBCAMS.map((cam) => (
              <div key={cam.id} className="flex flex-col justify-between rounded-xl border bg-muted/20 p-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{cam.name}</span>
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
