import OpenAI from 'openai';

type ChatContentPart = OpenAI.Chat.Completions.ChatCompletionContentPart;

const OPENROUTER_API_KEY = String(
  import.meta.env.VITE_OPENROUTER_API_KEY ?? import.meta.env.VITE_OPENROUTER_KEY ?? ''
).trim();

const HAS_OPENROUTER_KEY = OPENROUTER_API_KEY.length > 0 && OPENROUTER_API_KEY !== 'your_openrouter_api_key_here';
let hasWarnedMissingKey = false;

// OpenRouter API Configuration – GLM 4.5 Air via OpenRouter
const client = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    'HTTP-Referer': 'https://Rahber001.github.io/Ancient-Wisdom-for-Sustainable-Architecture',
    'X-Title': 'ZHUZHI QIANNIAN',
  },
});

type SupportedLang = 'zh' | 'en';
type SupportedAudienceMode = 'public' | 'engineer';
type SupportedTemplateMode = 'building' | 'consultation' | 'general';

function detectLikelyChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

function detectAudienceModeFromPrompt(text: string): SupportedAudienceMode {
  return /Audience Mode:\s*Engineer/i.test(text) ? 'engineer' : 'public';
}

function detectLangFromPrompt(text: string): SupportedLang {
  return detectLikelyChinese(text) ? 'zh' : 'en';
}

function isCasualGreeting(text: string): boolean {
  const normalized = text.split(/\n\nAudience Mode:/i)[0].trim().toLowerCase();
  if (normalized.length > 30) return false;
  return /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|你好|嗨|您好|早上好|下午好|晚上好)[\s!.?]*$/i.test(normalized);
}

function detectTemplateModeFromPrompt(text: string): SupportedTemplateMode {
  // Skip structured templates for casual greetings
  if (isCasualGreeting(text)) return 'general';

  const modeMatch = text.match(/Template Mode:\s*(Building|Consultation|General)/i);
  if (modeMatch?.[1]) {
    const mode = modeMatch[1].toLowerCase();
    if (mode === 'building') return 'building';
    if (mode === 'general') return 'general';
    return 'consultation';
  }

  if (/(what\s+is|tell\s+me\s+about|history|overview|explain|介绍|是什么|讲讲|解释)/i.test(text)) {
    return 'building';
  }

  if (/(design|proposal|recommend|strategy|plan|budget|cost|retrofit|方案|建议|设计|预算|造价|改造)/i.test(text)) {
    return 'consultation';
  }

  return 'general';
}

function isAuthError(error: unknown): boolean {
  const raw = error instanceof Error ? error.message : String(error);
  return /(401|unauthorized|missing authentication header|invalid api key)/i.test(raw);
}

function getUserIntentExcerpt(message: string): string {
  const normalized = message.split(/\n\nAudience Mode:/i)[0].trim();
  return normalized || message.trim();
}

function warnMissingKeyOnce(): void {
  if (hasWarnedMissingKey) return;
  hasWarnedMissingKey = true;
  console.warn('[AI Service] OpenRouter API key is missing or placeholder; using offline fallback mode.');
}

function getAuthSetupHint(lang: SupportedLang): string {
  if (lang === 'zh') {
    return [
      '### AI服务状态',
      '- 当前未连接在线模型（OpenRouter API Key 缺失或无效）。',
      '- 已自动切换到离线建议模式。',
      '- 修复方式：在项目根目录创建 `.env`，填写 `VITE_OPENROUTER_API_KEY=你的key`，然后重启开发服务器。',
    ].join('\n');
  }

  return [
    '### AI Service Status',
    '- Online model is unavailable (OpenRouter API key missing or invalid).',
    '- Switched to offline guidance mode automatically.',
    '- Fix: create `.env` in project root with `VITE_OPENROUTER_API_KEY=your_key`, then restart the dev server.',
  ].join('\n');
}

function buildOfflineStructuredFallback(
  message: string,
  lang: SupportedLang,
  audienceMode: SupportedAudienceMode,
  templateMode: SupportedTemplateMode,
  includeSetupHint: boolean
): string {
  const intent = getUserIntentExcerpt(message) || (lang === 'zh' ? '建筑气候适应咨询' : 'architecture climate consultation');

  // For casual greetings, return a natural friendly response
  if (isCasualGreeting(message)) {
    const greeting = lang === 'zh'
      ? '你好！我是筑之千年 AI 建筑顾问，专注于中国传统建筑的气候适应智慧与可持续设计。你可以问我关于土楼、四合院、窑洞等传统建筑类型，或者咨询现代低碳建筑方案。'
      : 'Hello! I\'m the ZHUZHI QIANNIAN AI architectural consultant, specializing in traditional Chinese building wisdom and sustainable design. Ask me about Tulou, Siheyuan, Yaodong, or any other traditional building types, or consult me on modern low-carbon design strategies.';
    return includeSetupHint ? `${greeting}\n\n${getAuthSetupHint(lang)}` : greeting;
  }

  if (templateMode === 'building') {
    // Engineer mode: strict headings
    if (audienceMode === 'engineer') {
      const base = lang === 'zh'
        ? [
            '## 建筑概览',
            `这是关于「${intent}」的离线识别与解读草案，结论用于前期判断。`,
            '',
            '## 气候适应特征',
            '- 重点关注围护热惰性、通风路径与遮阳组织。',
            '- 若有屋顶/院落信息，可进一步判断排雨与防风逻辑。',
            '',
            '## 现代应用建议',
            '1. 保留原理，不照搬形式：传统做法 → 现代规范化构造。',
            '2. 先做围护与通风，再做机电补偿，以降低运行碳。',
            '3. 结合当地材料与施工能力，优先低碳可维护方案。',
            '',
            '## 置信度',
            '置信度: Medium',
          ].join('\n')
        : [
            '## Building Overview',
            `This is an offline identification and interpretation draft for "${intent}", suitable for early-stage direction only.`,
            '',
            '## Climate Adaptation Features',
            '- Focus on thermal mass, ventilation paths, and shading geometry.',
            '- Roof and courtyard details can further confirm rain and wind adaptation logic.',
            '',
            '## Modern Application Ideas',
            '1. Keep principles, not replicas: traditional logic → code-compliant modern assemblies.',
            '2. Prioritize envelope and passive airflow before mechanical compensation to reduce operational carbon.',
            '3. Align with local material supply and contractor capability for maintainable low-carbon delivery.',
            '',
            '## Confidence',
            'Confidence: Medium',
          ].join('\n');

      return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
    }

    // Public mode: natural language
    const base = lang === 'zh'
      ? `关于「${intent}」，这是一种具有显著气候适应智慧的传统建筑类型。它通过厚重的围护结构（热惰性）、精心组织的通风路径和遮阳设计来应对当地气候。现代建筑可以借鉴这些被动式策略——例如利用热质量减少供暖能耗约30%，通过自然通风降低制冷需求。建议保留原理而非照搬形式，结合当地材料和施工能力选择低碳可维护方案。`
      : `"${intent}" is a traditional building type with notable climate-adaptation wisdom. It responds to local climate through heavy thermal-mass walls, carefully organized ventilation paths, and shading geometry. Modern buildings can borrow these passive strategies — for example, using thermal mass to reduce heating energy by ~30%, and natural ventilation to cut cooling demand. The recommendation is to keep the principles, not replicate the form, and align with local material supply for maintainable low-carbon delivery.`;

    return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
  }

  if (templateMode === 'general') {
    // Engineer mode: strict headings
    if (audienceMode === 'engineer') {
      const base = lang === 'zh'
        ? [
            '## 直接回答',
            `关于「${intent}」，当前可先给出离线版结论，作为后续细化前的参考。`,
            '',
            '## 关键依据',
            '- 结合传统建筑被动策略：围护、通风、遮阳与排水。',
            '- 在参数不完整时，建议先进行区间估算而非单点值承诺。',
            '',
            '## 建议下一步',
            '1. 补充城市、面积、预算与目标性能。',
            '2. 明确优先级：节能、舒适或韧性。',
            '3. 进入下一轮带参数的方案比选。',
            '',
            '## 置信度',
            '置信度: Medium',
          ].join('\n')
        : [
            '## Direct Answer',
            `For "${intent}", here is an offline-first conclusion that can guide your next design iteration.`,
            '',
            '## Key Points',
            '- Reuse passive principles from vernacular architecture: envelope, airflow, shading, and water management.',
            '- When inputs are incomplete, provide range-based estimates instead of single-point commitments.',
            '',
            '## Suggested Next Step',
            '1. Provide city, area, budget, and target performance level.',
            '2. Set a primary objective: energy, comfort, or resilience.',
            '3. Proceed to a parameterized option comparison in the next round.',
            '',
            '## Confidence',
            'Confidence: Medium',
          ].join('\n');

      return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
    }

    // Public mode: natural language
    const base = lang === 'zh'
      ? `关于「${intent}」，传统建筑的被动策略（围护、通风、遮阳与排水）仍然值得现代借鉴。当参数不完整时，建议先进行区间估算而非单点值承诺。下一步可以补充城市、面积、预算与目标性能，明确优先级（节能、舒适或韧性），然后进入更详细的方案比选。`
      : `For "${intent}", passive strategies from vernacular architecture (envelope, airflow, shading, and water management) remain highly relevant today. When inputs are incomplete, range-based estimates are more reliable than single-point values. Next step: provide city, area, budget, and target performance, then choose a primary objective (energy, comfort, or resilience) for a more detailed comparison.`;

    return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
  }

  if (audienceMode === 'engineer') {
    const base = lang === 'zh'
      ? [
          '## 假设条件',
          '- 当前为离线建议模式（未联网检索）。',
          '- 项目位置与规范条件未完整提供。',
          '',
          '## 输入与单位',
          '| 输入 | 值 | 单位 | 备注 |',
          '|---|---|---|---|',
          `| 用户需求 | ${intent.replace(/\|/g, '/')} | - | 原始提问 |`,
          '| 建筑面积 | N/A | m² | 待补充 |',
          '| 预算 | N/A | RMB | 待补充 |',
          '',
          '## 策略选项与权衡',
          '| 方案 | 优势 | 风险/权衡 |',
          '|---|---|---|',
          '| 被动优先 | 运行能耗更低 | 初期设计复杂度提高 |',
          '| 围护升级 | 热舒适提升明显 | 材料成本上升 |',
          '| 韧性优先 | 极端气候适应更强 | 施工与验收要求更高 |',
          '',
          '## 碳与成本区间估算',
          '| 指标 | 低 | 中 | 高 | 单位 |',
          '|---|---:|---:|---:|---|',
          '| 运行碳减排 | 10 | 20 | 35 | % |',
          '| 造价增量 | 150 | 350 | 650 | RMB/m² |',
          '',
          '## 风险与规范约束',
          '- 需结合当地抗震、防火、节能规范复核。',
          '- 方案参数缺失时，结果仅可作为前期参考。',
          '',
          '## 参考依据',
          '- N/A（离线模式，未附在线引用）',
          '',
          '## 置信度',
          'Confidence: Medium',
        ].join('\n')
      : [
          '## Assumptions',
          '- Offline guidance mode is active (no live web retrieval).',
          '- Site and code constraints are not fully provided.',
          '',
          '## Inputs & Units',
          '| Input | Value | Unit | Notes |',
          '|---|---|---|---|',
          `| User intent | ${intent.replace(/\|/g, '/')} | - | Original request |`,
          '| Building area | N/A | m² | Required for accurate estimate |',
          '| Budget | N/A | RMB | Required for feasibility |',
          '',
          '## Strategy Options and Trade-offs',
          '| Option | Strength | Trade-off |',
          '|---|---|---|',
          '| Passive-first | Lower operational load | Higher design complexity |',
          '| Envelope-upgrade | Better comfort stability | Higher material cost |',
          '| Resilience-first | Better extreme-weather performance | Tighter compliance requirements |',
          '',
          '## Carbon and Cost Estimate Ranges',
          '| Metric | Low | Medium | High | Unit |',
          '|---|---:|---:|---:|---|',
          '| Operational carbon reduction | 10 | 20 | 35 | % |',
          '| Cost uplift | 150 | 350 | 650 | RMB/m² |',
          '',
          '## Risks and Code Constraints',
          '- Must be verified against local seismic, fire, and energy-code requirements.',
          '- With missing inputs, values are preliminary only.',
          '',
          '## References',
          '- N/A (offline mode, no live citations)',
          '',
          '## Confidence',
          'Confidence: Medium',
        ].join('\n');

    return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
  }

  const base = lang === 'zh'
    ? [
        `结论摘要：围绕「${intent}」，可先采用“围护优化 + 被动通风 + 韧性补强”的三段式路径。`,
        '',
        '可执行建议：',
        '- 先做围护结构优化（保温、遮阳、气密）。',
        '- 再做自然通风与热惰性策略组合。',
        '- 最后做防灾韧性补强（防洪/抗风/抗震）。',
        '',
        '预算提示（估算）：',
        '- 低：约 ¥150/m² 增量',
        '- 中：约 ¥350/m² 增量',
        '- 高：约 ¥650/m² 增量',
        '',
        '下一步：',
        '1. 明确城市、建筑面积、预算上限。',
        '2. 选择1个主策略（节能/舒适/韧性）。',
        '3. 准备平面与朝向信息用于下一轮细化。',
      ].join('\n')
    : [
        `Summary: For "${intent}", start with a three-step path: envelope upgrades, passive airflow, then resilience reinforcement.`,
        '',
        'Practical recommendations:',
        '- Upgrade envelope performance first (insulation, shading, airtightness).',
        '- Combine passive ventilation and thermal-mass strategies.',
        '- Add resilience upgrades for flood, wind, and seismic risks.',
        '',
        'Budget signal (estimate):',
        '- Low: around RMB 150/m² uplift',
        '- Medium: around RMB 350/m² uplift',
        '- High: around RMB 650/m² uplift',
        '',
        'Next step:',
        '1. Confirm city, building area, and budget cap.',
        '2. Choose one primary goal (energy, comfort, or resilience).',
        '3. Prepare plan and orientation details for the next iteration.',
      ].join('\n');

  return includeSetupHint ? `${base}\n\n${getAuthSetupHint(lang)}` : base;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type AssistantPhase = 'thinking' | 'researching' | 'writing';

interface StreamCallbacks {
  onToken?: (chunk: string) => void;
  onPhase?: (phase: AssistantPhase) => void;
}

export interface DataHubResearchSource {
  title: string;
  publisher: string;
  year: string;
  note: string;
  url?: string;
}

export interface DataHubResearchCase {
  name: string;
  location: string;
  challenge: string;
  strategy: string;
  outcome: string;
}

export interface DataHubResearchSupplier {
  component: string;
  material: string;
  unitCost: string;
  supplier: string;
}

export interface DataHubResearchPayload {
  passiveStrategies: Array<{ title: string; impact: string; value: string }>;
  hazardScores: { flood: number; typhoon: number; heatwave: number; seismic: number };
  sourceLinkedCards: DataHubResearchSource[];
  benchmarkCases: DataHubResearchCase[];
  supplierRows: DataHubResearchSupplier[];
}

export interface DataHubResearchRequest {
  city: string;
  climateZone: string;
  buildingType: string;
  lang?: 'zh' | 'en';
}

const GLM_FREE_MODEL = 'z-ai/glm-4.5-air:free';
const IMAGE_GENERATION_MODEL = GLM_FREE_MODEL;
const WEB_RESEARCH_MODEL = GLM_FREE_MODEL;

// ---------------------------------------------------------------------------
// SYSTEM PROMPT
// ---------------------------------------------------------------------------
// The prompt is structured in three specialised "modes" that the AI switches
// between automatically based on what the user is asking:
//
//  MODE A - Historical Knowledge Query
//    Triggered when the user asks "what is X", "tell me about X", "explain X"
//    for any named traditional building type or architectural element.
//    -> Always returns a richly structured reference card.
//
//  MODE B - Location-Aware Design Consultation
//    Triggered when the user mentions a specific Chinese city, province, or
//    geographic/climate description alongside a desire to build something.
//    -> Acts as a licensed architect who first reads the site, then proposes a
//      modern building concept rooted in ancient principles, with explicit
//      carbon-reduction and natural-resource framing.
//
//  MODE C - General Conversation / Open Exploration
//    Everything else - comparisons, philosophy, material questions, etc.
//    -> Informed, engaging, but not rigidly structured.
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are ZHUZHI QIANNIAN (筑之千年) - an expert AI architectural consultant who bridges five thousand years of Chinese building wisdom with the demands of low-carbon, climate-resilient construction in 2026.

═══════════════════════════════════════════════════════════
CORE KNOWLEDGE BASE  -  Traditional Chinese Building Types
═══════════════════════════════════════════════════════════

You have deep, encyclopaedic knowledge of the following building traditions (and can discuss others as the knowledge base expands):

1. FUJIAN TULOU (福建土楼)
  Region: Fujian Province, SE China  |  Climate: Hot-humid, typhoon-prone
  Key principles: Rammed-earth thermal mass, circular aerodynamics, communal microclimate, interior courtyard chimney effect
  Carbon insight: Earthen walls sequester no carbon but have near-zero embodied energy; replicate with stabilised rammed earth or CEB (compressed earth blocks)

2. BEIJING SIHEYUAN (北京四合院)
  Region: North China Plain  |  Climate: Continental, hot summers / cold dry winters
  Key principles: South-facing orientation, courtyard as solar collector in winter / shade generator in summer, layered wind-break walls, timber frame allows disassembly
  Carbon insight: Passive solar gain reduces heating load by 30-40%; replicate with heavy thermal-mass perimeter walls + high-performance glazing on south court

3. SHAANBEI YAODONG (陕北窑洞)
  Region: Loess Plateau, Shaanxi / Gansu  |  Climate: Semi-arid, extreme diurnal swings
  Key principles: Earth sheltering eliminates 70-80 % of envelope heat loss, loess acts as heat battery, natural humidity buffering
  Carbon insight: Earth-sheltered modern buildings can achieve near-Passivhaus performance without mechanical HVAC; replicate with reinforced concrete shell + 1.5 m earth cover + CLT interior

4. DIAOJIAOLOU (吊脚楼)
  Region: Yunnan, Guizhou, Hunan  |  Climate: Subtropical highland, high humidity, flood-prone
  Key principles: Ground clearance for flood resilience and sub-floor ventilation, timber frame flexibility on slope, roof overhang for monsoon runoff
  Carbon insight: Engineered timber (CLT / glulam) at structural scale captures ~1 tCO2 per m3; elevating on pilots preserves permeable ground surface for urban stormwater

5. HAKKA WEILONGWU (客家围龙屋)
  Region: Guangdong, SE China  |  Climate: Subtropical, hot-humid
  Key principles: Semi-circular rear mass blocks afternoon sun + prevailing NE wind, central open hall generates stack ventilation, front pond reduces UHI and provides fire suppression water
  Carbon insight: Integrated water features cool incoming air by 2-4 C passively; front-pond concept maps onto modern bioretention + cooling courtyard systems

═══════════════════════════════════════════════════════════
RESPONSE MODES  -  Follow these strictly
═══════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────
MODE A  ·  HISTORICAL KNOWLEDGE QUERY
──────────────────────────────────────────────────────────
USE WHEN: The user asks about a named traditional building, element, or technique (e.g. "tell me about Tulou", "what is dougong", "explain siheyuan courtyard logic").

Always respond with this exact structure:

## 🏛️ [Building / Element Name] - [Chinese Name]

### 📍 Origin & Context
[1-2 sentences: where, when, who built it and why]

### 🌡️ Climate & Site Conditions
[The environmental problems this architecture was solving]

### 🔩 Key Structural & Material Principles
- [Principle 1 + why it works physically]
- [Principle 2]
- [Principle 3]
(use bullet list, be specific - mention materials, proportions, orientations)

### 🍃 Passive Climate Strategies
[Explain the thermal, ventilation, and water-management logic in plain terms. Use analogies where helpful.]

### 🌱 Carbon & Sustainability Lens (2026 Perspective)
[Quantify where possible: embodied energy, operational energy savings, resource use. Connect to modern benchmarks like Passivhaus, LEED, or China's Green Building Standard GB/T 50378.]

### 🔄 What Modern Builders Can Inherit
[3 specific principles directly transferable to contemporary construction, labelled as "Inherit: [name]"]

### ⚠️ What NOT to Copy Directly
[Honest limitations: fire safety, structural codes, material availability, seismic concerns]

---

──────────────────────────────────────────────────────────
MODE B  ·  LOCATION-AWARE DESIGN CONSULTATION
──────────────────────────────────────────────────────────
USE WHEN: The user describes a place in China (city, province, geography) AND expresses intent to build, design, or develop something.

Act as a licensed architect conducting a site pre-feasibility study. Follow this structure:

## 🗺️ Site Reading - [Location Name]

### Climate Zone Analysis
[Identify China's official climate zone: Severe Cold / Cold / Hot-Summer Cold-Winter / Hot-Summer Warm-Winter / Mild. State: annual temperature range, humidity, prevailing winds, rainfall, dominant hazards (flood, earthquake zone, typhoon, loess subsidence, permafrost, etc.)]

### Key Design Challenges to Solve
[List 3-5 site-specific problems the building must address]

---

## 🏗️ Proposed Concept - [Evocative Concept Name]

### Ancestral Inspiration
[Which traditional type(s) are most relevant here and why - be specific about which principles apply to THIS site]

### Design Strategy
**Form & Orientation:** [compass orientation, massing logic, relationship to sun path and wind]
**Envelope:** [wall materials, U-values to target, roof strategy]
**Passive Systems:** [ventilation paths, thermal mass placement, shading devices, water features]
**Structure:** [recommended structural system: CLT, rammed earth, concrete hybrid, steel, bamboo composite, etc.]

### Carbon & Resource Impact
| Strategy | Estimated Benefit |
|---|---|
| [e.g. Earth-sheltered north wall] | [e.g. ~25% heating energy reduction] |
| [e.g. CLT structure] | [e.g. ~180 tCO2 sequestered for 1,000 m2 floor area] |
| [e.g. Passive cooling courtyard] | [e.g. eliminates mechanical cooling 6 months/year] |

### Alignment with China's 2030 Carbon Peak Goals
[Connect the proposal to China's dual-carbon 碳达峰/碳中和 targets, the 14th Five-Year Plan green building mandate, or the Rural Revitalisation Strategy where applicable]

### Practical Next Steps
1. [Site survey / geotechnical recommendation]
2. [Regulatory check: which local green building standard applies]
3. [Suggested local materials or regional contractors familiar with earthen/timber construction]

---

──────────────────────────────────────────────────────────
MODE C  ·  GENERAL CONVERSATION
──────────────────────────────────────────────────────────
USE WHEN: Comparisons, philosophical questions, material discussions, open exploration, follow-up questions, greetings, or casual messages.

IMPORTANT: If the user sends a greeting (e.g. "hello", "hi", "你好", "hey") or a short casual message that is NOT about architecture or buildings, respond with a warm, natural greeting in 1-3 sentences. Introduce yourself briefly as the ZHUZHI QIANNIAN AI consultant and invite them to ask about traditional Chinese architecture or sustainable design. Do NOT use any structured template, headings, or bullet points for greetings.

For all other general conversation: Respond naturally and informatively. Use headers only if the answer genuinely benefits from structure. No rigid template required.

═══════════════════════════════════════════════════════════
AUDIENCE MODE CONTRACTS  (from user prompt metadata)
═══════════════════════════════════════════════════════════

If the user message includes "Audience Mode: Public":
1) Write in plain language for non-technical users.
2) Minimize jargon and explain technical terms briefly when used.
3) Use natural structure with concise paragraphs or bullets; fixed headings are NOT required.
4) Keep recommendations practical and easy to execute.
5) If data is missing, state assumptions clearly and ask for the minimum extra inputs.

If the user message includes "Audience Mode: Engineer":
1) Use precise technical language.
2) Use EXACT markdown headings in this order.
   English headings:
   - ## Assumptions
   - ## Inputs & Units
   - ## Strategy Options and Trade-offs
   - ## Carbon and Cost Estimate Ranges
   - ## Risks and Code Constraints
   - ## References
   - ## Confidence
   Chinese headings:
   - ## 假设条件
   - ## 输入与单位
   - ## 策略选项与权衡
   - ## 碳与成本区间估算
   - ## 风险与规范约束
   - ## 参考依据
   - ## 置信度
3) Include at least one comparison table with units and ranges.
4) End the confidence section with one line like: Confidence: High/Medium/Low.
5) If data is missing, keep the section and write N/A.

If no audience mode is provided:
1) Use balanced depth suitable for advanced general users.
2) Still include assumptions and confidence when giving design recommendations.

═══════════════════════════════════════════════════════════
UNIVERSAL RULES  (apply in all modes)
═══════════════════════════════════════════════════════════

1. NEVER suggest replicating a historical building as-is. Always adapt principles to 2026 building codes, safety, and constructability.

2. ALWAYS name the traditional principle first, then its modern translation. Format: "Traditional principle → Modern application"

3. QUANTIFY whenever possible. Vague sustainability claims are unhelpful. Use ranges, percentages, or order-of-magnitude estimates.

4. ACKNOWLEDGE LIMITS. If a traditional strategy conflicts with modern fire codes, seismic requirements, or cost constraints, say so clearly.

5. CARBON FIRST. Frame every design recommendation through the lens of: embodied carbon (materials), operational carbon (energy in use), and land/resource stewardship - reflecting China's national 双碳 (dual-carbon) commitment.

6. RESPECT LOCAL EXPERTISE. When recommending construction methods, acknowledge that local master craftspeople (传统工匠) hold knowledge that no AI can fully capture. Recommend engaging them.

7. OUTPUT FORMATTING STANDARD.
   - Use clean Markdown structure with concise section headers and short paragraphs.
   - Prefer bullets for principles and decisions; prefer tables for costs, materials, and comparisons.
   - For any design/build recommendation, include these sections when data is available:
     a) Construction Materials & Suppliers
     b) Estimated Costs
   - Use professional table formatting with aligned columns and explicit units.
   - If exact values are unknown, provide reasonable ranges and label them as estimates.

8. MATERIALS TABLE TEMPLATE (use this structure when giving component-level recommendations):
| Component | Recommended Material | Unit Cost (RMB) | Estimated Quantity | Subtotal (RMB) | Local Availability / Supplier |
|---|---:|---:|---:|---:|---|
| [e.g. Structural Frame] | [e.g. Glulam beams] | [e.g. ¥1,200/m3] | [value] | [value] | [supplier or source] |

9. COST SUMMARY TABLE TEMPLATE (use this structure for project-level budgeting):
| Cost Category | Amount (RMB) | Share of Total |
|---|---:|---:|
| Materials | [value] | [value]% |
| Labor | [value] | [value]% |
| Engineering & Design | [value] | [value]% |
| Total | [value] | 100% |

10. LANGUAGE. Respond in the same language the user writes in (Chinese or English). If Chinese, use simplified characters.`;

export async function chatWithAI(message: string, history: Message[]): Promise<string> {
  const lang = detectLangFromPrompt(message);
  const audienceMode = detectAudienceModeFromPrompt(message);
  const templateMode = detectTemplateModeFromPrompt(message);

  if (!HAS_OPENROUTER_KEY) {
    warnMissingKeyOnce();
    return buildOfflineStructuredFallback(message, lang, audienceMode, templateMode, true);
  }

  try {
    const response = await client.chat.completions.create({
      model: GLM_FREE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.65,
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    if (!shouldGenerateImage(message)) return text;

    const imageSection = await generateImageSection(message);
    return imageSection ? `${text}\n\n---\n\n${imageSection}` : text;
  } catch (error) {
    console.error('AI Service Error:', error);
    return buildOfflineStructuredFallback(message, lang, audienceMode, templateMode, isAuthError(error));
  }
}

export async function chatWithAIStream(
  message: string,
  history: Message[],
  callbacks: StreamCallbacks = {}
): Promise<string> {
  const { onToken, onPhase } = callbacks;
  let phaseTimer: ReturnType<typeof setInterval> | null = null;
  let fullText = '';
  const lang = detectLangFromPrompt(message);
  const audienceMode = detectAudienceModeFromPrompt(message);
  const templateMode = detectTemplateModeFromPrompt(message);

  if (!HAS_OPENROUTER_KEY) {
    warnMissingKeyOnce();
    const fallback = buildOfflineStructuredFallback(message, lang, audienceMode, templateMode, true);
    onPhase?.('writing');
    onToken?.(fallback);
    return fallback;
  }

  try {
    onPhase?.('thinking');

    const phaseCycle: AssistantPhase[] = ['thinking', 'researching'];
    let cycleIndex = 0;
    phaseTimer = setInterval(() => {
      cycleIndex = (cycleIndex + 1) % phaseCycle.length;
      onPhase?.(phaseCycle[cycleIndex]);
    }, 1400);

    const stream = await client.chat.completions.create({
      model: GLM_FREE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message }
      ],
      temperature: 0.65,
      max_tokens: 1500,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (!delta) continue;
      if (phaseTimer) {
        clearInterval(phaseTimer);
        phaseTimer = null;
      }
      onPhase?.('writing');
      fullText += delta;
      onToken?.(delta);
    }

    if (!fullText.trim()) {
      const fallback = 'Sorry, I could not generate a response.';
      onToken?.(fallback);
      return fallback;
    }

    if (shouldGenerateImage(message)) {
      onPhase?.('researching');
      const imageSection = await generateImageSection(message);
      if (imageSection) {
        const append = `\n\n---\n\n${imageSection}`;
        fullText += append;
        onToken?.(append);
      }
    }

    return fullText;
  } catch (error) {
    console.error('AI Service Error:', error);
    if (fullText.trim()) return fullText;
    const fallback = buildOfflineStructuredFallback(message, lang, audienceMode, templateMode, isAuthError(error));
    onPhase?.('writing');
    onToken?.(fallback);
    return fallback;
  } finally {
    if (phaseTimer) clearInterval(phaseTimer);
  }
}

const buildRepairTemplate = (templateMode: SupportedTemplateMode, audienceMode: 'public' | 'engineer', lang: 'zh' | 'en'): string => {
  if (templateMode === 'building') {
    return lang === 'zh'
      ? '## 建筑概览\n## 气候适应特征\n## 现代应用建议\n## 置信度'
      : '## Building Overview\n## Climate Adaptation Features\n## Modern Application Ideas\n## Confidence';
  }

  if (templateMode === 'general') {
    return lang === 'zh'
      ? '## 直接回答\n## 关键依据\n## 建议下一步\n## 置信度'
      : '## Direct Answer\n## Key Points\n## Suggested Next Step\n## Confidence';
  }

  if (audienceMode === 'public') {
    return lang === 'zh'
      ? '## 结论摘要\n## 可执行建议\n## 预算提示\n## 下一步'
      : '## Summary\n## Practical Recommendations\n## Budget Signal\n## Next Step'
  }

  return lang === 'zh'
    ? '## 假设条件\n## 输入与单位\n## 策略选项与权衡\n## 碳与成本区间估算\n## 风险与规范约束\n## 参考依据\n## 置信度'
    : '## Assumptions\n## Inputs & Units\n## Strategy Options and Trade-offs\n## Carbon and Cost Estimate Ranges\n## Risks and Code Constraints\n## References\n## Confidence'
}

export async function repairStructuredOutput(params: {
  originalContent: string;
  templateMode: SupportedTemplateMode;
  audienceMode: 'public' | 'engineer';
  lang: 'zh' | 'en';
  missingSections: string[];
}): Promise<string> {
  const { originalContent, templateMode, audienceMode, lang, missingSections } = params
  if (!originalContent.trim()) return originalContent
  if (!HAS_OPENROUTER_KEY) return originalContent

  const template = buildRepairTemplate(templateMode, audienceMode, lang)
  const missing = missingSections.length > 0 ? missingSections.join(', ') : (lang === 'zh' ? '无' : 'none')

  try {
    const response = await client.chat.completions.create({
      model: GLM_FREE_MODEL,
      messages: [
        {
          role: 'system',
          content: lang === 'zh'
            ? '你是严格的 Markdown 结构修复助手。你的任务是保持原始内容语义不变，并补齐缺失小节。禁止编造新事实。信息缺失时写 N/A。'
            : 'You are a strict Markdown structure repair assistant. Preserve the original meaning and fill missing sections only. Do not invent new facts. Write N/A when data is unavailable.'
        },
        {
          role: 'user',
          content: `${lang === 'zh' ? '目标模板（必须使用以下标题）：' : 'Target template (must use these headings):'}\n${template}\n\n${lang === 'zh' ? '当前缺失小节：' : 'Missing sections:'} ${missing}\n\n${lang === 'zh' ? '原始回答：' : 'Original response:'}\n${originalContent}`
        }
      ],
      temperature: 0.1,
      max_tokens: 1700,
    })

    const repaired = response.choices[0]?.message?.content?.trim()
    return repaired || originalContent
  } catch (error) {
    console.warn('Structured output repair failed:', getShortErrorMessage(error))
    return originalContent
  }
}

function shouldGenerateImage(message: string): boolean {
  const text = message.toLowerCase();
  const englishIntent = /(generate|create|make|show|visualize|render|draw).{0,30}(image|images|picture|illustration|visual|rendering|concept art|sketch)/i;
  const chineseIntent = /(生成|创建|画|绘制|出图|图片|图像|效果图|渲染|示意图)/;
  return englishIntent.test(text) || chineseIntent.test(message);
}

async function generateImageSection(userPrompt: string): Promise<string | null> {
  try {
    const prompt = `Architectural concept render inspired by traditional Chinese architecture, adapted for modern low-carbon, code-compliant construction in 2026. User request: ${userPrompt}`;
    // OpenRouter compatibility: request image output via chat completions modalities.
    const imageResponse = await client.chat.completions.create({
      model: IMAGE_GENERATION_MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      modalities: ['text', 'image'],
      image_config: {
        size: '1024x1024',
      },
    } as never);

    const assistantMessage = imageResponse.choices?.[0]?.message as unknown;
    const imageUrl = extractImageUrl(assistantMessage);
    const imageB64 = extractImageBase64(assistantMessage);

    if (imageUrl) {
      return `### Concept Image\n\n![Generated architectural concept](${imageUrl})`;
    }

    if (imageB64) {
      return `### Concept Image\n\n![Generated architectural concept](data:image/png;base64,${imageB64})`;
    }

    return null;
  } catch (error) {
    console.warn('Image generation failed:', getShortErrorMessage(error));
    return null;
  }
}

function extractImageUrl(message: unknown): string | undefined {
  const msg = message as {
    content?: unknown;
    image_url?: string;
    images?: Array<{ url?: string }>;
  };

  if (msg?.image_url) return msg.image_url;
  if (msg?.images?.[0]?.url) return msg.images[0].url;

  const content = msg?.content;
  if (typeof content === 'string') {
    const markdownMatch = content.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
    if (markdownMatch?.[1]) return markdownMatch[1];
    const urlMatch = content.match(/https?:\/\/[^\s]+/i);
    if (urlMatch?.[0]) return urlMatch[0];
    return undefined;
  }

  if (Array.isArray(content)) {
    for (const part of content as Array<unknown>) {
      const item = part as {
        type?: string;
        image_url?: string | { url?: string };
        url?: string;
      };
      if (item?.type === 'image_url') {
        if (typeof item.image_url === 'string') return item.image_url;
        if (item.image_url?.url) return item.image_url.url;
      }
      if (item?.url) return item.url;
    }
  }

  return undefined;
}

function extractImageBase64(message: unknown): string | undefined {
  const msg = message as {
    b64_json?: string;
    images?: Array<{ b64_json?: string }>;
    content?: unknown;
  };

  if (msg?.b64_json) return msg.b64_json;
  if (msg?.images?.[0]?.b64_json) return msg.images[0].b64_json;

  if (!Array.isArray(msg?.content)) return undefined;
  for (const part of msg.content as Array<unknown>) {
    const item = part as {
      b64_json?: string;
      image_base64?: string;
    };
    if (item?.b64_json) return item.b64_json;
    if (item?.image_base64) return item.image_base64;
  }

  return undefined;
}

function getShortErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const firstLine = raw.split('\n')[0]?.trim() || 'Unknown error';
  return firstLine.slice(0, 220);
}

function extractJsonObject(raw: string): string | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return raw.slice(start, end + 1);
}

function normalizeResearchPayload(input: unknown): DataHubResearchPayload | null {
  if (!input || typeof input !== 'object') return null;

  const data = input as Record<string, unknown>;
  const passive = Array.isArray(data.passiveStrategies) ? data.passiveStrategies : [];
  const sources = Array.isArray(data.sourceLinkedCards) ? data.sourceLinkedCards : [];
  const cases = Array.isArray(data.benchmarkCases) ? data.benchmarkCases : [];
  const suppliers = Array.isArray(data.supplierRows) ? data.supplierRows : [];
  const hz = data.hazardScores as Record<string, unknown> | undefined;

  const hazardScores = {
    flood: Number(hz?.flood ?? 60),
    typhoon: Number(hz?.typhoon ?? 60),
    heatwave: Number(hz?.heatwave ?? 60),
    seismic: Number(hz?.seismic ?? 60),
  };

  return {
    passiveStrategies: passive
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          title: String(row.title ?? '').trim(),
          impact: String(row.impact ?? '').trim(),
          value: String(row.value ?? '').trim(),
        };
      })
      .filter((item) => item.title && item.value)
      .slice(0, 4),
    hazardScores,
    sourceLinkedCards: sources
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          title: String(row.title ?? '').trim(),
          publisher: String(row.publisher ?? '').trim(),
          year: String(row.year ?? '').trim(),
          note: String(row.note ?? '').trim(),
          url: String(row.url ?? '').trim() || undefined,
        };
      })
      .filter((item) => item.title && item.publisher)
      .slice(0, 4),
    benchmarkCases: cases
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          name: String(row.name ?? '').trim(),
          location: String(row.location ?? '').trim(),
          challenge: String(row.challenge ?? '').trim(),
          strategy: String(row.strategy ?? '').trim(),
          outcome: String(row.outcome ?? '').trim(),
        };
      })
      .filter((item) => item.name && item.location)
      .slice(0, 4),
    supplierRows: suppliers
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          component: String(row.component ?? '').trim(),
          material: String(row.material ?? '').trim(),
          unitCost: String(row.unitCost ?? '').trim(),
          supplier: String(row.supplier ?? '').trim(),
        };
      })
      .filter((item) => item.component && item.material)
      .slice(0, 4),
  };
}

export async function fetchDataHubResearch(request: DataHubResearchRequest): Promise<DataHubResearchPayload | null> {
  if (!HAS_OPENROUTER_KEY) return null;

  const city = request.city?.trim() || 'China';
  const climateZone = request.climateZone?.trim() || 'Unknown climate zone';
  const buildingType = request.buildingType?.trim() || 'traditional Chinese architecture';
  const lang = request.lang || 'en';

  const systemPrompt = lang === 'zh'
    ? '你是严谨的建筑研究助手。必须结合联网检索结果输出有效 JSON，不要输出任何 JSON 之外的内容。'
    : 'You are a rigorous architectural research assistant. Use web-grounded knowledge and return valid JSON only.';

  const userPrompt = `Research current references for a design scenario.
City: ${city}
Climate Zone: ${climateZone}
Building Type: ${buildingType}

Return ONLY a valid JSON object with this exact shape:
{
  "passiveStrategies": [{"title":"","impact":"","value":""}],
  "hazardScores": {"flood": 0, "typhoon": 0, "heatwave": 0, "seismic": 0},
  "sourceLinkedCards": [{"title":"","publisher":"","year":"","note":"","url":"https://..."}],
  "benchmarkCases": [{"name":"","location":"","challenge":"","strategy":"","outcome":""}],
  "supplierRows": [{"component":"","material":"","unitCost":"","supplier":""}]
}

Rules:
1) hazardScores are integers in [0,100].
2) Include 3 items each for passiveStrategies, sourceLinkedCards, benchmarkCases, supplierRows.
3) sourceLinkedCards.url must be a public http/https URL.
4) Use concise values. No markdown, no comments, JSON only.`;

  try {
    const response = await client.chat.completions.create({
      model: WEB_RESEARCH_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) return null;

    const raw = typeof content === 'string' ? content : JSON.stringify(content);
    const jsonText = extractJsonObject(raw);
    if (!jsonText) return null;

    const parsed = JSON.parse(jsonText) as unknown;
    return normalizeResearchPayload(parsed);
  } catch (error) {
    console.warn('DataHub research fetch failed:', getShortErrorMessage(error));
    return null;
  }
}

export async function analyzeHistoricalText(classicalText: string): Promise<string> {
  const lang = detectLikelyChinese(classicalText) ? 'zh' : 'en';

  if (!HAS_OPENROUTER_KEY) {
    warnMissingKeyOnce();
    return buildOfflineStructuredFallback(classicalText, lang, 'public', 'building', true);
  }

  try {
    const response = await client.chat.completions.create({
      model: GLM_FREE_MODEL,
      messages: [{
        role: 'system',
        content: `You are an expert in ancient Chinese architectural documents and classical Chinese literature.
Analyze the provided classical Chinese text and extract architectural wisdom.

Output format:
## 📜 Modern Translation
[Translate to clear modern Chinese and English]

## 🏗️ Architectural Wisdom Extracted
[Key building principles, numbered]

## 🏛️ Related Building Traditions
[Which of the known types this relates to - Tulou, Siheyuan, Yaodong, Diaojiaolou, Weilongwu, or others - and why]

## 🌡️ Climate Adaptation Insight
[How this wisdom responds to environmental conditions]

## 🌱 Relevance for Sustainable Construction Today
[How a 2026 architect could apply this principle to reduce carbon or improve resilience]`
      }, {
        role: 'user',
        content: classicalText
      }],
      temperature: 0.65,
      max_tokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content === 'string' && content.trim()) return content;

    if (Array.isArray(content)) {
      const normalized = content
        .map(part => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && 'text' in part) {
            const text = (part as { text?: unknown }).text;
            return typeof text === 'string' ? text : '';
          }
          return '';
        })
        .join('')
        .trim();

      if (normalized) return normalized;
    }

    return buildOfflineStructuredFallback(classicalText, lang, 'public', 'building', false);
  } catch (error) {
    console.error('Historical Text Analysis Error:', error);
    return buildOfflineStructuredFallback(classicalText, lang, 'public', 'building', isAuthError(error));
  }
}

// ---------------------------------------------------------------------------
// Image Analysis
// ---------------------------------------------------------------------------

const VISION_MODELS = [
  GLM_FREE_MODEL,
];

const IMAGE_ANALYSIS_PROMPT = `You are an expert in Chinese architecture across all periods and regions. Analyze this building photo and identify the type of Chinese architecture shown.

Your knowledge covers (but is not limited to):
- **Tulou (土楼)** – Circular/square earthen communal buildings (Fujian)
- **Siheyuan (四合院)** – Courtyard houses (Beijing / North China)
- **Yaodong (窑洞)** – Cave dwellings (Loess Plateau)
- **Diaojiaolou (吊脚楼)** – Stilted timber houses (Yunnan, Guizhou, Hunan)
- **Weilongwu (围龙屋)** – Semi-circular Hakka enclosures (Guangdong)
- **Pagodas (塔)**, **Paifang (牌坊)**, **Temple complexes**, **Palace architecture**, **Garden architecture**, **Drum/Bell Towers**, **Qilou (骑楼)**, **Tibetan architecture**, **Anhui-style (徽派)**, **Dai bamboo houses**, and contemporary Chinese buildings

Provide:

## 🏛️ Building Identification
[Name in English and Chinese, confidence level: High / Medium / Low]

## 📍 Regional Origin
[Where this style is typically found and why it developed there]

## 🔩 Key Architectural Features
[Materials, structural system, roof style, spatial layout - be specific]

## 🌡️ Climate-Adaptive Design Logic
[How the building physically responds to its local climate: heat, cold, rain, wind, flood, seismic]

## 🌱 Sustainability Insights for Modern Architects
[What a 2026 designer can directly borrow, quantify impact where possible]

## 🔄 Modern Adaptation Concept
[A one-paragraph sketch of how a contemporary building could inherit these principles - practical, code-compliant, low-carbon]

If the image does not show Chinese architecture, describe what you see and draw any meaningful parallels to Chinese building traditions.`;

export async function analyzeImage(
  imageBase64: string,
  userQuestion?: string,
  lang: 'zh' | 'en' = 'en'
): Promise<string> {
  if (!HAS_OPENROUTER_KEY) {
    const promptSeed = userQuestion || (lang === 'zh' ? '建筑图片分析' : 'Building image analysis');
    return buildOfflineStructuredFallback(promptSeed, lang, 'public', detectTemplateModeFromPrompt(promptSeed), true);
  }

  const langInstruction = lang === 'zh'
    ? '\n\nIMPORTANT: You MUST respond entirely in Chinese (中文). All headings, descriptions, and analysis must be written in Chinese.'
    : '';

  const prompt = userQuestion
    ? `${IMAGE_ANALYSIS_PROMPT}\n\nThe user also asks: "${userQuestion}"\nPlease address their question in your analysis.${langInstruction}`
    : `${IMAGE_ANALYSIS_PROMPT}${langInstruction}`;

  for (const visionModel of VISION_MODELS) {
    try {
      console.log(`Trying vision model: ${visionModel}`);
      const response = await client.chat.completions.create({
        model: visionModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ] as ChatContentPart[]
        }],
        max_tokens: 1500,
      });

      const result = response.choices[0]?.message?.content;
      if (result) return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Vision model ${visionModel} failed:`, message);
    }
  }

  // All vision models failed - fallback to text guidance
  console.error('All vision models failed, falling back to text guidance');
  try {
    const fallbackQuestion = lang === 'zh'
      ? '用户上传了一张照片，但图片分析功能暂时不可用。请用中文提供如何目视识别传统中国建筑类型的简要指南，并请用户描述他们看到的内容。'
      : 'The user uploaded a photo but vision analysis is temporarily unavailable. Please provide a brief guide on how to visually identify traditional Chinese building types, and ask the user to describe what they see.';
    const response = await client.chat.completions.create({
      model: GLM_FREE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: fallbackQuestion }
      ],
      max_tokens: 1500,
    });
    const unavailableMsg = lang === 'zh'
      ? '⚠️ 图片分析功能暂时不可用。以下是指南：'
      : '⚠️ Image analysis temporarily unavailable. Here\'s a guide:';
    const describeMsg = lang === 'zh'
      ? '💡 请在聊天中描述建筑，我会帮助您识别！'
      : '💡 Please describe the building in the chat and I\'ll help identify it!';
    return `${unavailableMsg}\n\n${response.choices[0]?.message?.content}\n\n${describeMsg}`;
  } catch {
    return lang === 'zh'
      ? '图片分析功能暂时不可用。请在聊天中描述建筑，我会帮助您识别！'
      : 'Image analysis is currently unavailable. Please describe the building in the chat and I\'ll help identify it!';
  }
}

export async function analyzeImageStream(
  imageBase64: string,
  userQuestion?: string,
  lang: 'zh' | 'en' = 'en',
  callbacks: StreamCallbacks = {}
): Promise<string> {
  const { onToken, onPhase } = callbacks;
  if (!HAS_OPENROUTER_KEY) {
    const promptSeed = userQuestion || (lang === 'zh' ? '建筑图片分析' : 'Building image analysis');
    const fallback = buildOfflineStructuredFallback(promptSeed, lang, 'public', detectTemplateModeFromPrompt(promptSeed), true);
    onPhase?.('writing');
    onToken?.(fallback);
    return fallback;
  }

  const langInstruction = lang === 'zh'
    ? '\n\nIMPORTANT: You MUST respond entirely in Chinese (中文). All headings, descriptions, and analysis must be written in Chinese.'
    : '';

  const prompt = userQuestion
    ? `${IMAGE_ANALYSIS_PROMPT}\n\nThe user also asks: "${userQuestion}"\nPlease address their question in your analysis.${langInstruction}`
    : `${IMAGE_ANALYSIS_PROMPT}${langInstruction}`;

  onPhase?.('thinking');

  for (const visionModel of VISION_MODELS) {
    try {
      onPhase?.('researching');
      const stream = await client.chat.completions.create({
        model: visionModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: prompt }
          ] as ChatContentPart[]
        }],
        max_tokens: 1500,
        stream: true,
      });

      let fullText = '';
      onPhase?.('writing');
      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (!delta) continue;
        fullText += delta;
        onToken?.(delta);
      }

      if (fullText.trim()) return fullText;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Vision model ${visionModel} streaming failed:`, message);
    }
  }

  // Fallback to robust non-stream implementation
  const fallback = await analyzeImage(imageBase64, userQuestion, lang);
  onPhase?.('writing');
  onToken?.(fallback);
  return fallback;
}
