import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import FloatingAIChat from './components/FloatingAIChat'

// Route-level code splitting for better performance
const Home = lazy(() => import('./pages/Home'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Comparison = lazy(() => import('./pages/Comparison'))
const BuildingDetail = lazy(() => import('./pages/BuildingDetail'))
const AIConsultant = lazy(() => import('./pages/AIConsultant'))
const DataHub = lazy(() => import('./pages/DataHub'))
const Archive = lazy(() => import('./pages/Archive'))
const About = lazy(() => import('./pages/About'))
const References = lazy(() => import('./pages/References'))

// ScrollToTop component to handle page navigation
function ScrollToTop() {
  const { pathname } = useLocation()
  
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  
  return null
}

function AppContent() {
  const { pathname } = useLocation()
  const hideFloatingAI = pathname === '/' || pathname === '/ai-consultant'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-white"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/building/:id" element={<BuildingDetail />} />
            <Route path="/ai-consultant" element={<AIConsultant />} />
            <Route path="/data-hub" element={<DataHub />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/about" element={<About />} />
            <Route path="/references" element={<References />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      {!hideFloatingAI && <FloatingAIChat />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
