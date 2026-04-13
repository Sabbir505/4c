import { Circle, Home, Mountain, Warehouse, Castle, Building2, type LucideIcon } from 'lucide-react'

// ============================================
// SHARED BUILDING DATA CONSTANTS
// Used across Home, MapPage, DataHub, Comparison
// ============================================

export const BUILDING_IDS = [
  'tulou',
  'siheyuan',
  'yaodong',
  'diaojiaolou',
  'weilongwu',
  'huizhou-residence',
  'jiangnan-water-town-house',
  'beijing-northern-rural-house',
  'northwest-adobe-house',
  'lingnan-residence',
  'sichuan-folk-house',
  'xinjiang-uyghur-flat-roof-house',
  'tibetan-stone-house',
  'yi-bai-traditional-houses',
  'northeast-manor-house',
] as const

export type BuildingId = (typeof BUILDING_IDS)[number]

export const buildingIcons: Record<BuildingId, { icon: LucideIcon; gradient: string }> = {
  tulou: { icon: Circle, gradient: 'linear-gradient(135deg, #92702d 0%, #d4a853 100%)' },
  siheyuan: { icon: Home, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3d6a9f 100%)' },
  yaodong: { icon: Mountain, gradient: 'linear-gradient(135deg, #8b5a2b 0%, #cd853f 100%)' },
  diaojiaolou: { icon: Warehouse, gradient: 'linear-gradient(135deg, #2d5a3d 0%, #4a9c6d 100%)' },
  weilongwu: { icon: Castle, gradient: 'linear-gradient(135deg, #6b3a5d 0%, #a85d8f 100%)' },
  'huizhou-residence': { icon: Home, gradient: 'linear-gradient(135deg, #1f6f8b 0%, #4ea3c8 100%)' },
  'jiangnan-water-town-house': { icon: Building2, gradient: 'linear-gradient(135deg, #2f5d8a 0%, #6ca6d9 100%)' },
  'beijing-northern-rural-house': { icon: Home, gradient: 'linear-gradient(135deg, #6b4f2a 0%, #b1854f 100%)' },
  'northwest-adobe-house': { icon: Mountain, gradient: 'linear-gradient(135deg, #7a4f2f 0%, #c07d4f 100%)' },
  'lingnan-residence': { icon: Castle, gradient: 'linear-gradient(135deg, #1f6b5b 0%, #47a58d 100%)' },
  'sichuan-folk-house': { icon: Warehouse, gradient: 'linear-gradient(135deg, #4b5d2a 0%, #86a84f 100%)' },
  'xinjiang-uyghur-flat-roof-house': { icon: Building2, gradient: 'linear-gradient(135deg, #7a5d2f 0%, #c79a4a 100%)' },
  'tibetan-stone-house': { icon: Mountain, gradient: 'linear-gradient(135deg, #4a5568 0%, #7d8aa1 100%)' },
  'yi-bai-traditional-houses': { icon: Warehouse, gradient: 'linear-gradient(135deg, #5b4b7a 0%, #9d7fcf 100%)' },
  'northeast-manor-house': { icon: Castle, gradient: 'linear-gradient(135deg, #3d4e63 0%, #6b86a6 100%)' },
}

export const BUILDING_COLORS: Record<BuildingId, string> = {
  tulou: '#d4a853',
  siheyuan: '#3d6a9f',
  yaodong: '#cd853f',
  diaojiaolou: '#4a9c6d',
  weilongwu: '#a85d8f',
  'huizhou-residence': '#4ea3c8',
  'jiangnan-water-town-house': '#6ca6d9',
  'beijing-northern-rural-house': '#b1854f',
  'northwest-adobe-house': '#c07d4f',
  'lingnan-residence': '#47a58d',
  'sichuan-folk-house': '#86a84f',
  'xinjiang-uyghur-flat-roof-house': '#c79a4a',
  'tibetan-stone-house': '#7d8aa1',
  'yi-bai-traditional-houses': '#9d7fcf',
  'northeast-manor-house': '#6b86a6',
}

// Geographic coordinates [longitude, latitude] for map plotting
export const BUILDING_COORDS: Record<BuildingId, [number, number]> = {
  tulou: [117.0, 25.0],
  siheyuan: [116.4, 39.9],
  yaodong: [109.5, 37.0],
  diaojiaolou: [106.7, 26.6],
  weilongwu: [116.0, 24.3],
  'huizhou-residence': [118.1, 29.9],
  'jiangnan-water-town-house': [120.6, 31.3],
  'beijing-northern-rural-house': [116.4, 40.2],
  'northwest-adobe-house': [106.2, 37.4],
  'lingnan-residence': [113.3, 23.1],
  'sichuan-folk-house': [104.1, 30.7],
  'xinjiang-uyghur-flat-roof-house': [87.6, 43.8],
  'tibetan-stone-house': [91.1, 29.6],
  'yi-bai-traditional-houses': [100.2, 25.6],
  'northeast-manor-house': [126.6, 45.8],
}

// ECharts theme-aware color helper
export const getEChartsColors = (isDark: boolean) => ({
  textColor: isDark ? '#a1a1aa' : '#57534e',
  textMutedColor: isDark ? '#71717a' : '#78716c',
  axisLineColor: isDark ? 'rgba(255,255,255,0.1)' : '#e7e5e4',
  splitLineColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
  tooltipBg: isDark ? '#1c1c21' : '#ffffff',
  tooltipBorder: isDark ? 'rgba(255,255,255,0.1)' : '#e7e5e4',
})
