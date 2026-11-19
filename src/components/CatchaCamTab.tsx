import { useEffect, useRef, useState } from 'react';
import { CircleDot, Download, Square, Video, VideoOff } from 'lucide-react';
import { BlinkingClock } from '@/components/BlinkingClock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type FishingSpot } from '@/data/christchurchFishingData';
import { getTideHeightAt } from '@/lib/marineUtils';

interface CatchaCamTabProps {
  selectedSpot: FishingSpot;
  userCoords: { lat: number; lng: number } | null;
}

export function CatchaCamTab({ selectedSpot, userCoords }: CatchaCamTabProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [camReady, setCamReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const simCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simMode, setSimMode] = useState(false);

  useEffect(() => {
    if (!simMode) return;
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let anim = 0;
    let t = 0;
    const draw = () => {
      t += 0.06;
      const w = canvas.width;
      const h = canvas.height;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#082f49');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(34,211,238,0.35)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 16) {
          const y = 75 + i * 45 + Math.sin(x * 0.03 + t + i) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(w / 2 + Math.sin(t * 2) * 85, h / 2 + Math.cos(t * 1.5) * 24, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      anim = requestAnimationFrame(draw);
    };
    anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [simMode]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const startCamera = async () => {
    setError(null);
    setSimMode(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      setCamReady(true);
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }
    } catch {
      setError('No physical camera found — click "Simulate Fish Cam" to test HUD recording.');
    }
  };

  const startSimCam = () => {
    setError(null);
    setSimMode(true);
    setCamReady(true);
    setTimeout(() => {
      if (simCanvasRef.current && typeof simCanvasRef.current.captureStream === 'function') {
        streamRef.current = simCanvasRef.current.captureStream(24);
      }
    }, 50);
  };

  const stopCamera = () => {
    if (recording) stopRecording();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamReady(false);
    setSimMode(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
    chunksRef.current = [];
    setSeconds(0);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedUrl(URL.createObjectURL(blob));
    };
    recorder.start(250);
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const tideH = getTideHeightAt(new Date());
  const lat = (userCoords?.lat ?? selectedSpot.lat).toFixed(4);
  const lng = (userCoords?.lng ?? selectedSpot.lng).toFixed(4);
  const recMm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const recSs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-8">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-primary" />
                Catcha Cam — Live Fish Cam Video Recorder
              </CardTitle>
              <CardDescription>
                Mount on rod/chest or prop on chilly bin to record the reel-in with live telemetry HUD
              </CardDescription>
            </div>
            {recording && (
              <Badge variant="destructive" className="animate-pulse gap-1.5 font-mono">
                <CircleDot className="h-3.5 w-3.5" />
                REC {recMm}:{recSs}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-slate-950">
            <video
              ref={previewRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${camReady && !simMode ? 'block' : 'hidden'}`}
            />
            <canvas
              ref={simCanvasRef}
              width={640}
              height={360}
              className={`h-full w-full object-cover ${camReady && simMode ? 'block' : 'hidden'}`}
            />
            {!camReady && (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                <Video className="h-10 w-10 text-primary opacity-75" />
                <div className="text-sm font-medium text-slate-200">Catcha Cam Standby</div>
                <div className="max-w-sm text-xs">
                  Enable camera & mic to record your fight, landing, and release with live Christchurch
                  tide & GPS telemetry.
                </div>
              </div>
            )}

            {/* Live HUD Overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-3 text-xs text-white">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/90 text-primary-foreground">CATCHA CAM</Badge>
                <span className="font-semibold truncate">{selectedSpot.name}</span>
              </div>
              <BlinkingClock compact />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-3 font-mono text-[11px] text-slate-200">
              <span>
                GPS {lat}, {lng}
              </span>
              <span>TIDE {tideH.toFixed(2)} m (Lyttelton)</span>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {!camReady ? (
              <>
                <Button onClick={startCamera} className="gap-1.5">
                  <Video className="h-4 w-4" /> Enable Catcha Cam
                </Button>
                <Button variant="secondary" onClick={startSimCam} className="gap-1.5">
                  Simulate Fish Cam
                </Button>
              </>
            ) : (
              <>
                {!recording ? (
                  <Button variant="destructive" onClick={startRecording} className="gap-1.5">
                    <CircleDot className="h-4 w-4" /> Start Recording Reel-In
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={stopRecording} className="gap-1.5">
                    <Square className="h-4 w-4" /> Stop Recording
                  </Button>
                )}
                <Button variant="outline" onClick={stopCamera} className="gap-1.5">
                  <VideoOff className="h-4 w-4" /> Turn Off Cam
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Latest Reel-In Clip</CardTitle>
          <CardDescription>Review & download your Catcha Cam video (.webm)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recordedUrl ? (
            <>
              <video
                src={recordedUrl}
                controls
                playsInline
                className="aspect-video w-full rounded-lg border bg-black"
              />
              <a
                href={recordedUrl}
                download={`catcha-cam-${selectedSpot.id}-${Date.now()}.webm`}
                className="block"
              >
                <Button className="w-full gap-1.5">
                  <Download className="h-4 w-4" /> Download Fish Cam Video
                </Button>
              </a>
            </>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-center text-xs text-muted-foreground p-4">
              No clip recorded yet. Hit Start Recording when the rod bends!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
