import { useEffect, useState } from 'react';
import {
  Camera,
  Compass,
  Fish,
  LayoutDashboard,
  Moon,
  Radar,
  ShieldAlert,
  Sun,
  Trophy,
  Waves,
} from 'lucide-react';
import { BlinkingClock } from '@/components/BlinkingClock';
import { CatchaCamTab } from '@/components/CatchaCamTab';
import { CatchLogAndIdTab } from '@/components/CatchLogAndIdTab';
import { CommunityAndGameTab } from '@/components/CommunityAndGameTab';
import { DashboardTab } from '@/components/DashboardTab';
import { SafetyAndRadar3DTab } from '@/components/SafetyAndRadar3DTab';
import { ShareQrDialog } from '@/components/ShareQrDialog';
import { SonarSplashModal } from '@/components/SonarSplashModal';
import { SpotsMapTab } from '@/components/SpotsMapTab';
import { TidesWeatherTab } from '@/components/TidesWeatherTab';
import { VhfRadioDialog } from '@/components/VhfRadioDialog';
import { VirtualFishingGame } from '@/components/VirtualFishingGame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHRISTCHURCH_SPOTS, type FishingSpot } from '@/data/christchurchFishingData';
import { fetchChristchurchWeather, getTideHeightAt, type WeatherSnapshot } from '@/lib/marineUtils';

export function App() {
  const isStandaloneGame =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('game') === '1';

  const [appName, setAppName] = useState("Catch'a");
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [splashOpen, setSplashOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot>(CHRISTCHURCH_SPOTS[0]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'locked' | 'error'>('idle');
  const [weather, setWeather] = useState<WeatherSnapshot>({
    tempC: 16,
    feelsLikeC: 15,
    humidityPct: 72,
    windKmh: 18,
    gustKmh: 26,
    windDir: 'NE',
    swellM: 1.1,
    swellPeriodS: 8.5,
    swellDir: 'E',
    sstC: 15.6,
    pressureHpa: 1016,
    uvIndex: 4.2,
    visibilityKm: 18,
    sunrise: '06:04',
    sunset: '20:38',
    condition: 'Loading Christchurch marine...',
    source: 'fallback',
    hourly: [],
    forecast: [],
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchChristchurchWeather().then(setWeather);
  }, []);

  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setGpsStatus('locked');
      },
      () => {
        setUserCoords({ lat: -43.5321, lng: 172.6362 });
        setGpsStatus('error');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const currentTide = getTideHeightAt(new Date());

  if (isStandaloneGame) {
    return <VirtualFishingGame standalone />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-6">
      <SonarSplashModal
        open={splashOpen}
        onEnterWater={() => setSplashOpen(false)}
        gpsStatus={gpsStatus}
        userCoords={userCoords}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-md transition hover:scale-105"
              title="Catch'a NZ Home"
            >
              <Fish className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display truncate text-lg font-extrabold tracking-tight whitespace-nowrap">
                  {appName}
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex font-mono text-[10px] whitespace-nowrap">
                  ŌTAUTAHI · NZ563
                </Badge>
              </div>
              <div className="hidden font-mono text-[11px] text-muted-foreground md:block whitespace-nowrap tabular-nums">
                {weather.tempC}°C · {weather.windDir} {weather.windKmh} km/h · Swell {weather.swellM}m · Tide{' '}
                {currentTide.toFixed(2)}m
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <BlinkingClock />
            <div className="hidden sm:block">
              <VhfRadioDialog />
            </div>
            <ShareQrDialog appName={appName} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSplashOpen(true)}
              aria-label="Sonar HUD"
              className="hidden h-8 w-8 sm:inline-flex"
            >
              <Radar className="h-4 w-4 text-emerald-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle theme"
              className="h-8 w-8"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-3 py-4 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="hidden h-auto w-full justify-start gap-1.5 rounded-xl bg-muted/50 p-1.5 md:flex">
            <TabsTrigger value="dashboard" className="gap-2 rounded-lg px-4 py-2 whitespace-nowrap">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="spots" className="gap-2 rounded-lg px-4 py-2 whitespace-nowrap">
              <Compass className="h-4 w-4" /> Google Map &amp; Spots
            </TabsTrigger>
            <TabsTrigger value="tides" className="gap-2 rounded-lg px-4 py-2 whitespace-nowrap">
              <Waves className="h-4 w-4" /> Tides, Weather &amp; Cams
            </TabsTrigger>
            <TabsTrigger value="catch" className="gap-2 rounded-lg px-4 py-2 whitespace-nowrap">
              <Camera className="h-4 w-4" /> Catcha Cam, ID &amp; Log
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-2 rounded-lg px-4 py-2 whitespace-nowrap">
              <ShieldAlert className="h-4 w-4 text-destructive" /> SOS, 3D Radar &amp; Club
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab
              selectedSpot={selectedSpot}
              weather={weather}
              userCoords={userCoords}
              onNavigateTab={setActiveTab}
              onSelectSpot={setSelectedSpot}
            />
          </TabsContent>

          <TabsContent value="spots">
            <SpotsMapTab
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
              userCoords={userCoords}
              onRequestGps={requestGps}
              gpsStatus={gpsStatus}
            />
          </TabsContent>

          <TabsContent value="tides">
            <TidesWeatherTab weather={weather} />
          </TabsContent>

          <TabsContent value="catch" className="space-y-6">
            <CatchaCamTab selectedSpot={selectedSpot} userCoords={userCoords} />
            <CatchLogAndIdTab />
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <SafetyAndRadar3DTab
              selectedSpot={selectedSpot}
              userCoords={userCoords}
              onRequestGps={requestGps}
            />
            <CommunityAndGameTab appName={appName} onSelectAppName={setAppName} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Docked 5-Tab Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 backdrop-blur-md md:hidden"
      >
        {[
          { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
          { id: 'spots', label: 'Map', Icon: Compass },
          { id: 'tides', label: 'Weather', Icon: Waves },
          { id: 'catch', label: 'Cam & ID', Icon: Camera },
          { id: 'safety', label: 'SOS/Club', Icon: Trophy },
        ].map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-medium transition ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
