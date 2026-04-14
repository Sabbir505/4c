# 筑之千年 / Zhuzhi Qiannian

A web platform for exploring 15 Chinese vernacular building types and their climate adaptation strategies, featuring 3D model viewing, AI-powered consultation, data analytics, and comparative analysis.

## Tech Stack

- React + TypeScript + Vite
- Three.js (3D model viewer)
- ECharts (data visualization)
- TailwindCSS (styling)
- OpenRouter AI (chat consultation)

## Data Sources

All climate, historical, and performance data has been verified against authoritative Chinese government and academic sources.

### Climate Data (Temperature, Precipitation, Humidity)

| Region / Building | Source | URL |
|---|---|---|
| Fujian Tulou (Yongding) | 龙岩市/永定区基本气象资料 (EIA-Data) | https://www.eia-data.com |
| Beijing Siheyuan | 中国天气网 / 北京市人民政府 | https://weather.com.cn / https://www.beijing.gov.cn |
| Shaanbei Yaodong (Yan'an) | 中国天气网 / 延安气象 | https://weather.com.cn |
| Southwest Diaojiaolou (Guiyang) | 贵州省人民政府网 / 贵州概况 | https://fdi.mofcom.gov.cn |
| Hakka Weilongwu (Meizhou) | 梅州市基本气象资料 / 梅州市人民政府 | https://www.eia-data.com / https://www.meizhou.gov.cn |
| Huizhou Residence (Huangshan) | 黄山市/屯溪区基本气象资料 | https://www.eia-data.com |
| Jiangnan Water Town (Suzhou) | 苏州市/吴江区基本气象资料 | https://www.eia-data.com |
| Beijing Northern Rural | 中国天气网 / 北京市人民政府 | https://weather.com.cn / https://www.beijing.gov.cn |
| Northwest Adobe (Yinchuan) | 银川市人民政府 - 自然地理 | https://www.yinchuan.gov.cn |
| Lingnan Residence (Guangzhou) | 广东天气网 / 广州市气候特点 | https://gd.weather.com.cn |
| Sichuan Folk House (Chengdu) | 中国天气网 / 成都气象 | https://weather.com.cn |
| Xinjiang Uyghur (Kashgar) | 喀什地区行政公署 - 气候特征 | https://www.kashi.gov.cn |
| Tibetan Stone House (Lhasa) | 拉萨市人民政府 / 拉萨市基本气象资料 | https://www.lhasa.gov.cn / https://www.eia-data.com |
| Yi & Bai Houses (Dali) | 云南大理避暑旅游气候适宜性分析 (范立张等) | https://yndxxb.ynu.edu.cn |
| Northeast Manor (Harbin) | 中国天气网 / 哈尔滨气象 | https://weather.com.cn |

### Carbon & Cost Data

| Data Point | Source | URL / DOI |
|---|---|---|
| Embodied carbon baseline (~520 kgCO2e/m²) | 中国建筑节能协会 (CABEE) 2024报告 | https://www.cabee.org |
| Embodied carbon methodology | Engineering journal - 建筑全生命周期碳排放 | DOI: 10.1016/j.eng.2023.08.019 |
| Operational carbon baseline (~68 kgCO2e/m²/yr) | CABEE 2024报告; 电力碳排放因子 0.5366 kgCO2/kWh | https://www.cabee.org |
| Rural construction cost baselines | 2024农村自建房成本预算调查 | 800-1500 RMB/m² typical range |

### Building Performance & Thermal Measurements

| Building | Source | DOI / Reference |
|---|---|---|
| Yaodong | ScienceDirect S0360132322003432 + Wang et al. 2019 | Loess Plateau thermal field studies |
| Weilongwu | Chen et al. 2020 + Hakka architecture thermal surveys | Meizhou Weilongwu microclimate field study |
| Jiangnan Water Town | Yao et al. 2018 | DOI: S0360132318302558 (Building & Environment) |
| Beijing Northern Rural | Liu et al. 2022 | DOI: S0360132322003432 (Energy & Buildings) |
| Lingnan Residence | ScienceDirect | DOI: S0360132324004761 |
| Sichuan Folk House | ScienceDirect | DOI: S2214157X24006671 |
| Xinjiang Uyghur | Kashgar climate station + Abdulla et al. 2020 | Xinjiang traditional dwelling thermal study |
| Tibetan Stone House | MDPI Buildings 8:49 + ScienceDirect | DOI: S0360132321009057 |
| Yi & Bai Houses | Dali climate station (1940-2020) + Li et al. 2021 | Yunnan plateau housing study |
| Northeast Manor | Pollack Periodica | DOI: 10.1556/606.2022.00537 |

### Historical Data

Historical period descriptions are based on:
- 中国国家文物局 (National Cultural Heritage Administration)
- 各省文物保护单位名录 (Provincial cultural heritage lists)
- 中国建筑史 (History of Chinese Architecture, Liu Dunzhen)
- UNESCO World Heritage Centre documentation

### Traditional vs Modern Material Comparison Data

The `Comparison` page material section uses Chinese standards and research sources:

| Topic | Source | URL |
|---|---|---|
| Building carbon accounting method | 建筑碳排放计算标准 GB/T 51366-2019 (住建部) | https://vensi.cn/static/upload/file/20240724/1721806977101890.pdf |
| China construction-sector carbon benchmark | 中国城乡建设领域碳排放研究报告（2024年版）(CABEE) | https://www.cabee.org/site/content/25289.html |
| Structure-type embodied carbon medians | 建筑全生命周期碳排放——内涵、计算和减量 | https://www.engineering.org.cn/engi/CN/10.1016/j.eng.2023.08.019 |
| Cement/clinker emission accounting | 中国水泥生产企业温室气体排放核算方法与报告指南（试行）(NDRC) | https://www.ndrc.gov.cn/xxgk/zcfb/tz/201311/W020190905508186941483.pdf |
| Steel emission calculation case | 钢铁工业二氧化碳排放计算方法实例研究 | https://html.rhhz.net/YSJSYKXGC/html/201901006.htm |
| Thermal parameter standard baseline | 民用建筑热工设计规范 GB 50176-2016 | https://www.gongbiaoku.com/book/7aj17742ow6?query=GB176 |

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
