import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { Heart, Github, Mail, ArrowRight } from 'lucide-react'

const Footer = () => {
  const { lang } = useLanguage()

  const navLinks = [
    { path: '/', label: lang === 'zh' ? '首页' : 'Home' },
    { path: '/map', label: lang === 'zh' ? '互动地图' : 'Map' },
    { path: '/comparison', label: lang === 'zh' ? '建筑对比' : 'Compare' },
    { path: '/ai-consultant', label: lang === 'zh' ? 'AI咨询' : 'AI Consultant' },
    { path: '/data-hub', label: lang === 'zh' ? '数据中心' : 'Data Hub' },
    { path: '/archive', label: lang === 'zh' ? '文献档案' : 'Archive' },
    { path: '/about', label: lang === 'zh' ? '关于' : 'About' },
  ]

  return (
    <footer style={{ backgroundColor: 'var(--nav-bg)' }} role="contentinfo" aria-label={lang === 'zh' ? '网站页脚' : 'Site footer'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <span className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Serif SC', serif" }}>构</span>
              </div>
              <div>
                <div className="text-white font-bold" style={{ fontFamily: "'Noto Serif SC', serif" }}>筑智千年</div>
                <div className="text-white/50 text-xs tracking-widest uppercase">ZHUZHI QIANNIAN</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              {lang === 'zh'
                ? '传承千年建筑智慧，构建可持续未来。通过AI、3D建模与数据可视化，重新诠释传统建筑的气候适应策略。'
                : 'Preserving ancient architectural wisdom for a sustainable future. Reinterpreting climate adaptation through AI, 3D modeling, and data visualization.'}
            </p>
            <div
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              🏆 2026 China Collegiate Computing Competition
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label={lang === 'zh' ? '页脚导航' : 'Footer navigation'}>
            <h4 className="text-white font-semibold mb-4">{lang === 'zh' ? '快速导航' : 'Quick Links'}</h4>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-1 group py-1"
                >
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Tech Stack & Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{lang === 'zh' ? '技术栈' : 'Tech Stack'}</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {['React 19', 'TypeScript', 'Vite 7', 'Three.js', 'ECharts', 'TailwindCSS 4', 'GLM-4.5-Air:free'].map(tech => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-xs text-white/70 transition-colors hover:text-white"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <a
                href="https://github.com/Rahber001/Ancient-Wisdom-for-Sustainable-Architecture"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg transition-colors hover:bg-white/10"
                aria-label="GitHub Repository"
              >
                <Github size={18} className="text-white/60" />
              </a>
              <a
                href="mailto:contact@zhuzhi-qiannian.com"
                className="p-2.5 rounded-lg transition-colors hover:bg-white/10"
                aria-label={lang === 'zh' ? '发送邮件' : 'Send email'}
              >
                <Mail size={18} className="text-white/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Team Velox • {lang === 'zh' ? '筑智千年' : 'ZHUZHI QIANNIAN'}
          </p>
          <p className="text-white/40 text-sm flex items-center gap-1">
            {lang === 'zh' ? '用' : 'Made with'}{' '}
            <Heart size={12} className="text-red-400" />{' '}
            {lang === 'zh' ? '打造' : 'by Team Velox'}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
