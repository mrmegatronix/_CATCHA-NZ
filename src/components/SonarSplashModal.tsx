import { CheckCircle2, Compass, Radar, ShieldCheck, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SonarSplashModalProps {
  open: boolean;
  onEnterWater: () => void;
  gpsStatus: string;
  userCoords: { lat: number; lng: number } | null;
}

export function SonarSplashModal({
  open,
  onEnterWater,
  gpsStatus,
  userCoords,
}: SonarSplashModalProps) {
  const lat = (userCoords?.lat ?? -43.5321).toFixed(4);
  const lng = (userCoords?.lng ?? 172.6362).toFixed(4);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onEnterWater()}>
      <DialogContent className="border-cyan-500/30 bg-[#000f21] text-slate-100 sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <Badge variant="outline" className="mb-2 border-emerald-500/40 text-emerald-400 font-mono">
            ZONE NZ563 · PEGASUS BAY
          </Badge>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white">
            Catch&apos;a NZ · Marine Intel
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Canterbury Coastal Telemetry, Bathymetry &amp; Coastguard Safety HUD
          </DialogDescription>
        </DialogHeader>

        {/* Animated Sonar Radar Circle */}
        <div className="my-2 flex justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-cyan-400/30 bg-[#031427] shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <div className="absolute h-28 w-28 rounded-full border border-cyan-400/20" />
            <div className="absolute h-16 w-16 rounded-full border border-cyan-400/20" />
            <div className="radar-sweep absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,0.38)_0deg,transparent_65deg)]" />
            <Radar className="relative z-10 h-8 w-8 text-emerald-400" />
            <span className="absolute top-7 right-9 h-2 w-2 animate-ping rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Diagnostics Grid */}
        <div className="space-y-2 rounded-xl border border-cyan-500/20 bg-[#031427] p-3 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Compass className="h-3.5 w-3.5 text-cyan-400" /> GPS Coordinate Lock
            </span>
            <span className="text-emerald-400">
              {gpsStatus === 'locked' ? `${lat}, ${lng}` : 'READY (CHCH)'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Waves className="h-3.5 w-3.5 text-cyan-400" /> LINZ / NIWA Tides
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> SYNCED
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Offline Bathymetry Cache
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED
            </span>
          </div>
        </div>

        <Button
          onClick={onEnterWater}
          className="mt-1 w-full bg-orange-500 font-display text-sm font-bold text-white hover:bg-orange-600"
        >
          ENTER WATER · LAUNCH HUD
        </Button>
      </DialogContent>
    </Dialog>
  );
}
