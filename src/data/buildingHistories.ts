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
      description: '12世纪，福建客家人开始建造大型夯土建筑群，用于防御和 communal living。',
      descriptionEn: '12th century, Hakka communities in Fujian built large rammed-earth compounds for defense and communal living.'
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
      description: '吊脚楼在中国西南少数民族中发展起来，作为对潮湿地形、河流和山坡的适应。',
      descriptionEn: 'Developed among ethnic groups in southwest China as an adaptation to humid terrain, rivers, and mountain slopes.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '历史可追溯到许多代之前，设计演变为保持房屋干燥、通风，并保护免受蛇和潮湿地面影响。',
      descriptionEn: 'History stretches back many generations, with the design evolving to keep homes dry, ventilated, and safe from snakes and damp ground.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '它们已成为少数民族建筑的重要象征，特别是土家族、苗族和侗族。',
      descriptionEn: 'They have become an important symbol of minority architecture, especially for the Tujia, Miao, and Dong peoples.'
    }
  ],

  'hakka-weilongwu': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '围龙屋作为中国南方客家居住形式发展起来，与更广泛的客家 communal、防御性住房传统密切相关。',
      descriptionEn: 'Developed as a Hakka residential form in south China, closely related to the broader Hakka tradition of communal, defensive housing.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '其成熟形式随着客家人适应迁徙、防御需求和基于宗族的生活而出现，特别是从明朝到清朝时期。',
      descriptionEn: 'Its mature form emerged as Hakka communities adapted to migration, defense needs, and clan-based living, especially from the Ming through Qing periods.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '越来越多地被研究和保存为客家乡土建筑的地域变体。',
      descriptionEn: 'It is increasingly studied and preserved as a regional variation of Hakka vernacular architecture.'
    }
  ],

  huizhou: [
    {
      period: '秦汉时期',
      periodEn: 'Qin & Han Dynasties',
      description: '徽州民居的建筑技术可追溯到秦汉时期，当时早期结构系统已经投入使用。',
      descriptionEn: 'Construction techniques trace back to the Qin and Han dynasties, when early structural systems were already in use.'
    },
    {
      period: '宋代',
      periodEn: 'Song Dynasty',
      description: '建筑方法得到改进并融合了不同的木构架传统，为后来的徽州风格奠定了基础。',
      descriptionEn: 'Building methods improved and merged different timber-framing traditions, laying the foundation for later Huizhou style.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '内部 patio 布局和熟悉的"四柱五梁"结构已经稳定，清朝时期风格达到完全成熟，以其著名的白墙、黑瓦和高度精致的装饰而闻名。',
      descriptionEn: 'The internal patio layout and familiar "four pillars, five beams" structure had become stable, and in the Qing dynasty the style reached full maturity with its well-known white walls, black tiles, and highly refined ornament.'
    }
  ],

  'jiangnan-water-town-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '江南水乡民居在长江下游地区悠久的定居历史中发展起来，潮湿的天气和密集的水道将建筑塑造为 compact courtyard 和河畔形式。',
      descriptionEn: 'Developed in the long settlement history of the lower Yangtze region, where humid weather and dense waterways shaped architecture toward compact courtyard and riverside forms.'
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
      description: '北方乡村住宅围绕与北京四合院相同的 courtyard 传统形成，但采用更简单、更实用的形式，适应更冷、多风的乡村条件。',
      descriptionEn: 'Took shape around the same courtyard tradition as Beijing siheyuan, but in a simpler and more practical form suited to colder, windier rural conditions.'
    },
    {
      period: '明清时期',
      periodEn: 'Ming & Qing Dynasties',
      description: '发展加速，基于 courtyard 的家庭 compound 在华北地区广泛传播。',
      descriptionEn: 'Their development accelerated during the Ming and Qing dynasties, when courtyard-based family compounds spread widely across northern China.'
    },
    {
      period: '现代时期',
      periodEn: 'Modern Era',
      description: '许多被新住房取代，尽管幸存的例子仍然展示了 compact、内向型乡村生活的逻辑。',
      descriptionEn: 'Many were replaced by new housing, though surviving examples still show the logic of compact, inward-facing rural life.'
    }
  ],

  'northwest-adobe-house': [
    {
      period: '起源时期',
      periodEn: 'Origins',
      description: '西北土坯民居在干燥、气候挑战的地区发展起来，土基材料既实用又经济。',
      descriptionEn: 'Evolved in dry, climate-challenged regions where earth-based materials were practical and economical.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '其根源与长期存在的乡土建筑传统有关，利用当地土壤建造厚墙以实现热稳定性，特别是在木材稀缺的地区。',
      descriptionEn: 'Their roots are tied to long-standing vernacular building traditions that used local soil to create thick walls with thermal stability, especially in areas where timber was scarce.'
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
      description: '岭南民居从早期南方民族的建筑发展而来，随着该地区更多地融入中华帝国，逐渐吸收了唐宋文化的影响。',
      descriptionEn: 'Developed from the architecture of early southern peoples and gradually absorbed influences from Tang and Song culture as the region became more integrated into imperial China.'
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
      description: '巴蜀民居在四川盆地气候的影响下发展起来，布局和材料适合潮湿、炎热和日常生活。',
      descriptionEn: 'Developed under the influence of the basin climate, with layouts and materials suited to moisture, heat, and everyday family life.'
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
      description: '新疆维吾尔族民居在绿洲定居点发展了几个世纪，气候、社区生活和伊斯兰文化模式影响了设计。',
      descriptionEn: 'Developed over centuries in oasis settlements where climate, community life, and Islamic cultural patterns influenced design.'
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
      description: '藏式石屋在高海拔地区发展起来，石材、泥土和绝缘材料是生存的最佳可用材料。',
      descriptionEn: 'Evolved in high-altitude regions where stone, earth, and insulation were the best available materials for survival.'
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
      description: '彝族和白族民居从中国西南独特的民族传统发展而来，由山地地形、当地材料和强大的家庭组织塑造。',
      descriptionEn: 'Grew out of distinct ethnic traditions in southwest China, shaped by mountain terrain, local materials, and strong household organization.'
    },
    {
      period: '发展演变',
      periodEn: 'Development',
      description: '它们的形式在很长一段时间内演变，彝族适应了土坯住宅，白族在大理等地发展了 more courtyard-centered 和装饰华丽的住宅。',
      descriptionEn: 'Their forms evolved over a long period, with the Yi adapting earthen dwellings and the Bai developing more courtyard-centered and ornamented homes in places like Dali.'
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
      description: '东北庄园住宅比许多南方形式发展得更晚，反映了该地区的边疆历史、气候以及士绅和地主庄园的兴起。',
      descriptionEn: 'Developed later than many southern forms, reflecting the region\'s frontier history, climate, and the rise of gentry and landlord estates.'
    },
    {
      period: '清朝时期',
      periodEn: 'Qing Dynasty',
      description: '其成熟形式在清朝时期扩大，当时大型 compound-style 住宅和贵族庄园在东北更加稳固。',
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
