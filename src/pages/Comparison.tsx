import { useState, useEffect, useRef } from 'react'
import { Loader2, GitCompare, Sparkles, TrendingUp, CheckCircle2, XCircle, Layers, BarChart2, Trophy, Scale } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import ModelViewer from '../components/ModelViewer'
import { chatWithAI } from '../services/aiService'
import { buildingIcons } from '../data/buildings'
import ReactMarkdown from 'react-markdown'
import { BUILDING_PROFILES } from '../data/buildingCatalog'
import { NEW10_RESEARCH_BY_ID } from '../data/new10ResearchData'
import { MATERIAL_COMPARISON_BY_ID, MATERIAL_COMPARISON_SOURCES } from '../data/materialComparisons'
import type { BuildingId } from '../data/buildings'

const BUILDING_IDS = BUILDING_PROFILES.map((b) => b.id) as BuildingId[]

// Per-building feature and performance data (no longer grouped by family).
// Each of the 15 buildings has its own accurate profile.
// Sources: new10ResearchData.json, CABEE 2024, academic thermal studies.

const FEATURE_BY_ID: Record<string, {
  wallThickness: string
  circularLayout: string
  courtyardDesign: string
  naturalVentilation: string
  floodDesign: string
}> = {
  tulou:                    { wallThickness: '1-2m ✓', circularLayout: '✓', courtyardDesign: 'Central Skywell', naturalVentilation: '✓', floodDesign: 'High Base' },
  siheyuan:                { wallThickness: '0.4-0.6m', circularLayout: '✗', courtyardDesign: '✓', naturalVentilation: '✓', floodDesign: '✗' },
  yaodong:                  { wallThickness: 'Earth berm', circularLayout: '✗', courtyardDesign: '✗', naturalVentilation: 'Limited', floodDesign: '✗' },
  diaojiaolou:              { wallThickness: 'Timber frame', circularLayout: '✗', courtyardDesign: '✗', naturalVentilation: '✓✓', floodDesign: '✓✓' },
  weilongwu:                { wallThickness: '0.5-1m', circularLayout: 'Semi-circular', courtyardDesign: '✓', naturalVentilation: '✓', floodDesign: '✓' },
  'huizhou-residence':      { wallThickness: '0.4-0.6m', circularLayout: '✗', courtyardDesign: 'Skywell ✓', naturalVentilation: '✓', floodDesign: '✗' },
  'jiangnan-water-town-house': { wallThickness: '0.3-0.5m', circularLayout: '✗', courtyardDesign: 'Skywell ✓', naturalVentilation: '✓✓', floodDesign: '✓' },
  'beijing-northern-rural-house': { wallThickness: '0.4-0.6m', circularLayout: '✗', courtyardDesign: '✓', naturalVentilation: '✓', floodDesign: '✗' },
  'northwest-adobe-house':  { wallThickness: '0.6-1m adobe', circularLayout: '✗', courtyardDesign: '✗', naturalVentilation: 'Limited', floodDesign: '✗' },
  'lingnan-residence':      { wallThickness: '0.4-0.8m', circularLayout: '✗', courtyardDesign: 'Cold alley ✓', naturalVentilation: '✓✓', floodDesign: '✓' },
  'sichuan-folk-house':     { wallThickness: '0.3-0.5m', circularLayout: '✗', courtyardDesign: 'Open hall ✓', naturalVentilation: '✓', floodDesign: '✓' },
  'xinjiang-uyghur-flat-roof-house': { wallThickness: '0.5-0.8m adobe', circularLayout: '✗', courtyardDesign: 'Enclosed ✓', naturalVentilation: 'Limited', floodDesign: '✗' },
  'tibetan-stone-house':    { wallThickness: '0.6-1.2m stone', circularLayout: '✗', courtyardDesign: '✗', naturalVentilation: 'Limited', floodDesign: '✗' },
  'yi-bai-traditional-houses': { wallThickness: '0.3-0.5m', circularLayout: '✗', courtyardDesign: 'Screen wall ✓', naturalVentilation: '✓', floodDesign: '✓' },
  'northeast-manor-house':  { wallThickness: '0.5-0.8m log/earth', circularLayout: '✗', courtyardDesign: '✓', naturalVentilation: '✓', floodDesign: '✗' },
}

const PERFORMANCE_BY_ID: Record<string, { tempRegulation: number; humidityControl: number; energyEfficiency: number }> = {
  tulou:                    { tempRegulation: 85, humidityControl: 90, energyEfficiency: 88 },
  siheyuan:                { tempRegulation: 78, humidityControl: 65, energyEfficiency: 75 },
  yaodong:                  { tempRegulation: 92, humidityControl: 60, energyEfficiency: 95 },
  diaojiaolou:              { tempRegulation: 70, humidityControl: 85, energyEfficiency: 72 },
  weilongwu:                { tempRegulation: 80, humidityControl: 82, energyEfficiency: 78 },
  'huizhou-residence':      { tempRegulation: 72, humidityControl: 75, energyEfficiency: 70 },
  'jiangnan-water-town-house': { tempRegulation: 68, humidityControl: 78, energyEfficiency: 65 },
  'beijing-northern-rural-house': { tempRegulation: 76, humidityControl: 62, energyEfficiency: 73 },
  'northwest-adobe-house':  { tempRegulation: 88, humidityControl: 55, energyEfficiency: 90 },
  'lingnan-residence':      { tempRegulation: 82, humidityControl: 88, energyEfficiency: 80 },
  'sichuan-folk-house':     { tempRegulation: 68, humidityControl: 72, energyEfficiency: 65 },
  'xinjiang-uyghur-flat-roof-house': { tempRegulation: 90, humidityControl: 50, energyEfficiency: 92 },
  'tibetan-stone-house':    { tempRegulation: 84, humidityControl: 55, energyEfficiency: 86 },
  'yi-bai-traditional-houses': { tempRegulation: 75, humidityControl: 70, energyEfficiency: 72 },
  'northeast-manor-house':  { tempRegulation: 74, humidityControl: 60, energyEfficiency: 70 },
}

const SCORE_BY_ID: Record<string, { cost: number; carbon: number; thermal: number; resilience: number; constructability: number }> = {
  tulou:                    { cost: 70, carbon: 82, thermal: 84, resilience: 88, constructability: 68 },
  siheyuan:                { cost: 76, carbon: 73, thermal: 80, resilience: 70, constructability: 85 },
  yaodong:                  { cost: 74, carbon: 90, thermal: 94, resilience: 67, constructability: 62 },
  diaojiaolou:              { cost: 66, carbon: 78, thermal: 71, resilience: 89, constructability: 72 },
  weilongwu:                { cost: 72, carbon: 76, thermal: 79, resilience: 82, constructability: 80 },
  'huizhou-residence':      { cost: 74, carbon: 72, thermal: 70, resilience: 68, constructability: 82 },
  'jiangnan-water-town-house': { cost: 78, carbon: 68, thermal: 65, resilience: 72, constructability: 84 },
  'beijing-northern-rural-house': { cost: 80, carbon: 70, thermal: 74, resilience: 66, constructability: 88 },
  'northwest-adobe-house':  { cost: 76, carbon: 88, thermal: 88, resilience: 60, constructability: 65 },
  'lingnan-residence':      { cost: 70, carbon: 74, thermal: 80, resilience: 84, constructability: 78 },
  'sichuan-folk-house':     { cost: 68, carbon: 70, thermal: 66, resilience: 76, constructability: 80 },
  'xinjiang-uyghur-flat-roof-house': { cost: 72, carbon: 88, thermal: 90, resilience: 58, constructability: 64 },
  'tibetan-stone-house':    { cost: 70, carbon: 84, thermal: 82, resilience: 72, constructability: 60 },
  'yi-bai-traditional-houses': { cost: 74, carbon: 78, thermal: 74, resilience: 70, constructability: 76 },
  'northeast-manor-house':  { cost: 78, carbon: 68, thermal: 72, resilience: 64, constructability: 82 },
}

const parseRangeAverage = (value: string): number => {
  const numbers = value.match(/\d+(?:\.\d+)?/g)
  if (!numbers || numbers.length < 2) return 0
  const min = Number(numbers[0])
  const max = Number(numbers[1])
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0
  return (min + max) / 2
}

const Comparison = () => {
  const { t, lang } = useLanguage()
  const [buildingA, setBuildingA] = useState<BuildingId>('tulou')
  const [buildingB, setBuildingB] = useState<BuildingId>('yaodong')
  const [buildingC, setBuildingC] = useState<BuildingId>('siheyuan')
  const [comparisonMode, setComparisonMode] = useState<2 | 3>(2)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isScoreInfoOpen, setIsScoreInfoOpen] = useState(false)
  const scoreInfoRef = useRef<HTMLDivElement | null>(null)

  // Trigger entrance animations
  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const featureRows = [
    { key: 'wallThickness', name: t('compare.wallThickness') },
    { key: 'circularLayout', name: t('compare.circularLayout') },
    { key: 'courtyardDesign', name: t('compare.courtyardDesign') },
    { key: 'naturalVentilation', name: t('compare.naturalVentilation') },
    { key: 'floodDesign', name: t('compare.floodDesign') },
  ]

  const performanceRows = [
    { key: 'tempRegulation', name: t('compare.tempRegulation') },
    { key: 'humidityControl', name: t('compare.humidityControl') },
    { key: 'energyEfficiency', name: t('compare.energyEfficiency') },
  ]

  const buildings = BUILDING_PROFILES.map((b) => ({
    ...b,
    name: lang === 'zh' ? b.nameZh : b.nameEn,
    region: lang === 'zh' ? b.regionZh : b.regionEn,
    climate: lang === 'zh' ? b.climateZh : b.climateEn,
    climateEn: b.climateEn,
  }))

  const getFeatureValue = (featureKey: string, id: BuildingId): string => {
    const features = FEATURE_BY_ID[id]
    if (!features) return '—'
    const value = features[featureKey as keyof typeof features]
    if (lang === 'zh') {
      if (value === 'Earth berm') return '土层覆盖'
      if (value === 'Timber frame') return '木结构'
      if (value === 'Semi-circular') return '半圆形'
      if (value === 'Central Skywell') return '中央天井'
      if (value === 'Skywell ✓') return '天井 ✓'
      if (value === 'Cold alley ✓') return '冷巷 ✓'
      if (value === 'Open hall ✓') return '敞厅 ✓'
      if (value === 'Screen wall ✓') return '照壁 ✓'
      if (value === 'Enclosed ✓') return '封闭院落 ✓'
      if (value === 'Limited') return '有限'
      if (value === 'High Base') return '高基座'
      if (String(value).includes('adobe')) return String(value).replace('adobe', '土坯')
      if (String(value).includes('stone')) return String(value).replace('stone', '石墙')
      if (String(value).includes('log/earth')) return String(value).replace('log/earth', '木/土')
    }
    return String(value)
  }

  const getPerformanceValue = (metricKey: string, id: BuildingId): number => {
    const perf = PERFORMANCE_BY_ID[id]
    if (!perf) return 0
    return perf[metricKey as keyof typeof perf]
  }
  const dataA = buildings.find(b => b.id === buildingA)!
  const dataB = buildings.find(b => b.id === buildingB)!
  const dataC = buildings.find(b => b.id === buildingC)!

  const pickDistinctFallback = (excluded: BuildingId[]): BuildingId => {
    return BUILDING_IDS.find((id) => !excluded.includes(id)) || BUILDING_IDS[0]
  }

  const handleSelectBuilding = (slot: 'A' | 'B' | 'C', nextId: BuildingId) => {
    let nextA = buildingA
    let nextB = buildingB
    let nextC = buildingC

    if (slot === 'A') {
      if (nextId === buildingB) nextB = buildingA
      if (comparisonMode === 3 && nextId === buildingC) nextC = buildingA
      nextA = nextId
    }

    if (slot === 'B') {
      if (nextId === buildingA) nextA = buildingB
      if (comparisonMode === 3 && nextId === buildingC) nextC = buildingB
      nextB = nextId
    }

    if (slot === 'C') {
      if (nextId === buildingA) nextA = buildingC
      if (nextId === buildingB) nextB = buildingC
      nextC = nextId
    }

    setBuildingA(nextA)
    setBuildingB(nextB)
    setBuildingC(nextC)
  }

  const scoringMatrix: Record<string, { cost: number; carbon: number; thermal: number; resilience: number; constructability: number }> = SCORE_BY_ID

  const selectedIds: BuildingId[] = comparisonMode === 3 ? [buildingA, buildingB, buildingC] : [buildingA, buildingB]
  const selectedUniqueIds = Array.from(new Set(selectedIds))
  const selectedScoreRows = selectedUniqueIds.map((id) => {
    const b = buildings.find(item => item.id === id)!
    const score = scoringMatrix[id]
    const total = Math.round(score.cost * 0.2 + score.carbon * 0.25 + score.thermal * 0.2 + score.resilience * 0.2 + score.constructability * 0.15)
    return { ...b, ...score, total }
  }).sort((a, b) => b.total - a.total)

  const selectedMaterialRows = selectedUniqueIds
    .map((id) => {
      const building = buildings.find((item) => item.id === id)
      const material = MATERIAL_COMPARISON_BY_ID[id]
      if (!building || !material) return null

      const traditionalCarbonAvg = parseRangeAverage(material.traditionalEmbodiedCarbonRange)
      const modernCarbonAvg = parseRangeAverage(material.modernEmbodiedCarbonRange)
      const carbonReductionPct = modernCarbonAvg > 0
        ? Math.round(((modernCarbonAvg - traditionalCarbonAvg) / modernCarbonAvg) * 100)
        : 0

      return {
        id,
        building,
        material,
        carbonReductionPct,
      }
    })
    .filter((row): row is {
      id: BuildingId
      building: typeof buildings[number]
      material: typeof MATERIAL_COMPARISON_BY_ID[BuildingId]
      carbonReductionPct: number
    } => row !== null)

  const materialSources = Array.from(new Set(selectedMaterialRows.flatMap((row) => row.material.sourceIds)))
    .map((sourceId) => MATERIAL_COMPARISON_SOURCES[sourceId])
    .filter((source): source is (typeof MATERIAL_COMPARISON_SOURCES)[keyof typeof MATERIAL_COMPARISON_SOURCES] => Boolean(source))

  const topScore = selectedScoreRows[0]?.total ?? 0
  const topWinners = selectedScoreRows.filter((row) => row.total === topScore)
  const winner = topWinners[0]
  const hasTieWinner = topWinners.length > 1
  const scoringHelpText = lang === 'zh'
    ? '评分范围为 0-100，分数越高越优。\n总分计算：\n总分 = 成本×20% + 碳×25% + 热舒适×20% + 韧性×20% + 可建造性×15%（四舍五入）。\n\n维度含义：\n- 成本：经济可行性（越高表示越具成本优势）\n- 碳：低碳表现\n- 热舒适：温度调节能力\n- 韧性：对极端气候的适应能力\n- 可建造性：施工落地难度与成熟度'
    : 'Scores are on a 0-100 scale, where higher is better.\nTotal formula:\nTotal = Cost×20% + Carbon×25% + Thermal×20% + Resilience×20% + Constructability×15% (rounded).\n\nDimension meanings:\n- Cost: economic feasibility (higher means more cost-effective)\n- Carbon: low-carbon performance\n- Thermal: indoor thermal comfort/regulation\n- Resilience: adaptation to extreme climate conditions\n- Constructability: practicality and maturity for implementation'

  const generateSummary = async () => {
    setLoadingSummary(true)
    setAiSummary(null)
    try {
      const prompt = lang === 'zh' 
        ? `用一句话比较${dataA.name}和${dataB.name}的气候适应特点，突出各自的优势。`
        : `Compare ${dataA.nameEn} and ${dataB.nameEn} climate adaptations in one sentence, highlighting each building's strength.`
      const result = await chatWithAI(prompt, [])
      setAiSummary(result)
    } catch {
      setAiSummary(lang === 'zh' ? '无法生成对比摘要' : 'Could not generate comparison summary')
    } finally {
      setLoadingSummary(false)
    }
  }

  // Reset AI summary when buildings change
  useEffect(() => {
    setAiSummary(null)
  }, [buildingA, buildingB])

  useEffect(() => {
    if (comparisonMode !== 3) return
    if (buildingC !== buildingA && buildingC !== buildingB) return
    setBuildingC(pickDistinctFallback([buildingA, buildingB]))
  }, [comparisonMode, buildingA, buildingB, buildingC])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!scoreInfoRef.current) return
      if (!scoreInfoRef.current.contains(event.target as Node)) {
        setIsScoreInfoOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsScoreInfoOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 shine-sweep"
            style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
          >
            <GitCompare size={14} className="animate-pulse" />
            {lang === 'zh' ? '建筑对比' : 'Building Comparison'}
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            {t('compare.title')}
          </h1>
        </div>

        {/* Building Selection */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-5 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'var(--gradient-brand)' }}
            >
              VS
            </div>
            {t('compare.select')}
          </h2>

          <div className="mb-4 flex items-center gap-2">
            {[2, 3].map((mode) => (
              <button
                key={mode}
                onClick={() => setComparisonMode(mode as 2 | 3)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: comparisonMode === mode ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: comparisonMode === mode ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {mode === 2
                  ? (lang === 'zh' ? '2 方案对比' : '2-Option Mode')
                  : (lang === 'zh' ? '3 方案对比' : '3-Option Mode')}
              </button>
            ))}
          </div>
          
          <div className={`grid gap-6 ${comparisonMode === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {[
              { label: t('compare.buildingA'), value: buildingA, slot: 'A' as const, data: dataA },
              { label: t('compare.buildingB'), value: buildingB, slot: 'B' as const, data: dataB },
              ...(comparisonMode === 3
                ? [{
                    label: lang === 'zh' ? '建筑 C' : 'Building C',
                    value: buildingC,
                    slot: 'C' as const,
                    data: buildings.find(b => b.id === buildingC)!,
                  }]
                : [])
            ].map((item, idx) => {
              const IconComponent = buildingIcons[item.value].icon
              const iconGradient = buildingIcons[item.value].gradient
              
              return (
                <div key={idx} className="space-y-3">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item.label}
                  </label>
                  <div className="relative">
                    <div 
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center z-10 pointer-events-none"
                      style={{ background: iconGradient }}
                    >
                      <IconComponent size={20} className="text-white" strokeWidth={1.5} />
                    </div>
                    <select 
                      value={item.value} 
                      onChange={(e) => handleSelectBuilding(item.slot, e.target.value as BuildingId)}
                      className="w-full py-4 pr-10 rounded-xl text-base font-medium transition-all focus:outline-none appearance-none cursor-pointer"
                      style={{ 
                        paddingLeft: '72px',
                        border: '2px solid var(--border-default)', 
                        backgroundColor: 'var(--surface-card)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      {buildings.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.nameEn})</option>
                      ))}
                    </select>
                    <div 
                      className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                    style={{ background: iconGradient }}
                  >
                    <Sparkles size={14} />
                    {lang === 'zh' ? item.data.climate : item.data.climateEn}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Decision Comparison Mode */}
        <div className={`modern-card relative z-40 overflow-visible rounded-2xl p-6 mb-6 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap overflow-visible">
            <div className="flex items-center gap-2">
              <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <div className="w-1 h-5 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
                <Scale size={18} style={{ color: 'var(--brand-primary)' }} />
                {lang === 'zh' ? '方案评估面板' : 'Comparison Decision Panel'}
              </h2>
              <div className="relative" ref={scoreInfoRef}>
                <button
                  type="button"
                  onClick={() => setIsScoreInfoOpen((prev) => !prev)}
                  aria-label={lang === 'zh' ? '查看评分计算说明' : 'View scoring calculation details'}
                  aria-expanded={isScoreInfoOpen}
                  aria-haspopup="dialog"
                  className="w-5 h-5 rounded-full text-[11px] font-bold inline-flex items-center justify-center transition-colors"
                  style={{
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  !
                </button>
                <div
                  role="dialog"
                  aria-label={lang === 'zh' ? '评分说明' : 'Scoring explanation'}
                  className={`absolute right-0 sm:left-0 sm:right-auto top-full mt-2 p-3 rounded-lg text-xs leading-relaxed z-200 transition-all ${isScoreInfoOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'}`}
                  style={{
                    width: 'min(92vw, 420px)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 8px 30px var(--shadow-color)',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {scoringHelpText}
                </div>
              </div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '维度: 成本/碳/热舒适/韧性/可建造性' : 'Axes: Cost/Carbon/Thermal/Resilience/Constructability'}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <table className="w-full text-xs md:text-sm" style={{ backgroundColor: 'var(--surface-card)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <th className="p-3 text-left" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '方案' : 'Option'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '成本' : 'Cost'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '碳' : 'Carbon'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '热舒适' : 'Thermal'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '韧性' : 'Resilience'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '可建造性' : 'Construct.'}</th>
                    <th className="p-3 text-center" style={{ color: 'var(--text-secondary)' }}>{lang === 'zh' ? '总分' : 'Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedScoreRows.map((row, idx) => (
                    <tr key={row.id} style={{ borderTop: '1px solid var(--border-light)', backgroundColor: idx % 2 === 0 ? 'var(--surface-card)' : 'var(--bg-secondary)' }}>
                      <td className="p-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.name}</td>
                      <td className="p-3 text-center">{row.cost}%</td>
                      <td className="p-3 text-center">{row.carbon}%</td>
                      <td className="p-3 text-center">{row.thermal}%</td>
                      <td className="p-3 text-center">{row.resilience}%</td>
                      <td className="p-3 text-center">{row.constructability}%</td>
                      <td className="p-3 text-center font-bold" style={{ color: idx === 0 ? 'var(--temp-cool)' : 'var(--text-primary)' }}>{row.total}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                <Trophy size={16} style={{ color: 'var(--temp-cool)' }} />
                <span className="font-bold">{lang === 'zh' ? '推荐方案' : 'Recommended Result'}</span>
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: 'var(--temp-cool)' }}>
                {hasTieWinner
                  ? topWinners.map((row) => row.name).join(lang === 'zh' ? ' / ' : ' / ')
                  : winner?.name}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {hasTieWinner
                  ? (lang === 'zh'
                    ? `当前有并列最高分（${topScore}%），建议结合项目优先级（成本/施工难度/地域供应链）做二次筛选。`
                    : `There is a tie at the top score (${topScore}%). Use project priorities (cost, constructability, local supply chain) for final selection.`)
                  : (lang === 'zh'
                    ? `综合评分 ${winner?.total ?? '-'}%，在低碳与韧性维度上表现更平衡，适合优先进入深化设计。`
                    : `Composite score ${winner?.total ?? '-'}% with stronger balance in low-carbon and resilience dimensions, recommended for next-stage design.`)}
              </p>
              <div className="text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh'
                  ? '注：本面板为数据驱动的方案评分模型（用于前期决策），非项目实测值。'
                  : 'Note: This panel is a data-driven early-stage scoring model, not project measured values.'}
              </div>
            </div>
          </div>
        </div>

        {/* 3D Models Comparison */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 
              className="font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="w-1 h-5 rounded-full"
                style={{ background: 'var(--gradient-brand)' }}
              />
              <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
              {t('compare.3dModels')}
            </h2>
          </div>
          
          <div className={`grid gap-8 ${comparisonMode === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {(comparisonMode === 3 ? [dataA, dataB, dataC] : [dataA, dataB]).map((data, idx) => {
              const IconComponent = buildingIcons[data.id].icon
              const iconGradient = buildingIcons[data.id].gradient
              const research = NEW10_RESEARCH_BY_ID[data.id]
              
              return (
                <div key={idx} className="group">
                  <div className="text-center mb-4">
                    <span 
                      className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-white font-bold shadow-lg"
                      style={{ background: iconGradient }}
                    >
                      <IconComponent size={20} strokeWidth={1.5} />
                      {data.name}
                    </span>
                  </div>
                  <div 
                    className="rounded-2xl overflow-hidden hover-lift"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="h-64">
                      <ModelViewer
                        src={data.glbModel}
                        alt={data.nameEn}
                        poster={data.previewImage}
                        cameraControls
                        className="w-full h-full"
                      />
                    </div>
                    <div 
                      className="p-4 flex justify-between items-center"
                      style={{ backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--border-default)' }}
                    >
                      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span 
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ background: iconGradient }}
                        >
                          <IconComponent size={12} className="text-white" strokeWidth={2} />
                        </span>
                        {lang === 'zh' ? data.region : data.climateEn}
                      </span>
                      <span 
                        className="text-sm font-medium px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
                      >
                        {lang === 'zh' ? data.climate : data.climateEn}
                      </span>
                    </div>
                    {research && (
                      <div
                        className="px-4 py-3"
                        style={{ backgroundColor: 'var(--surface-card)', borderTop: '1px dashed var(--border-light)' }}
                      >
                        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                          {lang === 'zh' ? '文档提取性能' : 'Extracted Research'}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span>{lang === 'zh' ? '综合排名' : 'Rank'}: #{research.overallRank}</span>
                          <span>{lang === 'zh' ? '气候匹配' : 'Climate Fit'}: {research.climateFitStars}/5</span>
                          <span>{lang === 'zh' ? '夏季温差' : 'Summer Delta'}: {research.summerDelta}</span>
                          <span>{lang === 'zh' ? '冬季温差' : 'Winter Delta'}: {research.winterDelta}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Performance Comparison */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 
              className="font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="w-1 h-5 rounded-full"
                style={{ background: 'var(--gradient-brand)' }}
              />
              <TrendingUp size={18} style={{ color: 'var(--brand-primary)' }} />
              {t('compare.performance')}
            </h2>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--temp-cool)' }}></span> 
                {lang === 'zh' ? '更优' : 'Better'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}></span> 
                {lang === 'zh' ? '较低' : 'Lower'}
              </span>
            </div>
          </div>
          
          <div className={`grid gap-4 mb-4`} style={{ gridTemplateColumns: comparisonMode === 3 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' }}>
            <div></div>
            {(comparisonMode === 3 ? [dataA, dataB, dataC] : [dataA, dataB]).map((data, idx) => {
              const IconComponent = buildingIcons[data.id].icon
              const iconGradient = buildingIcons[data.id].gradient
              
              return (
                <div key={idx} className="text-center">
                  <span 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-md"
                    style={{ background: iconGradient }}
                  >
                    <IconComponent size={14} strokeWidth={2} />
                    {data.name}
                  </span>
                </div>
              )
            })}
          </div>
          
          <div className="space-y-4">
            {performanceRows.map((metric) => {
              const ids = comparisonMode === 3 ? [buildingA, buildingB, buildingC] : [buildingA, buildingB]
              const values = ids.map(id => getPerformanceValue(metric.key, id))
              const maxVal = Math.max(...values)
              
              return (
                <div 
                  key={metric.name} 
                  className={`grid gap-4 items-center p-3 rounded-xl`}
                  style={{ backgroundColor: 'var(--bg-secondary)', gridTemplateColumns: comparisonMode === 3 ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' }}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {metric.name}
                  </div>
                  {values.map((val, idx) => {
                    const isBest = val === maxVal
                    return (
                      <div 
                        key={idx}
                        className="relative h-10 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--surface-card)' }}
                      >
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3"
                          style={{ 
                            width: `${val}%`, 
                            backgroundColor: isBest ? 'var(--temp-cool)' : 'var(--border-default)' 
                          }}
                        >
                          <span 
                            className="text-sm font-bold"
                            style={{ color: isBest ? 'white' : 'var(--text-secondary)' }}
                          >
                            {val}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-6 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="w-1 h-5 rounded-full"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <BarChart2 size={18} style={{ color: 'var(--brand-primary)' }} />
            {t('compare.features')}
          </h2>
          
          <div 
            className="overflow-x-auto rounded-xl"
            style={{ border: '1px solid var(--border-default)' }}
          >
            <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface-card)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="p-4 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {t('compare.feature')}
                  </th>
                  {(comparisonMode === 3 ? [dataA, dataB, dataC] : [dataA, dataB]).map((data, idx) => {
                    const IconComponent = buildingIcons[data.id].icon
                    const iconGradient = buildingIcons[data.id].gradient
                    
                    return (
                      <th key={idx} className="p-4 text-center">
                        <span 
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                          style={{ background: iconGradient }}
                        >
                          <IconComponent size={12} strokeWidth={2} />
                          {data.name}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {featureRows.map((feature, idx) => {
                  const ids = comparisonMode === 3 ? [buildingA, buildingB, buildingC] : [buildingA, buildingB]
                  const featureValues = ids.map(id => getFeatureValue(feature.key, id))
                  const renderValue = (val: string) => {
                    if (val === '✓' || val === '✓✓') return (
                      <div className="flex justify-center">
                        <div className="p-1 rounded-lg" style={{ backgroundColor: 'var(--temp-cool-light)' }}>
                          <CheckCircle2 size={16} style={{ color: 'var(--temp-cool)' }} />
                        </div>
                      </div>
                    )
                    if (val === '✗') return (
                      <div className="flex justify-center">
                        <div className="p-1 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <XCircle size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    )
                    if (val.includes('✓')) return <span style={{ color: 'var(--temp-cool)' }} className="font-medium">{val}</span>
                    return <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
                  }
                  return (
                    <tr 
                      key={feature.name} 
                      style={{ 
                        borderTop: '1px solid var(--border-light)',
                        backgroundColor: idx % 2 === 0 ? 'var(--surface-card)' : 'var(--bg-secondary)' 
                      }}
                    >
                      <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>{feature.name}</td>
                      {featureValues.map((val, vIdx) => (
                        <td key={vIdx} className="p-4 text-center">{renderValue(val)}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Material Comparison */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-[450ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2
            className="font-bold mb-3 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div className="w-1 h-5 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
            <Layers size={18} style={{ color: 'var(--brand-primary)' }} />
            {lang === 'zh' ? '传统材料 vs 现代材料' : 'Traditional vs Modern Materials'}
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            {lang === 'zh'
              ? '以下对比基于中国标准与研究资料，展示所选建筑的传统材料体系与现代常规材料体系在碳排放与气候适配上的差异。'
              : 'The comparison below uses Chinese standards and studies to contrast selected vernacular materials with modern baseline material systems on carbon and climate fitness.'}
          </p>

          <div className={`grid gap-5 ${comparisonMode === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {selectedMaterialRows.map(({ id, building, material, carbonReductionPct }) => {
              const iconGradient = buildingIcons[id].gradient
              const IconComponent = buildingIcons[id].icon
              const climateBetterTraditional = material.climateSuitabilityTraditional >= material.climateSuitabilityModern
              const carbonBetterTraditional = material.carbonEfficiencyTraditional >= material.carbonEfficiencyModern

              return (
                <div
                  key={id}
                  className="rounded-2xl p-4"
                  style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--surface-card)' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold" style={{ background: iconGradient }}>
                      <IconComponent size={14} />
                      {building.name}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}>
                      {lang === 'zh' ? '碳减排' : 'Carbon Cut'} {carbonReductionPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--temp-cool)' }}>
                        {lang === 'zh' ? '传统材料' : 'Traditional'}
                      </div>
                      <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {(lang === 'zh' ? material.traditionalMaterialsZh : material.traditionalMaterialsEn).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                        {lang === 'zh' ? '现代对照材料' : 'Modern Baseline'}
                      </div>
                      <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {(lang === 'zh' ? material.modernMaterialsZh : material.modernMaterialsEn).map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{lang === 'zh' ? '传统隐含碳' : 'Traditional EC'}</div>
                      <div className="font-semibold" style={{ color: 'var(--temp-cool)' }}>{material.traditionalEmbodiedCarbonRange}</div>
                    </div>
                    <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div style={{ color: 'var(--text-muted)' }}>{lang === 'zh' ? '现代隐含碳' : 'Modern EC'}</div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{material.modernEmbodiedCarbonRange}</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '气候适配' : 'Climate Fit'}: {material.climateSuitabilityTraditional} / {material.climateSuitabilityModern}
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${material.climateSuitabilityTraditional}%`, backgroundColor: 'var(--temp-cool)' }} />
                    </div>

                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '碳效率' : 'Carbon Efficiency'}: {material.carbonEfficiencyTraditional} / {material.carbonEfficiencyModern}
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="h-full rounded-full" style={{ width: `${material.carbonEfficiencyTraditional}%`, backgroundColor: 'var(--brand-primary)' }} />
                    </div>
                  </div>

                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {lang === 'zh' ? material.summaryZh : material.summaryEn}
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="text-[11px] px-2 py-1 rounded-full" style={{ backgroundColor: climateBetterTraditional ? 'var(--temp-cool-light)' : 'var(--bg-secondary)', color: climateBetterTraditional ? 'var(--temp-cool)' : 'var(--text-muted)' }}>
                      {lang === 'zh' ? '气候适配：传统更优' : 'Climate: Traditional leads'}
                    </span>
                    <span className="text-[11px] px-2 py-1 rounded-full" style={{ backgroundColor: carbonBetterTraditional ? 'var(--temp-cool-light)' : 'var(--bg-secondary)', color: carbonBetterTraditional ? 'var(--temp-cool)' : 'var(--text-muted)' }}>
                      {lang === 'zh' ? '碳表现：传统更优' : 'Carbon: Traditional leads'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-xl p-4" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {lang === 'zh' ? '参考来源（中国标准与研究）' : 'References (Chinese Standards & Studies)'}
            </div>
            <div className="grid gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              {materialSources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-2 hover:underline"
                  style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{source.title}</span>
                  <span> · {source.publisher} · {source.year}</span>
                  <div style={{ color: 'var(--text-muted)' }}>{lang === 'zh' ? source.noteZh : source.noteEn}</div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div 
          className={`modern-card rounded-2xl p-6 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          style={{ backgroundColor: 'var(--nav-bg)' }}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0 relative">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <span className="text-2xl text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>匠</span>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold animate-pulse"
                style={{ backgroundColor: 'var(--temp-cool)' }}
              >
                AI
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-3 text-white text-lg flex items-center gap-2">
                <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} />
                {lang === 'zh' ? '虚拟建筑师总结' : 'Virtual Architect Summary'}
              </h3>
              {loadingSummary ? (
                <div className="flex items-center gap-3 text-white/70">
                  <Loader2 size={20} className="animate-spin" />
                  <span>{lang === 'zh' ? '正在生成分析...' : 'Generating analysis...'}</span>
                </div>
              ) : aiSummary ? (
                <div className="text-white/80 leading-relaxed [&_p]:my-1 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5">
                  <ReactMarkdown>{aiSummary}</ReactMarkdown>
                </div>
              ) : (
                <button
                  onClick={generateSummary}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
                >
                  <Sparkles size={16} />
                  {lang === 'zh' ? '生成 AI 对比分析' : 'Generate AI Comparison'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comparison
