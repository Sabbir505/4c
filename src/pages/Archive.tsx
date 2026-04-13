import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Search, Download, FileText, BookOpen, ScrollText, Brain, Lightbulb } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { analyzeHistoricalText } from '../services/aiService'

const Archive = () => {
  const { t, lang } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animations
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const documents = [
    {
      title: lang === 'zh' ? '《營造法式》序' : 'Yingzao Fashi - Preface',
      dynasty: t('detail.song'),
      dynastyId: 'song',
      pages: 1,
      category: 'construction',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E7%87%9F%E9%80%A0%E6%B3%95%E5%BC%8F/%E5%BA%8F',
      text: `臣聞上棟下宇，易為大壯之時；正位辨方，禮實太平之典。共工命於舜日，大匠始於漢朝，各有司存，按為功緒。

況神畿之千里，加禁闕之九重，內財宮寢之宜，外定廟朝之次，蟬聯庶府，棊列百司。櫼櫨枅柱之相枝，規矩準繩之先治，五材並用，百堵皆興。

臣考閱舊章，稽參衆智。功分三等，第為精粗之差；役辨四時，用度長短之晷。`
    },
    {
      title: lang === 'zh' ? '《營造法式》第一卷·總釋上' : 'Yingzao Fashi - Volume 1',
      dynasty: t('detail.song'),
      dynastyId: 'song',
      pages: 1,
      category: 'layout',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E7%87%9F%E9%80%A0%E6%B3%95%E5%BC%8F/%E7%AC%AC%E4%B8%80%E5%8D%B7',
      text: `《易·繫辭》：上古穴居而野處，後世聖人易之以宮室，上棟下宇，以待風雨。

《墨子》：古之民未知為宮室，時就陵阜而居，穴而處，下潤濕傷民。故聖王作為宮室之法曰：高足以辟潤濕，旁足以圉風寒，上足以待霜雪雨露。

《春秋·左氏傳》：計丈尺、揣高卑、度厚薄、仞溝洫，物土方、議遠邇、量事期、計徒庸、慮材用、書餱糧以令役，此築城之義也。`
    },
    {
      title: lang === 'zh' ? '《營造法式》第四卷·大木作製度一' : 'Yingzao Fashi - Volume 4',
      dynasty: t('detail.song'),
      dynastyId: 'song',
      pages: 1,
      category: 'construction',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E7%87%9F%E9%80%A0%E6%B3%95%E5%BC%8F/%E7%AC%AC%E5%9B%9B%E5%8D%B7',
      text: `凡構屋之製，皆以材為祖。材有八等，度屋之大小因而用之。

各以其材之廣分為十五分，以十分為其厚。凡屋宇之高深，名物之短長，曲直舉折之勢，規矩繩墨之宜，皆以所用材之分，以為製度焉。

總鋪作次序之製：凡鋪作自柱頭上櫨枓口內出一栱或一昂皆謂之一跳。`
    },
    {
      title: lang === 'zh' ? '《營造法式》第十三卷·瓦作製度·泥作製度' : 'Yingzao Fashi - Volume 13',
      dynasty: t('detail.song'),
      dynastyId: 'song',
      pages: 1,
      category: 'materials',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E7%87%9F%E9%80%A0%E6%B3%95%E5%BC%8F/%E7%AC%AC%E5%8D%81%E4%B8%89%E5%8D%B7',
      text: `磊牆之製：高廣隨間。每牆高四尺，則厚一尺。每高一尺，其上斜收六分。

用石灰等泥壁之製：先用粗泥搭絡不平處，候稍幹；次用中泥趁平，又候稍乾；次用細泥為襯，上施石灰。

凡和石灰泥，每石灰三十斤，用麻擣二斤。`
    },
    {
      title: lang === 'zh' ? '《天工開物》陶埏第七·瓦' : 'Tiangong Kaiwu - Tiles',
      dynasty: t('detail.ming'),
      dynastyId: 'ming',
      pages: 1,
      category: 'climate',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E5%A4%A9%E5%B7%A5%E9%96%8B%E7%89%A9/%E7%93%A6',
      text: `埏泥造瓦，堀地二尺餘，擇取無沙粘土而為之。百里之內，必產合用土色，供人居室之用。

凡坯既成，乾燥之後，則推積窯中，燃薪舉火，或一晝夜，或二晝夜，視窑中多少為熄火久暫。澆水轉鏽，與造磚同法。

其垂於簷端者有滴水，下於脊沿者有雲瓦，瓦掩覆脊者有抱同，鎮脊兩頭者有鳥獸諸形象。`
    },
    {
      title: lang === 'zh' ? '《天工開物》陶埏第七·磚' : 'Tiangong Kaiwu - Bricks',
      dynasty: t('detail.ming'),
      dynastyId: 'ming',
      pages: 1,
      category: 'materials',
      sourceLabel: 'Wikisource',
      sourceUrl: 'https://zh.wikisource.org/wiki/%E5%A4%A9%E5%B7%A5%E9%96%8B%E7%89%A9/%E7%A3%9A',
      text: `凡埏泥造砖，亦堀地验辨土色，或蓝、或白、或红、或黄，皆以粘而不散、粉而不沙者为上。

凡砖成坯之后，装入窑中。凡烧砖有柴薪窑，有煤炭窑。用薪者出火成青黑色，用煤者出火成白色。

凡转锈之法，窑颠作一平田样，四围稍弦起，灌水其上。水火既济，其质千秋矣。`
    },
  ]

  const wisdomPassages = [
    { topic: t('archive.ventilationDesign'), text: t('archive.ventilationText'), source: documents[0].title },
    { topic: t('archive.thermalMass'), text: t('archive.thermalText'), source: documents[1].title },
    { topic: t('archive.waterManagement'), text: t('archive.waterText'), source: documents[4].title },
    { topic: t('archive.materialSelection'), text: t('archive.materialText'), source: documents[5].title },
  ]
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDynasty, setSelectedDynasty] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState(documents[0])
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [hoveredDoc, setHoveredDoc] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categoryLabels: Record<string, { zh: string; en: string }> = {
    construction: { zh: '建筑结构', en: 'Construction' },
    layout: { zh: '空间布局', en: 'Layout' },
    climate: { zh: '气候适应', en: 'Climate' },
    ventilation: { zh: '通风设计', en: 'Ventilation' },
    materials: { zh: '材料工艺', en: 'Materials' },
    defense: { zh: '防御安全', en: 'Defense' },
  }

  const exportDocument = (doc: typeof documents[0]) => {
    const content = `${doc.title}\n${'='.repeat(40)}\nDynasty: ${doc.dynasty}\nSource: ${doc.sourceLabel}\nSource URL: ${doc.sourceUrl}\n\n${doc.text}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${doc.title.replace(/[^\w\u4e00-\u9fa5]/g, '_')}.txt`
    link.click()
  }

  const exportAllDocuments = () => {
    const allContent = documents.map(doc => 
      `${doc.title}\n${'='.repeat(40)}\nDynasty: ${doc.dynasty}\nSource: ${doc.sourceLabel}\nSource URL: ${doc.sourceUrl}\n\n${doc.text}\n\n`
    ).join('\n' + '-'.repeat(60) + '\n\n')
    const blob = new Blob([allContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'wuwei_huagou_archive.txt'
    link.click()
  }

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text.includes(searchQuery)
    const matchesDynasty = selectedDynasty === 'all' || doc.dynastyId === selectedDynasty
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesDynasty && matchesCategory
  })

  const handleDocSelect = (doc: typeof documents[0]) => {
    setSelectedDoc(doc)
    setAiAnalysis(null)
  }

  const handleAnalyze = async () => {
    if (analyzing) return
    setAnalyzing(true)
    setAiAnalysis(null)
    
    try {
      const result = await analyzeHistoricalText(selectedDoc.text)
      setAiAnalysis(result)
    } catch {
      setAiAnalysis(lang === 'zh' ? '分析失败' : 'Analysis failed')
    }
    finally { setAnalyzing(false) }
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 shine-sweep"
            style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
          >
            <BookOpen size={14} className="animate-pulse" />
            {lang === 'zh' ? '古籍文献' : 'Historical Archive'}
          </div>
          <h1 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            {t('archive.title')}
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            {lang === 'zh' ? '探索传统建筑智慧的文献宝库' : 'Explore the treasure trove of traditional architectural wisdom'}
          </p>
        </div>

        {/* Smart Search & Filters */}
        <div className={`modern-card rounded-2xl p-6 mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="flex items-center gap-3 mb-5">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Search size={22} className="text-white" />
            </div>
            <div>
              <h2 
                className="font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('archive.search')}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh' ? '搜索古籍文献中的建筑智慧' : 'Search architectural wisdom in historical texts'}
              </p>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh' ? '搜索文献标题或内容... (如: 通风、土楼、窑洞)' : 'Search document title or content... (e.g., ventilation, tulou)'}
              className="w-full px-4 py-4 rounded-xl text-sm transition-all focus:outline-none"
              style={{ 
                border: '2px solid var(--border-default)', 
                backgroundColor: 'var(--surface-card)', 
                color: 'var(--text-primary)'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-[var(--bg-secondary)]"
              >
                <span style={{ color: 'var(--text-muted)' }}>✕</span>
              </button>
            )}
          </div>
          
          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynasty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh' ? '朝代' : 'Dynasty'}:
              </span>
              <div className="flex gap-1">
                {[
                  { value: 'all', label: lang === 'zh' ? '全部' : 'All' },
                  { value: 'song', label: t('detail.song') },
                  { value: 'ming', label: t('detail.ming') },
                  { value: 'qing', label: t('detail.qing') },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDynasty(option.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selectedDynasty === option.value ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                      color: selectedDynasty === option.value ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-6" style={{ backgroundColor: 'var(--border-default)' }} />
            
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh' ? '类别' : 'Category'}:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{ 
                  border: '1px solid var(--border-default)', 
                  backgroundColor: 'var(--surface-card)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="all">{lang === 'zh' ? '全部类别' : 'All Categories'}</option>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{lang === 'zh' ? label.zh : label.en}</option>
                ))}
              </select>
            </div>
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Export Button */}
            <button
              onClick={exportAllDocuments}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-md"
              style={{ 
                background: 'var(--gradient-brand)',
                color: 'white'
              }}
            >
              <Download size={16} />
              {lang === 'zh' ? '导出全部文献' : 'Export All'}
            </button>
          </div>
          
          {/* Results Count */}
          {(searchQuery || selectedDynasty !== 'all' || selectedCategory !== 'all') && (
            <div 
              className="mt-4 pt-4 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <Sparkles size={14} style={{ color: 'var(--brand-primary)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {lang === 'zh' 
                  ? `找到 ${filteredDocs.length} 份相关文献` 
                  : `Found ${filteredDocs.length} matching documents`}
              </span>
              {(searchQuery || selectedDynasty !== 'all' || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedDynasty('all')
                    setSelectedCategory('all')
                  }}
                  className="text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  {lang === 'zh' ? '清除筛选' : 'Clear filters'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Document Library */}
          <div className={`modern-card rounded-2xl p-5 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="font-bold text-sm flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <div 
                  className="w-1 h-5 rounded-full"
                  style={{ background: 'var(--gradient-brand)' }}
                />
                <ScrollText size={14} style={{ color: 'var(--brand-primary)' }} />
                {t('archive.library')}
              </h2>
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                {filteredDocs.length} {lang === 'zh' ? '份文献' : 'docs'}
              </span>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredDocs.map((doc, idx) => {
                const textMatchIndex = searchQuery && doc.text.toLowerCase().includes(searchQuery.toLowerCase())
                  ? doc.text.toLowerCase().indexOf(searchQuery.toLowerCase())
                  : -1
                const matchPreview = textMatchIndex >= 0 
                  ? '...' + doc.text.substring(Math.max(0, textMatchIndex - 10), textMatchIndex + searchQuery.length + 30) + '...'
                  : null
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleDocSelect(doc)}
                    onMouseEnter={() => setHoveredDoc(idx)}
                    onMouseLeave={() => setHoveredDoc(null)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover-lift ${
                      selectedDoc.title === doc.title ? 'ring-2 ring-[var(--brand-primary)]' : ''
                    }`}
                  >
                    {searchQuery && matchPreview && (
                      <div className="absolute top-2 right-2 z-10">
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--gradient-brand)', color: 'white' }}
                        >
                          {lang === 'zh' ? '匹配' : 'Match'}
                        </span>
                      </div>
                    )}
                    <div 
                      className="h-24 relative"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-60">📜</span>
                      </div>
                    </div>
                    <div className="p-3" style={{ backgroundColor: 'var(--surface-card)' }}>
                      <div 
                        className="font-semibold text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {doc.title}
                      </div>
                      <div className="text-xs flex flex-wrap items-center gap-1 mt-1">
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
                        >
                          {doc.dynasty}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}
                        >
                          {lang === 'zh' ? categoryLabels[doc.category]?.zh : categoryLabels[doc.category]?.en}
                        </span>
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lang === 'zh' ? '原始来源' : 'Original source'}
                        </a>
                      </div>
                    </div>
                    {hoveredDoc === idx && (
                      <button
                        onClick={(e) => { e.stopPropagation(); exportDocument(doc); }}
                        className="absolute top-2 left-2 rounded-xl shadow-lg p-2 z-10 transition-colors"
                        style={{ backgroundColor: 'var(--surface-card)' }}
                      >
                        <Download size={14} style={{ color: 'var(--text-secondary)' }} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Document Viewer */}
          <div className={`lg:col-span-2 modern-card rounded-2xl p-5 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <h2 
              className="font-bold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <div 
                className="p-2 rounded-xl"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <FileText size={18} className="text-white" />
              </div>
              {t('archive.viewer')}
            </h2>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span style={{ color: 'var(--text-primary)' }}>{selectedDoc.title}</span>
              <span style={{ color: 'var(--text-muted)' }}>• {selectedDoc.dynasty}</span>
              <a
                href={selectedDoc.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline"
                style={{ color: 'var(--brand-primary)' }}
              >
                {lang === 'zh' ? '打开原始文献' : 'Open original source'}
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Original Text */}
              <div 
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
              >
                <div 
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ScrollText size={14} style={{ color: 'var(--brand-primary)' }} />
                  {t('archive.original')}
                </div>
                <div 
                  className="rounded-lg p-3 h-48 overflow-y-auto"
                  style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}
                >
                  <div 
                    className="text-sm leading-relaxed"
                    style={{ writingMode: 'vertical-rl', fontFamily: "'Noto Serif SC', serif", color: 'var(--text-primary)' }}
                  >
                    {selectedDoc.text}
                  </div>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="btn-seal mt-3 w-full flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> 
                      {lang === 'zh' ? '分析中...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Brain size={14} />
                      {lang === 'zh' ? 'AI 智能分析' : 'AI Analysis'}
                    </>
                  )}
                </button>
              </div>

              {/* AI Translation */}
              <div 
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
              >
                <div 
                  className="text-sm font-semibold mb-2 flex items-center gap-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Brain size={14} style={{ color: 'var(--brand-primary)' }} />
                  {t('archive.translation')}
                </div>
                <div 
                  className="rounded-lg p-3 h-48 overflow-y-auto"
                  style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}
                >
                  {aiAnalysis ? (
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{aiAnalysis}</div>
                  ) : (
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '点击 AI 分析以查看翻译' : 'Click AI Analysis to view translation'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wisdom Section */}
        <div className={`modern-card rounded-2xl p-6 transition-all duration-700 delay-[400ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <h2 
            className="font-bold mb-6 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <div 
              className="p-2 rounded-xl"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            {t('archive.wisdom')}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {wisdomPassages.map((passage, idx) => (
              <div 
                key={idx} 
                className="rounded-xl p-5 hover-lift stagger-item"
                style={{ 
                  animationDelay: `${idx * 100}ms`, 
                  backgroundColor: 'var(--surface-card)', 
                  border: '1px solid var(--border-light)' 
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    <Lightbulb size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'var(--brand-primary)' }}>{passage.topic}</div>
                    <div className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>"{passage.text}"</div>
                    <div className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <FileText size={10} />{passage.source}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Archive
