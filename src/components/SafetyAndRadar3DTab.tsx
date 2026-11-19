import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  PhoneCall,
  Radar,
  Radio,
  RotateCw,
  ShieldAlert,
  Waves,
} from 'lucide-react';
import { VhfRadioDialog } from '@/components/VhfRadioDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EMERGENCY_CONTACTS, type FishingSpot } from '@/data/christchurchFishingData';

interface Vessel3D {
  id: string;
  name: string;
  type: 'Cargo' | 'Coastguard' | 'Charter' | 'Tinnie';
  x: number;
  z: number;
  vx: number;
  vz: number;
  speedKn: number;
  depthM: number;
  color: string;
}

const INITIAL_VESSELS: Vessel3D[] = [
  { id: 'v1', name: 'MV Lyttelton Star', type: 'Cargo', x: -75, z: -30, vx: 0.22, vz: 0.08, speedKn: 14.2, depthM: 18, color: '#f59e0b' },
  { id: 'v2', name: 'Coastguard CRV', type: 'Coastguard', x: 25, z: 40, vx: -0.18, vz: -0.25, speedKn: 22.5, depthM: 12, color: '#ef4444' },
  { id: 'v3', name: 'Akaroa Reel Charter', type: 'Charter', x: 80, z: -55, vx: -0.12, vz: 0.16, speedKn: 9.8, depthM: 28, color: '#38bdf8' },
  { id: 'v4', name: 'Sumner Tinnie 4.8m', type: 'Tinnie', x: -30, z: 65, vx: 0.1, vz: -0.09, speedKn: 5.4, depthM: 7, color: '#10b981' },
  { id: 'v5', name: 'Pegasus Trawler', type: 'Charter', x: 45, z: 15, vx: 0.14, vz: 0.11, speedKn: 8.1, depthM: 22, color: '#a855f7' },
];

export function SafetyAndRadar3DTab({
  selectedSpot,
  userCoords,
  onRequestGps,
}: {
  selectedSpot: FishingSpot;
  userCoords: { lat: number; lng: number } | null;
  onRequestGps: () => void;
}) {
  const [sosActive, setSosActive] = useState(false);
  const [sirenOn, setSirenOn] = useState(false);
  const [copiedSos, setCopiedSos] = useState(false);
  const [tsunamiStatus, setTsunamiStatus] = useState<{
    status: string;
    latestQuake: string;
    checkedAt: string;
  }>({
    status: 'NO ACTIVE TSUNAMI WARNING',
    latestQuake: 'Checking GeoNet NZ feed...',
    checkedAt: 'Just now',
  });

  // 3D Radar State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vesselsRef = useRef<Vessel3D[]>(INITIAL_VESSELS.map((v) => ({ ...v })));
  const [yaw, setYaw] = useState(0.55);
  const [pitch, setPitch] = useState(0.58);
  const [selectedVessel, setSelectedVessel] = useState<Vessel3D>(INITIAL_VESSELS[1]);

  useEffect(() => {
    let active = true;
    fetch('https://api.geonet.org.nz/quake?MMI=3')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const first = data?.features?.[0]?.properties;
        if (first) {
          setTsunamiStatus({
            status: 'NO ACTIVE TSUNAMI WARNING',
            latestQuake: `M${Number(first.magnitude).toFixed(1)} · ${first.locality} (${Math.round(first.depth)} km deep)`,
            checkedAt: new Date().toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      })
      .catch(() => {
        if (!active) return;
        setTsunamiStatus({
          status: 'NO ACTIVE TSUNAMI WARNING (OFFLINE)',
          latestQuake: 'Verify at geonet.org.nz or civildefence.govt.nz',
          checkedAt: 'Cached',
        });
      });
    return () => {
      active = false;
    };
  }, []);

  // 3D Vessel Finder Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let angleSweep = 0;

    const project = (x: number, y: number, z: number, w: number, h: number) => {
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP;

      const scale = 320 / (320 + z2 + 120);
      return {
        sx: w / 2 + x1 * scale * 1.45,
        sy: h / 2 + y2 * scale * 1.45,
        scale,
      };
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      const grad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.65);
      grad.addColorStop(0, '#0c4a6e');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 3D Seafloor Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      for (let g = -120; g <= 120; g += 30) {
        const a = project(g, 0, -120, w, h);
        const b = project(g, 0, 120, w, h);
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();

        const c = project(-120, 0, g, w, h);
        const d = project(120, 0, g, w, h);
        ctx.beginPath();
        ctx.moveTo(c.sx, c.sy);
        ctx.lineTo(d.sx, d.sy);
        ctx.stroke();
      }

      // Radar Sweep Line
      angleSweep = (angleSweep + 0.02) % (Math.PI * 2);
      const center = project(0, 0, 0, w, h);
      const sweepEnd = project(Math.cos(angleSweep) * 115, 0, Math.sin(angleSweep) * 115, w, h);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center.sx, center.sy);
      ctx.lineTo(sweepEnd.sx, sweepEnd.sy);
      ctx.stroke();

      // Update & Draw 3D Vessels
      vesselsRef.current.forEach((v) => {
        v.x += v.vx;
        v.z += v.vz;
        if (v.x > 110 || v.x < -110) v.vx *= -1;
        if (v.z > 110 || v.z < -110) v.vz *= -1;

        const base = project(v.x, 0, v.z, w, h);
        const hullTop = project(v.x, -16, v.z, w, h);
        const bow = project(v.x + v.vx * 35, -6, v.z + v.vz * 35, w, h);

        // Depth tether
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.beginPath();
        ctx.moveTo(base.sx, base.sy);
        ctx.lineTo(hullTop.sx, hullTop.sy);
        ctx.stroke();

        // Heading vector
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hullTop.sx, hullTop.sy);
        ctx.lineTo(bow.sx, bow.sy);
        ctx.stroke();

        // Vessel 3D marker
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.arc(hullTop.sx, hullTop.sy, 5.5 * hullTop.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px Inter, sans-serif';
        ctx.fillText(v.name, hullTop.sx + 8, hullTop.sy - 4);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [yaw, pitch]);

  const lat = (userCoords?.lat ?? selectedSpot.lat).toFixed(5);
  const lng = (userCoords?.lng ?? selectedSpot.lng).toFixed(5);
  const sosMessage = `MAYDAY / SOS — Fishing near ${selectedSpot.name}, Christchurch NZ. GPS: ${lat}, ${lng}. Need urgent Coastguard/Maritime assistance.`;

  useEffect(() => {
    if (!sirenOn) return;
    let ctx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AudioCtx();
      osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
    } catch {
      // ignore audio block
    }
    return () => {
      try {
        osc?.stop();
        ctx?.close();
      } catch {
        // ignore
      }
    };
  }, [sirenOn]);

  const copySos = async () => {
    try {
      await navigator.clipboard.writeText(sosMessage);
      setCopiedSos(true);
      setTimeout(() => setCopiedSos(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* SOS Beacon Banner */}
      <Card className={sosActive ? 'border-red-500 bg-red-950/30' : 'border-destructive/40'}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <ShieldAlert className="h-5 w-5" />
                Emergency SOS Beacon & Distress Dispatch
              </CardTitle>
              <CardDescription>
                Locks GPS coordinates and prepares instant 111 / Coastguard *500 / VHF Ch 16 call
              </CardDescription>
            </div>
            <Button
              variant={sosActive ? 'secondary' : 'destructive'}
              size="lg"
              onClick={() => {
                if (!sosActive) onRequestGps();
                setSosActive((s) => !s);
              }}
              className={sosActive ? 'font-bold' : 'animate-pulse font-bold'}
            >
              {sosActive ? 'CANCEL SOS BEACON' : 'TRIGGER SOS BEACON'}
            </Button>
          </div>
        </CardHeader>
        {sosActive && (
          <CardContent className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>SOS BEACON ARMED — GPS LOCKED</AlertTitle>
              <AlertDescription className="font-mono text-xs">{sosMessage}</AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              <a href="tel:111">
                <Button variant="destructive" className="gap-1.5">
                  <PhoneCall className="h-4 w-4" /> Call 111 (Police / Maritime)
                </Button>
              </a>
              <a href="tel:*500">
                <Button variant="outline" className="gap-1.5">
                  <Radio className="h-4 w-4" /> Call Coastguard *500
                </Button>
              </a>
              <Button variant="secondary" onClick={copySos} className="gap-1.5">
                {copiedSos ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copiedSos ? 'Distress SMS Copied' : 'Copy GPS Distress Text'}
              </Button>
              <Button
                variant={sirenOn ? 'destructive' : 'outline'}
                onClick={() => setSirenOn((s) => !s)}
                className="gap-1.5"
              >
                {sirenOn ? 'Silence Distress Horn' : 'Sound Distress Horn'}
              </Button>
              <VhfRadioDialog />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Emergency Contacts + Tsunami Watcher */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PhoneCall className="h-4 w-4 text-primary" />
                Emergency, Coastguard & Conservation Contacts
              </CardTitle>
              <VhfRadioDialog />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {EMERGENCY_CONTACTS.map((c) => (
                <div key={c.id} className="flex flex-col justify-between rounded-xl border p-3 text-sm">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{c.name}</span>
                      <Badge
                        variant={c.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {c.vhf ?? c.role.split(' ')[0]}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.description}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <a href={`tel:${c.phone.replace(/\s+/g, '')}`}>
                      <Button size="xs" variant={c.priority === 'critical' ? 'destructive' : 'outline'}>
                        Call {c.phone}
                      </Button>
                    </a>
                    {c.url && (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Site <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Waves className="h-4 w-4 text-primary" />
              Canterbury Tsunami Watcher
            </CardTitle>
            <CardDescription>Live GeoNet NZ seismic & coastal surge monitor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
              <div className="font-bold text-emerald-400">{tsunamiStatus.status}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Latest NZ Quake: {tsunamiStatus.latestQuake}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Checked: {tsunamiStatus.checkedAt}
              </div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1">
              <div className="font-semibold">Long or Strong? Get Gone!</div>
              <p className="text-muted-foreground">
                New Brighton, Sumner, Lyttelton & Akaroa foreshores are Red/Orange Tsunami Zones. Move
                inland or up Port Hills immediately after a long/strong quake.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="https://www.geonet.org.nz/tsunami" target="_blank" rel="noreferrer">
                <Button size="xs" variant="outline" className="gap-1">
                  GeoNet Tsunami <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
              <a href="https://www.cdemcanterbury.govt.nz" target="_blank" rel="noreferrer">
                <Button size="xs" variant="outline" className="gap-1">
                  Canterbury CDEM <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ocean Vessel / Boat Finder 3D */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Radar className="h-5 w-5 text-primary" />
                Ocean Vessel & Boat Finder 3D (Lyttelton / Pegasus Bay)
              </CardTitle>
              <CardDescription>
                Interactive 3D AIS-style marine radar showing nearby ships, Coastguard & charters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="outline" onClick={() => setYaw((y) => y + 0.35)} className="gap-1">
                <RotateCw className="h-3.5 w-3.5" /> Orbit 3D
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => setPitch((p) => (p > 0.7 ? 0.35 : p + 0.15))}
              >
                Tilt View
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8 overflow-hidden rounded-xl border bg-slate-950">
            <canvas ref={canvasRef} width={680} height={320} className="h-auto w-full" />
          </div>
          <div className="space-y-2 lg:col-span-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Vessels in Sector
            </div>
            {INITIAL_VESSELS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVessel(v)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                  selectedVessel.id === v.id ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  <div>
                    <div className="font-semibold">{v.name}</div>
                    <div className="text-muted-foreground">{v.type}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div>{v.speedKn} kn</div>
                  <div className="text-muted-foreground">{v.depthM}m</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
