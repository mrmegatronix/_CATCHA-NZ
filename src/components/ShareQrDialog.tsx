import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, QrCode, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function ShareQrDialog({ appName }: { appName: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://mrmegatronix.github.io/_CATCHA-NZ/';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 whitespace-nowrap">
            <QrCode className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Share QR</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Share {appName}
          </DialogTitle>
          <DialogDescription>
            Scan on mobile to open the Christchurch fishing companion or add to Home Screen.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <QRCodeSVG value={shareUrl} size={192} level="M" includeMargin />
          </div>
          <div className="flex w-full items-center gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-xs" />
            <Button size="sm" variant="secondary" onClick={copyLink} className="shrink-0 gap-1">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
