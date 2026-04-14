import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Camera, Loader2, Snowflake, Sun, Shield, Bot, User, Sparkles, MessageCircle, Zap, ArrowRight, Download, Trash2, X, Image as ImageIcon, Search, BookOpen, PenLine } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../context/LanguageContext'
import { chatWithAIStream, analyzeImageStream, fetchDataHubResearch, type DataHubResearchPayload, type Message as AIMessage, type AssistantPhase } from '../services/aiService'
import { parseAreaFromText, computeCarbonProfile, computeCostSummary } from '../utils/analytics'
import { buildLocalKnowledgePromptContext } from '../data/localKnowledgePacks'
import {
  buildNew10ResearchPromptContext,
  buildNew10ResearchPortfolioContext,
  detectNew10ResearchEntry,
  NEW10_RESEARCH_BY_ID,
} from '../data/new10ResearchData'
import { BUILDING_PROFILES, BUILDING_PROFILE_MAP } from '../data/buildingCatalog'
import type { BuildingId } from '../data/buildings'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string // base64 data URL for display
  citations?: SourceItem[]
  complianceHints?: ComplianceHint[]
  validation?: TemplateValidationResult
}

interface SiteProfile {
  city: string
  climateZone: string
  landSize: string
  budgetRange: string
  buildingType: string
}

interface SourceItem {
  title: string
  publisher: string
  year: string
  note: string
  url?: string
}

interface ComplianceHint {
  key: 'flood' | 'typhoon' | 'seismic' | 'ventilation'
  level: 'warning' | 'advisory'
  title: string
  detail: string
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

type AudienceMode = 'public' | 'engineer'
type ResponseTemplateMode = 'building' | 'consultation' | 'general'

interface TemplateSectionSpec {
  title: string
  aliases: string[]
  confidenceLine?: boolean
}

interface TemplateValidationResult {
  complete: boolean
  missingTitles: string[]
}

const detectTemplateMode = (rawInput: string, hasImage: boolean): ResponseTemplateMode => {
  if (hasImage) return 'building'

  const normalized = rawInput.toLowerCase().trim()
  const hasBuildingTerm = /(tulou|siheyuan|yaodong|diaojiaolou|weilongwu|huizhou|jiangnan|lingnan|bashu|sichuan\s+folk|northwest\s+adobe|uyghur\s+flat|tibetan\s+stone|yi\s*&\s*bai|northeast\s+manor|beijing\s+northern\s+rural|dougong|土楼|四合院|窑洞|吊脚楼|围龙屋|徽州民居|江南水乡|岭南民居|巴蜀民居|西北土坯|新疆维吾尔|藏式石屋|彝族|白族|东北庄园|北方农村民居|斗拱|建筑)/i.test(rawInput)
  const asksDefinition = /(what\s+is|tell\s+me\s+about|explain|overview|history|介绍|是什么|讲讲|解释|原理)/i.test(rawInput)
  const asksDesign = /(design|proposal|recommend|strategy|plan|cost|budget|retrofit|build|project|consult|方案|建议|设计|预算|造价|改造|项目|咨询)/i.test(rawInput)

  if (asksDesign) return 'consultation'
  if (hasBuildingTerm || asksDefinition) return 'building'
  if (normalized.length === 0) return 'consultation'
  return 'general'
}

const normalizeTemplateText = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[`*_[\]():#\-]/g, '')
    .replace(/\s+/g, '')
}

const extractMarkdownHeadings = (content: string): string[] => {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^#{1,6}\s+/.test(line))
    .map(line => line.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').trim())
}

const getTemplateSections = (templateMode: ResponseTemplateMode, audienceMode: AudienceMode, lang: 'zh' | 'en'): TemplateSectionSpec[] => {
  // Public mode: no forced headings, use style guidance only
  if (audienceMode === 'public') {
    return []
  }

  // Engineer mode: strict structured templates
  if (templateMode === 'building') {
    return lang === 'zh'
      ? [
          { title: '建筑概览', aliases: ['建筑概览', '建筑识别', '建筑简介'] },
          { title: '气候适应特征', aliases: ['气候适应特征', '气候适应逻辑'] },
          { title: '现代应用建议', aliases: ['现代应用建议', '现代应用思路'] },
          { title: '置信度', aliases: ['置信度', 'Confidence'], confidenceLine: true },
        ]
      : [
          { title: 'Building Overview', aliases: ['Building Overview', 'Building Snapshot'] },
          { title: 'Climate Adaptation Features', aliases: ['Climate Adaptation Features', 'Climate Adaptation Logic'] },
          { title: 'Modern Application Ideas', aliases: ['Modern Application Ideas', 'Modern Application Notes'] },
          { title: 'Confidence', aliases: ['Confidence'], confidenceLine: true },
        ]
  }

  if (templateMode === 'general') {
    return lang === 'zh'
      ? [
          { title: '直接回答', aliases: ['直接回答', '结论'] },
          { title: '关键依据', aliases: ['关键依据', '关键点'] },
          { title: '建议下一步', aliases: ['建议下一步', '下一步建议'] },
          { title: '置信度', aliases: ['置信度', 'Confidence'], confidenceLine: true },
        ]
      : [
          { title: 'Direct Answer', aliases: ['Direct Answer'] },
          { title: 'Key Points', aliases: ['Key Points', 'Key Reasoning'] },
          { title: 'Suggested Next Step', aliases: ['Suggested Next Step', 'Recommended Next Step'] },
          { title: 'Confidence', aliases: ['Confidence'], confidenceLine: true },
        ]
  }

  // consultation + engineer
  return lang === 'zh'
    ? [
        { title: '假设条件', aliases: ['假设条件', '假设'] },
        { title: '输入与单位', aliases: ['输入与单位', '输入参数与单位'] },
        { title: '策略选项与权衡', aliases: ['策略选项与权衡', '策略对比与权衡'] },
        { title: '碳与成本区间估算', aliases: ['碳与成本区间估算', '碳与成本估算区间'] },
        { title: '风险与规范约束', aliases: ['风险与规范约束', '风险与约束'] },
        { title: '参考依据', aliases: ['参考依据', '参考文献', 'References'] },
        { title: '置信度', aliases: ['置信度', 'Confidence'], confidenceLine: true },
      ]
    : [
        { title: 'Assumptions', aliases: ['Assumptions'] },
        { title: 'Inputs & Units', aliases: ['Inputs & Units', 'Inputs and Units'] },
        { title: 'Strategy Options and Trade-offs', aliases: ['Strategy Options and Trade-offs', 'Strategy Options & Trade-offs'] },
        { title: 'Carbon and Cost Estimate Ranges', aliases: ['Carbon and Cost Estimate Ranges', 'Carbon & Cost Estimate Ranges'] },
        { title: 'Risks and Code Constraints', aliases: ['Risks and Code Constraints', 'Constraints/Risks'] },
        { title: 'References', aliases: ['References', 'Reference Basis'] },
        { title: 'Confidence', aliases: ['Confidence'], confidenceLine: true },
      ]
}

const buildStructuredTemplateGuide = (templateMode: ResponseTemplateMode, audienceMode: AudienceMode, lang: 'zh' | 'en'): string => {
  const sections = getTemplateSections(templateMode, audienceMode, lang)
  if (sections.length === 0) {
    // Public mode: natural style guidance, no forced headings
    if (lang === 'zh') {
      if (templateMode === 'building') {
        return '回答风格要求（建筑问答 + 大众模式）：\n1) 用通俗易懂的语言介绍建筑。\n2) 重点说明气候适应智慧和现代借鉴价值。\n3) 适当量化（如节能百分比），但避免过多专业术语。\n4) 信息不足时明确说明。'
      }
      if (templateMode === 'consultation') {
        return '回答风格要求（咨询方案 + 大众模式）：\n1) 先给出简短结论。\n2) 用2-4条要点给出可执行建议。\n3) 涉及费用时给出区间并标注为估算。\n4) 信息不足时明确假设并指出需补充数据。'
      }
      return '回答风格要求（大众模式）：\n1) 用自然、易懂的语言回答。\n2) 适当使用要点列表，但不强制使用固定标题。\n3) 涉及数据时给出估算区间。\n4) 信息不足时说明假设。'
    }

    if (templateMode === 'building') {
      return 'Response style guidance (Building QA + Public mode):\n1) Introduce the building in plain, accessible language.\n2) Highlight climate-adaptation wisdom and modern relevance.\n3) Quantify where possible (e.g. energy savings %), but minimize jargon.\n4) State when information is incomplete.'
    }
    if (templateMode === 'consultation') {
      return 'Response style guidance (Consultation + Public mode):\n1) Start with a short conclusion.\n2) Provide 2-4 actionable recommendations as concise bullets.\n3) Use range-based estimates for cost-related advice and label them as estimates.\n4) If inputs are missing, state assumptions and specify what data is needed.'
    }
    return 'Response style guidance (Public mode):\n1) Respond naturally in accessible language.\n2) Use bullet points when helpful, but no forced headings required.\n3) Provide range-based estimates for quantitative advice.\n4) State assumptions when data is incomplete.'
  }

  const headingList = sections
    .map(section => `## ${section.title}`)
    .join('\n')

  const modeLabel = lang === 'zh'
    ? templateMode === 'building' ? '建筑问答模板' : templateMode === 'consultation' ? '咨询方案模板' : '通用问答模板'
    : templateMode === 'building' ? 'Building QA template' : templateMode === 'consultation' ? 'Consultation template' : 'General QA template'

  if (lang === 'zh') {
    return `结构化模板要求（${modeLabel}，必须严格遵循）：\n${headingList}\n\n规则：\n1) 必须按以上顺序输出小节。\n2) 若信息不足，仍保留小节并写 N/A。\n3) 小节标题必须与模板一致。\n4) 仅在“咨询方案模板 + 工程师模式”下，至少包含1个带单位和区间的对比表。`
  }

  return `Structured template contract (${modeLabel}, must follow exactly):\n${headingList}\n\nRules:\n1) Keep sections in this exact order.\n2) If data is missing, keep the section and write N/A.\n3) Section headings must match the template.\n4) Only for Consultation template + Engineer mode, include at least one comparison table with units and ranges.`
}

const validateStructuredOutput = (content: string, templateMode: ResponseTemplateMode, audienceMode: AudienceMode, lang: 'zh' | 'en'): TemplateValidationResult => {
  const sections = getTemplateSections(templateMode, audienceMode, lang)
  if (sections.length === 0) {
    return {
      complete: true,
      missingTitles: [],
    }
  }

  const headings = extractMarkdownHeadings(content)
  const normalizedHeadings = headings.map(normalizeTemplateText)

  const missingTitles = sections
    .filter(section => {
      const hasHeading = section.aliases.some(alias => {
        const aliasNorm = normalizeTemplateText(alias)
        return normalizedHeadings.some(heading => heading.includes(aliasNorm) || aliasNorm.includes(heading))
      })

      if (hasHeading) return false
      if (!section.confidenceLine) return true

      return !(/confidence\s*[:：]/i.test(content) || /置信度\s*[:：]/.test(content))
    })
    .map(section => section.title)

  return {
    complete: missingTitles.length === 0,
    missingTitles,
  }
}

const buildRetrievedResearchContext = (research: DataHubResearchPayload, lang: 'zh' | 'en'): string => {
  const strategyLines = research.passiveStrategies
    .slice(0, 3)
    .map(item => `- ${item.title}: ${item.impact} = ${item.value}`)
    .join('\n')

  const sourceLines = research.sourceLinkedCards
    .slice(0, 4)
    .map(item => `- ${item.title} | ${item.publisher} | ${item.year}${item.url ? ` | ${item.url}` : ''}`)
    .join('\n')

  const hazard = research.hazardScores

  if (lang === 'zh') {
    return [
      '联网检索证据（请优先据此给出方案与引用）：',
      `- 气候风险评分: Flood ${hazard.flood}, Typhoon ${hazard.typhoon}, Heatwave ${hazard.heatwave}, Seismic ${hazard.seismic}`,
      '- 被动策略候选:',
      strategyLines || '- N/A',
      '- 参考来源:',
      sourceLines || '- N/A',
    ].join('\n')
  }

  return [
    'Web-retrieved evidence (prioritize this context and cite it when relevant):',
    `- Hazard scores: Flood ${hazard.flood}, Typhoon ${hazard.typhoon}, Heatwave ${hazard.heatwave}, Seismic ${hazard.seismic}`,
    '- Passive strategy candidates:',
    strategyLines || '- N/A',
    '- Reference candidates:',
    sourceLines || '- N/A',
  ].join('\n')
}

const buildConstraintComplianceHints = (params: {
  rawInput: string
  templateMode: ResponseTemplateMode
  lang: 'zh' | 'en'
  climateZone: string
  hazardScores: { flood: number; typhoon: number; heatwave: number; seismic: number }
}): ComplianceHint[] => {
  const { rawInput, templateMode, lang, climateZone, hazardScores } = params
  if (templateMode !== 'consultation') return []

  const input = rawInput.trim()
  if (!input) return []

  const hints: ComplianceHint[] = []
  const addHint = (hint: ComplianceHint) => {
    if (!hints.some(existing => existing.key === hint.key)) hints.push(hint)
  }

  const floodTriggered = hazardScores.flood >= 75 || /(flood|stormwater|inundation|rainstorm|\u6d2a|\u6d9d|\u5185\u6d9d|\u66b4\u96e8|\u96e8\u6d2a)/i.test(input)
  if (floodTriggered) {
    addHint({
      key: 'flood',
      level: 'warning',
      title: lang === 'zh' ? '洪涝约束' : 'Flood Constraint',
      detail: lang === 'zh'
        ? '将防洪作为硬约束：关键设备与首层控制点高于设计洪水位，并校核防倒灌与场地排水能力。'
        : 'Treat flood resilience as a hard constraint: keep critical equipment and key first-floor levels above design flood elevation, and verify backflow and drainage capacity.',
    })
  }

  const typhoonTriggered = hazardScores.typhoon >= 70 || /(typhoon|wind load|gust|\u53f0\u98ce|\u5927\u98ce|\u98ce\u538b)/i.test(input)
  if (typhoonTriggered) {
    addHint({
      key: 'typhoon',
      level: 'warning',
      title: lang === 'zh' ? '台风抗风约束' : 'Typhoon/Wind Constraint',
      detail: lang === 'zh'
        ? '围护与屋面系统需考虑抗拔、节点锚固与构件连续受力路径，避免高风压下的外立面失效。'
        : 'Envelope and roof systems should address uplift, anchorage, and continuous load paths to avoid facade or roofing failure under high wind pressure.',
    })
  }

  const seismicTriggered = hazardScores.seismic >= 65 || /(seismic|earthquake|\u6297\u9707|\u5730\u9707)/i.test(input)
  if (seismicTriggered) {
    addHint({
      key: 'seismic',
      level: 'warning',
      title: lang === 'zh' ? '抗震约束' : 'Seismic Constraint',
      detail: lang === 'zh'
        ? '优先采用延性体系并控制不规则体型，关键节点需满足抗震等级要求，避免仅以材料替换替代结构校核。'
        : 'Prefer ductile structural systems and control massing irregularities; critical joints should satisfy seismic-grade requirements instead of relying on material substitution alone.',
    })
  }

  const climateLower = climateZone.toLowerCase()
  const ventilationTriggered =
    /(ventilation|airflow|humid|overheat|mold|\u901a\u98ce|\u6e7f\u70ed|\u6f6e\u6e7f|\u95f7\u70ed|\u70ed\u6d6a)/i.test(input) ||
    /(hot summer warm winter|hot summer cold winter|hsww|hscw|\u590f\u70ed\u51ac\u6696|\u590f\u70ed\u51ac\u51b7)/i.test(climateLower)
  if (ventilationTriggered) {
    addHint({
      key: 'ventilation',
      level: 'advisory',
      title: lang === 'zh' ? '通风与新风约束' : 'Ventilation Constraint',
      detail: lang === 'zh'
        ? '需保留有效自然通风路径或提供机械新风补偿，避免提出“高气密+无新风”的不可实施方案。'
        : 'Maintain viable natural airflow paths or add mechanical fresh-air compensation; avoid proposing high-airtightness schemes without a fresh-air strategy.',
    })
  }

  return hints.slice(0, 4)
}

const buildConstraintHintContext = (hints: ComplianceHint[], lang: 'zh' | 'en'): string => {
  if (hints.length === 0) return ''
  if (lang === 'zh') {
    return [
      '约束与合规检查（请作为硬约束执行）：',
      ...hints.map((hint, idx) => `${idx + 1}. ${hint.title}: ${hint.detail}`),
    ].join('\n')
  }

  return [
    'Constraint and compliance checks (treat as hard constraints):',
    ...hints.map((hint, idx) => `${idx + 1}. ${hint.title}: ${hint.detail}`),
  ].join('\n')
}

interface HazardScore {
  flood: number
  typhoon: number
  heatwave: number
  seismic: number
}

interface BuildingFactors {
  embodiedReduction: number
  operationalReduction: number
  costMultiplier: number
}

const clampValue = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const extractFirstNumber = (value: string): number | null => {
  const match = value.match(/-?\d+(?:\.\d+)?/)
  if (!match) return null
  const parsed = Number(match[0])
  return Number.isFinite(parsed) ? parsed : null
}

const deriveTemperatureDelta = (internal: string, external: string): number => {
  const internalValue = extractFirstNumber(internal)
  const externalValue = extractFirstNumber(external)
  if (internalValue === null || externalValue === null) return 10
  return Math.max(0, Math.round(externalValue - internalValue))
}

const AI_BUILDING_ALIASES: Array<{ id: BuildingId; aliases: string[] }> = [
  { id: 'tulou', aliases: ['fujian tulou', 'tulou', '土楼'] },
  { id: 'siheyuan', aliases: ['beijing siheyuan', 'siheyuan', '四合院'] },
  { id: 'yaodong', aliases: ['shaanbei yaodong', 'yaodong', '窑洞'] },
  { id: 'diaojiaolou', aliases: ['diaojiaolou', '吊脚楼'] },
  { id: 'weilongwu', aliases: ['hakka weilongwu', 'weilongwu', '围龙屋'] },
  { id: 'huizhou-residence', aliases: ['huizhou residence', 'huizhou', 'wan architecture', '徽州民居', '徽州'] },
  { id: 'jiangnan-water-town-house', aliases: ['jiangnan water town house', 'jiangnan water', 'water town', '江南水乡', '江南'] },
  { id: 'beijing-northern-rural-house', aliases: ['beijing northern rural house', 'beijing northern rural', 'north china rural', '北京北方农村民居', '北京北方农村'] },
  { id: 'northwest-adobe-house', aliases: ['northwest adobe house', 'northwest adobe', 'loess house', '西北土坯民居', '西北土坯'] },
  { id: 'lingnan-residence', aliases: ['lingnan residence', 'lingnan', '岭南民居', '岭南'] },
  { id: 'sichuan-folk-house', aliases: ['sichuan folk house', 'bashu residence', 'bashu', '巴蜀民居', '巴蜀'] },
  { id: 'xinjiang-uyghur-flat-roof-house', aliases: ['xinjiang uyghur flat-roof house', 'uyghur flat roof', 'xinjiang flat roof', '新疆维吾尔平顶民居', '新疆平顶'] },
  { id: 'tibetan-stone-house', aliases: ['tibetan stone house', 'tibetan stone', '藏式石屋'] },
  { id: 'yi-bai-traditional-houses', aliases: ['yi & bai traditional houses', 'yi and bai', 'bai house', '彝族与白族', '白族', '彝族'] },
  { id: 'northeast-manor-house', aliases: ['manor houses of northeast china', 'northeast manor', 'manchu manor', '东北庄园大宅', '东北庄园'] },
]

const KNOWLEDGE_PACK_FAMILY_BY_BUILDING: Record<BuildingId, 'tulou' | 'siheyuan' | 'yaodong' | 'diaojiaolou' | 'weilongwu'> = {
  tulou: 'tulou',
  siheyuan: 'siheyuan',
  yaodong: 'yaodong',
  diaojiaolou: 'diaojiaolou',
  weilongwu: 'weilongwu',
  'huizhou-residence': 'siheyuan',
  'jiangnan-water-town-house': 'diaojiaolou',
  'beijing-northern-rural-house': 'siheyuan',
  'northwest-adobe-house': 'yaodong',
  'lingnan-residence': 'weilongwu',
  'sichuan-folk-house': 'diaojiaolou',
  'xinjiang-uyghur-flat-roof-house': 'yaodong',
  'tibetan-stone-house': 'yaodong',
  'yi-bai-traditional-houses': 'diaojiaolou',
  'northeast-manor-house': 'siheyuan',
}

const detectBuildingIdFromText = (text: string): BuildingId | null => {
  const normalized = text.trim().toLowerCase()
  if (!normalized) return null

  const researchMatch = detectNew10ResearchEntry(normalized)
  if (researchMatch) {
    return researchMatch.id
  }

  for (const profile of BUILDING_PROFILES) {
    if (
      normalized.includes(profile.id.toLowerCase()) ||
      normalized.includes(profile.nameEn.toLowerCase()) ||
      normalized.includes(profile.nameZh.toLowerCase())
    ) {
      return profile.id
    }
  }

  for (const group of AI_BUILDING_ALIASES) {
    if (group.aliases.some(alias => normalized.includes(alias.toLowerCase()))) {
      return group.id
    }
  }

  return null
}

const deriveBuildingHazardScores = (buildingId: BuildingId): HazardScore => {
  const profile = BUILDING_PROFILE_MAP[buildingId]
  const research = NEW10_RESEARCH_BY_ID[buildingId]
  const signal = `${profile.regionEn} ${profile.regionZh} ${profile.climateEn} ${profile.climateZh}`.toLowerCase()

  const floodBase = Math.round(24 + profile.precipValue / 22 + profile.humidValue / 5)
  const coastalSignal = /(fujian|guangdong|jiangnan|water|lingnan|coast|沿海|水乡|台风)/i.test(signal)
  const inlandDrySignal = /(northwest|xinjiang|northeast|plateau|西北|新疆|高原|东北)/i.test(signal)
  const flood = clampValue(floodBase + (coastalSignal ? 6 : 0) - (inlandDrySignal ? 4 : 0), 35, 95)

  const typhoonBase = Math.round(22 + profile.humidValue / 4 + profile.precipValue / 120)
  const typhoon = clampValue(typhoonBase + (coastalSignal ? 18 : 0) - (inlandDrySignal ? 8 : 0), 25, 95)

  const dryHotSignal = /(dry|arid|desert|hot|干热|干旱|荒漠)/i.test(signal)
  const coldHighlandSignal = /(tibet|plateau|qinghai|高原|藏|severe cold)/i.test(signal)
  const heatwaveBase = Math.round(35 + profile.tempValue * 2)
  const heatwave = clampValue(heatwaveBase + (dryHotSignal ? 10 : 0) - (coldHighlandSignal ? 8 : 0), 35, 95)

  const mountainSignal = /(sichuan|yunnan|tibet|xinjiang|loess|mountain|plateau|四川|云南|藏|山地|高原|黄土)/i.test(signal)
  const plainSignal = /(plain|delta|water town|平原|三角洲|水乡)/i.test(signal)
  const seismicBase = 48 + (mountainSignal ? 18 : 0) + (plainSignal ? 4 : 0)
  const seismic = clampValue(seismicBase + (research ? Math.round((6 - research.overallRank) * 1.5) : 0), 45, 95)

  return { flood, typhoon, heatwave, seismic }
}

const deriveBuildingFactors = (buildingId: BuildingId): BuildingFactors => {
  const profile = BUILDING_PROFILE_MAP[buildingId]
  const research = NEW10_RESEARCH_BY_ID[buildingId]
  const tempDelta = deriveTemperatureDelta(profile.tempInternal, profile.tempExternal)

  const embodiedReduction = research
    ? clampValue(0.14 + research.carbonEfficiencyStars * 0.045, 0.16, 0.4)
    : clampValue(0.18 + tempDelta * 0.005, 0.18, 0.34)

  const operationalReduction = research
    ? clampValue(0.16 + research.climateFitStars * 0.045 + tempDelta * 0.003, 0.2, 0.45)
    : clampValue(0.2 + tempDelta * 0.006, 0.2, 0.42)

  const climateSeverity = Math.abs(profile.tempValue - 18) / 14
  const humiditySeverity = profile.humidValue / 100
  const rainfallSeverity = profile.precipValue / 1800
  const costMultiplier = clampValue(0.9 + climateSeverity * 0.12 + humiditySeverity * 0.08 + rainfallSeverity * 0.06, 0.92, 1.18)

  return {
    embodiedReduction,
    operationalReduction,
    costMultiplier,
  }
}

const AIConsultant = () => {
  const { t, lang } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const [isVisible, setIsVisible] = useState(false)

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const promptCategories = lang === 'zh' ? [
    { icon: <Sun size={18} />, label: '夏季降温', color: 'var(--temp-hot)', bgColor: 'var(--temp-hot-light)', gradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)', prompts: ['炎热潮湿气候解决方案', '自然通风设计原理', '遮阳隔热技术'] },
    { icon: <Snowflake size={18} />, label: '冬季保暖', color: 'var(--info)', bgColor: 'var(--info-light)', gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', prompts: ['寒冷冬季保温策略', '地热利用技术', '太阳能被动采暖'] },
    { icon: <Shield size={18} />, label: '灾害防护', color: 'var(--temp-cool)', bgColor: 'var(--temp-cool-light)', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', prompts: ['台风防护设计', '防洪建筑措施', '抗震结构原理'] },
  ] : [
    { icon: <Sun size={18} />, label: 'Summer Cooling', color: 'var(--temp-hot)', bgColor: 'var(--temp-hot-light)', gradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)', prompts: ['Hot humid climate solutions', 'Natural ventilation principles', 'Solar shading techniques'] },
    { icon: <Snowflake size={18} />, label: 'Winter Heating', color: 'var(--info)', bgColor: 'var(--info-light)', gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', prompts: ['Cold winter insulation', 'Geothermal techniques', 'Passive solar heating'] },
    { icon: <Shield size={18} />, label: 'Disaster Protection', color: 'var(--temp-cool)', bgColor: 'var(--temp-cool-light)', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', prompts: ['Typhoon resistance design', 'Flood protection measures', 'Earthquake-resistant structures'] },
  ]

  const welcomeMessage: Message = {
    role: 'assistant',
    content: lang === 'zh' 
      ? '你好！我是「虚拟建筑师」，传承千年匠心智慧。问我传统建筑如何应对现代气候挑战吧！\n\n📸 你也可以点击发送按钮旁的相机图标上传建筑照片，我会为你分析！'
      : 'Greetings! I am "The Virtual Architect", keeper of a thousand years of craftsmanship. Ask me how traditional architecture solves modern climate challenges!\n\n📸 You can also click the camera icon beside the send button to upload a building photo for analysis!'
  }

  const CHAT_STORAGE_KEY = 'zhuzhi-chat-history'
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('zhuzhi-chat-history')
      return saved ? JSON.parse(saved) : [welcomeMessage]
    } catch {
      return [welcomeMessage]
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ base64: string; previewUrl: string } | null>(null)
  const [assistantPhase, setAssistantPhase] = useState<AssistantPhase>('thinking')
  const [hasStreamStarted, setHasStreamStarted] = useState(false)
  const [activityTick, setActivityTick] = useState(0)
  const streamingAssistantIndexRef = useRef<number | null>(null)
  const chunkBufferRef = useRef('')
  const flushTimerRef = useRef<number | null>(null)
  const [siteProfile] = useState<SiteProfile>({
    city: '',
    climateZone: '',
    landSize: '',
    budgetRange: '',
    buildingType: '',
  })
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('public')

  const areaM2 = useMemo(() => parseAreaFromText(siteProfile.landSize), [siteProfile.landSize])

  const inferredBuildingId = useMemo<BuildingId>(() => {
    const hintText = `${siteProfile.buildingType} ${siteProfile.city} ${siteProfile.climateZone}`.trim()
    return detectBuildingIdFromText(hintText) ?? 'tulou'
  }, [siteProfile.buildingType, siteProfile.city, siteProfile.climateZone])

  const buildingProfile = useMemo(() => BUILDING_PROFILE_MAP[inferredBuildingId], [inferredBuildingId])
  const matchedResearch = useMemo(() => NEW10_RESEARCH_BY_ID[inferredBuildingId] ?? null, [inferredBuildingId])

  const buildingFactors = useMemo(() => deriveBuildingFactors(inferredBuildingId), [inferredBuildingId])
  const carbonProfile = useMemo(
    () => computeCarbonProfile(areaM2, buildingFactors.embodiedReduction, buildingFactors.operationalReduction),
    [areaM2, buildingFactors.embodiedReduction, buildingFactors.operationalReduction]
  )
  const costSummary = useMemo(
    () => computeCostSummary(areaM2, buildingFactors.costMultiplier),
    [areaM2, buildingFactors.costMultiplier]
  )

  const hazardScores = useMemo(() => deriveBuildingHazardScores(inferredBuildingId), [inferredBuildingId])

  const passiveStrategies = useMemo(() => {
    const tempDelta = deriveTemperatureDelta(buildingProfile.tempInternal, buildingProfile.tempExternal)
    const adaptationBaseline = matchedResearch?.primaryStrategy
      || (lang === 'zh'
        ? (buildingProfile.adaptationsZh[0] || buildingProfile.modernEquivalent.zh)
        : (buildingProfile.adaptationsEn[0] || buildingProfile.modernEquivalent.en))
    const adaptationSummary = adaptationBaseline.split(/[。.;；]/)[0].trim()
    const heatImpact = buildingProfile.tempValue >= 18
      ? (lang === 'zh' ? '夏季降温' : 'Summer Cooling')
      : (lang === 'zh' ? '冬季保温' : 'Winter Heating')
    const moistureFocused = buildingProfile.humidValue > 65
    const resilienceValueLow = Math.max(12, Math.round((hazardScores.flood + hazardScores.typhoon) / 12))
    const resilienceValueHigh = Math.max(20, Math.round((hazardScores.flood + hazardScores.typhoon) / 8))

    return [
      {
        title: lang === 'zh' ? `${buildingProfile.nameZh}围护优化` : `${buildingProfile.nameEn} Envelope Upgrade`,
        impact: heatImpact,
        value: `${Math.max(10, Math.round(tempDelta * 1.3))}-${Math.max(18, Math.round(tempDelta * 1.9))}%`,
      },
      {
        title: lang === 'zh' ? `气候适配: ${adaptationSummary}` : `Climate Adaptation: ${adaptationSummary}`,
        impact: lang === 'zh' ? '灾害韧性' : 'Hazard Resilience',
        value: `${resilienceValueLow}-${resilienceValueHigh}%`,
      },
      {
        title: moistureFocused
          ? (lang === 'zh' ? '湿热环境含湿控制' : 'Moisture Buffering Loop')
          : (lang === 'zh' ? '昼夜温差缓冲' : 'Diurnal Thermal Buffer'),
        impact: lang === 'zh' ? '舒适稳定性' : 'Comfort Stability',
        value: `${Math.max(8, Math.round(tempDelta * 0.9))}-${Math.max(15, Math.round(tempDelta * 1.4))}%`,
      },
    ]
  }, [buildingProfile, hazardScores.flood, hazardScores.typhoon, lang, matchedResearch])

  const sourceLinkedCards = useMemo<SourceItem[]>(() => {
    const cards: SourceItem[] = [
      {
        title: `${buildingProfile.nameEn} Climate Profile`,
        publisher: 'Zhuzhi Building Dataset',
        year: '2024',
        note: `${buildingProfile.regionEn}; ${buildingProfile.climateEn}`,
      },
      {
        title: 'Traditional Climate Adaptation Patterns in China',
        publisher: 'Vernacular Architecture Synthesis',
        year: '2023',
        note: buildingProfile.adaptationsEn.slice(0, 2).join('; ') || buildingProfile.modernEquivalent.en,
      },
    ]

    if (matchedResearch) {
      cards.push(
        {
          title: `Environmental Suitability Study: ${buildingProfile.nameEn}`,
          publisher: 'Chinese Vernacular Architecture Environmental Study',
          year: '2024',
          note: `Overall rank ${matchedResearch.overallRank}/10; climate fit ${matchedResearch.climateFitStars}/5`,
        },
        {
          title: `${buildingProfile.nameEn} Hazard Adaptation Notes`,
          publisher: 'Regional Comparative Dataset',
          year: '2024',
          note: `${matchedResearch.primaryStrategy}; ${matchedResearch.secondaryStrategy}`,
        }
      )
    } else {
      cards.push({
        title: `${buildingProfile.nameEn} Regional Material Guide`,
        publisher: 'Local Construction Knowledge Base',
        year: '2022',
        note: `Recommended strategy focus: ${buildingProfile.adaptationsEn[0] || buildingProfile.modernEquivalent.en}`,
      })
    }

    return cards
  }, [buildingProfile, matchedResearch])

  const benchmarkCases = useMemo<CaseItem[]>(() => {
    const annualOperationalReduction = Math.round(buildingFactors.operationalReduction * 100)
    const embodiedReduction = Math.round(buildingFactors.embodiedReduction * 100)
    const areaHint = areaM2 ? `${Math.round(areaM2)} m²` : 'medium-scale block'

    const cases: CaseItem[] = [
      {
        name: `${buildingProfile.nameEn} Retrofit Pilot`,
        location: buildingProfile.regionEn,
        challenge: buildingProfile.climateEn,
        strategy: buildingProfile.adaptationsEn[0] || buildingProfile.modernEquivalent.en,
        outcome: `Annual operational carbon -${annualOperationalReduction}%`,
      },
      {
        name: `${buildingProfile.nameEn} New-Build Prototype`,
        location: buildingProfile.regionEn,
        challenge: `Cost-constrained delivery (${areaHint})`,
        strategy: 'Passive-first envelope + locally sourced material chain',
        outcome: `Embodied carbon -${embodiedReduction}%`,
      },
    ]

    if (matchedResearch) {
      cases[1] = {
        name: `${buildingProfile.nameEn} Comparative Topology Case`,
        location: buildingProfile.regionEn,
        challenge: `Hazard profile rank ${matchedResearch.overallRank}/10`,
        strategy: `${matchedResearch.primaryStrategy}; ${matchedResearch.secondaryStrategy}`,
        outcome: matchedResearch.summerDelta || matchedResearch.winterDelta
          ? `Measured thermal delta ${matchedResearch.summerDelta} (summer), ${matchedResearch.winterDelta} (winter)`
          : `Composite suitability score ${matchedResearch.climateFitStars}/5`,
      }
    }

    return cases
  }, [areaM2, buildingFactors.embodiedReduction, buildingFactors.operationalReduction, buildingProfile, matchedResearch])

  const supplierRows = useMemo<SupplierItem[]>(() => {
    const hazardCandidates: Array<{ key: keyof HazardScore; score: number }> = [
      { key: 'flood', score: hazardScores.flood },
      { key: 'typhoon', score: hazardScores.typhoon },
      { key: 'heatwave', score: hazardScores.heatwave },
      { key: 'seismic', score: hazardScores.seismic },
    ]
    const dominantHazard = hazardCandidates.sort((a, b) => b.score - a.score)[0]?.key ?? 'heatwave'

    const hazardMaterialMap: Record<keyof HazardScore, { component: string; material: string }> = {
      flood: { component: 'Flood Layer', material: 'Raised plinth + permeable drainage matrix' },
      typhoon: { component: 'Wind Layer', material: 'Roof tie-down system + impact-resistant cladding' },
      heatwave: { component: 'Heat Layer', material: 'High-albedo roof + ventilated shading screen' },
      seismic: { component: 'Seismic Layer', material: 'Constrained frame joints + ductile reinforcement' },
    }

    const envelopeMaterial = buildingProfile.humidValue >= 70
      ? 'Lime-stabilized masonry + treated timber frame'
      : buildingProfile.tempValue <= 10
        ? 'High-mass masonry + insulated cavity wall'
        : 'Rammed earth composite + RC confining frame'

    return [
      {
        component: 'Envelope',
        material: envelopeMaterial,
        unitCost: `¥${Math.round(920 * buildingFactors.costMultiplier)}/m²`,
        supplier: `${buildingProfile.regionEn} low-carbon supplier network`,
      },
      {
        component: hazardMaterialMap[dominantHazard].component,
        material: hazardMaterialMap[dominantHazard].material,
        unitCost: `¥${Math.round(740 * buildingFactors.costMultiplier)}/m²`,
        supplier: `${buildingProfile.regionEn} resilience engineering alliance`,
      },
    ]
  }, [buildingFactors.costMultiplier, buildingProfile, hazardScores.flood, hazardScores.heatwave, hazardScores.seismic, hazardScores.typhoon])

  // Persist chat history to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!loading || hasStreamStarted) return
    const timer = setInterval(() => {
      setActivityTick(prev => prev + 1)
    }, 950)
    return () => clearInterval(timer)
  }, [loading, hasStreamStarted])

  const flushBufferedChunks = () => {
    const content = chunkBufferRef.current
    const targetIndex = streamingAssistantIndexRef.current
    if (!content || targetIndex === null) return
    chunkBufferRef.current = ''
    setMessages(prev => {
      if (!prev[targetIndex] || prev[targetIndex].role !== 'assistant') return prev
      const next = [...prev]
      next[targetIndex] = { ...next[targetIndex], content: `${next[targetIndex].content}${content}` }
      return next
    })
  }

  const scheduleFlush = () => {
    if (flushTimerRef.current !== null) return
    flushTimerRef.current = window.setInterval(() => {
      flushBufferedChunks()
    }, 45)
  }

  const stopFlush = () => {
    flushBufferedChunks()
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current)
      flushTimerRef.current = null
    }
  }

  const exportChat = () => {
    const latestAssistantIndex = (() => {
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant' && messages[i].content.trim()) return i
      }
      return -1
    })()

    const latestAssistant = latestAssistantIndex >= 0 ? messages[latestAssistantIndex] : null
    const latestTemplateMode: ResponseTemplateMode = latestAssistantIndex >= 0
      ? detectTemplateMode(messages[latestAssistantIndex - 1]?.content || '', Boolean(messages[latestAssistantIndex - 1]?.image))
      : 'consultation'
    const latestValidation = latestAssistant
      ? validateStructuredOutput(latestAssistant.content, latestTemplateMode, audienceMode, lang)
      : null
    const latestComplianceHints = latestAssistant?.complianceHints || []
    const profileLines = [
      `- City / 城市: ${siteProfile.city || 'N/A'}`,
      `- Climate Zone / 气候区: ${siteProfile.climateZone || 'N/A'}`,
      `- Land Size / 用地规模: ${siteProfile.landSize || 'N/A'}`,
      `- Budget Range / 预算区间: ${siteProfile.budgetRange || 'N/A'}`,
      `- Target Building Type / 目标建筑类型: ${siteProfile.buildingType || 'N/A'}`,
      `- Audience Mode / 回答模式: ${audienceMode === 'public' ? (lang === 'zh' ? '大众模式' : 'Public mode') : (lang === 'zh' ? '工程师模式' : 'Engineer mode')}`,
      `- Template Mode / 模板模式: ${latestTemplateMode === 'building' ? (lang === 'zh' ? '建筑问答' : 'Building QA') : latestTemplateMode === 'consultation' ? (lang === 'zh' ? '咨询方案' : 'Consultation') : (lang === 'zh' ? '通用问答' : 'General QA')}`,
    ].join('\n')

    const passiveLines = passiveStrategies.map(s => `- ${s.title} (${s.impact}): ${s.value}`).join('\n')
    const exportSources = latestAssistant?.citations?.length ? latestAssistant.citations : sourceLinkedCards
    const supplierTable = supplierRows.map(s => `| ${s.component} | ${s.material} | ${s.unitCost} | ${s.supplier} |`).join('\n')
    const sourceTable = exportSources.map(s => `| ${s.title} | ${s.publisher} | ${s.year} | ${s.note} | ${s.url || 'N/A'} |`).join('\n')
    const caseTable = benchmarkCases.map(c => `| ${c.name} | ${c.location} | ${c.challenge} | ${c.strategy} | ${c.outcome} |`).join('\n')

    const report = `# ZHUZHI QIANNIAN Proposal Report / 筑之千年方案报告

Generated At / 生成时间: ${new Date().toLocaleString()}

## Site Reading / 场地输入
${profileLines}

## Concept Strategy / 概念策略
${latestAssistant?.content || (lang === 'zh' ? '暂无可导出的AI方案内容。' : 'No AI concept content available to export yet.')}

${latestValidation && !latestValidation.complete
  ? `## Template Compliance Warning / 结构化模板告警\n${latestValidation.missingTitles.map(title => `- ${lang === 'zh' ? '缺失小节' : 'Missing section'}: ${title}`).join('\n')}`
  : ''}

## Construction Materials & Suppliers / 建筑材料与供应
| Component | Recommended Material | Unit Cost (RMB) | Local Availability / Supplier |
|---|---|---:|---|
${supplierTable}

## Estimated Costs / 预估成本
| Cost Category | Amount (RMB) | Share of Total |
|---|---:|---:|
| Materials | ¥${costSummary.materials.toLocaleString()} | 57% |
| Labor | ¥${costSummary.labor.toLocaleString()} | 35% |
| Engineering & Design | ¥${costSummary.engineering.toLocaleString()} | 8% |
| Total | ¥${costSummary.total.toLocaleString()} | 100% |

## Carbon Impact / 碳影响
- Embodied Carbon Baseline / 隐含碳基线: ${carbonProfile.embodiedBaseline} tCO2e
- Embodied Carbon Adaptive / 优化后隐含碳: ${carbonProfile.embodiedAdaptive} tCO2e
- Embodied Carbon Reduction / 隐含碳减排: ${carbonProfile.embodiedSaved} tCO2e (${carbonProfile.embodiedSavedPct}%)
- Annual Operational Baseline / 年运行碳基线: ${carbonProfile.annualOperationalBaseline} tCO2e
- Annual Operational Adaptive / 年运行碳优化后: ${carbonProfile.annualOperationalAdaptive} tCO2e
- Annual Operational Reduction / 年运行减排: ${carbonProfile.annualOperationalSaved} tCO2e (${carbonProfile.annualOperationalSavedPct}%)

## Passive Strategy Simulation / 被动策略模拟
${passiveLines}

## Climate Hazard Adaptation Scoring / 气候灾害适应评分
| Hazard | Score |
|---|---:|
| Flood / 洪涝 | ${hazardScores.flood} |
| Typhoon / 台风 | ${hazardScores.typhoon} |
| Heatwave / 热浪 | ${hazardScores.heatwave} |
| Seismic / 抗震 | ${hazardScores.seismic} |

${latestComplianceHints.length > 0
  ? `## Constraint and Compliance Hints / 约束与合规提示\n${latestComplianceHints.map(hint => `- [${hint.level.toUpperCase()}] ${hint.title}: ${hint.detail}`).join('\n')}`
  : ''}

## Source-Linked Knowledge Cards / 依据来源
| Source | Publisher | Year | Evidence Note | URL |
|---|---|---:|---|---|
${sourceTable}

## Benchmark Case Library / 参考案例库
| Case | Location | Climate Challenge | Material/Design Strategy | Measured or Expected Outcome |
|---|---|---|---|---|
${caseTable}
`

    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zhuzhi-proposal-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const extractMappings = (content: string): Array<{ traditional: string; modern: string }> => {
    const lines = content.split('\n')
    const mappings: Array<{ traditional: string; modern: string }> = []
    for (const raw of lines) {
      const line = raw.trim()
      const normalized = line.replace(/^[-*]\s*/, '')
      if (!normalized.includes('→') && !normalized.includes('->')) continue
      const parts = normalized.split(/→|->/)
      if (parts.length < 2) continue
      const traditional = parts[0].trim()
      const modern = parts.slice(1).join(' ').trim()
      if (traditional && modern) mappings.push({ traditional, modern })
      if (mappings.length >= 4) break
    }
    return mappings
  }

  const isCasualGreeting = (text: string): boolean => {
    const normalized = text.trim().toLowerCase()
    if (normalized.length > 30) return false
    return /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|你好|嗨|您好|早上好|下午好|晚上好)[\s!.?]*$/i.test(normalized)
  }

  const buildContextualPrompt = (rawInput: string, templateMode: ResponseTemplateMode): string => {
    // For casual greetings, don't inject structured template metadata
    if (isCasualGreeting(rawInput)) return rawInput

    const profileSummary = [
      siteProfile.city && `City: ${siteProfile.city}`,
      siteProfile.climateZone && `Climate Zone: ${siteProfile.climateZone}`,
      siteProfile.landSize && `Land Size: ${siteProfile.landSize}`,
      siteProfile.budgetRange && `Budget Range: ${siteProfile.budgetRange}`,
      siteProfile.buildingType && `Target Building Type: ${siteProfile.buildingType}`,
    ].filter(Boolean)

    const audienceModeTag = audienceMode === 'public' ? 'Public' : 'Engineer'
    const templateModeTag = templateMode === 'building' ? 'Building' : templateMode === 'consultation' ? 'Consultation' : 'General'
    const templateGuide = buildStructuredTemplateGuide(templateMode, audienceMode, lang)

    if (profileSummary.length === 0) {
      return `${rawInput}\n\nAudience Mode: ${audienceModeTag}\nTemplate Mode: ${templateModeTag}\n\n${templateGuide}`
    }

    return `${rawInput}\n\nAudience Mode: ${audienceModeTag}\nTemplate Mode: ${templateModeTag}\n\nProject Context:\n- ${profileSummary.join('\n- ')}\n\n${templateGuide}`
  }

  const clearChat = () => {
    setMessages([welcomeMessage])
    setPendingImage(null)
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      const previewUrl = URL.createObjectURL(file)
      setPendingImage({ base64, previewUrl })
    } catch {
      // silently fail
    }
    // Reset the file input so re-selecting the same file works
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl)
      setPendingImage(null)
    }
  }

  const handleSend = async () => {
    if (loading) return
    if (!input.trim() && !pendingImage) return

    const userText = input.trim()
    const imageToSend = pendingImage
    const templateMode = detectTemplateMode(userText, Boolean(imageToSend))
    const promptBuildingId = detectBuildingIdFromText(
      `${siteProfile.buildingType} ${siteProfile.city} ${siteProfile.climateZone} ${userText}`
    ) ?? inferredBuildingId
    const promptBuildingProfile = BUILDING_PROFILE_MAP[promptBuildingId]
    const promptHazardScores = deriveBuildingHazardScores(promptBuildingId)
    const localKnowledge = buildLocalKnowledgePromptContext({
      rawInput: `${promptBuildingProfile.nameEn} ${promptBuildingProfile.nameZh} ${userText}`.trim(),
      buildingFamily: KNOWLEDGE_PACK_FAMILY_BY_BUILDING[promptBuildingId],
      lang,
      siteProfile,
    })
    const defaultPrompt = templateMode === 'building'
      ? (lang === 'zh' ? '请识别并分析这张建筑图片，并说明可借鉴的现代应用策略。' : 'Please identify and analyze this building image, then explain practical modern adaptation ideas.')
      : templateMode === 'general'
        ? (lang === 'zh' ? '请直接回答问题并给出关键依据与下一步建议。' : 'Please answer directly with key points and a suggested next step.')
        : (lang === 'zh' ? '请结合场地条件给出方案建议。' : 'Please provide a design proposal based on the site context.')
    const baseIntent = userText || defaultPrompt
    const extractedResearchContext = buildNew10ResearchPromptContext(
      `${promptBuildingProfile.nameEn} ${promptBuildingProfile.nameZh} ${siteProfile.buildingType} ${baseIntent}`,
      lang
    )
    const portfolioResearchContext = buildNew10ResearchPortfolioContext({
      text: `${promptBuildingProfile.nameEn} ${promptBuildingProfile.nameZh} ${baseIntent}`,
      lang,
      siteProfile,
    })

    setInput('')
    setPendingImage(null)

    // Build user message for display
    const profileBadge = siteProfile.city || siteProfile.climateZone || siteProfile.buildingType
      ? `\n\n[Site: ${[siteProfile.city, siteProfile.climateZone, siteProfile.buildingType].filter(Boolean).join(' | ')}]`
      : ''

    const userMessage: Message = {
      role: 'user',
      content: (userText || (lang === 'zh' ? '请分析这张建筑照片' : 'Please analyze this building photo')) + profileBadge,
      image: imageToSend ? imageToSend.previewUrl : undefined,
    }
    setMessages(prev => {
      const next = [...prev, userMessage, { role: 'assistant' as const, content: '' }]
      streamingAssistantIndexRef.current = next.length - 1
      return next
    })
    setLoading(true)
    setHasStreamStarted(false)
    setActivityTick(0)
    setAssistantPhase('thinking')

    try {
      let retrievalContext = ''
      let citationSources: SourceItem[] = []
      let complianceHints = buildConstraintComplianceHints({
        rawInput: baseIntent,
        templateMode,
        lang,
        climateZone: localKnowledge.climateZone,
        hazardScores: promptHazardScores,
      })

      if (!imageToSend && templateMode === 'consultation' && localKnowledge.hasSiteSignal) {
        setAssistantPhase('researching')
        const webResearch = await fetchDataHubResearch({
          city: localKnowledge.city,
          climateZone: localKnowledge.climateZone,
          buildingType: localKnowledge.buildingType,
          lang,
        })

        if (webResearch) {
          retrievalContext = buildRetrievedResearchContext(webResearch, lang)
          citationSources = webResearch.sourceLinkedCards.map(item => ({
            title: item.title,
            publisher: item.publisher,
            year: item.year,
            note: item.note,
            url: item.url,
          }))
          complianceHints = buildConstraintComplianceHints({
            rawInput: baseIntent,
            templateMode,
            lang,
            climateZone: localKnowledge.climateZone,
            hazardScores: webResearch.hazardScores,
          })
        }
      }

      const complianceContext = buildConstraintHintContext(complianceHints, lang)
      const contextualSeed = templateMode === 'consultation'
        ? [
            baseIntent,
            localKnowledge.snippet,
            portfolioResearchContext,
            extractedResearchContext,
            retrievalContext,
            complianceContext,
          ]
            .filter(Boolean)
            .join('\n\n')
        : [baseIntent, portfolioResearchContext, extractedResearchContext].filter(Boolean).join('\n\n')

      const promptToModel = buildContextualPrompt(contextualSeed, templateMode)

      let streamedAssistant = ''
      if (imageToSend) {
        // Image analysis (with optional question) with streaming output
        streamedAssistant = await analyzeImageStream(imageToSend.base64, promptToModel || undefined, lang, {
          onPhase: (phase) => setAssistantPhase(phase),
          onToken: (chunk) => {
            setHasStreamStarted(true)
            chunkBufferRef.current += chunk
            scheduleFlush()
          }
        })
      } else {
        // Regular text chat with streaming output
        const history: AIMessage[] = messages.map(m => ({ role: m.role, content: m.content }))
        streamedAssistant = await chatWithAIStream(promptToModel, history, {
          onPhase: (phase) => setAssistantPhase(phase),
          onToken: (chunk) => {
            setHasStreamStarted(true)
            chunkBufferRef.current += chunk
            scheduleFlush()
          }
        })
      }

      stopFlush()

      const assistantIndex = streamingAssistantIndexRef.current
      let finalContent = streamedAssistant.trim()
        ? streamedAssistant
        : (lang === 'zh' ? '抱歉，我未生成有效回复。请重试。' : 'Sorry, I could not generate a valid response. Please try again.')

      // Validation is informational only for engineer mode; public mode always passes
      const skipValidation = isCasualGreeting(userText) || audienceMode === 'public'
      const validation = skipValidation
        ? { complete: true, missingTitles: [] }
        : validateStructuredOutput(finalContent, templateMode, audienceMode, lang)

      // No repair loop — accept the AI's response as-is
      // Missing sections are shown as informational badges in the UI

      if (assistantIndex !== null) {
        setMessages(prev => {
          if (!prev[assistantIndex] || prev[assistantIndex].role !== 'assistant') return prev
          const next = [...prev]
          next[assistantIndex] = {
            ...next[assistantIndex],
            content: finalContent,
            citations: citationSources.length > 0 ? citationSources : undefined,
            complianceHints: complianceHints.length > 0 ? complianceHints : undefined,
            validation,
          }
          return next
        })
      }
    } catch {
      stopFlush()
      setMessages(prev => {
        const targetIndex = streamingAssistantIndexRef.current
        if (targetIndex !== null && prev[targetIndex]?.role === 'assistant') {
          const next = [...prev]
          next[targetIndex] = {
            ...next[targetIndex],
            content: next[targetIndex].content || (lang === 'zh' ? '抱歉，发生了错误。请重试。' : 'Sorry, an error occurred. Please try again.')
          }
          return next
        }
        const next = [...prev]
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === 'assistant') {
            next[i] = {
              ...next[i],
              content: next[i].content || (lang === 'zh' ? '抱歉，发生了错误。请重试。' : 'Sorry, an error occurred. Please try again.')
            }
            break
          }
        }
        return next
      })
    } finally {
      stopFlush()
      streamingAssistantIndexRef.current = null
      setLoading(false)
    }
  }

  const phaseHeadline = lang === 'zh'
    ? {
        thinking: '正在理解你的问题',
        researching: '正在检索相关知识',
        writing: '正在组织回答',
      }
    : {
        thinking: 'Understanding your question',
        researching: 'Gathering relevant context',
        writing: 'Composing response',
      }

  const dynamicActivities = lang === 'zh'
    ? [
        { icon: Search, label: '分析提问意图与场景' },
        { icon: BookOpen, label: '匹配建筑与气候知识' },
        { icon: Sparkles, label: '提炼关键结论与建议' },
        { icon: PenLine, label: '生成结构化回复内容' },
      ]
    : [
        { icon: Search, label: 'Analyzing intent and context' },
        { icon: BookOpen, label: 'Matching architecture-climate knowledge' },
        { icon: Sparkles, label: 'Extracting key takeaways' },
        { icon: PenLine, label: 'Drafting structured response' },
      ]

  const reasoningStages = lang === 'zh'
    ? [
        { key: 'thinking', label: '理解问题' },
        { key: 'researching', label: '场地分析' },
        { key: 'writing', label: '策略综合' },
        { key: 'writing', label: '成本/碳输出' },
      ]
    : [
        { key: 'thinking', label: 'Interpret Request' },
        { key: 'researching', label: 'Site Analysis' },
        { key: 'writing', label: 'Strategy Synthesis' },
        { key: 'writing', label: 'Cost/Carbon Output' },
      ]

  const phaseRank: Record<AssistantPhase, number> = {
    thinking: 0,
    researching: 1,
    writing: 3,
  }

  return (
    <div className="min-h-[calc(100svh-64px)] py-3 sm:py-4 lg:h-[calc(100dvh-64px)] lg:overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:h-full flex flex-col">
        {/* Compact Header */}
        <div className={`relative mb-4 shrink-0 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="relative group">
              <div 
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <span className="text-2xl text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>匠</span>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-md"
                style={{ backgroundColor: 'var(--temp-cool)' }}
              >
                <Bot size={12} className="text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
                >
                  {lang === 'zh' ? '虚拟建筑师' : 'The Virtual Architect'}
                </h1>
                <div 
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1"
                  style={{ background: 'var(--temp-cool)', color: 'white' }}
                >
                  <Zap size={8} />
                  {lang === 'zh' ? 'AI' : 'AI'}
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {lang === 'zh' 
                  ? '传承千年匠心智慧，解答现代建筑气候挑战' 
                  : 'Ancient wisdom meets modern climate challenges'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 flex-1 lg:min-h-0">
          {/* Quick Prompts Sidebar */}
          <div className={`order-2 lg:order-1 modern-card rounded-2xl overflow-hidden flex flex-col lg:max-h-full transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <div 
              className="p-4 relative overflow-hidden shrink-0"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <h2 className="font-bold text-white flex items-center gap-2 text-sm">
                <Sparkles size={16} />
                {t('ai.quickPrompts')}
              </h2>
            </div>
            
            <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[44svh] lg:max-h-none">
              {promptCategories.map((category, catIdx) => (
                <div 
                  key={catIdx} 
                  className="rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border-default)' }}
                >
                  <div 
                    className="p-2 flex items-center gap-2"
                    style={{ background: category.gradient }}
                  >
                    <div 
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                      {category.icon}
                    </div>
                    <span className="font-semibold text-white text-xs">
                      {category.label}
                    </span>
                  </div>
                  
                  <div className="p-1.5 space-y-1" style={{ backgroundColor: 'var(--surface-card)' }}>
                    {category.prompts.map((prompt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setInput(prompt)}
                        className="w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-all hover:translate-x-1 flex items-center justify-between group"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)', 
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span className="truncate">{prompt}</span>
                        <ArrowRight 
                          size={10} 
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1"
                          style={{ color: category.color }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Chat Interface — now spans 2 columns */}
          <div className={`order-1 lg:order-2 lg:col-span-2 modern-card rounded-2xl overflow-hidden flex flex-col min-h-[62svh] lg:min-h-0 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div 
              className="p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {t('ai.chat')}
                  </h2>
                  <div className="flex items-center gap-1">
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: 'var(--temp-cool)' }}
                    />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {lang === 'zh' ? '在线 · 支持图片分析' : 'Online · Photo analysis supported'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto">
                <div
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  {lang === 'zh' ? '模式' : 'Mode'}: {audienceMode === 'public' ? (lang === 'zh' ? '大众' : 'Public') : (lang === 'zh' ? '工程师' : 'Engineer')}
                </div>
                <div 
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                >
                  {messages.length - 1} {lang === 'zh' ? '条消息' : 'messages'}
                </div>
                <button
                  onClick={exportChat}
                  className="p-1.5 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  title={lang === 'zh' ? '导出聊天' : 'Export chat'}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  title={lang === 'zh' ? '清空聊天' : 'Clear chat'}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div 
              className="flex-1 flex flex-col min-h-0"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {/* Response Preferences */}
              <div className="p-3 border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-card)' }}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {lang === 'zh' ? '回答偏好' : 'Response Preferences'}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'zh' ? '选择回答风格' : 'Choose answer style'}
                  </span>
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {lang === 'zh' ? '回答模式' : 'Response mode'}
                  </span>
                  <div
                    className="inline-flex items-center p-0.5 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                  >
                    <button
                      onClick={() => setAudienceMode('public')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                      style={{
                        backgroundColor: audienceMode === 'public' ? 'var(--brand-primary)' : 'transparent',
                        color: audienceMode === 'public' ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {lang === 'zh' ? '大众' : 'Public'}
                    </button>
                    <button
                      onClick={() => setAudienceMode('engineer')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                      style={{
                        backgroundColor: audienceMode === 'engineer' ? 'var(--brand-primary)' : 'transparent',
                        color: audienceMode === 'engineer' ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {lang === 'zh' ? '工程师' : 'Engineer'}
                    </button>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {audienceMode === 'public'
                      ? (lang === 'zh' ? '通俗解释 + 可执行建议' : 'Plain language + actionable advice')
                      : (lang === 'zh' ? '技术细节 + 假设与约束' : 'Technical depth + assumptions and constraints')}
                  </span>
                </div>
              </div>

              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="shrink-0 mr-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                          style={{ background: 'var(--gradient-brand)' }}
                        >
                          <span className="text-xs text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>匠</span>
                        </div>
                      </div>
                    )}
                    <div 
                      className={`max-w-[88%] sm:max-w-[75%] rounded-xl px-3 py-2 ${
                        msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                      }`}
                      style={msg.role === 'user' 
                        ? { background: 'var(--gradient-brand)', color: 'white' }
                        : { backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }
                      }
                    >
                      {/* Show attached image in user message */}
                      {msg.image && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          <img src={msg.image} alt="Uploaded" className="w-full max-h-60 object-cover rounded-lg" />
                        </div>
                      )}
                      {msg.role === 'assistant' ? (
                        loading && idx === streamingAssistantIndexRef.current && !msg.content.trim() ? (
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <Loader2 size={13} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
                              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                                {phaseHeadline[assistantPhase]}
                              </span>
                            </div>
                            <div className="mb-3 rounded-lg p-2" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
                              <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                                {lang === 'zh' ? '推理时间线' : 'Reasoning Timeline'}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                                {reasoningStages.map((stage, stageIdx) => {
                                  const stageStatus = stageIdx <= phaseRank[assistantPhase] ? 'done' : stageIdx === (phaseRank[assistantPhase] + 1) ? 'active' : 'todo'
                                  return (
                                    <div
                                      key={`${stage.label}-${stageIdx}`}
                                      className="rounded px-2 py-1 text-[10px] font-medium"
                                      style={{
                                        backgroundColor: stageStatus === 'done'
                                          ? 'var(--temp-cool-light)'
                                          : stageStatus === 'active'
                                            ? 'var(--brand-primary-glow)'
                                            : 'var(--surface-card)',
                                        color: stageStatus === 'todo' ? 'var(--text-muted)' : 'var(--text-primary)',
                                        border: '1px solid var(--border-default)'
                                      }}
                                    >
                                      <span>{stageIdx + 1}. </span>
                                      <span>{stage.label}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              {dynamicActivities.map((item, activityIdx) => {
                                const Icon = item.icon
                                const activeIndex = activityTick % dynamicActivities.length
                                const isActive = activityIdx === activeIndex
                                return (
                                  <div key={item.label} className="flex items-center gap-2" style={{ opacity: isActive ? 1 : 0.45 }}>
                                    <Icon size={11} className={isActive ? 'animate-pulse' : ''} style={{ color: 'var(--brand-primary)' }} />
                                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:font-bold [&_h3]:mt-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:font-bold [&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {(() => {
                              const mappings = extractMappings(msg.content)
                              if (mappings.length === 0) return null
                              return (
                                <div className="mt-3 p-2 rounded-lg" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <div className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {lang === 'zh' ? '传统原则 → 现代应用' : 'Traditional Principle -> Modern Application'}
                                  </div>
                                  <div className="space-y-1.5">
                                    {mappings.map((mapping, mIdx) => (
                                      <div key={`${mapping.traditional}-${mIdx}`} className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--text-primary)' }}>{mapping.traditional}</span>
                                        <span> {' -> '} </span>
                                        <span>{mapping.modern}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })()}
                            {msg.citations && msg.citations.length > 0 && (
                              <div className="mt-3 p-2 rounded-lg" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="text-[11px] font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                  <BookOpen size={11} style={{ color: 'var(--brand-primary)' }} />
                                  {lang === 'zh' ? '引用依据' : 'Citation Sources'}
                                </div>
                                <div className="space-y-1.5">
                                  {msg.citations.map((citation, citationIdx) => (
                                    <div key={`${citation.title}-${citationIdx}`} className="rounded-md p-1.5" style={{ backgroundColor: 'var(--surface-card)' }}>
                                      <div className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{citation.title}</div>
                                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{citation.publisher} • {citation.year}</div>
                                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{citation.note}</div>
                                      {citation.url && (
                                        <a
                                          href={citation.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] mt-1 inline-block"
                                          style={{ color: 'var(--brand-primary)' }}
                                        >
                                          {lang === 'zh' ? '查看来源' : 'Open source'}
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {msg.complianceHints && msg.complianceHints.length > 0 && (
                              <div className="mt-3 p-2 rounded-lg" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)' }}>
                                <div className="text-[11px] font-semibold mb-2 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                                  <Shield size={11} style={{ color: 'var(--brand-primary)' }} />
                                  {lang === 'zh' ? '约束与合规提示' : 'Constraint & Compliance Hints'}
                                </div>
                                <div className="space-y-1.5">
                                  {msg.complianceHints.map((hint, hintIdx) => (
                                    <div key={`${hint.key}-${hintIdx}`} className="rounded-md p-1.5" style={{ backgroundColor: 'var(--surface-card)' }}>
                                      <div className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                        {hint.title}
                                        <span className="ml-1 text-[10px]" style={{ color: hint.level === 'warning' ? 'var(--warning)' : 'var(--temp-cool)' }}>
                                          ({hint.level.toUpperCase()})
                                        </span>
                                      </div>
                                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{hint.detail}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="shrink-0 ml-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                          style={{ background: 'var(--gradient-brand)' }}
                        >
                          <User size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input area with image preview and camera toggle */}
              <div 
                className="p-2.5 sm:p-3 shrink-0"
                style={{ backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--border-default)' }}
              >
                {/* Pending image preview */}
                {pendingImage && (
                  <div className="mb-2 relative inline-block">
                    <img 
                      src={pendingImage.previewUrl} 
                      alt="Pending upload" 
                      className="h-20 w-20 object-cover rounded-lg border-2"
                      style={{ borderColor: 'var(--brand-primary)' }}
                    />
                    <button
                      onClick={removePendingImage}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                    >
                      <X size={12} />
                    </button>
                    <div 
                      className="absolute bottom-0 left-0 right-0 text-center text-[9px] py-0.5 rounded-b-lg font-medium"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                    >
                      <ImageIcon size={8} className="inline mr-0.5" />
                      {lang === 'zh' ? '已附图' : 'Attached'}
                    </div>
                  </div>
                )}

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

                <div 
                  className="flex gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg items-center"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={pendingImage 
                      ? (lang === 'zh' ? '输入关于这张图片的问题（可选）...' : 'Ask about this photo (optional)...') 
                      : t('ai.placeholder')
                    }
                    className="flex-1 px-2 py-1.5 bg-transparent text-sm focus:outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {/* Camera toggle button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="p-1.5 sm:p-2 rounded-lg transition-all disabled:opacity-50 shrink-0"
                    style={{ 
                      backgroundColor: pendingImage ? 'var(--brand-primary)' : 'transparent',
                      color: pendingImage ? 'white' : 'var(--text-muted)',
                    }}
                    title={lang === 'zh' ? '上传建筑照片' : 'Upload building photo'}
                  >
                    <Camera size={18} />
                  </button>
                  {/* Send button */}
                  <button 
                    onClick={handleSend} 
                    disabled={loading || (!input.trim() && !pendingImage)}
                    className="btn-seal px-3 sm:px-4 py-2 rounded-lg disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIConsultant
