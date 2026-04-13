import { useEffect, useRef, useState } from 'react'

interface ModelViewerProps {
  src: string
  alt?: string
  className?: string
  autoRotate?: boolean
  cameraControls?: boolean
  poster?: string
  loadOnInteraction?: boolean
  forcePoster?: boolean
}

// Get base path from Vite
const BASE_PATH = import.meta.env.BASE_URL || '/'

const resolveAssetPath = (path: string) => {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) {
    return path
  }

  if (path.startsWith(BASE_PATH)) {
    return path
  }

  return path.startsWith('/') ? `${BASE_PATH}${path.slice(1)}` : path
}

const ModelViewer = ({
  src,
  alt = '3D Model',
  className = '',
  autoRotate = false,
  cameraControls = false,
  poster,
  loadOnInteraction = false,
  forcePoster = false,
}: ModelViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewerReady, setViewerReady] = useState(
    typeof window !== 'undefined' && !!customElements.get('model-viewer')
  )
  const [hasError, setHasError] = useState(false)
  const [isActivated, setIsActivated] = useState(!loadOnInteraction)
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lowCores = (navigator.hardwareConcurrency ?? 8) <= 4
    const lowMemory = (nav.deviceMemory ?? 8) <= 4
    setIsLowPerfDevice(prefersReducedMotion || lowCores || lowMemory)
  }, [])

  useEffect(() => {
    setHasError(false)
    setIsActivated(!loadOnInteraction)
  }, [src, loadOnInteraction])

  const shouldAttempt3D = !forcePoster && (!loadOnInteraction || isActivated)

  useEffect(() => {
    if (!shouldAttempt3D) {
      return
    }

    if (!customElements.get('model-viewer')) {
      import('@google/model-viewer')
        .then(() => {
          setViewerReady(true)
        })
        .catch(err => {
          console.error('Failed to load model viewer:', err)
          setHasError(true)
        })
    } else {
      setViewerReady(true)
    }
  }, [shouldAttempt3D])

  const resolvedSrc = resolveAssetPath(src)
  const resolvedPoster = poster ? resolveAssetPath(poster) : undefined

  const showPoster = forcePoster || hasError || !shouldAttempt3D || !viewerReady

  if (showPoster) {
    const canActivate3D = !forcePoster && loadOnInteraction && !isActivated && !hasError

    return (
      <div ref={containerRef} className={`${className} relative overflow-hidden`}>
        {resolvedPoster ? (
          <img
            src={resolvedPoster}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-500 text-sm">3D preview unavailable</span>
          </div>
        )}

        {canActivate3D && (
          <button
            type="button"
            onClick={() => setIsActivated(true)}
            className="absolute inset-x-3 bottom-3 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
          >
            View 3D
          </button>
        )}
      </div>
    )
  }

  const shouldAutoRotate = autoRotate && !isLowPerfDevice

  return (
    <div ref={containerRef} className={`relative overflow-hidden h-full ${className}`}>
      {/* @ts-ignore */}
      <model-viewer
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        {...(shouldAutoRotate ? { 'auto-rotate': '' } : {})}
        {...(cameraControls ? { 'camera-controls': '' } : {})}
        shadow-intensity="1"
        style={{ display: 'block', width: '100%', height: '100%', minHeight: '100%' }}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

export default ModelViewer
