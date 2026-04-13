import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Map, GitCompare, MessageSquare, BarChart3, BookOpen, Info, Menu, X, Globe, Sun, Moon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/map', label: t('nav.map'), icon: Map },
    { path: '/comparison', label: t('nav.compare'), icon: GitCompare },
    { path: '/ai-consultant', label: t('nav.ai'), icon: MessageSquare },
    { path: '/data-hub', label: t('nav.data'), icon: BarChart3 },
    { path: '/archive', label: t('nav.archive'), icon: BookOpen },
    { path: '/about', label: t('nav.about'), icon: Info },
  ]

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-lg' : ''
      }`}
      style={{ 
        backgroundColor: scrolled ? 'var(--nav-bg-scrolled)' : 'var(--nav-bg)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div 
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                style={{ 
                  background: 'var(--gradient-brand)',
                  boxShadow: '0 4px 12px var(--brand-primary-glow)'
                }}
              >
                <span className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Serif SC', serif" }}>构</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                筑智千年
              </span>
              <span className="text-[10px] text-white/50 -mt-0.5 tracking-widest uppercase">
                ZHUZHI QIANNIAN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-lg"
                      style={{ 
                        background: 'var(--gradient-brand)',
                        opacity: 0.15
                      }}
                    />
                  )}
                  <Icon size={16} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ background: 'var(--gradient-brand)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="relative p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <div className="relative w-5 h-5">
                <Sun 
                  size={20} 
                  className={`absolute inset-0 text-amber-400 transition-all duration-300 ${
                    theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                  }`} 
                />
                <Moon 
                  size={20} 
                  className={`absolute inset-0 text-amber-300 transition-all duration-300 ${
                    theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                  }`} 
                />
              </div>
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10"
            >
              <Globe size={16} className="text-white/70" />
              <span className="text-sm font-medium text-white/90">
                {lang === 'zh' ? 'EN' : '中'}
              </span>
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative w-5 h-5">
                <X 
                  size={20} 
                  className={`absolute inset-0 text-white transition-all duration-300 ${
                    isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                  }`} 
                />
                <Menu 
                  size={20} 
                  className={`absolute inset-0 text-white transition-all duration-300 ${
                    isOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'
                  }`} 
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-1 border-t border-white/10">
            {/* Mobile Theme & Language */}
            <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-white/10">
              <button 
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white transition-all"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                <span className="text-sm font-medium">
                  {theme === 'dark' ? (lang === 'zh' ? '深色' : 'Dark') : (lang === 'zh' ? '浅色' : 'Light')}
                </span>
              </button>
              <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white transition-all"
              >
                <Globe size={16} />
                <span className="text-sm font-medium">{lang === 'zh' ? 'English' : '中文'}</span>
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/15 text-white' 
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div 
                    className={`p-2 rounded-lg ${isActive ? '' : 'bg-white/10'}`}
                    style={isActive ? { background: 'var(--gradient-brand)' } : {}}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : ''} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div 
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--brand-primary)' }}
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar