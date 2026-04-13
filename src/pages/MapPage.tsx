import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { Thermometer, Droplets, CloudRain, MapPin, ArrowRight, Layers, Info, X } from 'lucide-react'
import { buildingIcons, BUILDING_COLORS, BUILDING_COORDS, getEChartsColors } from '../data/buildings'
import { useTheme } from '../context/ThemeContext'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { assetUrl } from '../utils/assetUrl'
import { BUILDING_PROFILES } from '../data/buildingCatalog'

interface EChartsParams {
  componentType?: string
  name?: string
  data?: {
    name: string
    buildingId?: string
    tempValue: number
    humidValue: number
    precipValue: number
  }
}

type FilterType = 'temperature' | 'humidity' | 'precipitation' | null

// Province name translations for English mode
const provinceNameEN: Record<string, string> = {
  '北京市': 'Beijing', '天津市': 'Tianjin', '河北省': 'Hebei', '山西省': 'Shanxi',
  '内蒙古自治区': 'Inner Mongolia', '辽宁省': 'Liaoning', '吉林省': 'Jilin',
  '黑龙江省': 'Heilongjiang', '上海市': 'Shanghai', '江苏省': 'Jiangsu',
  '浙江省': 'Zhejiang', '安徽省': 'Anhui', '福建省': 'Fujian', '江西省': 'Jiangxi',
  '山东省': 'Shandong', '河南省': 'Henan', '湖北省': 'Hubei', '湖南省': 'Hunan',
  '广东省': 'Guangdong', '广西壮族自治区': 'Guangxi', '海南省': 'Hainan',
  '重庆市': 'Chongqing', '四川省': 'Sichuan', '贵州省': 'Guizhou', '云南省': 'Yunnan',
  '西藏自治区': 'Tibet', '陕西省': 'Shaanxi', '甘肃省': 'Gansu', '青海省': 'Qinghai',
  '宁夏回族自治区': 'Ningxia', '新疆维吾尔自治区': 'Xinjiang', '台湾省': 'Taiwan',
  '香港特别行政区': 'Hong Kong', '澳门特别行政区': 'Macao', '南海诸岛': 'South China Sea Islands',
}

// Buildings most relevant to each climate data layer
const filterRelevance: Record<Exclude<FilterType, null>, string[]> = {
  temperature: ['yaodong', 'siheyuan', 'northwest-adobe-house', 'xinjiang-uyghur-flat-roof-house', 'northeast-manor-house', 'beijing-northern-rural-house'],
  humidity: ['tulou', 'diaojiaolou', 'weilongwu', 'jiangnan-water-town-house', 'lingnan-residence', 'sichuan-folk-house'],
  precipitation: ['tulou', 'diaojiaolou', 'weilongwu', 'jiangnan-water-town-house', 'lingnan-residence', 'sichuan-folk-house', 'yi-bai-traditional-houses'],
}

const MapPage = () => {
  const { t, lang } = useLanguage()
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [mapLoaded, setMapLoaded] = useState(false)

  // Trigger entrance animations
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Load China GeoJSON for ECharts geo map
  useEffect(() => {
    fetch(assetUrl('data/china.json'))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        echarts.registerMap('china', data)
        setMapLoaded(true)
      })
      .catch(err => {
        console.error('Failed to load China map data:', err)
        // Fallback: try the external API
        fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
          })
          .then(data => {
            echarts.registerMap('china', data)
            setMapLoaded(true)
          })
          .catch(err2 => {
            console.error('Fallback also failed:', err2)
            setMapLoaded(true) // Set loaded to avoid infinite spinner
          })
      })
  }, [])

  const buildings = BUILDING_PROFILES.map((b) => ({
    ...b,
    name: lang === 'zh' ? b.nameZh : b.nameEn,
    region: lang === 'zh' ? b.regionZh : b.regionEn,
    climate: b.climateZh,
    climateEn: b.climateEn,
  }))

  const relevantIds = activeFilter ? filterRelevance[activeFilter] : []
  const relevantBuildings = activeFilter ? buildings.filter(b => relevantIds.includes(b.id)) : []

  const filterConfig = {
    temperature: { icon: Thermometer, label: t('map.temperature'), color: 'var(--temp-hot)', bgColor: 'var(--temp-hot-light)' },
    humidity: { icon: Droplets, label: t('map.humidity'), color: 'var(--info)', bgColor: 'var(--info-light)' },
    precipitation: { icon: CloudRain, label: t('map.precipitation'), color: 'var(--temp-cool)', bgColor: 'var(--temp-cool-light)' },
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 shine-sweep"
            style={{ 
              backgroundColor: 'var(--brand-primary-glow)',
              color: 'var(--brand-primary)'
            }}
            
          >
            <Layers size={14} className="animate-pulse" />
            {lang === 'zh' ? '交互式地图' : 'Interactive Map'}
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            {t('map.title')}
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Map Section */}
          <div 
            className={`modern-card rounded-2xl overflow-hidden transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          >
            {/* Filter Bar */}
            <div 
              className="px-5 py-4 flex flex-wrap items-center gap-3"
              style={{ backgroundColor: 'var(--nav-bg)' }}
            >
              <span className="text-white/60 text-sm font-medium flex items-center gap-2">
                <Layers size={14} />
                {lang === 'zh' ? '数据层' : 'Data Layer'}:
              </span>
              {(['temperature', 'humidity', 'precipitation'] as const).map((filter) => {
                const config = filterConfig[filter]
                const Icon = config.icon
                const isActive = activeFilter === filter
                return (
                  <button 
                    key={filter} 
                    onClick={() => setActiveFilter(isActive ? null : filter)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive ? 'text-white shadow-lg scale-105' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent'
                    }}
                  >
                    <Icon size={14} />
                    {config.label}
                  </button>
                )
              })}
            </div>

            {/* Relevant Buildings */}
            <div 
              className="px-5 py-3 flex items-center gap-3 overflow-x-auto"
              style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--surface-card)' }}
            >
              <span className="text-xs font-medium whitespace-nowrap flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Layers size={12} style={{ color: 'var(--brand-primary)' }} />
                {lang === 'zh' ? '相关建筑' : 'Related'}:
              </span>
              {relevantBuildings.map(b => {
                const filterValue = activeFilter === 'temperature' ? `${b.tempValue}°C` : activeFilter === 'humidity' ? `${b.humidValue}%` : `${b.precipValue}mm`
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuilding(b.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105 flex-shrink-0 ${
                      selectedBuilding === b.id ? 'ring-2 ring-[var(--brand-primary)]' : ''
                    }`}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <img
                        src={b.previewImage}
                        alt={b.nameEn}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{b.name}</div>
                      <div className="text-xs font-bold" style={{ color: BUILDING_COLORS[b.id] }}>{filterValue}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Map Area */}
            <div 
              className="relative h-[550px]"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {/* Interactive ECharts Geo Map */}
              {mapLoaded ? (
                <ReactECharts
                  option={{
                    tooltip: {
                      trigger: 'item',
                      backgroundColor: getEChartsColors(isDark).tooltipBg,
                      borderColor: getEChartsColors(isDark).tooltipBorder,
                      textStyle: { color: getEChartsColors(isDark).textColor },
                      formatter: (params: EChartsParams) => {
                        if (params.componentType === 'geo') {
                          const name = params.name || ''
                          return lang === 'zh' ? name : (provinceNameEN[name] || name)
                        }
                        const d = params.data
                        if (!d) return ''
                        return `<b>${d.name}</b><br/>${lang === 'zh' ? '温度' : 'Temp'}: ${d.tempValue}°C<br/>${lang === 'zh' ? '湿度' : 'Humidity'}: ${d.humidValue}%<br/>${lang === 'zh' ? '降水' : 'Precip'}: ${d.precipValue}mm`
                      }
                    },
                    geo: {
                      map: 'china',
                      roam: true,
                      zoom: 1.2,
                      center: [105, 35],
                      label: { show: false },
                      itemStyle: {
                        areaColor: isDark
                          ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                              { offset: 0, color: '#2a2d3a' },
                              { offset: 1, color: '#1e2030' },
                            ])
                          : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                              { offset: 0, color: '#e8dfd3' },
                              { offset: 1, color: '#d4c9b8' },
                            ]),
                        borderColor: isDark ? 'rgba(140,160,200,0.35)' : '#a89880',
                        borderWidth: 1.2,
                        shadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)',
                        shadowBlur: 8,
                      },
                      emphasis: {
                        itemStyle: {
                          areaColor: isDark ? '#3a3f55' : '#c9b99a',
                          borderColor: isDark ? 'rgba(180,200,255,0.6)' : '#8a7560',
                          borderWidth: 2,
                        },
                        label: {
                          show: true,
                          color: getEChartsColors(isDark).textColor,
                          fontSize: 12,
                          formatter: (params: EChartsParams) => lang === 'zh' ? params.name : (provinceNameEN[params.name!] || params.name),
                        },
                      },
                    },
                    series: [{
                      type: 'effectScatter',
                      coordinateSystem: 'geo',
                      data: (activeFilter ? relevantBuildings : buildings).map(b => {
                        const coords = BUILDING_COORDS[b.id as keyof typeof BUILDING_COORDS]
                        const filterValue = activeFilter === 'temperature' ? b.tempValue : activeFilter === 'humidity' ? b.humidValue : activeFilter === 'precipitation' ? b.precipValue : 20
                        return {
                          name: b.name,
                          value: [...coords, filterValue],
                          buildingId: b.id,
                          tempValue: b.tempValue,
                          humidValue: b.humidValue,
                          precipValue: b.precipValue,
                          itemStyle: { color: BUILDING_COLORS[b.id] },
                          symbolSize: activeFilter ? Math.max(20, filterValue / (activeFilter === 'precipitation' ? 45 : 2.5)) : 25,
                        }
                      }),
                      rippleEffect: { brushType: 'stroke', scale: 3, period: 4 },
                      label: {
                        show: true,
                        formatter: '{b}',
                        position: 'right',
                        color: getEChartsColors(isDark).textColor,
                        fontSize: 12,
                        fontWeight: 'bold',
                      },
                    }],
                  }}
                  style={{ height: '100%', width: '100%' }}
                  className="absolute inset-0 z-[1]"
                  opts={{ renderer: 'canvas' }}
                  notMerge={true}
                  onEvents={{
                    click: (params: EChartsParams) => {
                      if (params.data?.buildingId) {
                        setSelectedBuilding(selectedBuilding === params.data.buildingId ? null : params.data.buildingId)
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--brand-primary)' }} />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{lang === 'zh' ? '地图加载中...' : 'Loading map...'}</p>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div 
                className="absolute bottom-4 left-4 rounded-xl p-4 shadow-lg"
                style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
              >
                <div className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Info size={12} />
                  {t('map.legend')}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--temp-hot)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{t('map.hot')} (25°C+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--info)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{t('map.cold')} (&lt;15°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--temp-cool)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{t('map.humid')} (70%+)</span>
                  </div>
                </div>
              </div>

              {/* Map Source Link */}
              <div 
                className="absolute bottom-4 right-4 rounded-lg px-3 py-2 shadow-md z-10"
                style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
              >
                <a 
                  href="http://english.www.gov.cn/archive/chinaabc/202303/29/content_WS6423ecc9c6d0f528699dc621.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1.5 hover:underline"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  <Info size={12} />
                  {lang === 'zh' ? '地图数据来源' : 'Map Source'}
                </a>
              </div>

              {/* Selected building detail panel */}
              {selectedBuilding && (() => {
                const data = buildings.find(b => b.id === selectedBuilding)
                if (!data) return null
                const IconComp = buildingIcons[data.id].icon
                const iconGradient = buildingIcons[data.id].gradient
                return (
                  <div 
                    className="absolute top-4 left-4 rounded-2xl p-5 shadow-xl w-72 fade-in"
                    style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)', zIndex: 50 }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ background: iconGradient }}
                      >
                        <IconComp size={24} className="text-white" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{data.name}</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{data.nameEn}</div>
                      </div>
                      <button
                        onClick={() => setSelectedBuilding(null)}
                        className="p-1.5 rounded-lg transition-all duration-200 hover:bg-[var(--bg-secondary)] hover:scale-110 hover:rotate-90 active:scale-95"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          {lang === 'zh' ? '切换建筑' : 'Switch Building'}
                        </label>
                        <select
                          value={selectedBuilding}
                          onChange={(e) => setSelectedBuilding(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-md text-sm bg-transparent focus:outline-none"
                          style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                        >
                          {buildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.nameEn})
                            </option>
                          ))}
                        </select>
                      </div>

                      {[
                        { icon: MapPin, label: t('map.location'), value: data.region },
                        { icon: Thermometer, label: lang === 'zh' ? '年均温' : 'Avg Temp', value: `${data.tempValue}°C`, color: 'var(--temp-hot)' },
                        { icon: Droplets, label: lang === 'zh' ? '湿度' : 'Humidity', value: `${data.humidValue}%`, color: 'var(--info)' },
                        { icon: CloudRain, label: lang === 'zh' ? '降水' : 'Precip', value: `${data.precipValue}mm`, color: 'var(--temp-cool)' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-2.5 rounded-lg"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <item.icon size={14} style={{ color: item.color || 'var(--text-muted)' }} />
                            {item.label}
                          </span>
                          <span className="font-semibold text-sm" style={{ color: item.color || 'var(--text-primary)' }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/building/${data.id}`} 
                      className="btn-seal block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold group"
                    >
                      {t('map.viewDetails')}
                      <ArrowRight size={14} className="inline ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                )
              })()}
            </div>

            <div
              className="px-5 py-2 text-xs"
              style={{
                borderTop: '1px solid var(--border-default)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-muted)'
              }}
            >
              审图号：GS(2016)1600号
            </div>
          </div>

          {/* Building List Sidebar */}
          <div 
            className={`modern-card rounded-2xl p-5 h-fit lg:max-h-[650px] overflow-hidden flex flex-col transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
          >
            <h3 
              className="font-bold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="w-1 h-5 rounded-full"
                style={{ background: 'var(--gradient-brand)' }}
              />
              {t('map.allBuildings')}
            </h3>
            
            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {buildings.map((building, index) => {
                const IconComp = buildingIcons[building.id].icon
                const iconGradient = buildingIcons[building.id].gradient
                const isRelevant = activeFilter ? relevantIds.includes(building.id) : true
                
                return (
                  <div 
                    key={building.id} 
                    onClick={() => setSelectedBuilding(building.id)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                      selectedBuilding === building.id
                        ? 'ring-2 ring-(--brand-primary) shadow-lg'
                        : 'hover:-translate-y-0.5 hover:shadow-md'
                    } ${!isRelevant ? 'opacity-45' : ''}`}
                    style={{ 
                      backgroundColor: selectedBuilding === building.id ? 'var(--bg-secondary)' : 'var(--surface-hover)',
                      borderColor: selectedBuilding === building.id ? 'var(--brand-primary)' : 'var(--border-default)',
                      opacity: 0,
                      animation: `slideUpReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08 + 0.3}s forwards`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-14 h-14 rounded-lg overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        <img
                          src={building.previewImage}
                          alt={building.nameEn}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                            style={{ background: iconGradient }}
                          >
                            <IconComp size={14} className="text-white" strokeWidth={2} />
                          </span>
                          <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                            {building.name}
                          </span>
                        </div>
                        <div className="text-xs mb-1 truncate" style={{ color: 'var(--text-muted)' }}>{building.region}</div>
                        <div 
                          className="text-[11px] font-medium block w-full px-2.5 py-1.5 rounded-lg leading-snug wrap-break-word"
                          style={{
                            backgroundColor: selectedBuilding === building.id ? 'var(--brand-primary-glow)' : 'var(--bg-secondary)',
                            color: selectedBuilding === building.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {lang === 'zh' ? building.climate : building.climateEn}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <Link 
              to="/comparison" 
              className="btn-seal mt-4 flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold group"
            >
              {lang === 'zh' ? '对比建筑' : 'Compare Buildings'}
              <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      
      </div>
  )
}

export default MapPage
