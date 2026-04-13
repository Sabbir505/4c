import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, Suspense, useEffect } from 'react'
import { Play, Pause, ArrowLeft, Thermometer, Droplets, CloudRain, Leaf, Clock, Box, Video } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import ModelViewer from '../components/ModelViewer'
import CrossSectionViewer from '../components/CrossSectionViewer'
import { BUILDING_PROFILES, BUILDING_PROFILE_MAP } from '../data/buildingCatalog'
import { NEW10_RESEARCH_BY_ID } from '../data/new10ResearchData'
import { getBuildingTimeline } from '../data/buildingHistories'
import type { BuildingId } from '../data/buildings'

const getSafeBuildingId = (value: string | undefined): BuildingId => {
  if (value && value in BUILDING_PROFILE_MAP) {
    return value as BuildingId
  }
  return 'tulou'
}

const BuildingDetail = () => {
  const { t, lang } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<'airflow' | 'thermal' | 'moisture'>('airflow')
  const [isAnimating, setIsAnimating] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [displayMode, setDisplayMode] = useState<'3d' | 'video'>('3d')
  
  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])
  
  const selectedId = getSafeBuildingId(id)
  const baseData = BUILDING_PROFILE_MAP[selectedId]
  
  const building = {
    ...baseData,
    name: lang === 'zh' ? baseData.nameZh : baseData.nameEn,
    region: lang === 'zh' ? baseData.regionZh : baseData.regionEn,
    climate: lang === 'zh' ? baseData.climateZh : baseData.climateEn,
    adaptations: lang === 'zh' ? baseData.adaptationsZh : baseData.adaptationsEn,
  }
  const research = NEW10_RESEARCH_BY_ID[building.id]

  const viewModes = [
    { key: 'airflow', label: t('detail.airflow'), color: 'var(--info)' },
    { key: 'thermal', label: t('detail.thermal'), color: 'var(--temp-hot)' },
    { key: 'moisture', label: t('detail.moisture'), color: 'var(--temp-cool)' },
  ]

  const timelineData = getBuildingTimeline(building.id, lang)

  const allBuildings = BUILDING_PROFILES.map((b) => ({
    id: b.id,
    name: lang === 'zh' ? b.nameZh : b.nameEn,
    nameEn: b.nameEn,
  }))

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link 
          to="/map" 
          className={`inline-flex items-center gap-2 text-sm font-medium mb-6 transition-all duration-500 hover:gap-3 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          {lang === 'zh' ? '返回地图' : 'Back to Map'}
        </Link>

        {/* Hero Section */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            {/* Left: 3D Model & Info */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 
                    className="text-3xl font-bold mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
                  >
                    {building.name}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {building.nameEn} • {building.region}
                  </p>
                  <div className="mt-3">
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '切换建筑' : 'Switch Building'}
                    </label>
                    <select
                      value={building.id}
                      onChange={(e) => navigate(`/building/${e.target.value}`)}
                      className="px-3 py-2 rounded-lg text-sm bg-transparent focus:outline-none min-w-60"
                      style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    >
                      {allBuildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* 3D / Video Toggle */}
                <div 
                  className="flex items-center gap-1 p-1 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <button
                    onClick={() => setDisplayMode('3d')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      displayMode === '3d' ? 'shadow-md' : ''
                    }`}
                    style={{ 
                      backgroundColor: displayMode === '3d' ? 'var(--brand-primary)' : 'transparent',
                      color: displayMode === '3d' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <Box size={16} />
                    {lang === 'zh' ? '3D模型' : '3D Model'}
                  </button>
                  <button
                    onClick={() => setDisplayMode('video')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      displayMode === 'video' ? 'shadow-md' : ''
                    }`}
                    style={{ 
                      backgroundColor: displayMode === 'video' ? 'var(--brand-primary)' : 'transparent',
                      color: displayMode === 'video' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <Video size={16} />
                    {lang === 'zh' ? '视频' : 'Video'}
                  </button>
                </div>
              </div>
              
              <div 
                className="rounded-xl overflow-hidden flex-1 relative"
                style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '300px' }}
              >
                {displayMode === '3d' ? (
                  <ModelViewer
                    key={building.glbModel}
                    src={building.glbModel}
                    alt={building.nameEn}
                    autoRotate
                    cameraControls
                    poster={building.previewImage}
                    className="w-full h-full"
                  />
                ) : (
                  <video
                    src={baseData.videoPath}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-contain"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    {lang === 'zh' ? '您的浏览器不支持视频播放' : 'Your browser does not support video playback'}
                  </video>
                )}
              </div>
            </div>
            
            {/* Right: Climate Data Panel */}
            <div 
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <h2 
                className="font-bold mb-4 text-sm flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <div 
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'var(--gradient-brand)' }}
                />
                {t('detail.climatePanel')}
              </h2>
              
              <div className="space-y-3">
                {/* Temperature */}
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--surface-card)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer size={14} style={{ color: 'var(--temp-hot)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('detail.tempRange')}</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{building.tempRange}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span style={{ color: 'var(--temp-cool)' }}>{lang === 'zh' ? '室内' : 'Indoor'}: {building.tempInternal}</span>
                    <span style={{ color: 'var(--temp-hot)' }}>{lang === 'zh' ? '室外' : 'Outdoor'}: {building.tempExternal}</span>
                  </div>
                </div>
                
                {/* Humidity */}
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--surface-card)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets size={14} style={{ color: 'var(--info)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('detail.humidity')}</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{building.humidity}</div>
                </div>
                
                {/* Precipitation */}
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--surface-card)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain size={14} style={{ color: 'var(--temp-cool)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('detail.precipitation')}</span>
                  </div>
                  <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{building.precipitation}</div>
                </div>
                
                {/* Modern Equivalent */}
                <div 
                  className="rounded-lg p-3"
                  style={{ backgroundColor: 'var(--temp-cool-light)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf size={14} style={{ color: 'var(--temp-cool)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--temp-cool)' }}>
                      {lang === 'zh' ? '现代应用' : 'Modern Equivalent'}
                    </span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: 'var(--temp-cool)' }}>
                    {lang === 'zh' ? building.modernEquivalent.zh : building.modernEquivalent.en}
                  </div>
                </div>

                {research && (
                  <div
                    className="rounded-lg p-3"
                    style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {lang === 'zh' ? '文档提取研究' : 'Extracted Research'}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
                      >
                        #{research.overallRank}
                      </span>
                    </div>
                    <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {research.primaryStrategy}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{lang === 'zh' ? '夏季温差' : 'Summer Delta'}: {research.summerDelta}</span>
                      <span>{lang === 'zh' ? '冬季温差' : 'Winter Delta'}: {research.winterDelta}</span>
                    </div>
                    <div className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '来源' : 'Source'}: {research.keyMeasurementSource}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Section Viewer */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
            <h2 
              className="font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="w-1 h-5 rounded-full"
                style={{ background: 'var(--gradient-brand)' }}
              />
              {t('detail.crossSection')}
            </h2>
            
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isAnimating ? 'btn-seal' : ''
              }`}
              style={!isAnimating ? { 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-primary)' 
              } : undefined}
            >
              {isAnimating ? <Pause size={16} /> : <Play size={16} />}
              {isAnimating ? (lang === 'zh' ? '暂停' : 'Pause') : (lang === 'zh' ? '播放' : 'Play')}
            </button>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-5">
            {viewModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setActiveView(mode.key as typeof activeView)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === mode.key ? 'shadow-md' : ''
                }`}
                style={{ 
                  backgroundColor: activeView === mode.key ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                  color: activeView === mode.key ? 'white' : 'var(--text-secondary)'
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
          
          {/* 3D Viewer */}
          <div 
            className="h-80 rounded-xl overflow-hidden relative"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: 'var(--brand-primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>{lang === 'zh' ? '加载 3D 查看器中...' : 'Loading 3D viewer...'}</span>
                </div>
              </div>
            }>
              <CrossSectionViewer modelPath={building.glbModel} viewMode={activeView} isAnimating={isAnimating} />
            </Suspense>
            
            {/* Status indicator */}
            <div 
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
            >
              <div 
                className={`w-2 h-2 rounded-full ${isAnimating ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isAnimating ? 'var(--temp-cool)' : 'var(--text-muted)' }}
              />
              {isAnimating ? (lang === 'zh' ? '动画中' : 'Animating') : (lang === 'zh' ? '已暂停' : 'Paused')}
            </div>
          </div>
        </div>

        {/* Key Adaptations */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-5 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="w-1 h-5 rounded-full"
              style={{ background: 'var(--gradient-brand)' }}
            />
            {t('detail.adaptations')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {building.adaptations.map((adaptation, idx) => {
              const parts = adaptation.split(/[:：,，]/)
              const keyPhrase = parts[0]
              const rest = parts.slice(1).join(', ')
              return (
                <div 
                  key={idx} 
                  className="flex items-start gap-4 p-4 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: 'var(--gradient-brand)', color: 'white' }}
                  >
                    {idx + 1}
                  </div>
                  <div className="text-sm leading-relaxed">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{keyPhrase}</span>
                    {rest && <span style={{ color: 'var(--text-secondary)' }}>: {rest}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Historical Timeline */}
        <div className={`modern-card rounded-2xl p-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-6 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="w-1 h-5 rounded-full"
              style={{ background: 'var(--gradient-brand)' }}
            />
            <Clock size={18} style={{ color: 'var(--brand-primary)' }} />
            {t('detail.timeline')}
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div 
              className="absolute left-5 top-0 bottom-0 w-0.5"
              style={{ background: 'var(--gradient-brand)' }}
            />
            
            {timelineData.map((item, idx) => (
              <div key={item.era} className="relative flex items-start gap-5 pb-8 last:pb-0">
                {/* Timeline dot */}
                <div 
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  {idx + 1}
                </div>
                
                {/* Content card */}
                <div 
                  className="flex-1 rounded-xl p-4 transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.era}</span>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
                    >
                      {item.year}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuildingDetail
