import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Anchor,
  Compass,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Layers,
  LocateFixed,
  MapPin,
  Minus,
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

type MapStyle = 'google-hybrid' | 'google-terrain' | 'google-road' | 'nautical-dark';

export function SpotsMapTab({
  selectedSpot,
  onSelectSpot,
  userCoords,
  onRequestGps,
  gpsStatus,
}: SpotsMapTabProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const seamarkLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapStyle, setMapStyle] = useState<MapStyle>('google-hybrid');
  const [showSeamarks, setShowSeamarks] = useState(true);
  const [showRamps, setShowRamps] = useState(true);
  const [showAis, setShowAis] = useState(true);
  const [showReserves, setShowReserves] = useState(true);

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
  const [activeVessel, setActiveVessel] = useState<AisVessel | null>(null);

  const saveMarkers = (next: CustomMarker[]) => {
    setMarkers(next);
    try {
      localStorage.setItem('ctfish_markers', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const dropMarkerAt = (lat: number, lng: number, customName?: string) => {
    const label = customName?.trim() || markerLabel.trim() || `Pin #${markers.length + 1}`;
    const next: CustomMarker = {
      id: `${Date.now()}`,
      label,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      note: markerNote.trim() || 'Marked fishing spot',
      createdAt: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }),
    };
    saveMarkers([next, ...markers]);
    setMarkerLabel('');
    setMarkerNote('');
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [selectedSpot.lat, selectedSpot.lng],
      zoom: 12,
      zoomControl: false,
    });

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = group;

    map.on('click', (e: L.LeafletMouseEvent) => {
      dropMarkerAt(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    const tileUrls: Record<MapStyle, { url: string; attr: string }> = {
      'google-hybrid': {
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attr: 'Map data &copy; Google',
      },
      'google-terrain': {
        url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
        attr: 'Map data &copy; Google',
      },
      'google-road': {
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        attr: 'Map data &copy; Google',
      },
      'nautical-dark': {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attr: '&copy; OpenStreetMap &copy; CARTO',
      },
    };

    const chosen = tileUrls[mapStyle];
    baseLayerRef.current = L.tileLayer(chosen.url, {
      attribution: chosen.attr,
      maxZoom: 20,
    }).addTo(map);

    if (seamarkLayerRef.current) {
      map.removeLayer(seamarkLayerRef.current);
      seamarkLayerRef.current = null;
    }

    if (showSeamarks) {
      seamarkLayerRef.current = L.tileLayer(
        'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
        { maxZoom: 18, opacity: 0.9 }
      ).addTo(map);
    }
  }, [mapStyle, showSeamarks]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      map.panTo([selectedSpot.lat, selectedSpot.lng], { animate: true });
    }
  }, [selectedSpot]);

  const filteredSpots =
    filterType === 'all' ? CHRISTCHURCH_SPOTS : CHRISTCHURCH_SPOTS.filter((s) => s.type === filterType);

  useEffect(() => {
    const group = markersLayerRef.current;
    if (!group) return;
    group.clearLayers();

    if (showReserves) {
      L.polygon(
        [
          [-43.875, 172.942],
          [-43.885, 172.968],
          [-43.855, 172.978],
          [-43.848, 172.952],
        ],
        {
          color: '#ef4444',
          weight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.22,
          dashArray: '4 4',
        }
      )
        .bindPopup('<strong>Akaroa Marine Reserve</strong><br/>Strict No-Take Zone')
        .addTo(group);

      L.circle([-43.612, 172.695], {
        radius: 2100,
        color: '#f59e0b',
        weight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.12,
        dashArray: '6 4',
      })
        .bindPopup('<strong>Whakaraupō Mātaitai</strong><br/>Customary &amp; special bag limits apply')
        .addTo(group);
    }

    filteredSpots.forEach((spot) => {
      const isSelected = spot.id === selectedSpot.id;
      const color =
        spot.biteStatus === 'prime'
          ? '#10b981'
          : spot.biteStatus === 'moderate'
            ? '#fbbf24'
            : '#f97316';

      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: isSelected ? 11 : 7,
        color: isSelected ? '#22d3ee' : '#ffffff',
        weight: isSelected ? 3 : 2,
        fillColor: color,
        fillOpacity: 0.95,
      });

      marker.bindTooltip(`${spot.name} (${spot.depthRange})`, { direction: 'top' });
      marker.on('click', () => onSelectSpot(spot));
      marker.addTo(group);
    });

    if (showRamps) {
      BOAT_RAMPS.forEach((ramp) => {
        L.circleMarker([ramp.lat, ramp.lng], {
          radius: 5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: '#38bdf8',
          fillOpacity: 0.95,
        })
          .bindPopup(`<strong>Ramp: ${ramp.name}</strong><br/>${ramp.lanes} lanes · ${ramp.tideAccess}`)
          .addTo(group);
      });
    }

    if (showAis) {
      AIS_VESSELS.forEach((v) => {
        const marker = L.circleMarker([v.lat, v.lng], {
          radius: 6,
          color: '#ffffff',
          weight: 1.5,
          fillColor: v.color,
          fillOpacity: 0.95,
        });
        marker.bindTooltip(`AIS: ${v.name} (${v.speedKn} kn)`, { direction: 'right' });
        marker.on('click', () => setActiveVessel(v));
        marker.addTo(group);
      });
    }

    markers.forEach((m) => {
      L.circleMarker([m.lat, m.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: '#a855f7',
        fillOpacity: 0.95,
      })
        .bindPopup(`<strong>${m.label}</strong><br/>${m.note}`)
        .addTo(group);
    });

    if (userCoords) {
      L.circleMarker([userCoords.lat, userCoords.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 1,
      })
        .bindPopup('<strong>Your GPS Location</strong>')
        .addTo(group);
    }
  }, [filteredSpots, selectedSpot, showRamps, showAis, showReserves, markers, userCoords, onSelectSpot]);

  const maskCoord = (val: number) => (spotSaverPrivacy ? `${val.toFixed(1)}**` : val.toFixed(4));

  return (
    <div className="space-y-4">
      {/* Main Google Maps + Spot Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8 overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Compass className="h-5 w-5 text-primary" />
                  Google Maps · Canterbury Coastal Chart
                </CardTitle>
                <CardDescription>
                  High-res Google Satellite, Terrain &amp; Nautical Seamarks · Tap map to drop GPS pin
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSpotSaverPrivacy((p) => !p)}
                  className="gap-1.5 whitespace-nowrap"
                >
                  {spotSaverPrivacy ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">{spotSaverPrivacy ? 'GPS Hidden' : 'Spot Saver'}</span>
                </Button>
                <Button size="sm" onClick={onRequestGps} className="gap-1.5 whitespace-nowrap">
                  <LocateFixed className="h-4 w-4" />
                  {gpsStatus === 'locked' ? 'GPS Locked' : 'My GPS'}
                </Button>
              </div>
            </div>

            {/* Map Controls */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
                <Layers className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
                {[
                  { id: 'google-hybrid', label: 'Google Satellite' },
                  { id: 'google-terrain', label: 'Terrain' },
                  { id: 'google-road', label: 'Road' },
                  { id: 'nautical-dark', label: 'Dark Chart' },
                ].map((st) => (
                  <Button
                    key={st.id}
                    size="xs"
                    variant={mapStyle === st.id ? 'default' : 'ghost'}
                    onClick={() => setMapStyle(st.id as MapStyle)}
                  >
                    {st.label}
                  </Button>
                ))}
              </div>
              <Button
                size="xs"
                variant={showSeamarks ? 'default' : 'outline'}
                onClick={() => setShowSeamarks((v) => !v)}
              >
                Nautical
              </Button>
              <Button
                size="xs"
                variant={showRamps ? 'default' : 'outline'}
                onClick={() => setShowRamps((v) => !v)}
              >
                Ramps
              </Button>
              <Button
                size="xs"
                variant={showAis ? 'default' : 'outline'}
                onClick={() => setShowAis((v) => !v)}
              >
                AIS
              </Button>
              <Button
                size="xs"
                variant={showReserves ? 'destructive' : 'outline'}
                onClick={() => setShowReserves((v) => !v)}
              >
                Reserves
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border bg-slate-950">
              <div ref={mapContainerRef} className="z-0 h-[360px] w-full sm:h-[460px]" />

              {/* Floating Zoom & Center Controls */}
              <div className="absolute right-2.5 top-2.5 z-[400] flex flex-col gap-1.5">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 shadow-lg"
                  onClick={() => mapRef.current?.zoomIn()}
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 shadow-lg"
                  onClick={() => mapRef.current?.zoomOut()}
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9 shadow-lg"
                  onClick={() => mapRef.current?.setView([selectedSpot.lat, selectedSpot.lng], 13)}
                  aria-label="Center on spot"
                  title="Center on Selected Spot"
                >
                  <Navigation className="h-4 w-4 text-primary" />
                </Button>
              </div>
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
                    <MapPin className="h-3 w-3 text-purple-400" />
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

        {/* Right Column: Spot Picker & Active Spot Telemetry */}
        <div className="space-y-4 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Spots ({filteredSpots.length})</CardTitle>
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
                  <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                    <span>{selectedSpot.name}</span>
                    <Badge
                      variant={selectedSpot.biteStatus === 'prime' ? 'default' : 'secondary'}
                      className="text-[10px] uppercase"
                    >
                      {selectedSpot.biteStatus}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {maskCoord(selectedSpot.lat)}, {maskCoord(selectedSpot.lng)} · {selectedSpot.area}
                  </CardDescription>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline" className="gap-1 whitespace-nowrap">
                    <Navigation className="h-3.5 w-3.5" />
                    Google Nav
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-2.5">
                  <div className="text-[11px] font-medium text-amber-400">Solunar</div>
                  <div className="font-mono text-sm font-bold">{selectedSpot.solunarRating}% Prime</div>
                </div>
                <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 p-2.5">
                  <div className="text-[11px] font-medium text-cyan-400">SST &amp; Vis</div>
                  <div className="font-mono text-sm font-bold">
                    {selectedSpot.sstC}°C · {selectedSpot.clarityM}m
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">Depth &amp; Chop</div>
                  <div className="text-xs font-medium">
                    {selectedSpot.depthRange} · {selectedSpot.barChopM}m
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5">
                  <div className="text-[11px] text-muted-foreground">Best Tide</div>
                  <div className="text-xs font-medium">{selectedSpot.bestTide}</div>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Ramp: </span>
                <span className="text-xs">{selectedSpot.boatRamp}</span>
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
      </div>

      {/* Boat Ramps & Laws */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
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
                    <span className="truncate font-semibold">{ramp.name}</span>
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
              Local Laws &amp; Licence Purchasing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 font-semibold">
                <Waves className="h-4 w-4 text-primary" />
                MPI South-East Marine Rules
              </div>
              <p className="text-xs text-muted-foreground">
                Combined daily limit: <strong>30 finfish</strong> per fisher. Stricter limits apply in Whakaraupō
                Mātaitai (Lyttelton Harbour). No-take in Akaroa &amp; Pohatu Marine Reserves.
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
            <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
              <div className="font-semibold">Freshwater Trout &amp; Salmon Licences</div>
              <p className="text-xs text-muted-foreground">
                Required for Waimakariri, Rakaia &amp; all North Canterbury rivers/lakes. Sea-Run Salmon Endorsement
                required for Chinook Salmon.
              </p>
              <a
                href="https://fishandgame.org.nz/licences/"
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <Button size="sm" className="gap-1.5">
                  Buy Fish &amp; Game NZ Licence <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
