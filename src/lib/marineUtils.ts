export interface MoonInfo {
  phaseName: string;
  illumination: number;
  ageDays: number;
  emoji: string;
  biteRating: 'Peak Solunar' | 'Good Bite' | 'Moderate' | 'Slow';
}

export interface TidePoint {
  time: string;
  hour: number;
  height: number;
  label?: string;
}

export interface TideEvent {
  type: 'HIGH' | 'LOW';
  time: string;
  height: number;
  dayOffset: number;
  dayLabel: string;
}

export interface HourlyWeatherPoint {
  time: string;
  tempC: number;
  windKmh: number;
  gustKmh: number;
  rainPct: number;
}

export interface WeatherSnapshot {
  tempC: number;
  feelsLikeC: number;
  humidityPct: number;
  windKmh: number;
  gustKmh: number;
  windDir: string;
  swellM: number;
  swellPeriodS: number;
  swellDir: string;
  sstC: number;
  pressureHpa: number;
  uvIndex: number;
  visibilityKm: number;
  sunrise: string;
  sunset: string;
  condition: string;
  source: 'open-meteo' | 'fallback';
  hourly: HourlyWeatherPoint[];
  forecast: Array<{
    day: string;
    highC: number;
    lowC: number;
    windKmh: number;
    rainPct: number;
    condition: string;
  }>;
}

export function getMoonInfo(date: Date = new Date()): MoonInfo {
  const synodicMonth = 29.53058867;
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0);
  const diffDays = (date.getTime() - ref) / 86400000;
  const age = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const phase = age / synodicMonth;
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100);

  let phaseName = 'New Moon';
  let emoji = '🌑';
  if (phase < 0.0625 || phase >= 0.9375) {
    phaseName = 'New Moon';
    emoji = '🌑';
  } else if (phase < 0.1875) {
    phaseName = 'Waxing Crescent';
    emoji = '🌒';
  } else if (phase < 0.3125) {
    phaseName = 'First Quarter';
    emoji = '🌓';
  } else if (phase < 0.4375) {
    phaseName = 'Waxing Gibbous';
    emoji = '🌔';
  } else if (phase < 0.5625) {
    phaseName = 'Full Moon';
    emoji = '🌕';
  } else if (phase < 0.6875) {
    phaseName = 'Waning Gibbous';
    emoji = '🌖';
  } else if (phase < 0.8125) {
    phaseName = 'Last Quarter';
    emoji = '🌗';
  } else {
    phaseName = 'Waning Crescent';
    emoji = '🌘';
  }

  let biteRating: MoonInfo['biteRating'] = 'Moderate';
  if (illumination >= 90 || illumination <= 10) biteRating = 'Peak Solunar';
  else if ((illumination >= 40 && illumination <= 60) || illumination >= 75) biteRating = 'Good Bite';
  else if (illumination < 25) biteRating = 'Slow';

  return {
    phaseName,
    illumination,
    ageDays: Number(age.toFixed(1)),
    emoji,
    biteRating,
  };
}

export function getTideHeightAt(date: Date): number {
  const hoursSinceRef = (date.getTime() - Date.UTC(2026, 0, 1, 0, 0, 0)) / 3600000;
  const m2Period = 12.4206;
  const s2Period = 12.0;
  const m2 = 0.88 * Math.cos((2 * Math.PI * hoursSinceRef) / m2Period - 0.8);
  const s2 = 0.22 * Math.cos((2 * Math.PI * hoursSinceRef) / s2Period - 1.4);
  const meanLevel = 1.42;
  return Number(Math.max(0.15, meanLevel + m2 + s2).toFixed(2));
}

export function getHourlyTideCurve(baseDate: Date = new Date()): TidePoint[] {
  const start = new Date(baseDate);
  start.setMinutes(0, 0, 0);
  const points: TidePoint[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = new Date(start.getTime() + i * 3600000);
    const hh = String(t.getHours()).padStart(2, '0');
    points.push({
      time: `${hh}:00`,
      hour: i,
      height: getTideHeightAt(t),
    });
  }
  return points;
}

export function getFutureTideEvents(days: number = 4, baseDate: Date = new Date()): TideEvent[] {
  const events: TideEvent[] = [];
  const start = new Date(baseDate);
  start.setMinutes(0, 0, 0);
  const stepMs = 15 * 60000;
  let prevH = getTideHeightAt(new Date(start.getTime() - stepMs));
  let currH = getTideHeightAt(start);

  const totalSteps = days * 24 * 4;
  for (let i = 1; i <= totalSteps; i++) {
    const t = new Date(start.getTime() + i * stepMs);
    const nextH = getTideHeightAt(t);
    const prevTime = new Date(start.getTime() + (i - 1) * stepMs);

    if (currH > prevH && currH >= nextH) {
      const dayOffset = Math.floor((prevTime.getTime() - start.getTime()) / 86400000);
      events.push({
        type: 'HIGH',
        time: prevTime.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
        height: currH,
        dayOffset,
        dayLabel: prevTime.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    } else if (currH < prevH && currH <= nextH) {
      const dayOffset = Math.floor((prevTime.getTime() - start.getTime()) / 86400000);
      events.push({
        type: 'LOW',
        time: prevTime.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit', hour12: false }),
        height: currH,
        dayOffset,
        dayLabel: prevTime.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    prevH = currH;
    currH = nextH;
  }
  return events;
}

export function degToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchChristchurchWeather(): Promise<WeatherSnapshot> {
  const fallbackHourly: HourlyWeatherPoint[] = [
    { time: '06:00', tempC: 12, windKmh: 12, gustKmh: 18, rainPct: 10 },
    { time: '09:00', tempC: 15, windKmh: 15, gustKmh: 22, rainPct: 10 },
    { time: '12:00', tempC: 18, windKmh: 19, gustKmh: 27, rainPct: 15 },
    { time: '15:00', tempC: 19, windKmh: 22, gustKmh: 31, rainPct: 20 },
    { time: '18:00', tempC: 16, windKmh: 17, gustKmh: 24, rainPct: 15 },
    { time: '21:00', tempC: 13, windKmh: 11, gustKmh: 16, rainPct: 5 },
  ];

  const fallback: WeatherSnapshot = {
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
    condition: 'Partly Cloudy · Light NE Sea Breeze',
    source: 'fallback',
    hourly: fallbackHourly,
    forecast: [
      { day: 'Today', highC: 18, lowC: 9, windKmh: 18, rainPct: 15, condition: 'Partly Cloudy' },
      { day: 'Tomorrow', highC: 20, lowC: 10, windKmh: 14, rainPct: 5, condition: 'Clear & Calm' },
      { day: 'Day 3', highC: 22, lowC: 11, windKmh: 24, rainPct: 10, condition: 'Nor’Wester' },
      { day: 'Day 4', highC: 15, lowC: 8, windKmh: 28, rainPct: 45, condition: 'Southerly Change' },
      { day: 'Day 5', highC: 17, lowC: 9, windKmh: 12, rainPct: 10, condition: 'Fine Morning' },
    ],
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const weatherUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=-43.5321&longitude=172.6362&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability,uv_index,visibility&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max,sunrise,sunset&timezone=Pacific%2FAuckland&forecast_days=5';
    const marineUrl =
      'https://marine-api.open-meteo.com/v1/marine?latitude=-43.55&longitude=172.80&current=wave_height,wave_period,wave_direction,sea_surface_temperature';

    const [wRes, mRes] = await Promise.all([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(marineUrl, { signal: controller.signal }).catch(() => null),
    ]);
    clearTimeout(timer);

    if (!wRes.ok) return fallback;
    const data = await wRes.json();
    const mData = mRes && mRes.ok ? await mRes.json() : null;

    const cur = data.current;
    const daily = data.daily;
    const hourlyRaw = data.hourly;
    const mCur = mData?.current;

    const windDir = degToCompass(cur?.wind_direction_10m ?? 45);
    const windKmh = Math.round(cur?.wind_speed_10m ?? 18);
    const gustKmh = Math.round(cur?.wind_gusts_10m ?? windKmh + 8);
    const swellM = Number(
      (mCur?.wave_height ?? Math.max(0.4, Math.min(3.5, windKmh * 0.055))).toFixed(1)
    );
    const swellPeriodS = Number((mCur?.wave_period ?? 8.2).toFixed(1));
    const swellDir = degToCompass(mCur?.wave_direction ?? 90);
    const sstC = Number((mCur?.sea_surface_temperature ?? 15.6).toFixed(1));

    const hourly: HourlyWeatherPoint[] = (hourlyRaw?.time ?? [])
      .slice(0, 12)
      .filter((_: string, i: number) => i % 2 === 0)
      .map((iso: string, idx: number) => {
        const realIdx = idx * 2;
        return {
          time: iso.slice(11, 16),
          tempC: Math.round(hourlyRaw.temperature_2m?.[realIdx] ?? 16),
          windKmh: Math.round(hourlyRaw.wind_speed_10m?.[realIdx] ?? 16),
          gustKmh: Math.round(hourlyRaw.wind_gusts_10m?.[realIdx] ?? 22),
          rainPct: Math.round(hourlyRaw.precipitation_probability?.[realIdx] ?? 10),
        };
      });

    const forecast = (daily?.time ?? []).slice(0, 5).map((iso: string, idx: number) => {
      const d = new Date(iso);
      const label = idx === 0 ? 'Today' : d.toLocaleDateString('en-NZ', { weekday: 'short' });
      const w = Math.round(daily.wind_speed_10m_max?.[idx] ?? 15);
      const r = Math.round(daily.precipitation_probability_max?.[idx] ?? 10);
      return {
        day: label,
        highC: Math.round(daily.temperature_2m_max?.[idx] ?? 18),
        lowC: Math.round(daily.temperature_2m_min?.[idx] ?? 9),
        windKmh: w,
        rainPct: r,
        condition: r > 50 ? 'Showers' : w > 28 ? 'Gusty Winds' : w < 16 ? 'Calm Window' : 'Moderate Breeze',
      };
    });

    const visMeters = hourlyRaw?.visibility?.[0] ?? 18000;
    const uvNow = hourlyRaw?.uv_index?.[0] ?? 4.0;

    return {
      tempC: Math.round(cur?.temperature_2m ?? 16),
      feelsLikeC: Math.round(cur?.apparent_temperature ?? cur?.temperature_2m ?? 15),
      humidityPct: Math.round(cur?.relative_humidity_2m ?? 72),
      windKmh,
      gustKmh,
      windDir,
      swellM,
      swellPeriodS,
      swellDir,
      sstC,
      pressureHpa: Math.round(cur?.surface_pressure ?? 1016),
      uvIndex: Number(Number(uvNow).toFixed(1)),
      visibilityKm: Math.round(visMeters / 1000),
      sunrise: daily?.sunrise?.[0]?.slice(11, 16) ?? '06:04',
      sunset: daily?.sunset?.[0]?.slice(11, 16) ?? '20:38',
      condition: `Live Open-Meteo · ${windDir} ${windKmh} km/h`,
      source: 'open-meteo',
      hourly: hourly.length > 0 ? hourly : fallbackHourly,
      forecast: forecast.length > 0 ? forecast : fallback.forecast,
    };
  } catch {
    return fallback;
  }
}
