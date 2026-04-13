export type BuildingFamily = 'tulou' | 'siheyuan' | 'yaodong' | 'diaojiaolou' | 'weilongwu'

export interface CarbonProfile {
  embodiedBaseline: number
  embodiedAdaptive: number
  embodiedSaved: number
  embodiedSavedPct: number
  annualOperationalBaseline: number
  annualOperationalAdaptive: number
  annualOperationalSaved: number
  annualOperationalSavedPct: number
}

export interface CostSummary {
  materials: number
  labor: number
  engineering: number
  total: number
}

export const parseAreaFromText = (raw: string): number => {
  const value = Number(raw.replace(/,/g, '').match(/\d+(\.\d+)?/)?.[0] || 0)
  if (!value) return 1000
  if (/ha|hectare/i.test(raw)) return value * 10000
  return value
}

export const inferBuildingFamily = (value: string): BuildingFamily => {
  const v = value.toLowerCase()
  if (v.includes('土楼') || v.includes('tulou')) return 'tulou'
  if (v.includes('四合院') || v.includes('siheyuan')) return 'siheyuan'
  if (v.includes('窑洞') || v.includes('yaodong')) return 'yaodong'
  if (v.includes('吊脚楼') || v.includes('diaojiaolou')) return 'diaojiaolou'
  if (v.includes('围龙屋') || v.includes('weilongwu')) return 'weilongwu'
  if (v.includes('huizhou') || v.includes('徽州') || v.includes('northern rural') || v.includes('北方农村') || v.includes('northeast manor') || v.includes('东北庄园')) return 'siheyuan'
  if (v.includes('jiangnan') || v.includes('水乡') || v.includes('lingnan') || v.includes('岭南')) return 'weilongwu'
  if (v.includes('northwest adobe') || v.includes('土坯') || v.includes('uyghur') || v.includes('xinjiang') || v.includes('新疆')) return 'yaodong'
  if (v.includes('sichuan folk') || v.includes('bashu') || v.includes('巴蜀') || v.includes('tibetan') || v.includes('藏式石屋') || v.includes('yi & bai') || v.includes('彝') || v.includes('白族')) return 'diaojiaolou'
  return 'siheyuan'
}

const clampFactor = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max)

export const computeCarbonProfile = (
  areaM2: number,
  buildingFamilyOrEmbodiedReduction: BuildingFamily | number,
  operationalReductionInput?: number
): CarbonProfile => {
  const embodiedBaselineFactor = 520
  const embodiedReductionMap: Record<BuildingFamily, number> = {
    tulou: 0.26,
    siheyuan: 0.21,
    yaodong: 0.31,
    diaojiaolou: 0.28,
    weilongwu: 0.23,
  }
  const operationalBaselineFactor = 68
  const operationalReductionMap: Record<BuildingFamily, number> = {
    tulou: 0.24,
    siheyuan: 0.2,
    yaodong: 0.34,
    diaojiaolou: 0.27,
    weilongwu: 0.22,
  }

  const embodiedReduction = typeof buildingFamilyOrEmbodiedReduction === 'number'
    ? clampFactor(buildingFamilyOrEmbodiedReduction, 0.05, 0.6)
    : embodiedReductionMap[buildingFamilyOrEmbodiedReduction]
  const operationalReduction = typeof buildingFamilyOrEmbodiedReduction === 'number'
    ? clampFactor(operationalReductionInput ?? buildingFamilyOrEmbodiedReduction, 0.05, 0.6)
    : operationalReductionMap[buildingFamilyOrEmbodiedReduction]

  const embodiedBaseline = Math.round((areaM2 * embodiedBaselineFactor) / 1000)
  const embodiedSaved = Math.round(embodiedBaseline * embodiedReduction)
  const embodiedAdaptive = embodiedBaseline - embodiedSaved

  const annualOperationalBaseline = Math.round((areaM2 * operationalBaselineFactor) / 1000)
  const annualOperationalSaved = Math.round(annualOperationalBaseline * operationalReduction)
  const annualOperationalAdaptive = annualOperationalBaseline - annualOperationalSaved

  return {
    embodiedBaseline,
    embodiedAdaptive,
    embodiedSaved,
    embodiedSavedPct: Math.round((embodiedSaved / Math.max(embodiedBaseline, 1)) * 100),
    annualOperationalBaseline,
    annualOperationalAdaptive,
    annualOperationalSaved,
    annualOperationalSavedPct: Math.round((annualOperationalSaved / Math.max(annualOperationalBaseline, 1)) * 100),
  }
}

export const computeCostSummary = (areaM2: number, multiplier = 1): CostSummary => {
  const safeMultiplier = clampFactor(multiplier, 0.7, 1.8)
  const materials = Math.round(areaM2 * 650 * safeMultiplier)
  const labor = Math.round(areaM2 * 400 * safeMultiplier)
  const engineering = Math.round(areaM2 * 80 * safeMultiplier)
  return {
    materials,
    labor,
    engineering,
    total: materials + labor + engineering,
  }
}
