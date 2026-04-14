// Historical evolution data for each building type
// Each entry contains bilingual historical period descriptions

export interface HistoricalPeriod {
  period: string
  periodEn: string
  description: string
  descriptionEn: string
}

export const BUILDING_HISTORIES: Record<string, HistoricalPeriod[]> = {
  tulou: [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '12世纪（南宋），福建客家人开始建造大型夯土建筑群，用于防御和聚族而居。',
      descriptionEn: '12th century (Southern Song), Hakka communities in Fujian built large rammed-earth compounds for defense and communal living.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '形式成熟为更大、更复杂的圆形和矩形村落，可容纳多个家族，体现宗族组织，抵御土匪袭击。',
      descriptionEn: 'Form matured into bigger, more complex circular and rectangular villages that could house multiple families, reflect clan organization, and resist bandit attacks.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '从纯居住用途转变为文化遗产保护和文化旅游，特别是2008年联合国教科文组织认定后。',
      descriptionEn: 'Shifted from purely residential use to heritage preservation and cultural tourism, especially after UNESCO recognition in 2008.'
    }
  ],

  siheyuan: [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '西周时期和汉代已有雏形，是中国最持久的四合院住宅形式之一。',
      descriptionEn: 'Origins traced as early as the Western Zhou period and Han era, making it one of China\'s most enduring courtyard house forms.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '广泛传播并成熟为经典的北京四合院，与宗族生活、等级制度和城市居住相关联。',
      descriptionEn: 'Became especially widespread and matured into the classic Beijing courtyard house associated with clan life, hierarchy, and urban residence.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '许多四合院被分割或改造，而幸存的例子成为文化遗产和老北京象征的珍贵价值。',
      descriptionEn: 'Many were subdivided or altered, while surviving examples became valued as cultural heritage and symbols of old Beijing.'
    }
  ],

  yaodong: [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '考古证据表明，窑洞洞穴住宅可追溯到3000多年前的周朝时期，是最古老的形式之一。',
      descriptionEn: 'Archaeological evidence placing them back more than 3,000 years to the Zhou period, among the oldest forms here.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '黄土高原定居者将其完善为崖侧、下沉式和独立式形式，利用该地区厚厚的黄土和恶劣气候。',
      descriptionEn: 'Settlers on the Loess Plateau refined them into cliff-side, sunken, and independent forms, taking advantage of the region\'s thick loess soil and harsh climate.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '20世纪，它们与中国北方的革命历史密切相关，今天它们仍然是有人居住的家园和遗产景点。',
      descriptionEn: 'In the 20th century, they became closely associated with revolutionary history in northern China, and today they remain both inhabited homes and heritage attractions.'
    }
  ],

  diaojiaolou: [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '吊脚楼起源于先秦时期百越族群干栏建筑传统，在西南潮湿山地、河流和坡地环境中逐步发展。',
      descriptionEn: 'Diaojiaolou originated from the pre-Qin Ganlan (stilt) building tradition of the Baiyue peoples, evolving in the humid mountains, rivers, and slopes of the southwest.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '唐宋以来，土家族、苗族、侗族等不断完善吊脚楼形制，架空底层保持干燥通风，防止蛇虫和地潮。',
      descriptionEn: 'From the Tang and Song dynasties onward, the Tujia, Miao, and Dong peoples refined the diaojiaolou form, elevating the ground floor for dry ventilation and protection from snakes and ground moisture.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '2006年吊脚楼营造技艺被列入国家级非物质文化遗产名录，成为土家族、苗族和侗族建筑文化的重要象征。',
      descriptionEn: 'In 2006, diaojiaolou construction techniques were listed as national intangible cultural heritage, becoming an important symbol of Tujia, Miao, and Dong architectural culture.'
    }
  ],

  weilongwu: [
    {
      period: '唐宋时期',
      periodEn: 'Tang & Song Dynasties',
      description: '围龙屋的雏形可追溯至唐宋时期，客家人南迁后在粤东地区形成聚族而居的防御性围合建筑。',
      descriptionEn: 'Prototypes trace to the Tang and Song dynasties, when Hakka migrants southward formed defensive communal enclosures in eastern Guangdong.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '明代中后期围龙屋形制成熟，前半月形池塘、后半月化胎的布局定型，清代大规模兴建，成为客家宗族聚落的核心。',
      descriptionEn: 'The mature form emerged in the mid-to-late Ming, with the front crescent pond and rear crescent embankment layout fixed. Large-scale construction continued through the Qing, becoming the core of Hakka clan settlements.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '20世纪末以来，围龙屋被列为文物保护单位，梅州等地围龙屋群成为客家文化遗产的重要载体。',
      descriptionEn: 'Since the late 20th century, weilongwu have been listed as cultural heritage sites, with Meizhou clusters becoming key carriers of Hakka cultural heritage.'
    }
  ],

  'huizhou-residence': [
    {
      period: '秦汉时期',
      periodEn: 'Qin & Han Dynasties',
      description: '徽州民居的建筑技术可追溯至秦汉时期，当时早期穿斗式木构架体系已在使用。',
      descriptionEn: 'Construction techniques trace back to the Qin and Han dynasties, when early chuan-dou timber frame systems were already in use.'
    },
    {
      period: '宋代',
      periodEn: 'Song Dynasty',
      description: '宋代徽商崛起带动住宅营造技艺进步，穿斗式与抬梁式木构架融合，天井院落布局初步形成。',
      descriptionEn: 'The rise of Huizhou merchants in the Song dynasty drove advances in residential construction, merging chuan-dou and tai-liang timber frames, and the skywell courtyard layout took initial shape.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '明代天井院落与"四柱五梁"结构定型，清代风格完全成熟，以粉墙黛瓦、马头墙和精美砖木雕饰著称。',
      descriptionEn: 'The skywell courtyard and "four pillars, five beams" structure stabilized in the Ming, and the style reached full maturity in the Qing with its iconic white walls, dark tiles, horse-head gables, and refined brick-and-wood carving.'
    }
  ],

  'jiangnan-water-town-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '江南水乡民居在长江下游地区发展起来，可追溯至六朝时期（3-6世纪），潮湿气候和密布水道将建筑塑造为紧凑院落和临河形式。',
      descriptionEn: 'Jiangnan water town houses developed in the lower Yangtze region, traceable to the Six Dynasties period (3rd-6th centuries), where humid climate and dense waterways shaped compact courtyard and riverside forms.'
    },
    {
      period: '宋明清时期',
      periodEn: 'Song, Ming & Qing Dynasties',
      description: '随着该地区在宋、明、清时期的繁荣，这些房屋变得更加精致，采用木结构、狭窄的巷道，并与运河和桥梁直接相连。',
      descriptionEn: 'As the region prospered during the Song, Ming, and Qing dynasties, these houses became more refined, with timber structure, narrow lanes, and direct links to canals and bridges.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '许多已被保存为历史水乡景观和文化旅游的一部分。',
      descriptionEn: 'Many have been preserved as part of historic water town landscapes and cultural tourism.'
    }
  ],

  'beijing-northern-rural-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '北方乡村住宅围绕与北京四合院相同的院落传统形成，可追溯至元代，但采用更简朴实用的形式，适应更冷、多风的乡村条件。',
      descriptionEn: 'Northern rural houses followed the same courtyard tradition as Beijing siheyuan, traceable to the Yuan dynasty, but in a simpler and more practical form suited to colder, windier rural conditions.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '明清时期发展加速，基于院落的家族合院在华北地区广泛传播。',
      descriptionEn: 'Their development accelerated during the Ming and Qing dynasties, when courtyard-based family compounds spread widely across northern China.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '许多被新住房取代，尽管幸存的例子仍然展示了紧凑、内向型乡村生活的逻辑。',
      descriptionEn: 'Many were replaced by new housing, though surviving examples still show the logic of compact, inward-facing rural life.'
    }
  ],

  'northwest-adobe-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '西北土坯民居在新石器时代已见雏形，在干旱少雨的黄土地区，土基材料既实用又经济。',
      descriptionEn: 'Prototypes appeared in the Neolithic period, and in the arid loess regions, earth-based materials were both practical and economical.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '汉唐以来，丝绸之路沿线居民利用当地黄土建造厚墙以实现热稳定性，特别是在木材稀缺的干旱地区。',
      descriptionEn: 'From the Han and Tang dynasties, residents along the Silk Road used local loess to build thick walls for thermal stability, especially in arid areas where timber was scarce.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '这些房屋在农村定居点中仍然很常见，现在经常被研究为一种气候适应型传统住房形式。',
      descriptionEn: 'These houses remained common in rural settlements and are now often studied as a climate-adaptive form of traditional housing.'
    }
  ],

  'lingnan-residence': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '岭南民居从南越族干栏建筑发展而来，秦统一岭南后逐渐吸收中原建筑影响，唐宋时期岭南建筑风格初步形成。',
      descriptionEn: 'Lingnan houses evolved from the Nanyue stilt-building tradition, absorbing Central Plains influences after the Qin unification, and a distinct Lingnan style emerged by the Tang and Song dynasties.'
    },
    {
      period: '14-15世纪',
      periodEn: '14th-15th Centuries',
      description: '到14至15世纪，一种可识别的古典岭南风格已经形成，由炎热、潮湿和当地工艺传统塑造。',
      descriptionEn: 'By the 14th to 15th centuries, a recognizable classical Lingnan style had formed, shaped by heat, humidity, and local craft traditions.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '灰塑、砖雕和庭院布局等装饰元素变得更加精致，今天岭南民居被公认为主要的地区建筑传统。',
      descriptionEn: 'Decorative elements such as gray sculpture, brick carving, and courtyard layouts became more sophisticated, and today Lingnan homes are recognized as a major regional architectural tradition.'
    }
  ],

  'sichuan-folk-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '巴蜀民居在四川盆地湿热气候影响下发展起来，可追溯至古蜀国时期，布局和材料适应潮湿、炎热和日常生活。',
      descriptionEn: 'Bashu houses developed under the humid basin climate, traceable to the ancient Shu kingdom period, with layouts and materials suited to moisture, heat, and everyday family life.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '在明清时期，该地区的住宅多样化为庭院住宅、木屋和由可用材料和社会组织塑造的当地乡村变体。',
      descriptionEn: 'Over the Ming and Qing periods, the region\'s dwellings diversified into courtyard houses, timber homes, and local rural variants shaped by available materials and social organization.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '在现代遗产研究中，这些房屋作为巴蜀地区建筑的代表性例子而受到重视。',
      descriptionEn: 'In modern heritage studies, these houses are valued as a representative example of Bashu regional architecture.'
    }
  ],

  'xinjiang-uyghur-flat-roof-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '新疆维吾尔族民居在绿洲定居点发展了数百年，10世纪伊斯兰教传入后，宗教文化深刻影响了庭院布局和装饰风格。',
      descriptionEn: 'Uyghur houses developed over centuries in oasis settlements, and after Islam arrived in the 10th century, religious culture deeply influenced courtyard layout and decorative style.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '庭院住宅成为中心形式，平屋顶、封闭的家庭空间和适合干燥气候的装饰性木工艺。',
      descriptionEn: 'The courtyard house became a central form, with flat roofs, enclosed family space, and decorative woodwork suited to the dry climate.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '这一传统越来越多地被记录为维吾尔族文化遗产的重要组成部分。',
      descriptionEn: 'This tradition has been increasingly documented as an important part of Uyghur cultural heritage.'
    }
  ],

  'tibetan-stone-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '藏式石屋在青藏高原发展起来，可追溯至吐蕃时期（7-9世纪），石材、夯土和毛毡是高原生存的最佳材料。',
      descriptionEn: 'Tibetan stone houses evolved on the Qinghai-Tibet Plateau, traceable to the Tubo period (7th-9th centuries), where stone, rammed earth, and felt were the best materials for highland survival.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '随着时间的推移，它们发展出厚的砖石墙、平屋顶和紧凑的平面布局，以抵御寒冷天气和强风。',
      descriptionEn: 'Over time, they developed thick masonry walls, flat roofs, and compact plans that resisted cold weather and strong winds.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '许多传统例子已被保存或修复，作为西藏建筑遗产的一部分。',
      descriptionEn: 'Many traditional examples have been preserved or restored as part of Tibet\'s architectural heritage.'
    }
  ],

  'yi-bai-traditional-houses': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '彝族民居从西南土掌房传统发展而来，白族民居在大理地区形成了"三坊一照壁"院落格局，可追溯至南诏时期（7-9世纪）。',
      descriptionEn: 'Yi houses evolved from the tuzhangfang (earthen flat-roof) tradition, while Bai houses formed the "three wings and one screen wall" courtyard layout in Dali, traceable to the Nanzhao period (7th-9th centuries).'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '明清时期，彝族土掌房和白族"三坊一照壁"形制成熟，白族民居以精美彩绘和石雕装饰著称，大理喜洲等地保存了大量实例。',
      descriptionEn: 'During the Ming and Qing dynasties, the Yi tuzhangfang and Bai "three wings and one screen wall" forms matured, with Bai houses renowned for colorful painting and stone carving; Xizhou in Dali preserves many examples.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '在现代，这些房屋被视为重要的民族遗产和地方适应的记录。',
      descriptionEn: 'In the modern era, these houses are treated as important ethnic heritage and a record of local adaptation.'
    }
  ],

  'northeast-manor-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '东北庄园住宅发展较晚，清代满族入关后，旗人庄园和地主大院在东北平原兴起，反映了边疆垦殖和严寒气候的双重影响。',
      descriptionEn: 'Northeast manor houses developed later; after the Qing Manchu conquest, banner estates and landlord compounds arose on the Northeast Plain, reflecting both frontier reclamation and severe cold climate.'
    },
    {
      period: '清朝时期',
      periodEn: 'Qing Dynasty',
      description: '其成熟形式在清朝中后期扩大，大型合院式住宅和贵族庄园在东北更加稳固。',
      descriptionEn: 'Their mature form expanded during the Qing dynasty, when large compound-style residences and noble estates became more established in the northeast.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '今天，幸存的庄园住宅通常作为历史遗址保存，展示旧东北中国的社会等级和地区生活。',
      descriptionEn: 'Today, surviving manor houses are usually preserved as historical sites that show the social hierarchy and regional life of old Northeast China.'
    }
  ]
}

// Helper function to get timeline data for a building
export function getBuildingTimeline(buildingId: string, lang: 'zh' | 'en'): { era: string; year: string; desc: string }[] {
  const history = BUILDING_HISTORIES[buildingId]
  if (!history) {
    // Fallback generic timeline
    return lang === 'zh'
      ? [
          { era: '起源时期', year: '古代', desc: '早期建筑形式出现' },
          { era: '发展时期', year: '中世纪', desc: '结构逐渐完善' },
          { era: '成熟时期', year: '近世', desc: '建筑体系成熟' },
          { era: '现代时期', year: '当代', desc: '保护与传承' }
        ]
      : [
          { era: 'Origins', year: 'Ancient', desc: 'Early architectural forms emerged' },
          { era: 'Development', year: 'Medieval', desc: 'Structures gradually refined' },
          { era: 'Maturity', year: 'Early Modern', desc: 'Architectural system matured' },
          { era: 'Modern Era', year: 'Contemporary', desc: 'Preservation and heritage' }
        ]
  }

  return history.map((period, index) => ({
    era: lang === 'zh' ? period.period : period.periodEn,
    year: ['I', 'II', 'III', 'IV'][index] || String(index + 1),
    desc: lang === 'zh' ? period.description : period.descriptionEn
  }))
}
