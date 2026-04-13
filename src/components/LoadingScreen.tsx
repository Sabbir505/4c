const LoadingScreen = () => (
  <div
    className="flex items-center justify-center py-32"
    style={{ backgroundColor: 'var(--bg-primary)' }}
    role="status"
    aria-label="Loading page content"
  >
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 animate-pulse shadow-lg"
        style={{ background: 'var(--gradient-brand)' }}
      >
        <span
          className="text-white text-2xl font-bold"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        >
          构
        </span>
      </div>
      <div
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
        style={{ borderColor: 'var(--brand-primary)' }}
      />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading...
      </p>
    </div>
  </div>
)

export default LoadingScreen
