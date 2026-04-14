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

const parseSignedNumbers = (value: string): number[] => {
  const matches = value.match(/[-+]?\d+(?:\.\d+)?/g)
  if (!matches) return []
  return matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

const deriveCoolingDeltaFromSummer = (summerDelta: string): number => {
  const values = parseSignedNumbers(summerDelta)
  if (!values.length) return 0

  const negativeMagnitudes = values
    .filter((value) => value < 0)
    .map((value) => Math.abs(value))
  if (negativeMagnitudes.length) {
    return Math.round(Math.max(...negativeMagnitudes))
  }

  return Math.round(Math.max(...values.map((value) => Math.abs(value))))
}

const deriveWinterGainFromDelta = (winterDelta: string): number => {
  if (/not directly measured/i.test(winterDelta)) return 0
  const values = parseSignedNumbers(winterDelta)
  if (!values.length) return 0

  const positives = values.filter((value) => value > 0)
  if (positives.length) {
    return Math.round(Math.max(...positives))
  }

  return Math.round(Math.max(...values.map((value) => Math.abs(value))))
}

type RankedResearchEntry = {
  entry: New10ResearchEntry
  summerCooling: number
  winterGain: number
  dataScore: number
}

const buildRankedResearchRows = (): RankedResearchEntry[] => {
  const rawRows = NEW10_RESEARCH_DATA.buildings.map((entry) => ({
    entry,
    summerCooling: deriveCoolingDeltaFromSummer(entry.summerDelta),
    winterGain: deriveWinterGainFromDelta(entry.winterDelta),
  }))

  const maxSummerCooling = Math.max(...rawRows.map((row) => row.summerCooling), 1)
  const maxWinterGain = Math.max(...rawRows.map((row) => row.winterGain), 1)

  return rawRows
    .map((row) => {
      const normalizedSummer = (row.summerCooling / maxSummerCooling) * 5
      const normalizedWinter = (row.winterGain / maxWinterGain) * 5
      const dataScore =
        row.entry.climateFitStars * 0.4 +
        row.entry.carbonEfficiencyStars * 0.35 +
        normalizedSummer * 0.2 +
        normalizedWinter * 0.05
      return { ...row, dataScore }
    })
    .sort((a, b) => b.dataScore - a.dataScore)
}

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

export const buildNew10ResearchPortfolioContext = (params: {
  text: string
  lang: 'zh' | 'en'
  siteProfile?: {
    city?: string
    climateZone?: string
    buildingType?: string
  }
}): string => {
  const { text, lang, siteProfile } = params
  const rankedRows = buildRankedResearchRows()
  if (!rankedRows.length) return ''

  const queryContext = [
    text,
    siteProfile?.city || '',
    siteProfile?.climateZone || '',
    siteProfile?.buildingType || '',
  ]
    .filter(Boolean)
    .join(' ')

  const matchedEntry = detectNew10ResearchEntry(queryContext)
  const top5Lines = rankedRows
    .slice(0, 5)
    .map((row, index) => {
      const { entry } = row
      return `${index + 1}) ${entry.name} | ${entry.koppen} | climate ${entry.climateFitStars}/5 | carbon ${entry.carbonEfficiencyStars}/5 | summer ${entry.summerDelta}`
    })
    .join('\n')

  const all15Lines = rankedRows
    .map((row, index) => {
      const { entry } = row
      return `${index + 1}. ${entry.name} (${entry.id}) | region: ${entry.region} | zone: ${entry.chineseClimateZone} | climate ${entry.climateFitStars}/5 | carbon ${entry.carbonEfficiencyStars}/5 | summer ${entry.summerDelta} | winter ${entry.winterDelta}`
    })
    .join('\n')

  if (lang === 'zh') {
    const focusLine = matchedEntry
      ? `匹配建筑焦点: ${matchedEntry.name}（${matchedEntry.koppen} / ${matchedEntry.chineseClimateZone}）`
      : '匹配建筑焦点: 当前问题未直接命中单一建筑，请优先做跨类型比较。'

    return [
      '15类传统建筑研究组合上下文（用于咨询与推荐）:',
      `用户场地线索: 城市=${siteProfile?.city || '未提供'} | 气候区=${siteProfile?.climateZone || '未提供'} | 建筑类型=${siteProfile?.buildingType || '未提供'}`,
      focusLine,
      '数据驱动 Top 5（基于气候适配、碳效率、夏季降温、冬季增温综合得分）:',
      top5Lines,
      '全量15类建筑概览（请先比较，再推荐）:',
      all15Lines,
      '回答要求: 至少比较3个候选建筑，并明确给出“推荐理由 + 风险限制 + 适用气候区 + 可落地现代改造策略”。',
      '若用户提出新建方案，请先从上述15类中筛选最接近的2-3类，再给出混合策略。',
    ].join('\n')
  }

  const focusLine = matchedEntry
    ? `Focus building match: ${matchedEntry.name} (${matchedEntry.koppen} / ${matchedEntry.chineseClimateZone})`
    : 'Focus building match: No direct single-building match; prioritize cross-type comparison.'

  return [
    '15-building research portfolio context (for consultation and recommendations):',
    `User site signal: city=${siteProfile?.city || 'n/a'} | climateZone=${siteProfile?.climateZone || 'n/a'} | buildingType=${siteProfile?.buildingType || 'n/a'}`,
    focusLine,
    'Data-driven Top 5 (combined score from climate fit, carbon efficiency, summer cooling, winter gain):',
    top5Lines,
    'All 15 building profiles (compare first, then recommend):',
    all15Lines,
    'Response requirement: compare at least 3 candidates and explicitly provide recommendation rationale, risk limitations, suitable climate zone, and modern implementation strategy.',
    'For new-building requests, first shortlist the closest 2-3 typologies from these 15, then propose a hybrid strategy.',
  ].join('\n')
}
