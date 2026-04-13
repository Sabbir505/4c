import rawData from './new10ResearchData.json'

export interface New10ResearchEntry {
  id:
    | 'tulou'
    | 'siheyuan'
    | 'yaodong'
    | 'diaojiaolou'
    | 'weilongwu'
    | 'huizhou-residence'
    | 'jiangnan-water-town-house'
    | 'beijing-northern-rural-house'
    | 'northwest-adobe-house'
    | 'lingnan-residence'
    | 'sichuan-folk-house'
    | 'xinjiang-uyghur-flat-roof-house'
    | 'tibetan-stone-house'
    | 'yi-bai-traditional-houses'
    | 'northeast-manor-house'
  name: string
  region: string
  koppen: string
  chineseClimateZone: string
  avgAnnualTemp: string
  summerAvg: string
  winterAvg: string
  annualRainfall: string
  relativeHumidity: string
  solarRadiation: string
  windPatterns: string
  primaryStrategy: string
  secondaryStrategy: string
  summerDelta: string
  winterDelta: string
  keyMeasurementSource: string
  climateFitStars: number
  carbonEfficiencyStars: number
  overallRank: number
  overallSummary: string
  keyLimitation: string
}

interface New10ResearchPayload {
  source: {
    document: string
    generatedDate: string
    scope: string
  }
  buildings: New10ResearchEntry[]
}

export const NEW10_RESEARCH_DATA = rawData as New10ResearchPayload

export const NEW10_RESEARCH_BY_ID: Partial<Record<string, New10ResearchEntry>> =
  NEW10_RESEARCH_DATA.buildings.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {} as Partial<Record<string, New10ResearchEntry>>)

const RESEARCH_ALIASES: Array<{ id: New10ResearchEntry['id']; aliases: string[] }> = [
  { id: 'tulou', aliases: ['tulou', 'fujian tulou', '土楼', '福建土楼'] },
  { id: 'siheyuan', aliases: ['siheyuan', 'beijing siheyuan', '四合院', '北京四合院'] },
  { id: 'yaodong', aliases: ['shaanbei yaodong', 'yaodong cave', '窑洞', '陕北窑洞'] },
  { id: 'diaojiaolou', aliases: ['diaojiaolou', '吊脚楼', '西南吊脚楼'] },
  { id: 'weilongwu', aliases: ['weilongwu', 'hakka weilongwu', '围龙屋', '客家围龙屋'] },
  { id: 'huizhou-residence', aliases: ['huizhou', 'wan architecture', '徽州'] },
  { id: 'jiangnan-water-town-house', aliases: ['jiangnan water', 'water town', '江南', '水乡'] },
  { id: 'beijing-northern-rural-house', aliases: ['beijing northern rural', 'north china rural', '北京北方农村'] },
  { id: 'northwest-adobe-house', aliases: ['northwest adobe', 'loess', '西北土坯'] },
  { id: 'lingnan-residence', aliases: ['lingnan', 'cantonese architecture', '岭南'] },
  { id: 'sichuan-folk-house', aliases: ['sichuan folk', 'bashu', '巴蜀', '四川民居'] },
  { id: 'xinjiang-uyghur-flat-roof-house', aliases: ['uyghur flat roof', 'xinjiang flat roof', '维吾尔', '新疆平顶'] },
  { id: 'tibetan-stone-house', aliases: ['tibetan stone', 'plateau stone', '藏式石屋', 'tibetan house'] },
  { id: 'yi-bai-traditional-houses', aliases: ['yi and bai', 'yi & bai', 'bai house', '白族', '彝族'] },
  { id: 'northeast-manor-house', aliases: ['northeast manor', 'manchu manor', 'manchu dwelling', '东北庄园', '满族'] },
]

const normalizeText = (value: string) => value.trim().toLowerCase()

export const detectNew10ResearchEntry = (text: string): New10ResearchEntry | null => {
  const normalized = normalizeText(text)
  if (!normalized) return null

  for (const group of RESEARCH_ALIASES) {
    if (group.aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      const match = NEW10_RESEARCH_BY_ID[group.id]
      if (match) return match
    }
  }

  return null
}

export const buildNew10ResearchPromptContext = (text: string, lang: 'zh' | 'en'): string => {
  const match = detectNew10ResearchEntry(text)
  if (!match) return ''

  if (lang === 'zh') {
    return [
      '文档提取研究上下文（15类建筑）:',
      `- 建筑: ${match.name}`,
      `- 排名: #${match.overallRank}`,
      `- 气候分类: ${match.koppen} / ${match.chineseClimateZone}`,
      `- 核心策略: ${match.primaryStrategy}`,
      `- 次级策略: ${match.secondaryStrategy}`,
      `- 夏季温差: ${match.summerDelta}`,
      `- 冬季温差: ${match.winterDelta}`,
      `- 证据来源: ${match.keyMeasurementSource}`,
      `- 关键限制: ${match.keyLimitation}`,
      '请优先引用这些提取数据，再补充推理。',
    ].join('\n')
  }

  return [
    'Extracted research context (all 15 building types):',
    `- Building: ${match.name}`,
    `- Rank: #${match.overallRank}`,
    `- Climate: ${match.koppen} / ${match.chineseClimateZone}`,
    `- Primary strategy: ${match.primaryStrategy}`,
    `- Secondary strategy: ${match.secondaryStrategy}`,
    `- Summer delta: ${match.summerDelta}`,
    `- Winter delta: ${match.winterDelta}`,
    `- Source evidence: ${match.keyMeasurementSource}`,
    `- Limitation: ${match.keyLimitation}`,
    'Prioritize these extracted values before adding general assumptions.',
  ].join('\n')
}
