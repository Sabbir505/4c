const BASE_URL = import.meta.env.BASE_URL || '/'

export function assetUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${BASE_URL}${cleanPath}`
}
