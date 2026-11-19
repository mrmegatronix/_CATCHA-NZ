import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Fish,
  Plus,
  Ruler,
  Search,
  Sparkles,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHRISTCHURCH_SPOTS, NZ_SPECIES_CHART } from '@/data/christchurchFishingData';

export interface CatchEntry {
  id: string;
  species: string;
  lengthCm: number;
  weightKg: number;
  spot: string;
  bait: string;
  fedGulls: boolean;
  timestamp: string;
}

export function CatchLogAndIdTab() {
  const [catches, setCatches] = useState<CatchEntry[]>(() => {
    try {
      const raw = localStorage.getItem('ctfish_catches');
      return raw
        ? JSON.parse(raw)
        : [
            {
              id: 'seed-1',
              species: 'Kahawai',
              lengthCm: 48,
              weightKg: 2.1,
              spot: 'New Brighton Pier',
              bait: 'Pilchard',
              fedGulls: false,
              timestamp: 'Yesterday 17:40',
            },
            {
              id: 'seed-2',
              species: 'Blue Cod',
              lengthCm: 36,
              weightKg: 1.2,
              spot: 'Akaroa Harbour & Heads',
              bait: 'Squid',
              fedGulls: false,
              timestamp: '3 days ago',
            },
          ];
    } catch {
      return [];
    }
  });

  // Catch Log Form
  const [species, setSpecies] = useState('Kahawai');
  const [lengthCm, setLengthCm] = useState('42');
  const [weightKg, setWeightKg] = useState('1.5');
  const [spot, setSpot] = useState(CHRISTCHURCH_SPOTS[0].name);
  const [bait, setBait] = useState('Pilchard');

  // Species Chart Filter
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'native' | 'marine' | 'freshwater'>('all');

  // Fish Identifier Camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camActive, setCamActive] = useState(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [traitColor, setTraitColor] = useState<'silver' | 'blue-green' | 'red-pink' | 'brown-spotted'>('silver');
  const [traitWater, setTraitWater] = useState<'surf-harbour' | 'reef' | 'river'>('surf-harbour');
  const [arMeasureCm, setArMeasureCm] = useState(44);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const persistCatches = (next: CatchEntry[]) => {
    setCatches(next);
    try {
      localStorage.setItem('ctfish_catches', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const addCatch = (fedGulls = false) => {
    const entry: CatchEntry = {
      id: `${Date.now()}`,
      species: fedGulls ? 'Feed the Gulls (0 Catch)' : species,
      lengthCm: fedGulls ? 0 : Number(lengthCm) || 0,
      weightKg: fedGulls ? 0 : Number(weightKg) || 0,
      spot,
      bait,
      fedGulls,
      timestamp: new Date().toLocaleString('en-NZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    persistCatches([entry, ...catches]);
  };

  const startIdCamera = async () => {
    setCamError(null);
    setCapturedImg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setCamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCamError('Camera unavailable — upload a fish photo or use the trait matcher below.');
    }
  };

  const snapPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setCapturedImg(canvas.toDataURL('image/jpeg', 0.85));
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCamActive(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImg(String(reader.result));
    reader.readAsDataURL(file);
  };

  // Trait-based NZ Species Matcher
  const matchedSpecies = (() => {
    if (traitWater === 'river') {
      return traitColor === 'silver'
        ? NZ_SPECIES_CHART.find((s) => s.id === 'chinook-salmon')!
        : NZ_SPECIES_CHART.find((s) => s.id === 'brown-trout')!;
    }
    if (traitWater === 'reef') {
      if (traitColor === 'blue-green') return NZ_SPECIES_CHART.find((s) => s.id === 'blue-cod')!;
      if (traitColor === 'red-pink') return NZ_SPECIES_CHART.find((s) => s.id === 'snapper')!;
      return NZ_SPECIES_CHART.find((s) => s.id === 'blue-moki')!;
    }
    if (traitColor === 'red-pink') return NZ_SPECIES_CHART.find((s) => s.id === 'red-gurnard')!;
    if (traitColor === 'brown-spotted') return NZ_SPECIES_CHART.find((s) => s.id === 'rig')!;
    if (traitColor === 'blue-green') return NZ_SPECIES_CHART.find((s) => s.id === 'kingfish')!;
    return NZ_SPECIES_CHART.find((s) => s.id === 'kahawai')!;
  })();

  const filteredSpecies = NZ_SPECIES_CHART.filter((sp) => {
    const matchesSearch =
      sp.name.toLowerCase().includes(search.toLowerCase()) ||
      (sp.maoriName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      sp.habitat.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (catFilter === 'native') return sp.native;
    if (catFilter === 'marine') return sp.category === 'marine' || sp.category === 'both';
    if (catFilter === 'freshwater') return sp.category === 'freshwater' || sp.category === 'both';
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Fish Catch Log */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Fish className="h-5 w-5 text-primary" />
              Fish Catch Log
            </CardTitle>
            <CardDescription>
              Log your catches (auto-checks MPI legal size) or tap Feed the Gulls on a quiet day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Select value={species} onValueChange={(v) => v && setSpecies(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Species" />
                </SelectTrigger>
                <SelectContent>
                  {NZ_SPECIES_CHART.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={spot} onValueChange={(v) => v && setSpot(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Spot" />
                </SelectTrigger>
                <SelectContent>
                  {CHRISTCHURCH_SPOTS.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Length (cm)</label>
                <Input
                  type="number"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Weight (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Bait / Lure</label>
                <Input value={bait} onChange={(e) => setBait(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => addCatch(false)} className="flex-1 gap-1.5 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Log Catch
              </Button>
              <Button
                variant="secondary"
                onClick={() => addCatch(true)}
                className="gap-1.5 whitespace-nowrap"
              >
                🪶 Feed the Gulls (0)
              </Button>
            </div>

            <ScrollArea className="h-56 pr-2">
              <div className="space-y-2">
                {catches.map((c) => {
                  const spMeta = NZ_SPECIES_CHART.find((s) => s.name === c.species);
                  const isUndersize =
                    !c.fedGulls && spMeta?.minSizeCm != null && c.lengthCm < spMeta.minSizeCm;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">{c.species}</span>
                          {!c.fedGulls && (
                            <Badge variant={isUndersize ? 'destructive' : 'outline'} className="text-[10px]">
                              {c.lengthCm} cm · {c.weightKg} kg
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {c.spot} · {c.bait} · {c.timestamp}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => persistCatches(catches.filter((x) => x.id !== c.id))}
                        className="ml-2 rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        aria-label="Delete catch"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fish Identifier Camera */}
        <Card className="lg:col-span-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5 text-primary" />
              Fish Identifier Camera & Size Check
            </CardTitle>
            <CardDescription>
              Snap or upload a catch photo + match NZ species traits & MPI minimum legal size
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border bg-slate-950">
              {camActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              ) : capturedImg ? (
                <img src={capturedImg} alt="Captured fish" className="h-full w-full object-contain" />
              ) : (
                <div className="text-center text-xs text-slate-400 px-4">
                  <Sparkles className="mx-auto mb-2 h-7 w-7 text-primary opacity-80" />
                  Start Camera or Upload Photo to inspect fin/colour patterns
                </div>
              )}
              {scanning && (
                <div className="scan-laser pointer-events-none absolute inset-x-4 h-0.5 bg-emerald-400 shadow-[0_0_12px_#10b981]" />
              )}
              {/* AR Measurement Scale Overlay */}
              <div className="pointer-events-none absolute inset-x-6 bottom-3 flex flex-col items-center">
                <div className="flex w-full items-center justify-between text-[10px] font-mono text-cyan-300">
                  <span>0 cm</span>
                  <span className="rounded bg-black/70 px-1.5 py-0.5 font-bold text-emerald-400">
                    AR RULER: {arMeasureCm} cm
                  </span>
                  <span>80 cm</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-cyan-950/80 border border-cyan-400/40 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{ width: `${Math.min(100, (arMeasureCm / 80) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground whitespace-nowrap">AR Calibrate:</span>
              <input
                type="range"
                min={15}
                max={80}
                value={arMeasureCm}
                onChange={(e) => setArMeasureCm(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  setScanning(true);
                  setTimeout(() => setScanning(false), 1800);
                }}
              >
                {scanning ? 'Scanning...' : 'Scan ID'}
              </Button>
            </div>

            {camError && <p className="text-xs text-amber-500">{camError}</p>}

            <div className="flex flex-wrap gap-2">
              {!camActive ? (
                <Button size="sm" onClick={startIdCamera} className="gap-1.5">
                  <Camera className="h-4 w-4" /> Start ID Camera
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={snapPhoto} className="gap-1.5">
                  Capture Frame
                </Button>
              )}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80">
                <Upload className="h-3.5 w-3.5" />
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={traitColor}
                onValueChange={(v) => setTraitColor(v as typeof traitColor)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Body Colour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Silver / Metallic</SelectItem>
                  <SelectItem value="blue-green">Blue / Green-Back</SelectItem>
                  <SelectItem value="red-pink">Red / Pink / Copper</SelectItem>
                  <SelectItem value="brown-spotted">Brown / Spotted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={traitWater}
                onValueChange={(v) => setTraitWater(v as typeof traitWater)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Water Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surf-harbour">Surf / Harbour / Pier</SelectItem>
                  <SelectItem value="reef">Rocky Reef / Kelp</SelectItem>
                  <SelectItem value="river">Braided River / Mouth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-primary/10 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-primary">
                  Likely Match: {matchedSpecies.name} ({matchedSpecies.maoriName})
                </span>
                <Badge
                  variant={
                    matchedSpecies.minSizeCm && arMeasureCm < matchedSpecies.minSizeCm
                      ? 'destructive'
                      : 'outline'
                  }
                >
                  {matchedSpecies.minSizeCm
                    ? arMeasureCm >= matchedSpecies.minSizeCm
                      ? `LEGAL (≥${matchedSpecies.minSizeCm}cm)`
                      : `UNDERSIZE (<${matchedSpecies.minSizeCm}cm)`
                    : 'No Min Size'}
                </Badge>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Limit: {matchedSpecies.dailyLimit} · Bait: {matchedSpecies.bestBait}
                </span>
                <Button
                  size="xs"
                  onClick={() => {
                    setSpecies(matchedSpecies.name);
                    setLengthCm(String(arMeasureCm));
                    addCatch(false);
                  }}
                  className="shrink-0"
                >
                  + Log Catch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Native Fish Species Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ruler className="h-5 w-5 text-primary" />
                Native & Canterbury Fish Species Chart
              </CardTitle>
              <CardDescription>
                MPI South-East Fishery Management Area · 30 combined finfish daily limit
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search species..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex gap-1">
                {(['all', 'native', 'marine', 'freshwater'] as const).map((f) => (
                  <Button
                    key={f}
                    size="xs"
                    variant={catFilter === f ? 'default' : 'ghost'}
                    onClick={() => setCatFilter(f)}
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpecies.map((sp) => (
              <div key={sp.id} className="rounded-xl border bg-muted/20 p-3.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: sp.color }}
                      />
                      {sp.name}
                    </div>
                    <div className="text-xs italic text-muted-foreground">
                      {sp.maoriName} · {sp.scientificName}
                    </div>
                  </div>
                  <Badge variant={sp.native ? 'default' : 'secondary'} className="text-[10px]">
                    {sp.native ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Native
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Intro
                      </span>
                    )}
                  </Badge>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-xs">
                  <div className="rounded bg-background/70 px-2 py-1">
                    <span className="text-muted-foreground">Min Size: </span>
                    <strong>{sp.minSizeCm ? `${sp.minSizeCm} cm` : 'None'}</strong>
                  </div>
                  <div className="rounded bg-background/70 px-2 py-1 truncate" title={sp.dailyLimit}>
                    <span className="text-muted-foreground">Limit: </span>
                    <strong>{sp.dailyLimit}</strong>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Bait: </span>
                  {sp.bestBait}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{sp.notes}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
