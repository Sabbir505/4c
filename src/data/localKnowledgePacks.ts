import type { BuildingFamily } from '../utils/analytics'

type ClimateZoneKey =
  | 'severe-cold'
  | 'cold'
  | 'hot-summer-cold-winter'
  | 'hot-summer-warm-winter'
  | 'mild'

interface ClimateZonePack {
  key: ClimateZoneKey
  label: string
  aliases: string[]
  dominantHazards: string[]
}

interface MaterialRange {
  material: string
  rangeRmbPerM2: string
  note: string
}

interface StrategyMapping {
  traditional: string
  modern: string
  useWhen: string
}

interface BuildingKnowledgePack {
  family: BuildingFamily
  label: string
  materialRanges: MaterialRange[]
  strategyMappings: StrategyMapping[]
}

interface CostFactorEntry {
  city: string
  aliases: string[]
  climateZone: ClimateZoneKey
  multiplier: number
  note: string
}

const CLIMATE_ZONE_PACKS: ClimateZonePack[] = [
  {
    key: 'severe-cold',
    label: 'Severe Cold',
    aliases: ['severe cold', 'very cold', 'harsh winter', '\u4e25\u5bd2'],
    dominantHazards: ['freeze-thaw', 'winter heating peak', 'snow load'],
  },
  {
    key: 'cold',
    label: 'Cold',
    aliases: ['cold zone', 'cold climate', '\u5bd2\u51b7'],
    dominantHazards: ['winter heating demand', 'dry-wet swing'],
  },
  {
    key: 'hot-summer-cold-winter',
    label: 'Hot Summer Cold Winter',
    aliases: ['hscw', 'hot summer cold winter', '\u590f\u70ed\u51ac\u51b7'],
    dominantHazards: ['summer overheating', 'winter discomfort', 'seasonal humidity swing'],
  },
  {
    key: 'hot-summer-warm-winter',
    label: 'Hot Summer Warm Winter',
    aliases: ['hsww', 'hot humid', 'hot summer warm winter', '\u590f\u70ed\u51ac\u6696', '\u708e\u70ed\u6f6e\u6e7f'],
    dominantHazards: ['high humidity', 'typhoon wind', 'driving rain'],
  },
  {
    key: 'mild',
    label: 'Mild',
    aliases: ['mild zone', 'temperate mild', '\u6e29\u548c'],
    dominantHazards: ['rainfall variability', 'diurnal comfort swings'],
  },
]

// NOTE: Only 5 building families are defined; the other 10 buildings map to these
// via the family field in buildingCatalog.ts. This is a simplification — buildings
// like tibetan-stone-house (mapped to diaojiaolou) and jiangnan-water-town-house
// (mapped to weilongwu) have distinct traditions but share some strategies.

// Material cost ranges sourced from:
// - China Construction Material Price Index (2024)
// - Rural self-build cost surveys (800-1500 RMB/m² typical range)
// - Regional construction cost yearbooks (各省工程造价信息)
const BUILDING_PACKS: Record<BuildingFamily, BuildingKnowledgePack> = {
  tulou: {
    family: 'tulou',
    label: 'Tulou-inspired envelope',
    materialRanges: [
      { material: 'Stabilized rammed earth wall', rangeRmbPerM2: '600-950', note: 'High thermal mass and low embodied energy' },
      { material: 'Clay tile roof with membrane', rangeRmbPerM2: '110-220', note: 'Improves rain resilience in humid climates' },
      { material: 'Lime-based breathable finish', rangeRmbPerM2: '70-150', note: 'Moisture buffering for mixed ventilation' },
    ],
    strategyMappings: [
      { traditional: 'Thick earthen wall', modern: 'High-mass insulated hybrid wall', useWhen: 'Cooling-dominant or mixed climates' },
      { traditional: 'Circular courtyard airflow', modern: 'Stack-assisted cross ventilation core', useWhen: 'Need passive cooling and smoke purge path' },
      { traditional: 'Deep eaves', modern: 'Parametric solar-control overhangs', useWhen: 'High summer solar exposure' },
    ],
  },
  siheyuan: {
    family: 'siheyuan',
    label: 'Siheyuan courtyard logic',
    materialRanges: [
      { material: 'Insulated masonry perimeter wall', rangeRmbPerM2: '550-900', note: 'Winter buffering and acoustic stability' },
      { material: 'Low-E glazing (triple where needed)', rangeRmbPerM2: '700-1400', note: 'Seasonal solar gain control' },
      { material: 'Timber-shade gallery system', rangeRmbPerM2: '240-480', note: 'Adaptive shading with outdoor comfort value' },
    ],
    strategyMappings: [
      { traditional: 'South-facing court', modern: 'Solar-oriented massing with seasonal shading', useWhen: 'Heating and daylight optimization' },
      { traditional: 'Layered courtyard thresholds', modern: 'Wind buffering zoning and pressure control', useWhen: 'Strong seasonal winds' },
      { traditional: 'Central open court', modern: 'Mixed-mode thermal reset zone', useWhen: 'Need natural ventilation with social program' },
    ],
  },
  yaodong: {
    family: 'yaodong',
    label: 'Yaodong earth-sheltered model',
    materialRanges: [
      { material: 'Earth-bermed RC shell', rangeRmbPerM2: '880-1300', note: 'Very stable annual thermal response' },
      { material: 'Waterproof drainage composite layer', rangeRmbPerM2: '100-240', note: 'Critical to moisture and durability control' },
      { material: 'Timber/CLT interior liner', rangeRmbPerM2: '380-800', note: 'Improves interior comfort and carbon profile' },
    ],
    strategyMappings: [
      { traditional: 'Subsurface dwelling', modern: 'Partially buried low-load envelope', useWhen: 'Large diurnal temperature swings' },
      { traditional: 'Earth as thermal battery', modern: 'Ground-coupled thermal lag system', useWhen: 'Reduce HVAC peak load' },
      { traditional: 'Narrow openings', modern: 'Controlled aperture with heat-loss mitigation', useWhen: 'Winter-dominant climates' },
    ],
  },
  diaojiaolou: {
    family: 'diaojiaolou',
    label: 'Diaojiaolou elevated frame',
    materialRanges: [
      { material: 'Glulam or steel-timber stilt frame', rangeRmbPerM2: '850-1400', note: 'Flood adaptation and terrain fit' },
      { material: 'Ventilated raised floor assembly', rangeRmbPerM2: '220-420', note: 'Moisture and mold risk reduction' },
      { material: 'Monsoon roof drainage package', rangeRmbPerM2: '80-160', note: 'Downpour management and envelope longevity' },
    ],
    strategyMappings: [
      { traditional: 'Raised building body', modern: 'Flood-safe podium or stilted ground plane', useWhen: 'Flood-prone or high humidity sites' },
      { traditional: 'Timber flexibility', modern: 'Ductile lateral system design', useWhen: 'Seismic or wind-sensitive zones' },
      { traditional: 'Large roof overhang', modern: 'Rain-screen and splash-back control edge', useWhen: 'Frequent heavy rain' },
    ],
  },
  weilongwu: {
    family: 'weilongwu',
    label: 'Weilongwu enclosure strategy',
    materialRanges: [
      { material: 'High-mass masonry shell', rangeRmbPerM2: '580-950', note: 'Heat damping for subtropical climates' },
      { material: 'Courtyard bio-retention layer', rangeRmbPerM2: '160-340', note: 'Cooling and stormwater co-benefits' },
      { material: 'Shaded arcade structure', rangeRmbPerM2: '240-480', note: 'Outdoor comfort and passive circulation' },
    ],
    strategyMappings: [
      { traditional: 'Semi-enclosed plan', modern: 'Heat and wind buffer massing', useWhen: 'Hot-humid sites with seasonal wind' },
      { traditional: 'Central hall airflow', modern: 'Stack-enabled ventilation spine', useWhen: 'Need passive air exchange' },
      { traditional: 'Front pond cooling', modern: 'Blue-green cooling forecourt', useWhen: 'Urban heat and stormwater pressure' },
    ],
  },
}

const LOCAL_COST_FACTORS: CostFactorEntry[] = [
  { city: 'Beijing', aliases: ['beijing', 'capital', '\u5317\u4eac'], climateZone: 'cold', multiplier: 1.12, note: 'Higher labor and compliance overhead' },
  { city: 'Shanghai', aliases: ['shanghai', '\u4e0a\u6d77'], climateZone: 'hot-summer-cold-winter', multiplier: 1.18, note: 'Premium metro procurement profile' },
  { city: 'Shenzhen', aliases: ['shenzhen', '\u6df1\u5733'], climateZone: 'hot-summer-warm-winter', multiplier: 1.2, note: 'High labor intensity and coastal detailing' },
  { city: 'Guangzhou', aliases: ['guangzhou', '\u5e7f\u5dde'], climateZone: 'hot-summer-warm-winter', multiplier: 1.14, note: 'Humidity and corrosion control uplift' },
  { city: 'Chengdu', aliases: ['chengdu', '\u6210\u90fd'], climateZone: 'hot-summer-cold-winter', multiplier: 1.05, note: 'Balanced regional pricing baseline' },
  { city: 'Wuhan', aliases: ['wuhan', '\u6b66\u6c49'], climateZone: 'hot-summer-cold-winter', multiplier: 1.04, note: 'Mixed climate detailing uplift' },
  { city: 'Xi an', aliases: ['xian', 'xi an', '\u897f\u5b89'], climateZone: 'cold', multiplier: 0.98, note: 'Moderate inland cost structure' },
  { city: 'Harbin', aliases: ['harbin', '\u54c8\u5c14\u6ee8'], climateZone: 'severe-cold', multiplier: 1.08, note: 'Cold-weather envelope complexity' },
  { city: 'Kunming', aliases: ['kunming', '\u6606\u660e'], climateZone: 'mild', multiplier: 0.96, note: 'Mild climate and stable supply chain' },
]

const DEFAULT_ZONE_MULTIPLIER: Record<ClimateZoneKey, number> = {
  'severe-cold': 1.1,
  cold: 1.04,
  'hot-summer-cold-winter': 1.06,
  'hot-summer-warm-winter': 1.09,
  mild: 1,
}

const normalize = (value: string): string => value.trim().toLowerCase()

const findCityCostFactor = (raw: string): CostFactorEntry | null => {
  const normalized = normalize(raw)
  if (!normalized) return null

  for (const entry of LOCAL_COST_FACTORS) {
    if (entry.aliases.some(alias => normalized.includes(alias))) {
      return entry
    }
  }

  return null
}

const findClimateZone = (raw: string): ClimateZonePack | null => {
  const normalized = normalize(raw)
  if (!normalized) return null

  for (const zone of CLIMATE_ZONE_PACKS) {
    if (zone.aliases.some(alias => normalized.includes(alias))) {
      return zone
    }
  }

  return null
}

export interface LocalKnowledgePromptContext {
  city: string
  climateZone: string
  buildingType: string
  hasSiteSignal: boolean
  snippet: string
}

export function buildLocalKnowledgePromptContext(params: {
  rawInput: string
  buildingFamily: BuildingFamily
  lang: 'zh' | 'en'
  siteProfile?: {
    city?: string
    climateZone?: string
    buildingType?: string
  }
}): LocalKnowledgePromptContext {
  const { rawInput, buildingFamily, lang, siteProfile } = params

  const mergedText = [
    siteProfile?.city || '',
    siteProfile?.climateZone || '',
    siteProfile?.buildingType || '',
    rawInput,
  ]
    .join(' ')
    .trim()

  const cityFromInput = findCityCostFactor(mergedText)
  const explicitZone = findClimateZone(mergedText)
  const derivedZoneKey = explicitZone?.key || cityFromInput?.climateZone || 'hot-summer-cold-winter'
  const zonePack = CLIMATE_ZONE_PACKS.find(zone => zone.key === derivedZoneKey) || CLIMATE_ZONE_PACKS[2]
  const buildingPack = BUILDING_PACKS[buildingFamily]

  const siteSignalRegex = /(city|province|district|site|location|climate|zone|budget|area|sqm|m2|in\s+|\u57ce\u5e02|\u7701|\u5730\u70b9|\u6c14\u5019|\u6c14\u5019\u533a|\u9884\u7b97|\u9762\u79ef|\u4f4d\u4e8e)/i
  const hasSiteSignal = siteSignalRegex.test(mergedText) || Boolean(cityFromInput)

  const costMultiplier = cityFromInput?.multiplier || DEFAULT_ZONE_MULTIPLIER[zonePack.key]
  const costNote = cityFromInput?.note || `Baseline multiplier for ${zonePack.label}`
  const city = cityFromInput?.city || 'Unspecified'
  const buildingType = siteProfile?.buildingType?.trim() || buildingPack.label

  const materialLines = buildingPack.materialRanges
    .slice(0, 3)
    .map(item => `- ${item.material}: RMB ${item.rangeRmbPerM2}/m2 (${item.note})`)
    .join('\n')

  const mappingLines = buildingPack.strategyMappings
    .slice(0, 3)
    .map(item => `- ${item.traditional} -> ${item.modern} (when: ${item.useWhen})`)
    .join('\n')

  const hazardLine = zonePack.dominantHazards.join(', ')

  const snippet = lang === 'zh'
    ? [
        'Local Knowledge Pack (deterministic baseline):',
        `- City signal: ${city}`,
        `- Climate zone baseline: ${zonePack.label}`,
        `- Building baseline: ${buildingType}`,
        `- Dominant hazards: ${hazardLine}`,
        `- Localized cost factor: x${costMultiplier.toFixed(2)} (${costNote})`,
        'Material ranges:',
        materialLines,
        'Traditional-to-modern mappings:',
        mappingLines,
        'Use this baseline as hard context before drafting recommendations.',
      ].join('\n')
    : [
        'Local Knowledge Pack (deterministic baseline):',
        `- City signal: ${city}`,
        `- Climate zone baseline: ${zonePack.label}`,
        `- Building baseline: ${buildingType}`,
        `- Dominant hazards: ${hazardLine}`,
        `- Localized cost factor: x${costMultiplier.toFixed(2)} (${costNote})`,
        'Material ranges:',
        materialLines,
        'Traditional-to-modern mappings:',
        mappingLines,
        'Use this baseline as hard context before drafting recommendations.',
      ].join('\n')

  return {
    city,
    climateZone: zonePack.label,
    buildingType,
    hasSiteSignal,
    snippet,
  }
}
