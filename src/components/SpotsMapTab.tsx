import { useState } from 'react';
import {
  Anchor,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  ShieldAlert,
  Trash2,
  Waves,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AIS_VESSELS,
  BOAT_RAMPS,
  CHRISTCHURCH_SPOTS,
  type AisVessel,
  type FishingSpot,
} from '@/data/christchurchFishingData';

export interface CustomMarker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  note: string;
  createdAt: string;
}

interface SpotsMapTabProps {
  selectedSpot: FishingSpot;
  onSelectSpot: (spot: FishingSpot) => void;
  userCoords: { lat: number; lng: number } | null;
  onRequestGps: () => void;
  gpsStatus: string;
}

// Map bounding box covering Canterbury: Waimakariri (-43.35) to Rakaia (-43.93), 172.15 to 173.12
const LAT_MAX = -43.33;
const LAT_MIN = -43.95;
const LNG_MIN = 172.15;
const LNG_MAX = 173.12;

function toSvgCoords(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 600;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 400;
  return {
    x: Math.max(12, Math.min(588, x)),
    y: Math.max(12, Math.min(388, y)),
  };
}

function fromSvgCoords(x: number, y: number) {
  const lng = LNG_MIN + (x / 600) * (LNG_MAX - LNG_MIN);
  const lat = LAT_MAX - (y / 400) * (LAT_MAX - LAT_MIN);
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

export function SpotsMapTab({
  selectedSpot,
  onSelectSpot,
  userCoords,
  onRequestGps,
  gpsStatus,
}: SpotsMapTabProps) {
  const [markers, setMarkers] = useState<CustomMarker[]>(() => {
    try {
      const raw = localStorage.getItem('ctfish_markers');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [markerLabel, setMarkerLabel] = useState('');
  const [markerNote, setMarkerNote] = useState('');
  const [spotSaverPrivacy, setSpotSaverPrivacy] = useState(false);
  const [filterType, setFilterType] = useState<'all' | FishingSpot['type']>('all');
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [activeVessel, setActiveVessel] = useState<AisVessel | null>(null);

  const saveMarkers = (next: CustomMarker[]) => {
    setMarkers(next);
    try {
      localStorage.setItem('ctfish_markers', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const dropMarkerAt = (lat: number, lng: number, customName?: string) => {
    const label = customName?.trim() || markerLabel.trim() || `Pin #${markers.length + 1}`;
    const next: CustomMarker = {
      id: `${Date.now()}`,
      label,
      lat,
      lng,
      note: markerNote.trim() || 'Marked fishing spot',
      createdAt: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }),
    };
    saveMarkers([next, ...markers]);
    setMarkerLabel('');
    setMarkerNote('');
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 400;
    const coords = fromSvgCoords(x, y);
    dropMarkerAt(coords.lat, coords.lng);
  };

  const filteredSpots =
    filterType === 'all' ? CHRISTCHURCH_SPOTS : CHRISTCHURCH_SPOTS.filter((s) => s.type === filterType);

  const maskCoord = (val: number) => (spotSaverPrivacy ? `${val.toFixed(1)}**` : val.toFixed(4));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Interactive Bathymetric & GPS Map */}
      <Card className="lg:col-span-7">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Compass className="h-5 w-5 text-primary" />
                Canterbury GPS & Depth Chart
              </CardTitle>
              <CardDescription>
                Click anywhere on the chart to drop a location marker · Bathymetry contours in metres
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSpotSaverPrivacy((p) => !p)}
                className="gap-1.5 whitespace-nowrap"
              >
                {spotSaverPrivacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {spotSaverPrivacy ? 'GPS Hidden' : 'Spot Saver'}
              </Button>
              <Button size="sm" onClick={onRequestGps} className="gap-1.5 whitespace-nowrap">
                <LocateFixed className="h-4 w-4" />
                {gpsStatus === 'locked' ? 'GPS Locked' : 'Get GPS'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border bg-slate-950">
            <svg
              viewBox="0 0 600 400"
              onClick={handleSvgClick}
              className="h-auto w-full cursor-crosshair select-none"
              role="img"
              aria-label="Christchurch & Banks Peninsula Interactive Fishing Map"
            >
              {/* Ocean background & bathymetry contours */}
              <defs>
                <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#082f49" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
              </defs>
              <rect width="600" height="400" fill="url(#oceanGrad)" />

              {/* Depth Contours */}
              <path
                d="M 330,0 Q 370,130 430,190 T 560,310 L 600,310 L 600,0 Z"
                fill="#0c4a6e"
                opacity="0.45"
              />
              <path
                d="M 390,0 Q 430,120 490,180 T 600,260 L 600,0 Z"
                fill="#0369a1"
                opacity="0.25"
              />
              <text x="415" y="65" fill="#7dd3fc" fontSize="10" opacity="0.7">
                15m Contour
              </text>
              <text x="495" y="120" fill="#38bdf8" fontSize="10" opacity="0.7">
                30m+ Shelf
              </text>

              {/* Canterbury Plains & Banks Peninsula Landmass */}
              <path
                d="M 0,0 L 345,0 Q 355,60 365,120 Q 385,155 435,165 Q 505,175 535,235 Q 545,285 495,315 Q 435,325 365,280 Q 275,270 155,345 L 40,400 L 0,400 Z"
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Lake Ellesmere / Te Waihora */}
              <ellipse cx="140" cy="295" rx="48" ry="22" fill="#0e7490" opacity="0.7" stroke="#38bdf8" strokeWidth="1" />
              <text x="115" y="298" fill="#bae6fd" fontSize="9">
                Te Waihora
              </text>

              {/* Lyttelton Harbour Cutout */}
              <path
                d="M 380,180 Q 345,178 320,188 Q 348,198 388,195 Z"
                fill="#0284c7"
                opacity="0.85"
              />
              {/* Akaroa Harbour Cutout */}
              <path
                d="M 485,308 Q 492,265 502,248 Q 512,268 504,310 Z"
                fill="#0284c7"
                opacity="0.85"
              />

              {/* Land labels */}
              <text x="210" y="130" fill="#94a3b8" fontSize="13" fontWeight="600">
                CHRISTCHURCH
              </text>
              <text x="405" y="235" fill="#94a3b8" fontSize="10" fontWeight="600">
                BANKS PENINSULA
              </text>
              <text x="410" y="35" fill="#38bdf8" fontSize="11" opacity="0.8">
                Pegasus Bay
              </text>

              {/* Fishing Spot Pins */}
              {filteredSpots.map((spot) => {
                const { x, y } = toSvgCoords(spot.lat, spot.lng);
                const isSelected = spot.id === selectedSpot.id;
                const statusColor =
                  spot.biteStatus === 'prime'
                    ? '#10b981'
                    : spot.biteStatus === 'moderate'
                      ? '#fbbf24'
                      : '#f97316';
                const showLabel =
                  isSelected ||
                  spot.id === 'waimakariri-mouth' ||
                  spot.id === 'rakaia-mouth' ||
                  spot.id === 'akaroa-harbour';
                const alignLeft = x > 430;
                return (
                  <g
                    key={spot.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSpot(spot);
                    }}
                    className="cursor-pointer"
                  >
                    <title>{spot.name} ({spot.depthRange})</title>
                    {isSelected && (
                      <circle cx={x} cy={y} r="14" fill="#22d3ee" opacity="0.28" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 7 : 5}
                      fill={isSelected ? '#22d3ee' : statusColor}
                      stroke="#000f21"
                      strokeWidth="2"
                    />
                    {showLabel && (
                      <text
                        x={alignLeft ? x - 10 : x + 9}
                        y={y + 3}
                        textAnchor={alignLeft ? 'end' : 'start'}
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize={isSelected ? '11' : '9'}
                        fontWeight={isSelected ? '700' : '500'}
                      >
                        {spot.name.split(' (')[0]}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* AIS Vessel Overlay */}
              {AIS_VESSELS.map((v) => {
                const { x, y } = toSvgCoords(v.lat, v.lng);
                return (
                  <g
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVessel(v);
                    }}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={`${x},${y - 6} ${x + 5},${y + 5} ${x - 5},${y + 5}`}
                      fill={v.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                      transform={`rotate(${v.headingDeg} ${x} ${y})`}
                    />
                  </g>
                );
              })}

              {/* Custom User Dropped Markers */}
              {markers.map((m) => {
                const { x, y } = toSvgCoords(m.lat, m.lng);
                return (
                  <g key={m.id}>
                    <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                    <text x={x + 7} y={y - 4} fill="#6ee7b7" fontSize="9" fontWeight="600">
                      {m.label}
                    </text>
                  </g>
                );
              })}

              {/* User GPS Live Marker */}
              {userCoords && (
                <g>
                  <circle
                    cx={toSvgCoords(userCoords.lat, userCoords.lng).x}
                    cy={toSvgCoords(userCoords.lat, userCoords.lng).y}
                    r="10"
                    fill="#ef4444"
                    opacity="0.3"
                  />
                  <circle
                    cx={toSvgCoords(userCoords.lat, userCoords.lng).x}
                    cy={toSvgCoords(userCoords.lat, userCoords.lng).y}
                    r="5"
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>
          </div>

          {activeVessel && (
            <Alert className="border-cyan-500/40 bg-cyan-500/10 py-2">
              <AlertTitle className="flex items-center justify-between text-xs font-bold">
                <span>
                  AIS: {activeVessel.name} ({activeVessel.callsign}) · {activeVessel.speedKn} kn
                </span>
                <button
                  type="button"
                  onClick={() => setActiveVessel(null)}
                  className="text-[11px] underline"
                >
                  Dismiss
                </button>
              </AlertTitle>
              <AlertDescription className="font-mono text-[11px]">
                MMSI {activeVessel.mmsi} · Draft {activeVessel.draftM}m · Depth Below Keel{' '}
                {activeVessel.depthBelowKeelM}m
                {activeVessel.washWarning ? ` · ⚠ ${activeVessel.washWarning}` : ''}
              </AlertDescription>
            </Alert>
          )}

          {/* Drop Marker Controls */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Marker label (e.g. 'Kahawai Workup')"
              value={markerLabel}
              onChange={(e) => setMarkerLabel(e.target.value)}
              className="sm:flex-1"
            />
            <Input
              placeholder="Depth / bait note"
              value={markerNote}
              onChange={(e) => setMarkerNote(e.target.value)}
              className="sm:flex-1"
            />
            <Button
              variant="secondary"
              onClick={() =>
                dropMarkerAt(
                  userCoords?.lat ?? selectedSpot.lat,
                  userCoords?.lng ?? selectedSpot.lng
                )
              }
              className="gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Mark {userCoords ? 'GPS' : 'Spot'}
            </Button>
          </div>

          {markers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {markers.map((m) => (
                <Badge key={m.id} variant="secondary" className="gap-1.5 py-1 pr-1.5">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span>
                    {m.label} ({maskCoord(m.lat)}, {maskCoord(m.lng)})
                  </span>
                  <button
                    type="button"
                    onClick={() => saveMarkers(markers.filter((x) => x.id !== m.id))}
                    className="ml-1 rounded p-0.5 hover:bg-destructive/20"
                    aria-label="Remove marker"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Column: Spot List & Selected Spot Details */}
      <div className="space-y-4 lg:col-span-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Christchurch Hotspots</CardTitle>
              <div className="flex flex-wrap gap-1">
                {(['all', 'pier', 'surf', 'harbour', 'river', 'lake'] as const).map((t) => (
                  <Button
                    key={t}
                    size="xs"
                    variant={filterType === t ? 'default' : 'ghost'}
                    onClick={() => setFilterType(t)}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 pr-3">
              <div className="space-y-1.5">
                {filteredSpots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => onSelectSpot(spot)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                      spot.id === selectedSpot.id
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{spot.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {spot.area} · {spot.depthRange}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0 capitalize">
                      {spot.type}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{selectedSpot.name}</span>
                  <Badge
                    variant={selectedSpot.biteStatus === 'prime' ? 'default' : 'secondary'}
                    className="text-[10px] uppercase"
                  >
                    {selectedSpot.biteStatus}
                  </Badge>
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  GPS: {maskCoord(selectedSpot.lat)}, {maskCoord(selectedSpot.lng)} · {selectedSpot.area}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setDrawerExpanded((e) => !e)}
                >
                  {drawerExpanded ? 'Peek' : 'Expand'}
                </Button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="gap-1 whitespace-nowrap">
                    <Navigation className="h-3.5 w-3.5" />
                    GPS
                  </Button>
                </a>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {drawerExpanded && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5">
                  <div className="text-[11px] text-amber-400 font-medium">Solunar Window</div>
                  <div className="font-mono text-sm font-bold">{selectedSpot.solunarRating}% Prime</div>
                </div>
                <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 p-2.5">
                  <div className="text-[11px] text-cyan-400 font-medium">Surface Temp &amp; Vis</div>
                  <div className="font-mono text-sm font-bold">
                    {selectedSpot.sstC}°C · {selectedSpot.clarityM}m
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">Depth &amp; Bar Chop</div>
                  <div className="font-medium text-xs">
                    {selectedSpot.depthRange} · {selectedSpot.barChopM}m chop
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">Best Tide</div>
                  <div className="font-medium text-xs">{selectedSpot.bestTide}</div>
                </div>
              </div>
            )}
            <div>
              <span className="text-xs font-medium text-muted-foreground">Boat Ramp: </span>
              <span>{selectedSpot.boatRamp}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Conditions: </span>
              <span>{selectedSpot.conditions}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedSpot.targetSpecies.map((sp) => (
                <Badge key={sp} variant="secondary">
                  {sp}
                </Badge>
              ))}
            </div>
            {selectedSpot.localRuleNote && (
              <Alert variant="destructive" className="py-2">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Local Rule Alert</AlertTitle>
                <AlertDescription className="text-xs">{selectedSpot.localRuleNote}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Boat Ramps & Laws / Licence Purchasing */}
      <Card className="lg:col-span-7">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Anchor className="h-4 w-4 text-primary" />
            Canterbury Boat Ramps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {BOAT_RAMPS.map((ramp) => (
              <div key={ramp.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate">{ramp.name}</span>
                  <Badge variant="outline" className="shrink-0">
                    {ramp.lanes} {ramp.lanes > 1 ? 'Lanes' : 'Lane'}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {ramp.surface} · {ramp.tideAccess}
                </div>
                <div className="mt-1 text-xs">{ramp.facilities}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Local Laws & Licence Purchasing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5">
              <Waves className="h-4 w-4 text-primary" />
              MPI South-East Marine Rules
            </div>
            <p className="text-xs text-muted-foreground">
              Combined daily limit: <strong>30 finfish</strong> per fisher. Stricter limits apply in Whakaraupō
              Mātaitai (Lyttelton Harbour). No-take in Akaroa & Pohatu Marine Reserves.
            </p>
            <a
              href="https://www.mpi.govt.nz/fishing-aquaculture/recreational-fishing/fishing-rules/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Official MPI NZ Fishing Rules <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
            <div className="font-semibold">Freshwater Trout & Salmon Licences</div>
            <p className="text-xs text-muted-foreground">
              Required for Waimakariri, Rakaia & all North Canterbury rivers/lakes. Sea-Run Salmon Endorsement
              required for Chinook Salmon.
            </p>
            <a
              href="https://fishandgame.org.nz/licences/"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button size="sm" className="gap-1.5">
                Buy Fish & Game NZ Licence <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
