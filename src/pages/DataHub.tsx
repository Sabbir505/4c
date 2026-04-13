import { useState, useEffect, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { Leaf, Building2, ThermometerSun, Droplets, Wind, Sparkles, Database, Mountain, BookOpen, Shield, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildingIcons, getEChartsColors } from '../data/buildings'
import ReactECharts from 'echarts-for-react'
import { BUILDING_PROFILES } from '../data/buildingCatalog'
import { NEW10_RESEARCH_BY_ID } from '../data/new10ResearchData'
import { parseAreaFromText, inferBuildingFamily } from '../utils/analytics'

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

const parseTemperatureValue = (value: string): number | null => {
  const match = value.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

const deriveTempReduction = (internal: string, external: string, fallback: number): number => {
  const internalValue = parseTemperatureValue(internal)
  const externalValue = parseTemperatureValue(external)
  if (internalValue === null || externalValue === null) {
    return fallback
  }

  return Math.max(0, Math.round(externalValue - internalValue))
}

const DataHub = () => {
  const { t, lang } = useLanguage()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [isVisible, setIsVisible] = useState(false)
  const [showAllBuildings, setShowAllBuildings] = useState(false)
  const [selectedBuildingId, setSelectedBuildingId] = useState(BUILDING_PROFILES[0].id)
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

  // Building icon components with modern styling - imported from shared data

  const familyDashboardMetrics: Record<string, { energy: number; carbon: number; comfort: number; tempReductionFallback: number }> = {
    tulou: { energy: 85, carbon: 78, comfort: 82, tempReductionFallback: 13 },
    siheyuan: { energy: 72, carbon: 70, comfort: 88, tempReductionFallback: 10 },
    yaodong: { energy: 95, carbon: 92, comfort: 75, tempReductionFallback: 20 },
    diaojiaolou: { energy: 68, carbon: 65, comfort: 85, tempReductionFallback: 6 },
    weilongwu: { energy: 78, carbon: 75, comfort: 80, tempReductionFallback: 13 },
  }

  const buildings = BUILDING_PROFILES.map((profile) => {
    const familyMetrics = familyDashboardMetrics[profile.family]
    return {
      id: profile.id,
      name: lang === 'zh' ? profile.nameZh : profile.nameEn,
      nameEn: profile.nameEn,
      family: profile.family,
      previewImage: profile.previewImage,
      energy: familyMetrics.energy,
      carbon: familyMetrics.carbon,
      comfort: familyMetrics.comfort,
      tempReduction: deriveTempReduction(
        profile.tempInternal,
        profile.tempExternal,
        familyMetrics.tempReductionFallback
      ),
    }
  })

  const visibleBuildings = showAllBuildings ? buildings : buildings.slice(0, 5)
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0]
  const selectedResearch = selectedBuilding ? NEW10_RESEARCH_BY_ID[selectedBuilding.id] : undefined

  
  const climateData = [
    { label: lang === 'zh' ? '温度稳定性' : 'Temperature Stability', value: lang === 'zh' ? '显著改善' : 'Significant', icon: ThermometerSun, color: 'var(--temp-hot)', note: lang === 'zh' ? '研究表明窑洞冬季室温可达8-12°C' : 'Studies show cave dwellings maintain 8-12°C in winter' },
    { label: lang === 'zh' ? '湿度调节' : 'Humidity Control', value: lang === 'zh' ? '因地而异' : 'Varies', icon: Droplets, color: 'var(--info)', note: lang === 'zh' ? '南方传统民居室内湿度约53-83%' : 'Southern residences show 53-83% indoor humidity' },
    { label: lang === 'zh' ? '自然通风' : 'Natural Ventilation', value: lang === 'zh' ? '核心策略' : 'Key Strategy', icon: Wind, color: 'var(--temp-cool)', note: lang === 'zh' ? '院落与烟囱效应是主要通风手段' : 'Courtyard and stack effect are primary ventilation methods' },
    { label: lang === 'zh' ? '能源效益' : 'Energy Benefits', value: lang === 'zh' ? '有据可查' : 'Documented', icon: Leaf, color: 'var(--brand-primary)', note: lang === 'zh' ? '被动式设计可显著降低能耗' : 'Passive design significantly reduces energy demand' },
  ]

  const areaM2 = useMemo(() => parseAreaFromText(analysisProfile.landSize), [analysisProfile.landSize])
  const buildingFamily = useMemo(
    () => selectedBuilding?.family ?? inferBuildingFamily(analysisProfile.buildingType),
    [selectedBuilding, analysisProfile.buildingType]
  )

  const carbonStats = useMemo(() => {
    const embodiedBaselineFactor = 520
    const embodiedReductionMap: Record<string, number> = {
      tulou: 0.26,
      siheyuan: 0.21,
      yaodong: 0.31,
      diaojiaolou: 0.28,
      weilongwu: 0.23,
    }
    const operationalBaselineFactor = 68
    const operationalReductionMap: Record<string, number> = {
      tulou: 0.24,
      siheyuan: 0.2,
      yaodong: 0.34,
      diaojiaolou: 0.27,
      weilongwu: 0.22,
    }
    const embodiedBaseline = Math.round((areaM2 * embodiedBaselineFactor) / 1000)
    const embodiedSaved = Math.round(embodiedBaseline * embodiedReductionMap[buildingFamily])
    const annualOperationalBaseline = Math.round((areaM2 * operationalBaselineFactor) / 1000)
    const annualOperationalSaved = Math.round(annualOperationalBaseline * operationalReductionMap[buildingFamily])

    return {
      embodiedBaseline,
      embodiedSaved,
      embodiedSavedPct: Math.round((embodiedSaved / Math.max(embodiedBaseline, 1)) * 100),
      annualOperationalBaseline,
      annualOperationalSaved,
      annualOperationalSavedPct: Math.round((annualOperationalSaved / Math.max(annualOperationalBaseline, 1)) * 100),
    }
  }, [areaM2, buildingFamily])

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
        { title: 'Fujian Tulou and Earthen Construction', publisher: 'UNESCO WHC', year: '2008', note: 'Thermal mass and communal courtyards' },
        { title: 'Rammed Earth for Low-Carbon Buildings', publisher: 'Journal of Green Building', year: '2022', note: 'Embodied carbon reductions vs concrete' },
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
        { title: 'Thermal Behavior of Cave Dwellings', publisher: 'Building and Environment', year: '2020', note: 'Stable indoor temperatures via earth sheltering' },
        { title: 'Earth-Covered Housing and Energy Performance', publisher: 'Passivhaus Institute Notes', year: '2022', note: 'Low HVAC dependence' },
      ],
      diaojiaolou: [
        { title: 'Vernacular Stilted Housing in Southwest China', publisher: 'Regional Architecture Studies', year: '2021', note: 'Flood resilience and ventilation' },
        { title: 'Timber Elevated Structures in Humid Climates', publisher: 'Sustainable Structures Journal', year: '2023', note: 'Moisture and durability response' },
      ],
      weilongwu: [
        { title: 'Hakka Walled Enclosures and Microclimate', publisher: 'South China Vernacular Archive', year: '2019', note: 'Semi-enclosed massing and airflow' },
        { title: 'Courtyard Cooling and Urban Heat Mitigation', publisher: 'Climate Responsive Design', year: '2022', note: 'Cooling courtyards and water bodies' },
      ],
    }
    return sourceMap[buildingFamily]
  }, [buildingFamily, lang])

  const benchmarkCases = useMemo<CaseItem[]>(() => {
    const map: Record<string, CaseItem[]> = {
      tulou: [
        { name: 'Modern Earthen Community Hub', location: 'Fujian', challenge: 'Hot-humid summer', strategy: 'Rammed-earth envelope + shaded court', outcome: 'Cooling load -22%' },
        { name: 'Circular Co-living Block', location: 'Xiamen', challenge: 'Typhoon exposure', strategy: 'Aerodynamic massing + reinforced shell', outcome: 'Wind resilience improved' },
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
        { name: 'Earth-Sheltered School', location: 'Shaanxi', challenge: 'Large diurnal swing', strategy: 'Earth berm + thermal buffer', outcome: 'HVAC demand -31%' },
        { name: 'Loess Plateau Visitor Center', location: 'Yan\'an', challenge: 'Dry heat and winter cold', strategy: 'Semi-buried massing', outcome: 'Annual energy -28%' },
      ],
      diaojiaolou: [
        { name: 'Raised Timber Health Clinic', location: 'Guizhou', challenge: 'Flood and humidity', strategy: 'Elevated floor + cross ventilation', outcome: 'Moisture incidents reduced' },
        { name: 'Slope-Adapted Community Hall', location: 'Yunnan', challenge: 'Steep terrain', strategy: 'Stilted structure + roof drainage', outcome: 'Lower earthwork impact' },
      ],
      weilongwu: [
        { name: 'Subtropical Courtyard Housing', location: 'Guangdong', challenge: 'Heat and humidity', strategy: 'Semi-enclosure + cooling court', outcome: 'Peak heat gain -18%' },
        { name: 'Heritage-Inspired Campus Block', location: 'Shenzhen', challenge: 'UHI stress', strategy: 'Ventilation spine + shaded arcades', outcome: 'Outdoor comfort improved' },
      ],
    }
    return map[buildingFamily]
  }, [buildingFamily, lang])

  const supplierRows = useMemo<SupplierItem[]>(() => {
    const base: Record<string, SupplierItem[]> = {
      tulou: [
        { component: 'Structure', material: 'Stabilized rammed earth + RC frame', unitCost: '¥850/m²', supplier: 'Fujian EarthTech + local lime' },
        { component: 'Roof', material: 'Clay tile + breathable membrane', unitCost: '¥150/m²', supplier: 'Yongding tile workshops' },
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
        { component: 'Envelope', material: 'Earth-bermed concrete shell', unitCost: '¥980/m²', supplier: 'Shaanxi GeoBuild' },
        { component: 'Interior', material: 'CLT fit-out', unitCost: '¥1,400/m³', supplier: 'Western China timber network' },
      ],
      diaojiaolou: [
        { component: 'Structure', material: 'Glulam/steel hybrid stilt frame', unitCost: '¥1,260/m³', supplier: 'Guizhou Timber Alliance' },
        { component: 'Floor', material: 'Ventilated composite decking', unitCost: '¥380/m²', supplier: 'Yunnan resilient housing suppliers' },
      ],
      weilongwu: [
        { component: 'Walls', material: 'High-thermal-mass masonry', unitCost: '¥760/m²', supplier: 'Guangdong local masonry yards' },
        { component: 'Cooling Court', material: 'Bioretention and permeable paving', unitCost: '¥240/m²', supplier: 'Pearl River landscape suppliers' },
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
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.publisher} • {s.year}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.note}</div>
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
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.location} • {c.challenge}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.strategy}{' -> '}{c.outcome}</div>
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
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.component}: {s.material}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.unitCost}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.supplier}</div>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {visibleBuildings.map((building, idx) => {
              const iconGradient = buildingIcons[building.id].gradient
              const maxReduction = 20
              const reductionPercent = (building.tempReduction / maxReduction) * 100
              const isSelected = selectedBuildingId === building.id
              
              return (
                <div 
                  key={building.id} 
                  className="text-center stagger-item group cursor-pointer" 
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    transform: isSelected ? 'translateY(-2px)' : undefined,
                  }}
                  onClick={() => setSelectedBuildingId(building.id)}
                >
                  {/* Icon Container with Glow Effect */}
                  <div className="relative mb-4">
                    <div 
                      className="w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer relative overflow-hidden"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        boxShadow: isSelected ? '0 12px 28px rgba(0,0,0,0.18)' : '0 8px 32px rgba(0,0,0,0.12)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-light)'
                      }}
                    >
                      <img
                        src={building.previewImage}
                        alt={building.nameEn}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.35) 100%)'
                        }}
                      />
 
                      {/* Hover Ring Effect */}
                      <div 
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                        style={{
                          boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
                        }}
                      />
                    </div>
                    
                    {/* Temperature Badge */}
                    <div 
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        background: building.tempReduction >= 15 ? 'var(--temp-cool)' : building.tempReduction >= 10 ? 'var(--info)' : 'var(--brand-primary)',
                        color: 'white'
                      }}
                    >
                      ↓{building.tempReduction}°C
                    </div>
                  </div>
                  
                  {/* Building Name */}
                  <div 
                    className="font-semibold text-sm mb-2 transition-colors duration-300 group-hover:text-(--brand-primary)" 
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {building.name}
                  </div>
                  
                  {/* Mini Progress Bar */}
                  <div 
                    className="h-1.5 rounded-full overflow-hidden mx-auto"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      width: '80%'
                    }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${reductionPercent}%`,
                        background: iconGradient
                      }}
                    />
                  </div>
                  
                  {/* Efficiency Label */}
                  <div 
                    className="text-[10px] mt-2 font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {building.tempReduction >= 15 
                      ? (lang === 'zh' ? '卓越' : 'Excellent')
                      : building.tempReduction >= 10 
                        ? (lang === 'zh' ? '优秀' : 'Great')
                        : (lang === 'zh' ? '良好' : 'Good')
                    }
                  </div>
                  {isSelected && (
                    <div className="text-[10px] mt-1 font-semibold" style={{ color: 'var(--brand-primary)' }}>
                      {lang === 'zh' ? '已选择' : 'Selected'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {buildings.length > 5 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllBuildings((prev) => !prev)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'white',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.14)'
                }}
              >
                {showAllBuildings
                  ? (lang === 'zh' ? '收起建筑' : 'Show Less')
                  : (lang === 'zh' ? '更多建筑' : 'More Buildings')}
              </button>
            </div>
          )}

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
                  #{selectedResearch.overallRank}
                </span>
              </div>
              <div className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {selectedResearch.primaryStrategy}
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>{lang === 'zh' ? '夏季温差' : 'Summer Delta'}: {selectedResearch.summerDelta}</div>
                <div>{lang === 'zh' ? '冬季温差' : 'Winter Delta'}: {selectedResearch.winterDelta}</div>
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
                  {selectedBuilding?.name || 'Building'}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {selectedResearch
                    ? `${selectedResearch.overallSummary}. ${lang === 'zh' ? '关键限制' : 'Key limitation'}: ${selectedResearch.keyLimitation}.`
                    : (lang === 'zh'
                      ? '该建筑目前没有文档提取研究条目，可继续使用通用数据分析。'
                      : 'No extracted document record is available for this building yet; general analytics are still applied.')}
                </p>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{selectedResearch ? `#${selectedResearch.overallRank}` : '-'}</div>
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
