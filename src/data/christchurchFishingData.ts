export interface FishingSpot {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  depthRange: string;
  boatRamp: string;
  hasRamp: boolean;
  targetSpecies: string[];
  bestTide: string;
  conditions: string;
  localRuleNote?: string;
  type: 'pier' | 'surf' | 'harbour' | 'river' | 'lake';
  biteStatus: 'prime' | 'moderate' | 'rough';
  solunarRating: number;
  sstC: number;
  clarityM: number;
  barChopM: number;
}

export interface AisVessel {
  id: string;
  mmsi: string;
  name: string;
  callsign: string;
  type: 'Cargo' | 'Coastguard' | 'Charter' | 'Tinnie';
  lat: number;
  lng: number;
  speedKn: number;
  headingDeg: number;
  draftM: number;
  depthBelowKeelM: number;
  washWarning?: string;
  color: string;
}

export interface FishSpecies {
  id: string;
  name: string;
  maoriName?: string;
  scientificName: string;
  minSizeCm: number | null;
  dailyLimit: string;
  habitat: string;
  bestBait: string;
  native: boolean;
  category: 'marine' | 'freshwater' | 'both';
  notes: string;
  color: string;
}

export interface WebcamSpot {
  id: string;
  name: string;
  provider: string;
  url: string;
  location: string;
  status: 'LIVE' | 'EXTERNAL';
  summary: string;
}

export interface BoatRamp {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  surface: string;
  lanes: number;
  tideAccess: string;
  fees: string;
  facilities: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  vhf?: string;
  url?: string;
  priority: 'critical' | 'conservation' | 'marine';
  description: string;
}

export const CHRISTCHURCH_SPOTS: FishingSpot[] = [
  {
    id: 'new-brighton-pier',
    name: 'New Brighton Pier',
    area: 'Pegasus Bay',
    lat: -43.5063,
    lng: 172.7347,
    depthRange: '2–6 m (surf zone)',
    boatRamp: 'None (land-based pier)',
    hasRamp: false,
    targetSpecies: ['Kahawai', 'Red Cod', 'Rig', 'Elephant Fish', 'Snapper'],
    bestTide: 'Incoming to High Tide',
    conditions: 'Dawn/dusk, light NW/W offshore wind, swell <1.5 m',
    localRuleNote: 'No fishing on Pier Sunday 10am–5pm (CCC Bylaw)',
    type: 'pier',
    biteStatus: 'prime',
    solunarRating: 92,
    sstC: 15.6,
    clarityM: 2.8,
    barChopM: 0.9,
  },
  {
    id: 'south-shore-spit',
    name: 'South Shore Spit',
    area: 'Avon-Heathcote Estuary',
    lat: -43.5412,
    lng: 172.731,
    depthRange: '1–5 m (estuary channel)',
    boatRamp: 'Moncks Bay / Humphreys Dr',
    hasRamp: true,
    targetSpecies: ['Kahawai', 'Flounder', 'Yellow-eyed Mullet'],
    bestTide: 'Incoming to Slack High',
    conditions: 'Strong estuary rip on tidal change; light winds ideal',
    type: 'surf',
    biteStatus: 'moderate',
    solunarRating: 78,
    sstC: 16.1,
    clarityM: 2.1,
    barChopM: 0.7,
  },
  {
    id: 'shag-rock',
    name: 'Shag Rock / Rapanui',
    area: 'Sumner Bar',
    lat: -43.5658,
    lng: 172.7542,
    depthRange: '2–8 m (channel)',
    boatRamp: 'Sumner / Moncks Bay',
    hasRamp: true,
    targetSpecies: ['Kahawai', 'Trevally', 'Red Cod', 'Flounder'],
    bestTide: 'Incoming Tide',
    conditions: 'Heavy tidal flow through Sumner channel; watch bar break',
    type: 'surf',
    biteStatus: 'moderate',
    solunarRating: 81,
    sstC: 15.8,
    clarityM: 2.5,
    barChopM: 1.2,
  },
  {
    id: 'sumner-taylors',
    name: "Sumner & Taylor's Mistake",
    area: 'Port Hills Coast',
    lat: -43.5705,
    lng: 172.757,
    depthRange: '2–12 m (rocky heads)',
    boatRamp: 'Scarborough / Sumner beach launch',
    hasRamp: true,
    targetSpecies: ['Kahawai', 'Blue Moki', 'Red Cod', 'Rig', 'Kingfish'],
    bestTide: 'Rising to High Tide',
    conditions: 'Calm SW/W breeze; avoid heavy Easterly surf',
    type: 'surf',
    biteStatus: 'prime',
    solunarRating: 89,
    sstC: 15.7,
    clarityM: 3.6,
    barChopM: 1.0,
  },
  {
    id: 'godley-head',
    name: 'Godley Head Ledges',
    area: 'Outer Lyttelton Heads',
    lat: -43.5936,
    lng: 172.8021,
    depthRange: '8–24 m (reef drop-off)',
    boatRamp: 'Naval Point Marina (launch & run)',
    hasRamp: true,
    targetSpecies: ['Yellowtail Kingfish', 'Blue Cod', 'Tarakihi', 'Blue Moki'],
    bestTide: 'Slack to Early Ebb',
    conditions: 'Steep cliffs, swell surges, watch ship wake wash',
    type: 'harbour',
    biteStatus: 'prime',
    solunarRating: 94,
    sstC: 15.8,
    clarityM: 4.5,
    barChopM: 1.1,
  },
  {
    id: 'lyttelton-naval-point',
    name: 'Lyttelton Harbour (Naval Point)',
    area: 'Whakaraupō',
    lat: -43.6068,
    lng: 172.7125,
    depthRange: '5–16 m (channel & heads)',
    boatRamp: 'Naval Point Marina (multi-lane concrete)',
    hasRamp: true,
    targetSpecies: ['Kahawai', 'Red Cod', 'Rig', 'Flounder', 'Kingfish'],
    bestTide: 'Slack water / gentle run',
    conditions: 'Sheltered from most swells; watch shipping channel',
    localRuleNote: 'Whakaraupō Mātaitai Reserve rules apply inside harbour',
    type: 'harbour',
    biteStatus: 'prime',
    solunarRating: 86,
    sstC: 16.0,
    clarityM: 3.0,
    barChopM: 0.4,
  },
  {
    id: 'corsair-bay',
    name: 'Corsair Bay',
    area: 'Lyttelton Harbour',
    lat: -43.606,
    lng: 172.715,
    depthRange: '2–8 m',
    boatRamp: 'Concrete trailer ramp & jetty',
    hasRamp: true,
    targetSpecies: ['Flounder', 'Kahawai', 'Red Cod', 'Spotty'],
    bestTide: 'High Tide & early ebb',
    conditions: 'Very sheltered; great family & kayak spot',
    localRuleNote: 'Whakaraupō Mātaitai rules apply',
    type: 'harbour',
    biteStatus: 'moderate',
    solunarRating: 75,
    sstC: 16.2,
    clarityM: 2.4,
    barChopM: 0.2,
  },
  {
    id: 'rapaki-bay',
    name: 'Rāpaki Bay',
    area: 'Lyttelton Harbour',
    lat: -43.61,
    lng: 172.68,
    depthRange: '1–6 m (mud/sand)',
    boatRamp: 'Limited (use Corsair Bay / Naval Point)',
    hasRamp: false,
    targetSpecies: ['Flounder', 'Kahawai', 'Mullet', 'Spotty'],
    bestTide: 'High Tide',
    conditions: 'Calm mornings',
    localRuleNote: 'Rāpaki Mātaitai Reserve — strict customary & bag limits',
    type: 'harbour',
    biteStatus: 'moderate',
    solunarRating: 72,
    sstC: 16.3,
    clarityM: 2.0,
    barChopM: 0.2,
  },
  {
    id: 'diamond-harbour',
    name: 'Diamond Harbour & Purau',
    area: 'South Lyttelton',
    lat: -43.623,
    lng: 172.721,
    depthRange: '4–12 m',
    boatRamp: 'Diamond Harbour / Charteris Bay / Purau',
    hasRamp: true,
    targetSpecies: ['Kahawai', 'Rig', 'Red Cod', 'School Shark'],
    bestTide: 'Incoming Tide',
    conditions: 'Light winds; stay clear of ferry & port lanes',
    type: 'harbour',
    biteStatus: 'prime',
    solunarRating: 84,
    sstC: 16.0,
    clarityM: 3.1,
    barChopM: 0.4,
  },
  {
    id: 'akaroa-harbour',
    name: 'Akaroa Harbour & Heads',
    area: 'Banks Peninsula',
    lat: -43.804,
    lng: 172.965,
    depthRange: '5–25 m (harbour) / 30–50 m (heads)',
    boatRamp: 'Akaroa (Rue Jolie), Duvauchelle, Wainui',
    hasRamp: true,
    targetSpecies: ['Blue Cod', 'Tarakihi', 'Blue Moki', 'Kingfish', 'Sea Perch'],
    bestTide: 'Slack to Incoming Tide',
    conditions: 'Low E/S swell for outer heads',
    localRuleNote: 'No-take Akaroa & Pohatu Marine Reserves strictly enforced',
    type: 'harbour',
    biteStatus: 'prime',
    solunarRating: 95,
    sstC: 15.4,
    clarityM: 5.2,
    barChopM: 1.0,
  },
  {
    id: 'waimakariri-mouth',
    name: 'Waimakariri River Mouth',
    area: 'Kairaki / Brooklands',
    lat: -43.3905,
    lng: 172.7135,
    depthRange: '1–5 m (channel & surf)',
    boatRamp: 'Kairaki & Kaiapoi river ramps',
    hasRamp: true,
    targetSpecies: ['Chinook Salmon', 'Brown Trout', 'Kahawai'],
    bestTide: '2 hrs before to 1 hr after High',
    conditions: 'Clean greenish river flow (Dec–Apr salmon)',
    localRuleNote: 'Fish & Game licence + Salmon Endorsement required for trout/salmon',
    type: 'river',
    biteStatus: 'rough',
    solunarRating: 88,
    sstC: 14.5,
    clarityM: 1.6,
    barChopM: 1.5,
  },
  {
    id: 'rakaia-mouth',
    name: 'Rakaia River Mouth',
    area: 'Mid-Canterbury',
    lat: -43.8965,
    lng: 172.2035,
    depthRange: '1–6 m (shingle surf)',
    boatRamp: 'Shingle river/jet boat access (4WD caution)',
    hasRamp: true,
    targetSpecies: ['Chinook Salmon', 'Brown Trout', 'Kahawai', 'Rig'],
    bestTide: 'Incoming Tide, dawn & dusk',
    conditions: 'Low clear river flow (Jan–Apr peak)',
    localRuleNote: 'Fish & Game licence required for salmon/trout',
    type: 'river',
    biteStatus: 'moderate',
    solunarRating: 83,
    sstC: 14.2,
    clarityM: 1.8,
    barChopM: 1.3,
  },
  {
    id: 'ellesmere-pegasus',
    name: 'Te Waihora / Pegasus Bay',
    area: 'South-West / Offshore',
    lat: -43.798,
    lng: 172.368,
    depthRange: '1–2.5 m (Lake) / 10–35 m (Bay)',
    boatRamp: 'Lakeside Domain / Kaiapoi / Lyttelton',
    hasRamp: true,
    targetSpecies: ['Red Gurnard', 'Tarakihi', 'Elephant Fish', 'Flounder', 'Blue Cod'],
    bestTide: 'Light W/NW <1.5 m swell (Bay)',
    conditions: 'Check ECan water quality for Lake Ellesmere',
    type: 'lake',
    biteStatus: 'moderate',
    solunarRating: 79,
    sstC: 15.5,
    clarityM: 2.9,
    barChopM: 1.1,
  },
];

export const NZ_SPECIES_CHART: FishSpecies[] = [
  {
    id: 'kahawai',
    name: 'Kahawai',
    maoriName: 'Kahawai',
    scientificName: 'Arripis trutta',
    minSizeCm: null,
    dailyLimit: '15 (counts to 30 combined)',
    habitat: 'Surf beaches, river mouths, harbours, coastal reefs',
    bestBait: 'Pilchard, sprat, silver hex/ticer spinners, soft baits',
    native: true,
    category: 'marine',
    notes: 'Great sportfish on light gear; bleed immediately for top eating.',
    color: '#38bdf8',
  },
  {
    id: 'blue-cod',
    name: 'Blue Cod',
    maoriName: 'Rāwaru',
    scientificName: 'Parapercis colias',
    minSizeCm: 33,
    dailyLimit: '2 (Hurunui–Rakaia) / 10 (South of Rakaia)',
    habitat: 'Rocky reefs, kelp beds, Banks Peninsula outer bays',
    bestBait: 'Squid, pāua gut, bonito, mussel, octopus',
    native: true,
    category: 'marine',
    notes: 'Must be landed whole or gutted (no filleting at sea).',
    color: '#0ea5e9',
  },
  {
    id: 'red-cod',
    name: 'Red Cod',
    maoriName: 'Hoka',
    scientificName: 'Pseudophycis bachus',
    minSizeCm: null,
    dailyLimit: 'No individual limit (30 combined)',
    habitat: 'Mud/sand harbour bottoms, surf beaches, piers',
    bestBait: 'Squid, pilchard, bonito, mussel',
    native: true,
    category: 'marine',
    notes: 'Common off New Brighton Pier & Lyttelton; best eaten fresh.',
    color: '#fb7185',
  },
  {
    id: 'rig',
    name: 'Rig (Spotted Dogfish)',
    maoriName: 'Pioke / Mangō',
    scientificName: 'Mustelus lenticulatus',
    minSizeCm: null,
    dailyLimit: '5 (counts to 30 combined)',
    habitat: 'Shallow harbours, sandy/muddy bays, surf beaches',
    bestBait: 'Paddle crab (top), squid, pilchard, mussel',
    native: true,
    category: 'marine',
    notes: 'Popular "lemon fish" for fish & chips; spring/summer harbour runs.',
    color: '#94a3b8',
  },
  {
    id: 'elephant-fish',
    name: 'Elephant Fish',
    maoriName: 'Reperepe',
    scientificName: 'Callorhinchus milii',
    minSizeCm: null,
    dailyLimit: '5 (counts to 30 combined)',
    habitat: 'Shallow sandy bays, Pegasus Bay, surf beaches (spring)',
    bestBait: 'Tuatua, surf clam, mussel, squid, crab',
    native: true,
    category: 'marine',
    notes: 'Prized white fillets; aggregates in Pegasus Bay in spring.',
    color: '#cbd5e1',
  },
  {
    id: 'blue-moki',
    name: 'Blue Moki',
    maoriName: 'Moki',
    scientificName: 'Latridopsis ciliaris',
    minSizeCm: 40,
    dailyLimit: '15 (check Mātaitai closures)',
    habitat: 'Rocky kelp reefs, Banks Peninsula headlands',
    bestBait: 'Kina, mussel, crab, crayfish, small squid strips',
    native: true,
    category: 'marine',
    notes: 'Runs along Sumner/Godley Head/Akaroa reefs; strong fighters.',
    color: '#6366f1',
  },
  {
    id: 'snapper',
    name: 'Snapper',
    maoriName: 'Tāmure',
    scientificName: 'Chrysophrys auratus',
    minSizeCm: 25,
    dailyLimit: '5–10 (30 combined)',
    habitat: 'Warm summer incursions in Pegasus Bay & reefs',
    bestBait: 'Pilchard, squid, bonito, soft baits, kabura',
    native: true,
    category: 'marine',
    notes: 'Increasingly caught in Canterbury during warm La Niña summers.',
    color: '#f43f5e',
  },
  {
    id: 'kingfish',
    name: 'Yellowtail Kingfish',
    maoriName: 'Haku',
    scientificName: 'Seriola lalandi',
    minSizeCm: 75,
    dailyLimit: '3 (counts to 30 combined)',
    habitat: 'Outer heads (Lyttelton, Akaroa, Godley Head) in summer',
    bestBait: 'Live kahawai/mackerel, topwater stickbaits, deep jigs',
    native: true,
    category: 'marine',
    notes: 'Heavy tackle required around rocky Peninsula heads.',
    color: '#eab308',
  },
  {
    id: 'brown-trout',
    name: 'Brown Trout',
    maoriName: 'Tāwhiti (introduced)',
    scientificName: 'Salmo trutta',
    minSizeCm: null,
    dailyLimit: '2–4 (max 1 >500mm in many waters)',
    habitat: 'Waimakariri, Rakaia, Selwyn rivers & mouths',
    bestBait: 'Woolly buggers, nymphs, Rapala/Tobys, worms',
    native: false,
    category: 'freshwater',
    notes: 'Sea-run browns follow whitebait & smelt into river mouths.',
    color: '#d97706',
  },
  {
    id: 'chinook-salmon',
    name: 'Chinook Salmon',
    maoriName: 'Hāmana (introduced)',
    scientificName: 'Oncorhynchus tshawytscha',
    minSizeCm: null,
    dailyLimit: 'Strict season limit (often 1/season)',
    habitat: 'Waimakariri & Rakaia rivers & mouths (Dec–Apr)',
    bestBait: 'Silver/copper zed spinners, ticers, Tasmanian devils',
    native: false,
    category: 'both',
    notes: 'Requires Fish & Game Sea-Run Salmon Endorsement + Bag Card.',
    color: '#ec4899',
  },
  {
    id: 'red-gurnard',
    name: 'Red Gurnard',
    maoriName: 'Kumu',
    scientificName: 'Chelidonichthys kumu',
    minSizeCm: 25,
    dailyLimit: 'No individual limit (30 combined)',
    habitat: 'Sandy/muddy bottoms in Pegasus Bay & outer harbours',
    bestBait: 'Pilchard, squid, bonito, shellfish on ledger rig',
    native: true,
    category: 'marine',
    notes: 'Top table fish; watch the sharp dorsal spines.',
    color: '#ef4444',
  },
  {
    id: 'tarakihi',
    name: 'Tarakihi',
    maoriName: 'Tarakihi',
    scientificName: 'Nemadactylus macropterus',
    minSizeCm: 25,
    dailyLimit: '10 (updated Nov 2026; 30 combined)',
    habitat: 'Deeper reefs & sand/gravel edges (20–50 m off Banks Peninsula)',
    bestBait: 'Squid, tuatua, mussel, bonito on 2/0–3/0 flasher rigs',
    native: true,
    category: 'marine',
    notes: 'Schooling reef-edge species off Akaroa & Pegasus Bay.',
    color: '#a855f7',
  },
];

export const WEBCAMS: WebcamSpot[] = [
  {
    id: 'sumner-cam',
    name: 'Sumner Beach & Bar',
    provider: 'SurfCheck NZ / CamJam',
    url: 'https://surfcheck.nz',
    location: 'Sumner Esplanade, Christchurch',
    status: 'LIVE',
    summary: 'Real-time surf break, swell period & beach launch visibility.',
  },
  {
    id: 'taylors-cam',
    name: "Taylor's Mistake",
    provider: 'TaylorsSurf.co.nz',
    url: 'https://taylorssurf.co.nz',
    location: "Taylor's Mistake Bay",
    status: 'LIVE',
    summary: 'Live swell height, wind chop & rock-ledge wash check.',
  },
  {
    id: 'brighton-cam',
    name: 'New Brighton Pier',
    provider: 'CamJam / Surf.co.nz',
    url: 'https://www.camjam.co.nz',
    location: 'New Brighton Pier',
    status: 'LIVE',
    summary: 'Pier crowd check, surf zone clarity & easterly swell conditions.',
  },
  {
    id: 'lyttelton-cam',
    name: 'Lyttelton Harbour / Adderley Head',
    provider: 'Environment Canterbury (ECan)',
    url: 'https://www.ecan.govt.nz',
    location: 'Whakaraupō / Lyttelton Heads',
    status: 'EXTERNAL',
    summary: 'Harbour entrance swell, wind whitecaps & vessel traffic.',
  },
  {
    id: 'akaroa-cam',
    name: 'Akaroa Harbour / Lucas Peak',
    provider: 'Environment Canterbury (ECan)',
    url: 'https://www.ecan.govt.nz',
    location: 'Akaroa Harbour, Banks Peninsula',
    status: 'EXTERNAL',
    summary: 'Outer heads sea state & harbour wind conditions.',
  },
];

export const BOAT_RAMPS: BoatRamp[] = [
  {
    id: 'naval-point',
    name: 'Naval Point Marina',
    location: 'Lyttelton Harbour',
    lat: -43.6068,
    lng: 172.7125,
    surface: 'Concrete (Multi-lane + Pontoon)',
    lanes: 3,
    tideAccess: 'All Tides',
    fees: 'Ramp fee / trailer parking',
    facilities: 'Washdown, toilets, Coastguard base, fuel nearby',
  },
  {
    id: 'corsair-ramp',
    name: 'Corsair Bay Ramp',
    location: 'Lyttelton Harbour',
    lat: -43.606,
    lng: 172.715,
    surface: 'Concrete + Jetty',
    lanes: 1,
    tideAccess: 'Mid to High Tide',
    fees: 'Free',
    facilities: 'Sheltered bay, toilets, picnic area',
  },
  {
    id: 'diamond-ramp',
    name: 'Diamond Harbour / Purau',
    location: 'South Lyttelton',
    lat: -43.623,
    lng: 172.721,
    surface: 'Concrete / Gravel',
    lanes: 1,
    tideAccess: 'Mid to High Tide',
    fees: 'Free',
    facilities: 'Small trailer parking, sheltered launch',
  },
  {
    id: 'akaroa-ramp',
    name: 'Akaroa Rue Jolie Ramp',
    location: 'Akaroa Harbour',
    lat: -43.804,
    lng: 172.965,
    surface: 'Concrete + Jetty',
    lanes: 2,
    tideAccess: 'All Tides',
    fees: 'Council ramp fee',
    facilities: 'Trailer park, toilets, fuel & supplies in town',
  },
  {
    id: 'kairaki-ramp',
    name: 'Kairaki / Kaiapoi River Ramp',
    location: 'Waimakariri River',
    lat: -43.3905,
    lng: 172.7135,
    surface: 'Concrete',
    lanes: 2,
    tideAccess: 'All Tides (bar crossing caution)',
    fees: 'Free',
    facilities: 'River access, salmon/whitebait staging',
  },
  {
    id: 'scarborough-ramp',
    name: 'Scarborough / Sumner Boat Ramp',
    location: 'Sumner',
    lat: -43.5715,
    lng: 172.768,
    surface: 'Concrete / Sand',
    lanes: 1,
    tideAccess: 'Mid to High (surf dependent)',
    fees: 'Free',
    facilities: 'Small craft & inflatable launch only in calm swell',
  },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'sos-111',
    name: 'NZ Police / Maritime SOS',
    role: 'Life-Threatening Emergency',
    phone: '111',
    vhf: 'VHF Ch 16',
    url: 'https://www.maritimenz.govt.nz',
    priority: 'critical',
    description: 'Immediate rescue, capsized vessel, medical emergency or coastal distress.',
  },
  {
    id: 'coastguard',
    name: 'Coastguard Canterbury',
    role: 'Marine Assistance & Trip Reports',
    phone: '*500',
    vhf: 'VHF Ch 63 / 16',
    url: 'https://www.coastguard.co.nz',
    priority: 'marine',
    description: 'Non-urgent breakdowns, bar crossings, and logging trip reports.',
  },
  {
    id: 'mpi-poacher',
    name: 'MPI Fisheries / Conservation Officer',
    role: 'Poaching & Illegal Fishing Hotline',
    phone: '0800 476 224',
    url: 'https://www.mpi.govt.nz',
    priority: 'conservation',
    description: '0800 4 POACHER — report undersize catches, excess bags, or reserve breaches.',
  },
  {
    id: 'doc-hot',
    name: 'DOC Conservation Hotline',
    role: 'Marine Mammals & Reserves',
    phone: '0800 362 468',
    url: 'https://www.doc.govt.nz',
    priority: 'conservation',
    description: '0800 DOC HOT — injured Hector’s dolphins, seals, or marine reserve incidents.',
  },
];

export const APP_NAME_IDEAS = [
  { name: "Catch'a", tagline: 'User original — punchy Kiwi hook', style: 'Original' },
  { name: 'Hook, Line & Sumner', tagline: 'Local twist on Hook, Line & Sinker', style: 'Local Pun' },
  { name: 'Baity Mate', tagline: 'Playful NZ banter + user original', style: 'Banter' },
  { name: 'Feed the Gulls', tagline: 'Self-deprecating badge-of-honour brand', style: 'Humour' },
  { name: 'CastAway Canty', tagline: 'Regional pride across coast & rivers', style: 'Regional' },
  { name: 'Waitaha Cast', tagline: "Honouring Canterbury's Māori name", style: 'Heritage' },
  { name: 'Pegasus Cast', tagline: 'Clean, iconic local bay identity', style: 'Minimal' },
  { name: 'Tide & Tinnie', tagline: 'Classic Kiwi boating & fishing vibe', style: 'Boating' },
  { name: "Nor'Wester", tagline: "Nod to Canterbury's famous fishing wind", style: 'Weather' },
  { name: 'Brine & Braid', tagline: 'Bridges ocean surf & braided rivers', style: 'Dual-Water' },
  { name: 'Otautahi Angler', tagline: 'Pro-grade Christchurch companion', style: 'Pro' },
  { name: 'Reel Canty', tagline: 'Short, App Store-ready handle', style: 'Modern' },
  { name: 'Kaikōura to Rakaia', tagline: 'Full Canterbury coastal reach', style: 'Explorer' },
  { name: 'Sinker & Swell', tagline: 'Marine forecast + tackle focus', style: 'Nautical' },
];

export const AIS_VESSELS: AisVessel[] = [
  {
    id: 'ais-1',
    mmsi: '512004810',
    name: 'MV Pacific Voyager',
    callsign: 'ZMVY',
    type: 'Cargo',
    lat: -43.588,
    lng: 172.815,
    speedKn: 14.2,
    headingDeg: 245,
    draftM: 9.4,
    depthBelowKeelM: 11.6,
    washWarning: 'Wake wash expected at Godley Head Ledges in ~12 mins',
    color: '#10b981',
  },
  {
    id: 'ais-2',
    mmsi: '512001999',
    name: 'Coastguard Canterbury CRV',
    callsign: 'ZMCG63',
    type: 'Coastguard',
    lat: -43.595,
    lng: 172.742,
    speedKn: 22.5,
    headingDeg: 65,
    draftM: 1.4,
    depthBelowKeelM: 10.2,
    color: '#ef4444',
  },
  {
    id: 'ais-3',
    mmsi: '512007321',
    name: 'Akaroa Reel Charter',
    callsign: 'ZM4412',
    type: 'Charter',
    lat: -43.765,
    lng: 172.975,
    speedKn: 9.8,
    headingDeg: 180,
    draftM: 2.1,
    depthBelowKeelM: 24.5,
    color: '#22d3ee',
  },
  {
    id: 'ais-4',
    mmsi: '512009102',
    name: 'Sumner Tinnie 4.8m',
    callsign: 'ZM9901',
    type: 'Tinnie',
    lat: -43.552,
    lng: 172.762,
    speedKn: 5.4,
    headingDeg: 120,
    draftM: 0.6,
    depthBelowKeelM: 6.4,
    color: '#fbbf24',
  },
];
