import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { Leaf, Building2, ThermometerSun, Droplets, Wind, Sparkles, Database, Mountain, BookOpen, Shield, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildingIcons, getEChartsColors } from '../data/buildings'
import ReactECharts from 'echarts-for-react'
import { BUILDING_PROFILES } from '../data/buildingCatalog'
import { NEW10_RESEARCH_BY_ID } from '../data/new10ResearchData'
import type { New10ResearchEntry } from '../data/new10ResearchData'
import { parseAreaFromText, inferBuildingFamily, computeCarbonProfile } from '../utils/analytics'
import type { BuildingId } from '../data/buildings'

interface AnalysisProfile {
  city: string
  climateZone: string
  landSize: string
  buildingType: string
}

interface SourceItem {
  title: string
  publisher: string
  year: string
  note: string
  url?: string
}

interface CaseItem {
  name: string
  location: string
  challenge: string
  strategy: string
  outcome: string
}

interface SupplierItem {
  component: string
  material: string
  unitCost: string
  supplier: string
}

const RESEARCH_ZH_LOOKUP: Record<string, string> = {
  'Hot Summer / Warm Winter': '夏热冬暖',
  'Cold Zone': '寒冷地区',
  'Cold or Severe Cold': '寒冷或严寒地区',
  'Hot Summer / Cold Winter': '夏热冬冷',
  'Severe Cold / Temperate Dry': '严寒 / 温带干旱',
  'Severe Cold': '严寒地区',
  'Temperate Plateau': '温和高原',
  'Rammed-earth thermal mass with compact enclosure': '夯土高热容围护与紧凑体量',
  'South-facing courtyard solar zoning': '南向院落的太阳分区',
  'Earth-sheltered loess envelope with high thermal inertia': '覆土黄土围护与高热惰性',
  'Elevated stilt structure for flood and moisture control': '架空吊脚结构用于防洪与防潮',
  'Semi-enclosed arc form with central ventilation court': '半围合弧形布局结合中央通风庭院',
  'Sky-well stack ventilation': '天井烟囱通风',
  'Canal breeze plus overhanging eaves': '河道风引入与深出檐',
  'Kang platform and thick north-south walls': '炕体平台与厚重南北墙体',
  'Ground-coupled loess thermal mass': '与地耦合的黄土高热容围护',
  'Cold alley Venturi ventilation': '冷巷文丘里通风',
  'Bamboo microclimate plus open hall ventilation': '竹林微气候与敞厅通风',
  'Adobe mass plus flat-roof night cooling': '土坯热容与平屋顶夜间散热',
  'South glazing solar gain plus stone mass': '南向采光得热与石材热容',
  'Screen-wall solar reflection and wind buffering': '照壁反射日照与挡风缓冲',
  'Three-sided Kang radiant heating': '三面炕辐射供暖',
  'Inner courtyard stack ventilation and deep eaves shading': '内院烟囱效应通风与深檐遮阳',
  'Layered enclosure, shaded galleries, and seasonal opening control': '分层围护、遮阴廊道与季节性开闭控制',
  'Courtyard orientation and reduced opening area for winter heat retention': '院落朝向优化与减小开口以保温',
  'Permeable underfloor ventilation and deep overhang drainage': '架空层透风与深檐排水',
  'Shaded arcades, thick walls, and pond-assisted evaporative cooling': '遮阴骑楼、厚墙与池塘辅助蒸发降温',
  'Brick thermal mass plus reflective white walls': '砖墙热容与白色反射墙面',
  'Two-storey elevated plan with skywell': '双层抬高平面与天井',
  'Wide courtyard winter solar gain': '宽院落冬季日照得热',
  'Adobe night-radiation roof and Kang': '土坯夜间辐射屋顶与炕',
  'Deep eaves, shading arcades, and water features': '深檐、遮阴廊道与水体',
  'Stone or rammed-earth thermal mass': '石材或夯土高热容围护',
  'Grape-trellis evaporative courtyard': '葡萄架蒸发庭院',
  'North buffer spaces and inward-sloping walls': '北侧缓冲空间与内倾墙体',
  'White walls plus curved eaves': '白墙与曲檐',
  'Thick log or earth walls with wide winter courtyard': '厚木/土墙与宽敞冬季院落',
  'Approx -8 to -13 C (indoor core vs afternoon outdoor peak)': '约 -8 至 -13°C（室内核心区相对下午室外峰值）',
  'Approx +4 to +7 C (indoor core vs outdoor)': '约 +4 至 +7°C（室内核心区相对室外）',
  'Estimated -6 to -10 C in shaded courtyard-side rooms': '估计 -6 至 -10°C（遮阴院落侧房间）',
  'Estimated +5 to +9 C with solar gain and wind protection': '估计 +5 至 +9°C（依靠日照得热与避风）',
  'Approx -10 to -20 C with near-zero daytime cooling demand': '约 -10 至 -20°C，白天几乎无需制冷',
  'Approx +8 to +12 C compared with outdoor air': '约 +8 至 +12°C（相对室外空气）',
  'Approx -4 to -7 C from enhanced cross-ventilation and shaded floor': '约 -4 至 -7°C（来自强化交叉通风与遮阴架空地板）',
  'Estimated +1 to +3 C (limited winter buffering)': '估计 +1 至 +3°C（冬季缓冲有限）',
  'Approx -6 to -13 C depending on courtyard airflow and shading depth': '约 -6 至 -13°C（取决于院落气流与遮阳深度）',
  'Estimated +2 to +4 C in enclosed rear rooms': '估计 +2 至 +4°C（封闭后部房间）',
  '-2.6 C (bedroom vs outdoor)': '-2.6°C（卧室相对室外）',
  '+1.8 C (bedroom vs outdoor)': '+1.8°C（卧室相对室外）',
  'Estimated -1 to -2 C': '估计 -1 至 -2°C',
  'Not directly measured': '暂无直接实测',
  'Estimated -3 to -5 C peak': '估计 -3 至 -5°C（峰值时段）',
  'Estimated +8 to +12 C with Kang': '估计 +8 至 +12°C（配合炕体）',
  'Approx -10 to -15 C, near-zero cooling demand': '约 -10 至 -15°C，制冷需求接近零',
  '+9.6 to +10.9 C vs outdoor': '+9.6 至 +10.9°C（相对室外）',
  'Estimated -3 to -5 C in cold-alley adjacent rooms (95% comfort hours)': '估计 -3 至 -5°C（冷巷邻近房间，舒适小时占比约95%）',
  'Estimated +1 to +2 C (limited winter buffering)': '估计 +1 至 +2°C（冬季缓冲有限）',
  'Estimated -2 to -4 C vs modern thin-wall reference': '估计 -2 至 -4°C（相对现代薄墙参照）',
  '+2.36 C neutral temperature above outdoor': '+2.36°C（中性温度高于室外）',
  'Estimated -10 to -15 C peak cooling': '估计 -10 至 -15°C（峰值降温）',
  'Estimated +8 to +12 C vs outdoor (thick adobe thermal mass)': '估计 +8 至 +12°C（相对室外，来自厚土坯热容）',
  'Negligible cooling demand; summer interior ~15-22 C': '几乎无需制冷；夏季室内约 15–22°C',
  'Passive +8 to +10 C winter uplift': '被动增温约 +8 至 +10°C',
  'Estimated -1 to -2 C (mild climate; little cooling needed)': '估计 -1 至 -2°C（气候温和，几乎不需制冷）',
  'Estimated +1 to +3 C from stone/earth thermal mass (mild climate)': '估计 +1 至 +3°C（来自石/土热容，气候温和）',
  'Negligible cooling demand; summer interior ~22-25 C': '几乎无需制冷；夏季室内约 22–25°C',
  'Estimated +20 to +30 C with Kang and thermal mass': '估计 +20 至 +30°C（依靠炕与高热容围护）',
  'High-mass earthen enclosure offers stable passive cooling in humid subtropical climate': '高热容土体围护在湿热亚热带气候中提供稳定的被动降温',
  'Balanced courtyard typology with strong seasonal adaptability in continental climate': '均衡的院落类型，在大陆性气候中具备很强的季节适应性',
  'Exceptional thermal stability from ground coupling and low-material envelope': '地耦合与低材料围护带来卓越热稳定性',
  'Highly resilient vernacular response to flood-prone humid mountain terrain': '对湿润山地易洪环境具有高度适应性的传统建造回应',
  'Strong subtropical passive cooling logic combining enclosure and airflow control': '结合围护与气流控制的强亚热带被动降温逻辑',
  'Best documented vernacular research case': '文献证据最充分的传统民居研究案例',
  'Canal-edge climate logic but limited thermal mass': '具有滨水气候调节逻辑，但热容有限',
  'Reliable cold-zone courtyard typology': '可靠的寒冷地区院落类型',
  'Best cold-dry performer in the comparative ranking': '对比排名中表现最优的寒冷干燥类型',
  'Best documented hot-humid passive system': '文献证据最充分的湿热气候被动系统',
  'Good summer stability but unresolved rainy-season humidity': '夏季稳定性良好，但雨季湿度问题仍未完全解决',
  'Best hot-dry passive package for extreme diurnal swing': '针对昼夜温差极端环境的最佳炎热干燥被动方案',
  'Strong high-altitude passive strategy with rich field evidence': '高海拔被动策略强，且具有丰富实测证据',
  'Highly climate-compatible typology in mild plateau context': '在温和高原气候中高度匹配的建筑类型',
  'Strong severe-cold active-passive hybrid logic': '强烈严寒地区下主动-被动结合逻辑突出',
  'High indoor humidity can persist during prolonged rainy periods': '连续雨季时室内高湿度可能持续存在',
  'Urban densification can reduce courtyard ratio and passive performance': '城市加密会降低院落比例并削弱被动性能',
  'Daylighting, moisture control, and seismic retrofit need modern intervention': '采光、防潮与抗震加固仍需现代技术介入',
  'Timber durability and fire safety require contemporary detailing': '木构耐久性与防火仍需现代构造细化',
  'Performance depends on courtyard upkeep and unobstructed wind paths': '性能依赖院落维护与不受阻的通风路径',
  'High summer indoor RH around 83%': '夏季室内相对湿度可高达约 83%',
  'High humidity and limited direct measurement': '湿度偏高且直接实测数据有限',
  'Limited passive winter performance without Kang heating': '若无炕体供暖，冬季被动性能有限',
  'Moisture vulnerability during prolonged wet periods': '长时间潮湿时段下易受潮',
  'Humidity remains unavoidable in peak wet season': '在最潮湿季节仍难避免高湿环境',
  'Indoor RH can reach 85-95% in rainy season': '雨季室内相对湿度可达 85–95%',
  'Material maintenance burden in desert exposure': '荒漠暴露环境下材料维护负担较大',
  'Winter comfort remains limited without supplemental heating': '若无辅助供暖，冬季舒适度仍有限',
  'Limited direct measurement series in reviewed literature': '已审阅文献中的直接实测序列有限',
  'Active winter heating is still required in deep cold': '深寒冬季仍需要主动供暖',
  'Fujian Tulou and Earthen Construction': '福建土楼与夯土建造',
  'Thermal mass and communal courtyards': '高热容围护与共享院落',
  'Rammed Earth for Low-Carbon Buildings': '夯土在低碳建筑中的应用',
  'Embodied carbon reductions vs concrete': '相较混凝土可降低隐含碳',
  'Modern Earthen Community Hub': '现代夯土社区中心',
  'Fujian': '福建',
  'Hot-humid summer': '湿热夏季',
  'Rammed-earth envelope + shaded court': '夯土围护 + 遮阴院落',
  'Cooling load -22%': '制冷负荷 -22%',
  'Circular Co-living Block': '环形共享居住单元',
  'Xiamen': '厦门',
  'Typhoon exposure': '台风暴露',
  'Aerodynamic massing + reinforced shell': '气动体型 + 加强外壳',
  'Wind resilience improved': '抗风韧性提升',
  'Structure': '结构',
  'Stabilized rammed earth + RC frame': '稳定夯土 + 钢筋混凝土框架',
  'Fujian EarthTech + local lime': '福建 EarthTech + 本地石灰供应',
  'Roof': '屋面',
  'Clay tile + breathable membrane': '黏土瓦 + 可呼吸防水膜',
  'Yongding tile workshops': '永定瓦作工坊',
  'UNESCO WHC': '联合国教科文组织世界遗产中心',
  'Journal of Green Building': '绿色建筑期刊',
  'Tsinghua Architecture Review': '清华建筑评论',
  'Energy & Buildings': '《Energy & Buildings》',
  'Building and Environment': '《Building and Environment》',
  'Passivhaus Institute Notes': '被动房研究所笔记',
  'Regional Architecture Studies': '地域建筑研究',
  'Sustainable Structures Journal': '可持续结构期刊',
  'South China Vernacular Archive': '华南乡土建筑档案',
  'Climate Responsive Design': '气候响应设计',
}

const normalizeResearchText = (value: string): string => value.replace(/\s+/g, ' ').trim()

const translateResearchText = (value: string | undefined, lang: 'zh' | 'en'): string => {
  if (!value) return '—'
  if (lang === 'en') return value

  const normalizedValue = normalizeResearchText(value)
  const directMatch = RESEARCH_ZH_LOOKUP[normalizedValue]
  if (directMatch) return directMatch

  let translated = normalizedValue
  const sortedEntries = Object.entries(RESEARCH_ZH_LOOKUP).sort((a, b) => b[0].length - a[0].length)

  for (const [englishText, chineseText] of sortedEntries) {
    translated = translated.split(englishText).join(chineseText)
  }

  return translated
}

const parseSignedNumbers = (value: string): number[] => {
  const matches = value.match(/[-+]?\d+(?:\.\d+)?/g)
  if (!matches) return []
  return matches
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

const deriveCoolingDeltaFromSummer = (summerDelta?: string): number => {
  if (!summerDelta) return 0
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

const formatThermalBufferValue = (entry: New10ResearchEntry | undefined, lang: 'zh' | 'en'): string => {
  if (!entry) return '—'

  const summerCooling = deriveCoolingDeltaFromSummer(entry.summerDelta)
  const winterGain = deriveWinterGainFromDelta(entry.winterDelta)

  if (summerCooling && winterGain) {
    return lang === 'zh'
      ? `夏-${summerCooling}°C / 冬+${winterGain}°C`
      : `S -${summerCooling}°C / W +${winterGain}°C`
  }

  if (summerCooling) {
    return lang === 'zh' ? `夏-${summerCooling}°C` : `${summerCooling}°C cooler`
  }

  if (winterGain) {
    return lang === 'zh' ? `冬+${winterGain}°C` : `${winterGain}°C warmer`
  }

  return '—'
}

const formatHumidityRange = (value: string | undefined, lang: 'zh' | 'en'): string => {
  if (!value) return '—'

  const range = value.match(/\d+\s*(?:-\s*\d+)?%/)
  if (range) {
    return lang === 'zh'
      ? `${range[0].replace(/\s+/g, '')} 相对湿度`
      : `${range[0].replace(/\s+/g, '')} RH`
  }

  return translateResearchText(value, lang)
}

const summarizePassiveStrategy = (
  primaryStrategy: string | undefined,
  secondaryStrategy: string | undefined,
  lang: 'zh' | 'en'
): string => {
  const combined = `${primaryStrategy ?? ''} ${secondaryStrategy ?? ''}`.toLowerCase()

  if (combined.includes('earth-sheltered') || combined.includes('ground coupling')) {
    return lang === 'zh' ? '覆土围护' : 'Earth-Sheltered'
  }

  if (combined.includes('rammed-earth') || combined.includes('thermal mass')) {
    return lang === 'zh' ? '高热容围护' : 'Thermal Mass'
  }

  if (combined.includes('courtyard') && combined.includes('solar')) {
    return lang === 'zh' ? '向阳院落' : 'Solar Courtyard'
  }

  if (combined.includes('stack')) {
    return lang === 'zh' ? '烟囱通风' : 'Stack Vent.'
  }

  if (combined.includes('underfloor') || combined.includes('stilt')) {
    return lang === 'zh' ? '架空通风' : 'Raised Vent.'
  }

  if (combined.includes('ventilation court')) {
    return lang === 'zh' ? '通风庭院' : 'Ventilation Court'
  }

  if (combined.includes('shading') || combined.includes('eaves')) {
    return lang === 'zh' ? '遮阳控制' : 'Shading Logic'
  }

  return lang === 'zh' ? '被动策略' : 'Passive Strategy'
}

const deriveWinterGainFromDelta = (winterDelta?: string): number => {
  if (!winterDelta || /not directly measured/i.test(winterDelta)) return 0
  const values = parseSignedNumbers(winterDelta)
  if (!values.length) return 0

  const positives = values.filter((value) => value > 0)
  if (positives.length) {
    return Math.round(Math.max(...positives))
  }

  return Math.round(Math.max(...values.map((value) => Math.abs(value))))
}

const DataHub = () => {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isVisible, setIsVisible] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId>(BUILDING_PROFILES[0].id)
  const [analysisProfile] = useState<AnalysisProfile>({
    city: '',
    climateZone: '',
    landSize: '',
    buildingType: '',
  })

  // Trigger entrance animations
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const buildings: Array<{
    id: BuildingId
    name: string
    nameEn: string
    family: (typeof BUILDING_PROFILES)[number]['family']
    previewImage: string
    tempReduction: number
  }> = BUILDING_PROFILES.map((profile) => {
    const research = NEW10_RESEARCH_BY_ID[profile.id]
    return {
      id: profile.id,
      name: lang === 'zh' ? profile.nameZh : profile.nameEn,
      nameEn: profile.nameEn,
      family: profile.family,
      previewImage: profile.previewImage,
      tempReduction: deriveCoolingDeltaFromSummer(research?.summerDelta),
    }
  })

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0]
  const selectedResearch = selectedBuilding ? NEW10_RESEARCH_BY_ID[selectedBuilding.id] : undefined

  const maxTempReduction = useMemo(
    () => Math.max(...buildings.map((item) => item.tempReduction), 1),
    [buildings]
  )

  const dynamicRankById = useMemo(() => {
    const rows: Array<{
      id: string
      climateFit: number
      carbon: number
      summerCooling: number
      winterGain: number
    }> = []

    for (const profile of BUILDING_PROFILES) {
      const research = NEW10_RESEARCH_BY_ID[profile.id]
      if (!research) continue

      rows.push({
        id: profile.id,
        climateFit: research.climateFitStars,
        carbon: research.carbonEfficiencyStars,
        summerCooling: deriveCoolingDeltaFromSummer(research.summerDelta),
        winterGain: deriveWinterGainFromDelta(research.winterDelta),
      })
    }

    if (!rows.length) return {} as Record<string, number>

    const maxSummerCooling = Math.max(...rows.map((row) => row.summerCooling), 1)
    const maxWinterGain = Math.max(...rows.map((row) => row.winterGain), 1)

    const ranked = rows
      .map((row) => {
        const normalizedSummer = (row.summerCooling / maxSummerCooling) * 5
        const normalizedWinter = (row.winterGain / maxWinterGain) * 5
        const score =
          row.climateFit * 0.4 +
          row.carbon * 0.35 +
          normalizedSummer * 0.2 +
          normalizedWinter * 0.05
        return { ...row, score }
      })
      .sort((a, b) => b.score - a.score)

    const rankMap: Record<string, number> = {}
    ranked.forEach((row, index) => {
      rankMap[row.id] = index + 1
    })

    return rankMap
  }, [])

  const selectedRank = selectedResearch ? dynamicRankById[selectedResearch.id] : undefined

  
  const climateData = useMemo(
    () => [
      {
        label: lang === 'zh' ? '温度缓冲' : 'Thermal Buffer',
        value: formatThermalBufferValue(selectedResearch, lang),
        icon: ThermometerSun,
        color: 'var(--temp-hot)',
        note: selectedResearch
          ? (lang === 'zh'
            ? `夏季 ${translateResearchText(selectedResearch.summerDelta, lang)}；冬季 ${translateResearchText(selectedResearch.winterDelta, lang)}`
            : `Summer: ${selectedResearch.summerDelta}; Winter: ${selectedResearch.winterDelta}`)
          : (lang === 'zh' ? '暂无研究数据' : 'Research data unavailable'),
      },
      {
        label: lang === 'zh' ? '湿度范围' : 'Humidity Range',
        value: formatHumidityRange(selectedResearch?.relativeHumidity, lang),
        icon: Droplets,
        color: 'var(--info)',
        note: selectedResearch
          ? (lang === 'zh'
            ? `研究湿度区间 · ${translateResearchText(selectedResearch.chineseClimateZone, lang)}`
            : `Research humidity range · ${selectedResearch.chineseClimateZone}`)
          : (lang === 'zh' ? '暂无研究数据' : 'Research data unavailable'),
      },
      {
        label: lang === 'zh' ? '被动策略' : 'Passive Strategy',
        value: summarizePassiveStrategy(selectedResearch?.primaryStrategy, selectedResearch?.secondaryStrategy, lang),
        icon: Wind,
        color: 'var(--temp-cool)',
        note: selectedResearch
          ? translateResearchText(selectedResearch.secondaryStrategy ?? selectedResearch.primaryStrategy, lang)
          : (lang === 'zh' ? '暂无研究数据' : 'Research data unavailable'),
      },
      {
        label: lang === 'zh' ? '碳效率' : 'Carbon Efficiency',
        value: selectedResearch ? `${selectedResearch.carbonEfficiencyStars}/5` : '—',
        icon: Leaf,
        color: 'var(--brand-primary)',
        note: selectedResearch
          ? (lang === 'zh'
            ? `排名 #${selectedRank ?? selectedResearch.overallRank} · 气候匹配 ${selectedResearch.climateFitStars}/5`
            : `Rank #${selectedRank ?? selectedResearch.overallRank} · Climate fit ${selectedResearch.climateFitStars}/5`)
          : (lang === 'zh' ? '暂无研究数据' : 'Research data unavailable'),
      },
    ],
    [lang, selectedRank, selectedResearch]
  )

  const areaM2 = useMemo(() => parseAreaFromText(analysisProfile.landSize), [analysisProfile.landSize])
  const buildingFamily = useMemo(
    () => selectedBuilding?.family ?? inferBuildingFamily(analysisProfile.buildingType),
    [selectedBuilding, analysisProfile.buildingType]
  )

  const carbonStats = useMemo(
    () => computeCarbonProfile(areaM2, buildingFamily),
    [areaM2, buildingFamily]
  )

  const passiveStrategies = useMemo(() => {
    const map: Record<string, Array<{ title: string; impact: string; value: string }>> = {
      tulou: [
        { title: lang === 'zh' ? '厚墙热惰性' : 'Thermal Mass Envelope', impact: lang === 'zh' ? '降温效果' : 'Cooling Effect', value: lang === 'zh' ? '显著' : 'Significant' },
        { title: lang === 'zh' ? '中庭烟囱效应' : 'Courtyard Stack Effect', impact: lang === 'zh' ? '自然通风' : 'Natural Ventilation', value: lang === 'zh' ? '核心策略' : 'Key Strategy' },
        { title: lang === 'zh' ? '遮阳深檐' : 'Deep Overhang Shading', impact: lang === 'zh' ? '太阳得热控制' : 'Solar Heat Gain', value: lang === 'zh' ? '有效' : 'Effective' },
      ],
      siheyuan: [
        { title: lang === 'zh' ? '院落冬季增温' : 'Winter Courtyard Gain', impact: lang === 'zh' ? '采暖效果' : 'Heating Effect', value: lang === 'zh' ? '有据可查' : 'Documented' },
        { title: lang === 'zh' ? '南向体型优化' : 'South-Oriented Massing', impact: lang === 'zh' ? '日照效率' : 'Solar Efficiency', value: lang === 'zh' ? '优化设计' : 'Optimized' },
        { title: lang === 'zh' ? '可调遮阳系统' : 'Adaptive Shading', impact: lang === 'zh' ? '夏季降温' : 'Summer Cooling', value: lang === 'zh' ? '季节性调控' : 'Seasonal' },
      ],
      yaodong: [
        { title: lang === 'zh' ? '半地下覆土' : 'Earth-Sheltered Envelope', impact: lang === 'zh' ? '全年温度稳定' : 'Year-round Stability', value: lang === 'zh' ? '卓越' : 'Excellent' },
        { title: lang === 'zh' ? '地温缓冲层' : 'Ground Thermal Buffer', impact: lang === 'zh' ? '峰值负荷' : 'Peak Load', value: lang === 'zh' ? '大幅降低' : 'Reduced' },
        { title: lang === 'zh' ? '自然湿度调节' : 'Humidity Buffering', impact: lang === 'zh' ? '舒适度' : 'Comfort Stability', value: lang === 'zh' ? '稳定' : 'Stable' },
      ],
      diaojiaolou: [
        { title: lang === 'zh' ? '架空通风层' : 'Raised Ventilated Floor', impact: lang === 'zh' ? '潮湿控制' : 'Moisture Control', value: lang === 'zh' ? '有效' : 'Effective' },
        { title: lang === 'zh' ? '坡屋顶排雨' : 'Monsoon Roof Drainage', impact: lang === 'zh' ? '雨洪风险' : 'Rain/Flood Risk', value: lang === 'zh' ? '降低' : 'Reduced' },
        { title: lang === 'zh' ? '顺坡布置' : 'Slope-Compatible Layout', impact: lang === 'zh' ? '土方与能耗' : 'Earthwork & Energy', value: lang === 'zh' ? '适应性强' : 'Adaptive' },
      ],
      weilongwu: [
        { title: lang === 'zh' ? '半围合挡热' : 'Semi-Enclosed Heat Shield', impact: lang === 'zh' ? '夏季热增益' : 'Summer Heat Gain', value: lang === 'zh' ? '有效遮挡' : 'Effective' },
        { title: lang === 'zh' ? '中庭通风廊道' : 'Central Ventilation Spine', impact: lang === 'zh' ? '空气交换' : 'Air Exchange', value: lang === 'zh' ? '促进通风' : 'Enhanced' },
        { title: lang === 'zh' ? '水体蒸发降温' : 'Evaporative Cooling Court', impact: lang === 'zh' ? '室外微气候' : 'Microclimate', value: lang === 'zh' ? '改善' : 'Improved' },
      ],
    }
    return map[buildingFamily]
  }, [buildingFamily, lang])

  const hazardScores = useMemo(() => {
    const map: Record<string, { flood: number; typhoon: number; heatwave: number; seismic: number }> = {
      tulou: { flood: 72, typhoon: 86, heatwave: 79, seismic: 68 },
      siheyuan: { flood: 63, typhoon: 56, heatwave: 74, seismic: 66 },
      yaodong: { flood: 58, typhoon: 40, heatwave: 82, seismic: 61 },
      diaojiaolou: { flood: 88, typhoon: 67, heatwave: 69, seismic: 64 },
      weilongwu: { flood: 77, typhoon: 81, heatwave: 73, seismic: 62 },
    }
    return map[buildingFamily]
  }, [buildingFamily])

  const sourceLinkedCards = useMemo<SourceItem[]>(() => {
    const sourceMap: Record<string, SourceItem[]> = {
      tulou: [
        {
          title: lang === 'zh' ? '福建土楼与夯土建造' : 'Fujian Tulou and Earthen Construction',
          publisher: 'UNESCO WHC',
          year: '2008',
          note: lang === 'zh' ? '高热容围护与共享院落' : 'Thermal mass and communal courtyards'
        },
        {
          title: lang === 'zh' ? '夯土在低碳建筑中的应用' : 'Rammed Earth for Low-Carbon Buildings',
          publisher: 'Journal of Green Building',
          year: '2022',
          note: lang === 'zh' ? '相较混凝土可降低隐含碳' : 'Embodied carbon reductions vs concrete'
        },
      ],
      siheyuan: [
        {
          title: lang === 'zh' ? '华北院落住宅的气候逻辑' : 'Courtyard Housing Climate Logic in North China',
          publisher: lang === 'zh' ? '清华建筑评论' : 'Tsinghua Architecture Review',
          year: '2021',
          note: lang === 'zh' ? '朝向优化与季节性调控' : 'Solar orientation and seasonal control'
        },
        {
          title: lang === 'zh' ? '高密度城市街区的被动式太阳能设计' : 'Passive Solar Design in Dense Urban Blocks',
          publisher: 'Energy & Buildings',
          year: '2023',
          note: lang === 'zh' ? '采暖需求降低策略' : 'Heating demand reduction strategies'
        },
      ],
      yaodong: [
        {
          title: lang === 'zh' ? '窑洞居住空间的热环境表现' : 'Thermal Behavior of Cave Dwellings',
          publisher: 'Building and Environment',
          year: '2020',
          note: lang === 'zh' ? '依靠覆土实现稳定室内温度' : 'Stable indoor temperatures via earth sheltering'
        },
        {
          title: lang === 'zh' ? '覆土住宅与能源性能' : 'Earth-Covered Housing and Energy Performance',
          publisher: 'Passivhaus Institute Notes',
          year: '2022',
          note: lang === 'zh' ? '对 HVAC 系统依赖较低' : 'Low HVAC dependence'
        },
      ],
      diaojiaolou: [
        {
          title: lang === 'zh' ? '中国西南地区传统吊脚居住建筑' : 'Vernacular Stilted Housing in Southwest China',
          publisher: 'Regional Architecture Studies',
          year: '2021',
          note: lang === 'zh' ? '防洪韧性与通风表现' : 'Flood resilience and ventilation'
        },
        {
          title: lang === 'zh' ? '湿润气候中的木质架空结构' : 'Timber Elevated Structures in Humid Climates',
          publisher: 'Sustainable Structures Journal',
          year: '2023',
          note: lang === 'zh' ? '应对潮湿与耐久性问题' : 'Moisture and durability response'
        },
      ],
      weilongwu: [
        {
          title: lang === 'zh' ? '客家围合建筑与微气候' : 'Hakka Walled Enclosures and Microclimate',
          publisher: 'South China Vernacular Archive',
          year: '2019',
          note: lang === 'zh' ? '半围合体量与气流组织' : 'Semi-enclosed massing and airflow'
        },
        {
          title: lang === 'zh' ? '院落降温与城市热缓解' : 'Courtyard Cooling and Urban Heat Mitigation',
          publisher: 'Climate Responsive Design',
          year: '2022',
          note: lang === 'zh' ? '降温院落与水体调节' : 'Cooling courtyards and water bodies'
        },
      ],
    }
    return sourceMap[buildingFamily]
  }, [buildingFamily, lang])

  const benchmarkCases = useMemo<CaseItem[]>(() => {
    const map: Record<string, CaseItem[]> = {
      tulou: [
        {
          name: lang === 'zh' ? '现代夯土社区中心' : 'Modern Earthen Community Hub',
          location: lang === 'zh' ? '福建' : 'Fujian',
          challenge: lang === 'zh' ? '湿热夏季' : 'Hot-humid summer',
          strategy: lang === 'zh' ? '夯土围护 + 遮阴院落' : 'Rammed-earth envelope + shaded court',
          outcome: lang === 'zh' ? '制冷负荷 -22%' : 'Cooling load -22%'
        },
        {
          name: lang === 'zh' ? '环形共享居住单元' : 'Circular Co-living Block',
          location: lang === 'zh' ? '厦门' : 'Xiamen',
          challenge: lang === 'zh' ? '台风暴露' : 'Typhoon exposure',
          strategy: lang === 'zh' ? '气动体型 + 加强外壳' : 'Aerodynamic massing + reinforced shell',
          outcome: lang === 'zh' ? '抗风韧性提升' : 'Wind resilience improved'
        },
      ],
      siheyuan: [
        {
          name: lang === 'zh' ? '新式院落住宅' : 'Neo-Courtyard Housing',
          location: lang === 'zh' ? '北京' : 'Beijing',
          challenge: lang === 'zh' ? '夏热冬冷' : 'Hot-summer cold-winter',
          strategy: lang === 'zh' ? '南向庭院 + 外墙保温' : 'South-facing court + insulated walls',
          outcome: lang === 'zh' ? '采暖需求 -19%' : 'Heating demand -19%'
        },
        {
          name: lang === 'zh' ? '城市街区更新改造' : 'Urban Block Retrofit',
          location: lang === 'zh' ? '天津' : 'Tianjin',
          challenge: lang === 'zh' ? '季节极端波动' : 'Seasonal extremes',
          strategy: lang === 'zh' ? '分层院落与遮阳逻辑' : 'Layered courtyard and shading logic',
          outcome: lang === 'zh' ? '舒适小时数 +17%' : 'Comfort hours +17%'
        },
      ],
      yaodong: [
        {
          name: lang === 'zh' ? '覆土学校建筑' : 'Earth-Sheltered School',
          location: lang === 'zh' ? '陕西' : 'Shaanxi',
          challenge: lang === 'zh' ? '昼夜温差大' : 'Large diurnal swing',
          strategy: lang === 'zh' ? '覆土缓坡 + 热缓冲层' : 'Earth berm + thermal buffer',
          outcome: lang === 'zh' ? 'HVAC 需求 -31%' : 'HVAC demand -31%'
        },
        {
          name: lang === 'zh' ? '黄土高原游客中心' : 'Loess Plateau Visitor Center',
          location: lang === 'zh' ? '延安' : 'Yan\'an',
          challenge: lang === 'zh' ? '干热夏季与寒冷冬季' : 'Dry heat and winter cold',
          strategy: lang === 'zh' ? '半埋式体量' : 'Semi-buried massing',
          outcome: lang === 'zh' ? '全年能耗 -28%' : 'Annual energy -28%'
        },
      ],
      diaojiaolou: [
        {
          name: lang === 'zh' ? '架空木结构卫生站' : 'Raised Timber Health Clinic',
          location: lang === 'zh' ? '贵州' : 'Guizhou',
          challenge: lang === 'zh' ? '洪涝与潮湿' : 'Flood and humidity',
          strategy: lang === 'zh' ? '抬升地板 + 交叉通风' : 'Elevated floor + cross ventilation',
          outcome: lang === 'zh' ? '受潮问题减少' : 'Moisture incidents reduced'
        },
        {
          name: lang === 'zh' ? '适应坡地的社区礼堂' : 'Slope-Adapted Community Hall',
          location: lang === 'zh' ? '云南' : 'Yunnan',
          challenge: lang === 'zh' ? '地形陡峭' : 'Steep terrain',
          strategy: lang === 'zh' ? '吊脚结构 + 屋面排水' : 'Stilted structure + roof drainage',
          outcome: lang === 'zh' ? '土方影响更低' : 'Lower earthwork impact'
        },
      ],
      weilongwu: [
        {
          name: lang === 'zh' ? '亚热带院落住宅' : 'Subtropical Courtyard Housing',
          location: lang === 'zh' ? '广东' : 'Guangdong',
          challenge: lang === 'zh' ? '高温与高湿' : 'Heat and humidity',
          strategy: lang === 'zh' ? '半围合布局 + 冷却庭院' : 'Semi-enclosure + cooling court',
          outcome: lang === 'zh' ? '峰值得热 -18%' : 'Peak heat gain -18%'
        },
        {
          name: lang === 'zh' ? '遗产启发式校园组团' : 'Heritage-Inspired Campus Block',
          location: lang === 'zh' ? '深圳' : 'Shenzhen',
          challenge: lang === 'zh' ? '城市热岛压力' : 'UHI stress',
          strategy: lang === 'zh' ? '通风廊脊 + 遮阴骑楼' : 'Ventilation spine + shaded arcades',
          outcome: lang === 'zh' ? '室外舒适度提升' : 'Outdoor comfort improved'
        },
      ],
    }
    return map[buildingFamily]
  }, [buildingFamily, lang])

  const supplierRows = useMemo<SupplierItem[]>(() => {
    const base: Record<string, SupplierItem[]> = {
      tulou: [
        {
          component: lang === 'zh' ? '结构' : 'Structure',
          material: lang === 'zh' ? '稳定夯土 + 钢筋混凝土框架' : 'Stabilized rammed earth + RC frame',
          unitCost: '¥850/m²',
          supplier: lang === 'zh' ? '福建 EarthTech + 本地石灰供应' : 'Fujian EarthTech + local lime'
        },
        {
          component: lang === 'zh' ? '屋面' : 'Roof',
          material: lang === 'zh' ? '黏土瓦 + 可呼吸防水膜' : 'Clay tile + breathable membrane',
          unitCost: '¥150/m²',
          supplier: lang === 'zh' ? '永定瓦作工坊' : 'Yongding tile workshops'
        },
      ],
      siheyuan: [
        {
          component: lang === 'zh' ? '结构' : 'Structure',
          material: lang === 'zh' ? '胶合木梁' : 'Glulam beams',
          unitCost: '¥1,200/m³',
          supplier: lang === 'zh' ? '江苏林产品供应链' : 'Jiangsu Forest Products'
        },
        {
          component: lang === 'zh' ? '窗体' : 'Windows',
          material: lang === 'zh' ? '三层中空 Low-E 玻璃' : 'Triple-glazed low-E',
          unitCost: '¥1,500/m²',
          supplier: lang === 'zh' ? '上海玻璃供应商' : 'Shanghai glass suppliers'
        },
      ],
      yaodong: [
        {
          component: lang === 'zh' ? '围护' : 'Envelope',
          material: lang === 'zh' ? '覆土混凝土壳体' : 'Earth-bermed concrete shell',
          unitCost: '¥980/m²',
          supplier: lang === 'zh' ? '陕西 GeoBuild' : 'Shaanxi GeoBuild'
        },
        {
          component: lang === 'zh' ? '室内' : 'Interior',
          material: lang === 'zh' ? 'CLT 室内装配' : 'CLT fit-out',
          unitCost: '¥1,400/m³',
          supplier: lang === 'zh' ? '中国西部木材供应网络' : 'Western China timber network'
        },
      ],
      diaojiaolou: [
        {
          component: lang === 'zh' ? '结构' : 'Structure',
          material: lang === 'zh' ? '胶合木/钢混合吊脚框架' : 'Glulam/steel hybrid stilt frame',
          unitCost: '¥1,260/m³',
          supplier: lang === 'zh' ? '贵州木构产业联盟' : 'Guizhou Timber Alliance'
        },
        {
          component: lang === 'zh' ? '楼板' : 'Floor',
          material: lang === 'zh' ? '通风复合地板' : 'Ventilated composite decking',
          unitCost: '¥380/m²',
          supplier: lang === 'zh' ? '云南韧性住宅供应商' : 'Yunnan resilient housing suppliers'
        },
      ],
      weilongwu: [
        {
          component: lang === 'zh' ? '墙体' : 'Walls',
          material: lang === 'zh' ? '高热容砌体' : 'High-thermal-mass masonry',
          unitCost: '¥760/m²',
          supplier: lang === 'zh' ? '广东本地砌体材料场' : 'Guangdong local masonry yards'
        },
        {
          component: lang === 'zh' ? '冷却庭院' : 'Cooling Court',
          material: lang === 'zh' ? '生物滞留设施与透水铺装' : 'Bioretention and permeable paving',
          unitCost: '¥240/m²',
          supplier: lang === 'zh' ? '珠江流域景观供应商' : 'Pearl River landscape suppliers'
        },
      ],
    }
    return base[buildingFamily]
  }, [buildingFamily, lang])

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 shine-sweep"
            style={{ backgroundColor: 'var(--temp-cool-light)', color: 'var(--temp-cool)' }}
          >
            <Database size={14} className="animate-pulse" />
            {lang === 'zh' ? '数据中心' : 'Data Hub'}
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            {t('data.title')}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '基于实测数据的传统建筑气候适应性能分析' : 'Climate adaptation performance analysis based on measured data'}
          </p>
        </div>

        {/* Compact Building Selector */}
        <div className={`modern-card rounded-2xl p-5 mb-6 transition-all duration-700 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Building2 size={18} style={{ color: 'var(--brand-primary)' }} />
              {lang === 'zh' ? '建筑选择' : 'Building Selector'}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '点击图片切换全部数据' : 'Click a photo to update all data'}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {buildings.map((building, idx) => {
              const iconGradient = buildingIcons[building.id].gradient
              const reductionPercent = (building.tempReduction / maxTempReduction) * 100
              const isSelected = selectedBuildingId === building.id
              const buildingRank = dynamicRankById[building.id]

              return (
                <button
                  type="button"
                  key={building.id}
                  className="text-left group"
                  style={{ animationDelay: `${idx * 40}ms` }}
                  onClick={() => setSelectedBuildingId(building.id)}
                >
                  <div
                    className="relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      boxShadow: isSelected ? '0 10px 24px rgba(0,0,0,0.16)' : '0 4px 16px rgba(0,0,0,0.08)',
                      border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)',
                      transform: isSelected ? 'translateY(-2px)' : undefined,
                    }}
                  >
                    <img
                      src={building.previewImage}
                      alt={building.nameEn}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.45) 100%)' }}
                    />
                    <div
                      className="absolute left-2 top-2 text-[10px] px-2 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255,255,255,0.92)',
                        color: isDark ? 'rgba(255,255,255,0.96)' : 'var(--text-primary)',
                        border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(15,23,42,0.06)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.16)'
                      }}
                    >
                      #{buildingRank ?? '—'}
                    </div>
                    <div
                      className="absolute right-2 bottom-2 text-[10px] px-2 py-1 rounded-full font-semibold text-white"
                      style={{ background: iconGradient }}
                    >
                      ↓{building.tempReduction}°C
                    </div>
                  </div>

                  <div className="mt-2 px-1">
                    <div
                      className="text-[11px] font-semibold leading-snug line-clamp-2"
                      style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}
                    >
                      {building.name}
                    </div>
                    <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${reductionPercent}%`, background: iconGradient }}
                      />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Key Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {climateData.map((item, idx) => (
            <div 
              key={idx} 
              className={`modern-card rounded-2xl p-5 hover-lift shine-sweep transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <item.icon size={22} className="text-white" />
              </div>
              <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.note}</div>
            </div>
          ))}
        </div>

        {/* Climate + Carbon Intelligence */}
        <div className={`grid lg:grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Leaf size={16} style={{ color: 'var(--temp-cool)' }} />
              {lang === 'zh' ? '碳排快速估算' : 'Quick Carbon Calculator'}
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between"><span>{lang === 'zh' ? '基线隐含碳' : 'Embodied Baseline'}</span><b>{carbonStats.embodiedBaseline} tCO2e</b></div>
              <div className="flex justify-between"><span>{lang === 'zh' ? '隐含碳减排' : 'Embodied Savings'}</span><b style={{ color: 'var(--temp-cool)' }}>{carbonStats.embodiedSaved} tCO2e ({carbonStats.embodiedSavedPct}%)</b></div>
              <div className="flex justify-between"><span>{lang === 'zh' ? '年运行碳基线' : 'Annual Operational Baseline'}</span><b>{carbonStats.annualOperationalBaseline} tCO2e</b></div>
              <div className="flex justify-between"><span>{lang === 'zh' ? '年运行减排' : 'Annual Operational Savings'}</span><b style={{ color: 'var(--temp-cool)' }}>{carbonStats.annualOperationalSaved} tCO2e ({carbonStats.annualOperationalSavedPct}%)</b></div>
            </div>
          </div>

          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Leaf size={16} style={{ color: 'var(--brand-primary)' }} />
              {lang === 'zh' ? '被动设计策略' : 'Passive Design Strategies'}
            </h3>
            <div className="space-y-2">
              {passiveStrategies.map((s, i) => (
                <div key={`${s.title}-${i}`} className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.impact}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--brand-primary)' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield size={16} style={{ color: 'var(--info)' }} />
              {lang === 'zh' ? '灾害适应评分' : 'Hazard Adaptation Score'}
            </h3>
            <ReactECharts
              option={{
                radar: {
                  radius: 58,
                  splitNumber: 4,
                  indicator: [
                    { name: lang === 'zh' ? '洪涝' : 'Flood', max: 100 },
                    { name: lang === 'zh' ? '台风' : 'Typhoon', max: 100 },
                    { name: lang === 'zh' ? '热浪' : 'Heatwave', max: 100 },
                    { name: lang === 'zh' ? '抗震' : 'Seismic', max: 100 },
                  ],
                  axisName: { color: getEChartsColors(isDark).textColor, fontSize: 10 },
                  splitLine: { lineStyle: { color: getEChartsColors(isDark).splitLineColor } },
                  axisLine: { lineStyle: { color: getEChartsColors(isDark).axisLineColor } },
                },
                series: [{
                  type: 'radar',
                  data: [{
                    value: [hazardScores.flood, hazardScores.typhoon, hazardScores.heatwave, hazardScores.seismic],
                    areaStyle: { color: 'rgba(74,156,109,0.22)' },
                    lineStyle: { color: 'var(--temp-cool)', width: 2 },
                    symbol: 'circle',
                    symbolSize: 5,
                    itemStyle: { color: 'var(--temp-cool)' },
                  }],
                }],
              }}
              style={{ height: '180px', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* Data + Research Depth */}
        <div className={`grid lg:grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-250 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BookOpen size={16} style={{ color: 'var(--brand-primary)' }} />
              {lang === 'zh' ? '来源知识卡片' : 'Source-Linked Knowledge'}
            </h3>
            <div className="space-y-2">
              {sourceLinkedCards.map((s, idx) => (
                <div key={`${s.title}-${idx}`} className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{translateResearchText(s.title, lang)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateResearchText(s.publisher, lang)} • {s.year}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{translateResearchText(s.note, lang)}</div>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs mt-1 inline-block"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      {lang === 'zh' ? '查看来源' : 'Open source'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
              {lang === 'zh' ? '基准案例库' : 'Benchmark Case Library'}
            </h3>
            <div className="space-y-2">
              {benchmarkCases.map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{translateResearchText(c.name, lang)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{translateResearchText(c.location, lang)} • {translateResearchText(c.challenge, lang)}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{translateResearchText(c.strategy, lang)}{' -> '}{translateResearchText(c.outcome, lang)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-card rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Building2 size={16} style={{ color: 'var(--brand-primary)' }} />
              {lang === 'zh' ? '本地供应链' : 'Local Supplier Layer'}
            </h3>
            <div className="space-y-2">
              {supplierRows.map((s, idx) => (
                <div key={`${s.component}-${idx}`} className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{translateResearchText(s.component, lang)}: {translateResearchText(s.material, lang)}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.unitCost}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{translateResearchText(s.supplier, lang)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Temperature Reduction Comparison */}
        <div className={`modern-card rounded-2xl p-6 mb-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-6 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="w-1 h-5 rounded-full"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <ThermometerSun size={18} style={{ color: 'var(--brand-primary)' }} />
            {lang === 'zh' ? '室内外温差对比' : 'Indoor-Outdoor Temperature Difference'}
          </h2>
          
          {/* Visual Temperature Scale Header */}
          <div 
            className="flex items-center justify-between mb-6 p-4 rounded-xl"
            style={{ 
              background: 'linear-gradient(90deg, var(--temp-cool-light) 0%, var(--bg-secondary) 50%, var(--temp-hot-light) 100%)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--temp-cool)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--temp-cool)' }}>
                {lang === 'zh' ? '室内凉爽' : 'Cool Interior'}
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh' ? '传统建筑被动降温效果' : 'Passive Cooling Effect'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--temp-hot)' }}>
                {lang === 'zh' ? '室外炎热' : 'Hot Exterior'}
              </span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--temp-hot)' }} />
            </div>
          </div>

          <div
            className="mb-6 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
            style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
          >
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedBuilding?.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh'
                  ? '当前数据由上方建筑缩略图切换'
                  : 'This data changes with the building thumbnails above'}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
              >
                #{selectedRank ?? selectedResearch?.overallRank ?? '—'}
              </span>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: 'var(--temp-cool-light)', color: 'var(--temp-cool)' }}
              >
                ↓{selectedBuilding?.tempReduction ?? 0}°C
              </span>
            </div>
          </div>

          {selectedResearch && (
            <div
              className="mt-6 rounded-2xl p-4"
              style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {lang === 'zh' ? '文档提取研究快照' : 'Extracted Research Snapshot'}
                </h3>
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
                >
                  #{selectedRank ?? selectedResearch.overallRank}
                </span>
              </div>
              <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {translateResearchText(selectedResearch.primaryStrategy, lang)}
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>{lang === 'zh' ? '夏季温差' : 'Summer Delta'}: {translateResearchText(selectedResearch.summerDelta, lang)}</div>
                <div>{lang === 'zh' ? '冬季温差' : 'Winter Delta'}: {translateResearchText(selectedResearch.winterDelta, lang)}</div>
                <div>{lang === 'zh' ? '气候匹配' : 'Climate Fit'}: {selectedResearch.climateFitStars}/5</div>
                <div>{lang === 'zh' ? '碳效率' : 'Carbon Efficiency'}: {selectedResearch.carbonEfficiencyStars}/5</div>
              </div>
            </div>
          )}
          
          {/* Enhanced Info Card */}
          <div 
            className="mt-8 p-5 rounded-2xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, var(--temp-cool) 0%, #0d9488 100%)',
            }}
          >
            {/* Decorative Pattern */}
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-10"
              style={{
                background: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}
            />
            
            <div className="flex items-start gap-4 relative z-10">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Mountain size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-300" />
                  {selectedBuilding?.name || (lang === 'zh' ? '建筑' : 'Building')}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {selectedResearch
                    ? `${translateResearchText(selectedResearch.overallSummary, lang)}。${lang === 'zh' ? '关键限制' : 'Key limitation'}: ${translateResearchText(selectedResearch.keyLimitation, lang)}${lang === 'zh' ? '。' : '.'}`
                    : (lang === 'zh'
                      ? '该建筑目前没有文档提取研究条目，可继续使用通用数据分析。'
                      : 'No extracted document record is available for this building yet; general analytics are still applied.')}
                </p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{selectedResearch ? `#${selectedRank ?? selectedResearch.overallRank}` : '-'}</div>
                <div className="text-xs text-white/60">{lang === 'zh' ? '综合排名' : 'Overall Rank'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{selectedResearch ? `${selectedResearch.climateFitStars}/5` : '-'}</div>
                <div className="text-xs text-white/60">{lang === 'zh' ? '气候匹配' : 'Climate Fit'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{selectedResearch ? `${selectedResearch.carbonEfficiencyStars}/5` : '-'}</div>
                <div className="text-xs text-white/60">{lang === 'zh' ? '碳效率' : 'Carbon'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Sources & Download */}
        <div 
          className={`modern-card rounded-2xl p-6 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          style={{ backgroundColor: 'var(--nav-bg)' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <Building2 size={28} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Sparkles size={16} style={{ color: 'var(--brand-primary)' }} />
                  {lang === 'zh' ? '数据来源' : 'Data Sources'}
                </h3>
                <p className="text-white/60 text-sm">
                  {lang === 'zh' 
                    ? '本站数据基于学术研究和传统建筑文献，具体性能因地区和建造方式而异。'
                    : 'Data based on academic research and traditional building literature. Performance varies by region and construction.'}
                </p>
              </div>
            </div>
            <Link 
              to="/references" 
              className="btn-seal px-6 py-3 rounded-xl font-medium flex items-center gap-2 group"
            >
              <ExternalLink size={16} />
              {lang === 'zh' ? '查看参考文献' : 'View References'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataHub
