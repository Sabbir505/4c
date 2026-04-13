import { useLanguage } from '../context/LanguageContext'
import { ExternalLink, BookOpen, Mountain, Home, Warehouse, Castle, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ReferenceItem {
  title: string
  publisher: string
  url: string
  note: string
}

const References = () => {
  const { lang } = useLanguage()

  const generalSources: ReferenceItem[] = [
    {
      title: lang === 'zh' ? '中国传统民居的气候适应性研究' : 'Climate Adaptation in Traditional Chinese Dwellings',
      publisher: 'MDPI Buildings',
      url: 'https://www.mdpi.com/2075-5309/14/12/4002',
      note: lang === 'zh' ? '南方传统民居室内热湿环境实测研究' : 'Indoor thermal-humidity environment study of Southern Jiangsu residences'
    },
    {
      title: lang === 'zh' ? '传统院落住宅的被动式设计优化' : 'Passive Design Optimization in Courtyard Housing',
      publisher: 'ScienceDirect - Building and Environment',
      url: 'https://www.sciencedirect.com/science/article/abs/pii/S0360132322003432',
      note: lang === 'zh' ? '院落住宅改造案例研究' : 'Retrofitted courtyard housing case studies'
    },
    {
      title: lang === 'zh' ? '福建农村土建筑碳排放与能耗优化' : 'Carbon and Energy Optimization in Fujian Rural Earthen Buildings',
      publisher: 'Nature Scientific Reports',
      url: 'https://www.nature.com/articles/s41598-024-68391-x',
      note: lang === 'zh' ? '土建筑的碳减排与能效研究' : 'Carbon reduction and energy efficiency in earthen construction'
    },
  ]

  const buildingSources: Record<string, { icon: typeof Circle; gradient: string; sources: ReferenceItem[] }> = {
    tulou: {
      icon: Circle,
      gradient: 'linear-gradient(135deg, #92702d 0%, #d4a853 100%)',
      sources: [
        {
          title: lang === 'zh' ? '福建土楼 - 世界文化遗产' : 'Fujian Tulou - UNESCO World Heritage',
          publisher: 'UNESCO WHC',
          url: 'https://whc.unesco.org/en/list/1113/',
          note: lang === 'zh' ? '土楼的建筑特征与文化价值' : 'Architectural features and cultural value of Tulou'
        },
      ]
    },
    siheyuan: {
      icon: Home,
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3d6a9f 100%)',
      sources: [
        {
          title: lang === 'zh' ? '北京四合院的气候适应设计' : 'Climate-Adaptive Design of Beijing Siheyuan',
          publisher: 'ScienceDirect',
          url: 'https://www.sciencedirect.com/science/article/abs/pii/S0360132322003432',
          note: lang === 'zh' ? '院落朝向与季节性热调控' : 'Courtyard orientation and seasonal thermal control'
        },
      ]
    },
    yaodong: {
      icon: Mountain,
      gradient: 'linear-gradient(135deg, #8b5a2b 0%, #cd853f 100%)',
      sources: [
        {
          title: lang === 'zh' ? '地坑院的热环境特性' : 'Thermal Environment of Pit Courtyard Dwellings',
          publisher: 'Sohu',
          url: 'https://www.sohu.com/a/947488626_121107000',
          note: lang === 'zh' ? '冬季室温可达8-12°C的热稳定性' : 'Winter indoor temps of 8-12°C thermal stability'
        },
      ]
    },
    diaojiaolou: {
      icon: Warehouse,
      gradient: 'linear-gradient(135deg, #2d5a3d 0%, #4a9c6d 100%)',
      sources: [
        {
          title: lang === 'zh' ? '西南吊脚楼的防洪适应性' : 'Flood Resilience of Southwest Diaojiaolou',
          publisher: 'Asian Journal of Environment and Disaster Management',
          url: 'https://www.rpsonline.com.sg/journals/101-ajedm/2011/0301/S1793924011000642.php',
          note: lang === 'zh' ? '架空结构的防潮与通风功能' : 'Elevated structure for moisture control and ventilation'
        },
      ]
    },
    weilongwu: {
      icon: Castle,
      gradient: 'linear-gradient(135deg, #6b3a5d 0%, #a85d8f 100%)',
      sources: [
        {
          title: lang === 'zh' ? '客家围龙屋的微气候调节' : 'Microclimate Regulation in Hakka Weilongwu',
          publisher: '360doc',
          url: 'https://www.360doc.cn/article/72104280_1158438522.html',
          note: lang === 'zh' ? '半围合布局与通风廊道' : 'Semi-enclosed layout and ventilation corridors'
        },
      ]
    },
  }

  const buildingNames: Record<string, string> = {
    tulou: lang === 'zh' ? '福建土楼' : 'Fujian Tulou',
    siheyuan: lang === 'zh' ? '北京四合院' : 'Beijing Siheyuan',
    yaodong: lang === 'zh' ? '陕北窑洞' : 'Shaanxi Yaodong',
    diaojiaolou: lang === 'zh' ? '西南吊脚楼' : 'Southwest Diaojiaolou',
    weilongwu: lang === 'zh' ? '客家围龙屋' : 'Hakka Weilongwu',
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/data-hub" 
            className="inline-flex items-center gap-2 text-sm mb-4 hover:underline"
            style={{ color: 'var(--brand-primary)' }}
          >
            ← {lang === 'zh' ? '返回数据中心' : 'Back to Data Hub'}
          </Link>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ml-4"
            style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
          >
            <BookOpen size={14} />
            {lang === 'zh' ? '参考文献' : 'References'}
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            {lang === 'zh' ? '数据来源与参考文献' : 'Data Sources & References'}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh' 
              ? '以下链接为本站数据的主要参考来源，点击可查看原始资料。'
              : 'The following links are the primary sources for data on this site. Click to view original materials.'}
          </p>
        </div>

        {/* General Sources */}
        <div className="modern-card rounded-2xl p-6 mb-6">
          <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <div className="w-1 h-5 rounded-full" style={{ background: 'var(--gradient-brand)' }} />
            <BookOpen size={18} style={{ color: 'var(--brand-primary)' }} />
            {lang === 'zh' ? '综合研究文献' : 'General Research'}
          </h2>
          <div className="space-y-4">
            {generalSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{source.title}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{source.publisher}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{source.note}</div>
                  </div>
                  <ExternalLink size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Building-Specific Sources */}
        {Object.entries(buildingSources).map(([buildingId, { icon: Icon, gradient, sources }]) => (
          <div key={buildingId} className="modern-card rounded-2xl p-6 mb-6">
            <h2 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: gradient }}
              >
                <Icon size={16} className="text-white" />
              </div>
              {buildingNames[buildingId]}
            </h2>
            <div className="space-y-4">
              {sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{source.title}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{source.publisher}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{source.note}</div>
                    </div>
                    <ExternalLink size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div 
          className="p-4 rounded-xl text-sm"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
        >
          {lang === 'zh' 
            ? '注：本站展示的建筑原理和策略基于学术研究和传统建筑文献。具体性能数据因地区、气候和建造方式而异，仅供参考。'
            : 'Note: The architectural principles and strategies shown on this site are based on academic research and traditional building literature. Specific performance data varies by region, climate, and construction method, and is provided for reference only.'}
        </div>
      </div>
    </div>
  )
}

export default References
