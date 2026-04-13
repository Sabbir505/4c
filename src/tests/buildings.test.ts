import { describe, it, expect } from 'vitest'
import { buildingIcons, BUILDING_COLORS, BUILDING_COORDS, BUILDING_IDS, getEChartsColors } from '../data/buildings'

describe('Building Shared Data', () => {
  it('defines the full 15-building catalog', () => {
    expect(BUILDING_IDS).toHaveLength(15)
    expect(BUILDING_IDS).toContain('tulou')
    expect(BUILDING_IDS).toContain('siheyuan')
    expect(BUILDING_IDS).toContain('yaodong')
    expect(BUILDING_IDS).toContain('diaojiaolou')
    expect(BUILDING_IDS).toContain('weilongwu')
    expect(BUILDING_IDS).toContain('huizhou-residence')
    expect(BUILDING_IDS).toContain('jiangnan-water-town-house')
    expect(BUILDING_IDS).toContain('beijing-northern-rural-house')
    expect(BUILDING_IDS).toContain('northwest-adobe-house')
    expect(BUILDING_IDS).toContain('lingnan-residence')
    expect(BUILDING_IDS).toContain('sichuan-folk-house')
    expect(BUILDING_IDS).toContain('xinjiang-uyghur-flat-roof-house')
    expect(BUILDING_IDS).toContain('tibetan-stone-house')
    expect(BUILDING_IDS).toContain('yi-bai-traditional-houses')
    expect(BUILDING_IDS).toContain('northeast-manor-house')
  })

  it('has icons with gradient for all buildings', () => {
    BUILDING_IDS.forEach(id => {
      expect(buildingIcons[id]).toBeDefined()
      expect(buildingIcons[id].icon).toBeDefined()
      expect(buildingIcons[id].gradient).toMatch(/linear-gradient/)
    })
  })

  it('has hex colors for all buildings', () => {
    BUILDING_IDS.forEach(id => {
      expect(BUILDING_COLORS[id]).toBeDefined()
      expect(BUILDING_COLORS[id]).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })

  it('has valid China coordinates for all buildings', () => {
    BUILDING_IDS.forEach(id => {
      const coords = BUILDING_COORDS[id]
      expect(coords).toHaveLength(2)
      // China longitude range: ~73-135°E
      expect(coords[0]).toBeGreaterThan(73)
      expect(coords[0]).toBeLessThan(135)
      // China latitude range: ~18-53°N
      expect(coords[1]).toBeGreaterThan(18)
      expect(coords[1]).toBeLessThan(53)
    })
  })
})

describe('ECharts Theme Colors', () => {
  it('returns appropriate colors for dark theme', () => {
    const colors = getEChartsColors(true)
    expect(colors.textColor).toBeDefined()
    expect(colors.tooltipBg).toBeDefined()
    expect(colors.splitLineColor).toBeDefined()
    expect(colors.axisLineColor).toBeDefined()
  })

  it('returns appropriate colors for light theme', () => {
    const colors = getEChartsColors(false)
    expect(colors.textColor).toBeDefined()
    expect(colors.tooltipBg).toBeDefined()
  })

  it('has different text colors for dark vs light', () => {
    const dark = getEChartsColors(true)
    const light = getEChartsColors(false)
    expect(dark.textColor).not.toBe(light.textColor)
  })
})
