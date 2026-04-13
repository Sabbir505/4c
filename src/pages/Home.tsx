import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Compass, Brain, LineChart, GitCompare, BookOpen, Sparkles } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { buildingIcons } from '../data/buildings'
import { useState, useEffect, useRef } from 'react'
import { BUILDING_PROFILES } from '../data/buildingCatalog'

const Home = () => {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const [expandingBuilding, setExpandingBuilding] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [activeStoryStep, setActiveStoryStep] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  // Trigger entrance animations
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Track mouse for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryStep((prev) => (prev + 1) % 5)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  const buildings = BUILDING_PROFILES.map((profile) => ({
    id: profile.id,
    name: lang === 'zh' ? profile.nameZh : profile.nameEn,
    nameEn: profile.nameEn,
    region: lang === 'zh' ? profile.regionZh : profile.regionEn,
    previewImage: profile.previewImage,
    strength: lang === 'zh' ? profile.strengthZh : profile.strengthEn,
  }))

  // Custom featured selection: exclude jiangnan-water-town-house, include lingnan-residence instead
  const featuredBuildings = [
    buildings[0], // tulou
    buildings[1], // siheyuan
    buildings[2], // yaodong
    buildings[3], // diaojiaolou
    buildings.find(b => b.id === 'lingnan-residence')!, // replace jiangnan with lingnan
  ]
  const secondaryBuildings = buildings.filter(b => 
    !featuredBuildings.some(fb => fb.id === b.id)
  ).slice(0, 2)

  const renderBuildingCard = (
    building: (typeof buildings)[number],
    index: number,
    delayOffset = 0,
    extraClassName = ''
  ) => {
    const IconComponent = buildingIcons[building.id].icon
    const iconGradient = buildingIcons[building.id].gradient

    return (
      <div
        key={building.id}
        onClick={() => {
          setExpandingBuilding(building.id)
          setTimeout(() => navigate(`/building/${building.id}`), 400)
        }}
        className={`group relative rounded-2xl overflow-hidden cursor-pointer ${extraClassName}
          ${expandingBuilding === building.id ? 'scale-110 opacity-0' : ''}`}
        style={{
          opacity: 0,
          animation: `slideUpReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index + delayOffset) * 0.1}s forwards`,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease'
        }}
      >
        {/* Card with layered design */}
        <div
          className="relative h-full rounded-2xl overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            boxShadow: '0 4px 20px var(--shadow-color)'
          }}
        >
          {/* Animated gradient border on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${iconGradient.split(',')[0].split('(')[2]}30, transparent, ${iconGradient.split(',')[0].split('(')[2]}15)`,
            }}
          />

          {/* Top accent line with animation */}
          <div
            className="h-1.5 relative overflow-hidden"
            style={{ background: iconGradient }}
          >
            <div
              className="absolute inset-0 bg-white/40"
              style={{
                transform: 'translateX(-100%)',
                animation: 'shineSweep 3s ease-in-out infinite',
                animationDelay: `${(index + delayOffset) * 0.4}s`
              }}
            />
          </div>

          {/* 3D Model Container */}
          <div
            className="h-52 overflow-hidden pointer-events-none relative"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none z-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, var(--text-primary) 1px, transparent 0)`,
                backgroundSize: '16px 16px'
              }}
            />

            {/* Gradient overlay on hover */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
            />

            {/* Icon badge - top right */}
            <div
              className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg z-20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{
                background: iconGradient,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <IconComponent className="text-white" size={18} strokeWidth={1.5} />
            </div>

            <img
              src={building.previewImage}
              alt={building.nameEn}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110"
            />
          </div>

          {/* Info Section - Enhanced */}
          <div className="p-5 relative">
            {/* Decorative corner accent */}
            <div
              className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${iconGradient.split(',')[0].split('(')[2]}15, transparent 70%)`
              }}
            />

            <div className="relative z-10">
              {/* Region tag */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium mb-3 uppercase tracking-wide"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-light)'
                }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: iconGradient }} />
                {building.region}
              </div>

              {/* Building name */}
              <div className="mb-3 transform transition-transform duration-300 group-hover:translate-x-1">
                <h3
                  className="font-bold text-lg leading-tight mb-1"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
                >
                  {building.name}
                </h3>
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {building.nameEn}
                </p>
              </div>

              {/* Strength Badge - Enhanced */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                style={{
                  background: iconGradient,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Sparkles size={12} className="opacity-80" />
                {building.strength}
              </div>
            </div>
          </div>

          {/* Hover overlay with blur effect */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400 backdrop-blur-sm z-30"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          >
            {/* Building icon large */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75"
              style={{
                background: iconGradient,
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              }}
            >
              <IconComponent className="text-white" size={28} strokeWidth={1.5} />
            </div>

            <span className="text-white font-semibold text-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
              {lang === 'zh' ? '查看详情' : 'View Details'}
            </span>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="text-white/80 text-sm">{building.strength}</span>
              <ArrowRight size={14} className="text-white group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const storyFlow = [
    {
      title: lang === 'zh' ? '问题' : 'Problem',
      subtitle: lang === 'zh' ? '高能耗与气候风险' : 'High energy and climate risk',
      detail: lang === 'zh' ? '现代建筑在舒适度、能耗和韧性上面临多重压力。' : 'Modern buildings face pressure across comfort, energy use, and resilience.',
      demoLine: lang === 'zh' ? '先明确痛点: 高能耗、热不舒适、极端天气风险。' : 'Start with the pain point: high energy use, discomfort, and extreme weather risk.',
      outputs: lang === 'zh' ? ['风险地图', '气候脆弱点', '场地约束'] : ['Risk map', 'Climate vulnerabilities', 'Site constraints'],
      kpi: lang === 'zh' ? '目标: 将峰值能耗降低 20%+' : 'Goal: reduce peak energy use by 20%+',
      route: '/map',
    },
    {
      title: lang === 'zh' ? '古代智慧' : 'Ancient Wisdom',
      subtitle: lang === 'zh' ? '五大传统类型策略' : 'Five vernacular strategy families',
      detail: lang === 'zh' ? '提取土楼、四合院、窑洞等可迁移的被动式原理。' : 'Extract transferable passive principles from Tulou, Siheyuan, Yaodong and more.',
      demoLine: lang === 'zh' ? '解释传统不是复刻，而是提炼可工程化原则。' : 'Show that tradition is not copied directly, but translated into buildable principles.',
      outputs: lang === 'zh' ? ['结构逻辑', '微气候策略', '材料启发'] : ['Structural logic', 'Microclimate strategies', 'Material inspiration'],
      kpi: lang === 'zh' ? '目标: 被动策略覆盖率 > 70%' : 'Target: passive strategy coverage > 70%',
      route: '/archive',
    },
    {
      title: lang === 'zh' ? 'AI 智能' : 'AI Intelligence',
      subtitle: lang === 'zh' ? '场地与需求理解' : 'Site-aware synthesis',
      detail: lang === 'zh' ? 'AI 将场地参数转化为可执行设计建议与风险判断。' : 'AI converts site inputs into actionable design and risk guidance.',
      demoLine: lang === 'zh' ? '输入场地参数，实时生成策略与推理时间线。' : 'Input site parameters and generate strategy with a live reasoning timeline.',
      outputs: lang === 'zh' ? ['方案草案', '风险提示', '材料建议'] : ['Concept draft', 'Risk flags', 'Material recommendations'],
      kpi: lang === 'zh' ? '目标: 30 秒内给出首轮可用方案' : 'Target: first usable concept within 30 seconds',
      route: '/ai-consultant',
    },
    {
      title: lang === 'zh' ? '现代落地' : 'Practical Delivery',
      subtitle: lang === 'zh' ? '材料、成本、施工' : 'Materials, cost, constructability',
      detail: lang === 'zh' ? '方案输出包含材料路径、成本结构与实施建议。' : 'Output includes material pathways, cost structure, and implementation guidance.',
      demoLine: lang === 'zh' ? '对比 2-3 个方案，选出综合性价比最高方案。' : 'Compare 2-3 options and identify the strongest practical winner.',
      outputs: lang === 'zh' ? ['多方案评分', '优胜建议', '实施清单'] : ['Option scoring', 'Winner recommendation', 'Execution checklist'],
      kpi: lang === 'zh' ? '目标: 成本偏差控制在 ±15%' : 'Target: keep cost variance within +/-15%',
      route: '/comparison',
    },
    {
      title: lang === 'zh' ? '可量化影响' : 'Measurable Impact',
      subtitle: lang === 'zh' ? '碳、舒适与韧性' : 'Carbon, comfort, resilience',
      detail: lang === 'zh' ? '通过数据面板验证节能减碳与气候适应成效。' : 'Validate savings and adaptation outcomes through data dashboards.',
      demoLine: lang === 'zh' ? '最后用量化指标收口，让评委看到可验证价值。' : 'Close with measurable outcomes so judges see verifiable value.',
      outputs: lang === 'zh' ? ['碳减排估算', '韧性雷达', '研究与供应链证据'] : ['Carbon estimate', 'Resilience radar', 'Research and supplier evidence'],
      kpi: lang === 'zh' ? '目标: 年运行碳减排 20%+' : 'Target: 20%+ annual operational carbon reduction',
      route: '/data-hub',
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 lg:py-28 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Morphing blob backgrounds with parallax */}
          <div 
            className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full blur-3xl morph-blob opacity-20"
            style={{ 
              background: 'var(--brand-primary-glow)',
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
            }}
          />
          <div 
            className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full blur-3xl morph-blob opacity-15"
            style={{ 
              background: 'var(--brand-primary-glow)',
              animationDelay: '-5s',
              transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`
            }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-3xl morph-blob opacity-10"
            style={{ 
              background: 'var(--brand-primary-glow)',
              animationDelay: '-10s',
              transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`
            }}
          />
          
          {/* Floating particles */}
          <div className="particle particle-1" style={{ top: '20%', left: '15%' }} />
          <div className="particle particle-2" style={{ top: '60%', left: '80%' }} />
          <div className="particle particle-3" style={{ top: '40%', left: '60%' }} />
          <div className="particle particle-1" style={{ top: '70%', left: '25%', animationDelay: '2s' }} />
          <div className="particle particle-2" style={{ top: '30%', left: '70%', animationDelay: '1s' }} />
          
          {/* Decorative grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(var(--brand-primary) 1px, transparent 1px),
                linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Animated Badge */}
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 shine-sweep"
              style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                animationDelay: '0.2s'
              }}
            >
              <Sparkles 
                className="animate-pulse"
                size={16}
                style={{ color: 'var(--brand-primary)' }}
              />
              {lang === 'zh' ? '2026 中国大学生计算机大赛' : '2026 China Collegiate Computing Competition'}
            </div>
            
            {/* Hero Title with gradient text effect */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
            >
              <span className="brush-underline active relative">
                {t('home.hero.title')}
                <span 
                  className="absolute -bottom-2 left-0 w-full h-1 rounded-full gradient-animate"
                  style={{ background: 'var(--gradient-brand)', backgroundSize: '200% 200%' }}
                />
              </span>
            </h1>
            
            {/* Subtitle with fade effect */}
            <p 
              className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* 5 Building Types Section */}
          <div className={`mb-0 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Enhanced Section Header */}
            <div className="text-center mb-14">
              <div 
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-medium mb-6 elastic-scale cursor-default backdrop-blur-sm"
                style={{ 
                  backgroundColor: 'var(--brand-primary-glow)',
                  color: 'var(--brand-primary)',
                  border: '1px solid var(--brand-primary)',
                  borderColor: 'rgba(146, 112, 45, 0.3)',
                  boxShadow: '0 4px 20px var(--brand-primary-glow)'
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--brand-primary)' }} />
                {lang === 'zh' ? `${buildings.length} 大建筑类型` : `${buildings.length} Building Types`}
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '0.5s' }} />
              </div>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
                style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
              >
                {t('home.buildings.title')}
              </h2>
              <p 
                className="text-lg max-w-2xl mx-auto mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('home.buildings.subtitle')}
              </p>
              <p
                className="text-sm max-w-2xl mx-auto mb-6"
                style={{ color: 'var(--text-muted)' }}
              >
                {lang === 'zh' ? '新增 10 种建筑类型已上线。' : '10 newly uploaded building types are now live.'}
              </p>
              {/* Decorative element */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-16 h-px" style={{ background: 'linear-gradient(to right, transparent, var(--border-default))' }} />
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        background: 'var(--gradient-brand)',
                        opacity: 0.3 + (i * 0.15),
                        animationDelay: `${i * 0.1}s`
                      }} 
                    />
                  ))}
                </div>
                <div className="w-16 h-px" style={{ background: 'linear-gradient(to left, transparent, var(--border-default))' }} />
              </div>
            </div>
            
            {/* Building Cards Grid - Enhanced */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {featuredBuildings.map((building, index) => renderBuildingCard(building, index, 0))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {secondaryBuildings.map((building, index) =>
                  renderBuildingCard(
                    building,
                    index,
                    featuredBuildings.length,
                    index === 0 ? 'lg:col-start-2' : ''
                  )
                )}

                <button
                  type="button"
                  onClick={() => navigate('/building/tulou')}
                  className="group relative rounded-2xl overflow-hidden"
                  style={{
                    opacity: 0,
                    animation: `slideUpReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(featuredBuildings.length + secondaryBuildings.length) * 0.1}s forwards`
                  }}
                >
                  <div
                    className="h-full min-h-[360px] rounded-2xl p-6 transition-all duration-500 group-hover:shadow-2xl flex flex-col items-center justify-center text-center"
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      border: '1px dashed var(--brand-primary)',
                      boxShadow: '0 4px 20px var(--shadow-color)'
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
                      <Sparkles size={22} className="text-white" />
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}>
                      {lang === 'zh' ? '更多建筑' : 'More Buildings'}
                    </h3>

                    <p className="text-sm mb-4 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                      {lang === 'zh'
                        ? '进入建筑详情页，可通过切换器查看全部建筑。'
                        : 'Open the building detail page and use the switcher to browse all buildings.'}
                    </p>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--brand-primary)' }}>
                      {lang === 'zh' ? '查看全部建筑' : 'View All Buildings'}
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Flow Section */}
      <section className="py-16 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
            >
              <Sparkles size={13} />
              {lang === 'zh' ? '演示叙事主线' : 'Demo Storyline'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}>
              {lang === 'zh' ? '问题 → 智慧 → AI → 落地 → 影响' : 'Problem → Wisdom → AI → Delivery → Impact'}
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '可直接用于 3 分钟讲解的引导式流程。' : 'A guided narrative designed for a strong 3-minute demo.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_2fr] gap-5">
            <div className="space-y-2">
              {storyFlow.map((step, idx) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStoryStep(idx)}
                  className="w-full text-left rounded-xl px-4 py-3 transition-all cursor-pointer hover:-translate-y-0.5"
                  style={{
                    border: `1px solid ${idx === activeStoryStep ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    backgroundColor: idx === activeStoryStep ? 'var(--brand-primary-glow)' : 'var(--surface-card)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--brand-primary)' }}>{idx + 1}. {step.title}</div>
                  <div className="text-sm font-bold">{step.subtitle}</div>
                </button>
              ))}
            </div>

            <div className="modern-card rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'zh' ? '当前讲解节点' : 'Current Narrative Step'}
                </div>
                <div className="text-[11px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? `步骤 ${activeStoryStep + 1}/${storyFlow.length}` : `Step ${activeStoryStep + 1}/${storyFlow.length}`}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}>
                {storyFlow[activeStoryStep].title}
              </h3>
              <div className="text-xs font-semibold mb-3" style={{ color: 'var(--brand-primary)' }}>
                {storyFlow[activeStoryStep].subtitle}
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                {storyFlow[activeStoryStep].detail}
              </p>

              <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? '讲解话术' : 'Presenter Line'}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {storyFlow[activeStoryStep].demoLine}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? '本步产出' : 'Outputs in This Step'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {storyFlow[activeStoryStep].outputs.map((item) => (
                    <span key={item} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg p-3 mb-5" style={{ backgroundColor: 'var(--surface-card)', border: '1px dashed var(--border-default)' }}>
                <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
                  {lang === 'zh' ? '关键指标' : 'Key KPI'}
                </div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {storyFlow[activeStoryStep].kpi}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveStoryStep((prev) => (prev - 1 + storyFlow.length) % storyFlow.length)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {lang === 'zh' ? '上一步' : 'Previous'}
                </button>
                <button
                  onClick={() => navigate(storyFlow[activeStoryStep].route)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--brand-primary)', color: '#fff' }}
                >
                  {lang === 'zh' ? '打开本步页面' : 'Open This Step'}
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => setActiveStoryStep((prev) => (prev + 1) % storyFlow.length)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {lang === 'zh' ? '下一步' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Enhanced Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical accent lines */}
          <div 
            className="absolute top-0 left-1/4 w-px h-full opacity-10"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--brand-primary), transparent)' }}
          />
          <div 
            className="absolute top-0 right-1/4 w-px h-full opacity-10"
            style={{ background: 'linear-gradient(to bottom, transparent, var(--brand-primary), transparent)' }}
          />
          {/* Horizontal accent line */}
          <div 
            className="absolute top-1/2 left-0 w-full h-px opacity-5"
            style={{ background: 'linear-gradient(to right, transparent, var(--brand-primary), transparent)' }}
          />
          {/* Subtle corner decorations */}
          <div 
            className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--brand-primary-glow)' }}
          />
          <div 
            className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-3xl opacity-10"
            style={{ background: 'var(--brand-primary-glow)' }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Enhanced Section Header */}
          <div className="text-center mb-16">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 elastic-scale cursor-default backdrop-blur-sm"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 4px 20px var(--shadow-color)'
              }}
            >
              <span 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: 'var(--brand-primary)' }} 
              />
              {lang === 'zh' ? '核心功能' : 'Core Features'}
              <span 
                className="w-2 h-2 rounded-full animate-pulse" 
                style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '0.5s' }} 
              />
            </div>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
            >
              {t('home.features.title')}
            </h2>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-muted)' }}
            >
              {lang === 'zh' ? '探索平台的强大功能，开启您的传统建筑智慧之旅' : 'Discover powerful features to explore traditional architectural wisdom'}
            </p>
            {/* Decorative underline */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'var(--border-default)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
              <div className="w-12 h-0.5 rounded-full" style={{ background: 'var(--border-default)' }} />
            </div>
          </div>
          
          {/* Feature Cards - Enhanced Grid Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { 
                icon: Compass, 
                title: t('home.features.exploration'), 
                desc: t('home.features.exploration.desc'), 
                link: '/map',
                iconBg: 'var(--gradient-brand)',
                accent: 'var(--brand-primary)'
              },
              { 
                icon: GitCompare, 
                title: lang === 'zh' ? '建筑对比' : 'Building Comparison', 
                desc: lang === 'zh' ? '并排对比不同建筑类型的气候适应特性、性能指标和设计特点' : 'Compare climate adaptations, performance metrics, and design features of different building types side by side', 
                link: '/comparison',
                iconBg: 'var(--gradient-brand)',
                accent: 'var(--brand-primary)'
              },
              { 
                icon: Brain, 
                title: t('home.features.ai'), 
                desc: t('home.features.ai.desc'), 
                link: '/ai-consultant',
                iconBg: 'linear-gradient(135deg, var(--temp-cool), var(--accent-emerald))',
                accent: 'var(--temp-cool)'
              },
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                <div 
                  className="modern-card rounded-2xl p-6 h-full relative overflow-hidden transition-all duration-500 hover:shadow-2xl"
                  style={{
                    opacity: 0,
                    animation: `slideUpReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.2}s forwards`
                  }}
                >
                  {/* Animated gradient border on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.accent}20, transparent, ${feature.accent}10)`,
                    }}
                  />
                  
                  {/* Top accent bar */}
                  <div 
                    className="absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 rounded-t-2xl"
                    style={{ background: feature.iconBg }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with floating effect */}
                    <div className="flex items-start justify-between mb-5">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl"
                        style={{ 
                          background: feature.iconBg,
                          boxShadow: `0 8px 24px ${feature.accent}30`
                        }}
                      >
                        <feature.icon className="text-white transition-transform duration-300 group-hover:scale-110" size={26} />
                      </div>
                      {/* Decorative dots */}
                      <div className="flex gap-1 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: feature.accent }} />
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: feature.accent }} />
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: feature.accent }} />
                      </div>
                    </div>
                    
                    <h3 
                      className="text-xl font-bold mb-3 transition-colors duration-300"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {feature.title}
                    </h3>
                    
                    <p 
                      className="mb-5 leading-relaxed text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {feature.desc}
                    </p>
                    
                    {/* Enhanced CTA */}
                    <div 
                      className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                      style={{ color: feature.accent }}
                    >
                      <span className="relative">
                        {lang === 'zh' ? '立即探索' : 'Explore Now'}
                        <span 
                          className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full"
                          style={{ background: feature.accent }}
                        />
                      </span>
                      <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Row - Two Larger Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { 
                icon: LineChart, 
                title: t('home.features.data'), 
                desc: t('home.features.data.desc'), 
                link: '/data-hub',
                iconBg: 'linear-gradient(135deg, var(--temp-hot), #f97316)',
                accent: 'var(--temp-hot)',
                extraTag: lang === 'zh' ? '数据驱动' : 'Data Driven'
              },
              { 
                icon: BookOpen, 
                title: lang === 'zh' ? '文献档案' : 'Text Archive', 
                desc: lang === 'zh' ? '探索古籍文献中的建筑智慧，AI驱动的古文翻译与分析' : 'Explore architectural wisdom in historical texts with AI-powered translation and analysis', 
                link: '/archive',
                iconBg: 'linear-gradient(135deg, #92702d, #d4a853)',
                accent: '#92702d',
                extraTag: lang === 'zh' ? 'AI 驱动' : 'AI Powered'
              },
            ].map((feature, index) => (
              <Link key={index} to={feature.link} className="group">
                <div 
                  className="modern-card rounded-2xl p-6 h-full relative overflow-hidden transition-all duration-500 hover:shadow-2xl"
                  style={{
                    opacity: 0,
                    animation: `slideUpReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${(index + 3) * 0.1 + 0.2}s forwards`
                  }}
                >
                  {/* Animated gradient border on hover */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${feature.accent}15, transparent, ${feature.accent}08)`,
                    }}
                  />
                  
                  {/* Top accent bar */}
                  <div 
                    className="absolute top-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 rounded-t-2xl"
                    style={{ background: feature.iconBg }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                    {/* Icon with floating effect */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-xl"
                      style={{ 
                        background: feature.iconBg,
                        boxShadow: `0 8px 24px ${feature.accent}30`
                      }}
                    >
                      <feature.icon className="text-white transition-transform duration-300 group-hover:scale-110" size={28} />
                    </div>
                    
                    <div className="flex-1">
                      {/* Tag badge */}
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                        style={{ 
                          background: `${feature.accent}15`,
                          color: feature.accent
                        }}
                      >
                        <Sparkles size={10} />
                        {feature.extraTag}
                      </span>
                      
                      <h3 
                        className="text-xl font-bold mb-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {feature.title}
                      </h3>
                      
                      <p 
                        className="mb-4 leading-relaxed text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {feature.desc}
                      </p>
                      
                      {/* Enhanced CTA */}
                      <div 
                        className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3"
                        style={{ color: feature.accent }}
                      >
                        <span className="relative">
                          {lang === 'zh' ? '立即探索' : 'Explore Now'}
                          <span 
                            className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full"
                            style={{ background: feature.accent }}
                          />
                        </span>
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: 'var(--nav-bg)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, var(--brand-primary-glow) 0%, transparent 50%),
                               radial-gradient(circle at 80% 50%, var(--brand-primary-glow) 0%, transparent 50%)`
            }}
          />
          {/* Floating particles */}
          <div className="particle particle-1" style={{ top: '20%', left: '10%', background: 'rgba(255,255,255,0.1)' }} />
          <div className="particle particle-2" style={{ top: '70%', left: '85%', background: 'rgba(255,255,255,0.1)' }} />
          <div className="particle particle-3" style={{ top: '50%', left: '50%', background: 'rgba(255,255,255,0.05)' }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Animated badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 shine-sweep"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--temp-cool)' }}
            />
            <span className="text-white/70 text-sm">
              {lang === 'zh' ? '开始您的探索之旅' : 'Start Your Journey'}
            </span>
          </div>
          
          {/* Main heading with glow */}
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 relative"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            <span className="relative z-10">{t('home.cta.title')}</span>
            <span 
              className="absolute inset-0 blur-2xl opacity-30"
              style={{ color: 'var(--brand-primary)' }}
            >
              {t('home.cta.title')}
            </span>
          </h2>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t('home.cta.subtitle')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home
