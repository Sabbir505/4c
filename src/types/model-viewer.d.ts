declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          alt?: string
          loading?: 'lazy' | 'eager' | 'auto'
          reveal?: 'auto' | 'interaction' | 'manual'
          poster?: string
          'auto-rotate'?: boolean | string
          'camera-controls'?: boolean | string
          'shadow-intensity'?: string
          'environment-image'?: string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}

export {}
