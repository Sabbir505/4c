import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { Users, Target, Lightbulb, Award, Mail, Globe, Heart, Sparkles, ArrowRight, Building2, ScrollText, Thermometer, Infinity as InfinityIcon, type LucideIcon } from 'lucide-react'

const BASE_PATH = import.meta.env.BASE_URL || '/'

const About = () => {
  const { t, lang } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)

  // Trigger entrance animations
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  const team = [
    { name: 'Rahber Haseen', role: lang === 'zh' ? '产品经理' : 'Product Manager', image: `${BASE_PATH}images/team/rahber-haseen.png` },
    { name: 'Salma Lahmiri', role: lang === 'zh' ? '设计师' : 'Designer', image: `${BASE_PATH}images/team/salma-lahmiri.png` },
    { name: 'Sabbir Hossain', role: lang === 'zh' ? '主开发者' : 'Main Developer', image: `${BASE_PATH}images/team/sabbir-hossain.png` },
    { name: 'Shoriful Islam', role: lang === 'zh' ? '后端开发者' : 'Custom Backend Developer', image: `${BASE_PATH}images/team/shoriful-islam.png` },
    { name: 'Hajar Zahir', role: lang === 'zh' ? '演讲者' : 'Presenter', image: `${BASE_PATH}images/team/hajar-zahir.png` },
  ]

  const features = [
    { icon: Target, title: lang === 'zh' ? '项目目标' : 'Project Goal', desc: lang === 'zh' ? '通过数字化手段传承和展示中国传统建筑的气候适应智慧，为现代可持续建筑提供灵感。' : 'Preserve and showcase climate adaptation wisdom of Chinese traditional architecture through digital means, inspiring modern sustainable design.' },
    { icon: Lightbulb, title: lang === 'zh' ? '核心理念' : 'Core Concept', desc: lang === 'zh' ? '传统智慧与现代技术的融合：运用AI、3D建模、数据可视化等技术重新诠释千年建筑智慧。' : 'Fusion of traditional wisdom and modern technology: Using AI, 3D modeling, and data visualization to reinterpret thousand-year-old architectural wisdom.' },
    { icon: Award, title: lang === 'zh' ? '项目特色' : 'Key Features', desc: lang === 'zh' ? '交互式3D模型、AI建筑顾问、气候数据可视化、多语言支持，打造沉浸式学习体验。' : 'Interactive 3D models, AI architect consultant, climate data visualization, multi-language support for an immersive learning experience.' },
  ]

  const stats: { value: string; label: string; icon: LucideIcon; gradient: string }[] = [
    { value: '15', label: lang === 'zh' ? '建筑类型' : 'Building Types', icon: Building2, gradient: 'linear-gradient(135deg, #92702d 0%, #d4a853 100%)' },
    { value: '1000+', label: lang === 'zh' ? '年历史' : 'Years of History', icon: ScrollText, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #3d6a9f 100%)' },
    { value: '20°C', label: lang === 'zh' ? '最大温差调节' : 'Max Temp Regulation', icon: Thermometer, gradient: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)' },
    { value: '∞', label: lang === 'zh' ? '智慧传承' : 'Wisdom Legacy', icon: InfinityIcon, gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
  ]

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 shine-sweep"
            style={{ backgroundColor: 'var(--temp-hot-light)', color: 'var(--temp-hot)' }}
          >
            <Heart size={14} className="animate-pulse" />
            {lang === 'zh' ? '关于我们' : 'About Us'}
          </div>
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: 'var(--text-primary)', fontFamily: "'Noto Serif SC', serif" }}
          >
            <span className="brush-underline active">TEAM VELOX</span>
          </h1>
          <p 
            className="text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {lang === 'zh' 
              ? '筑智千年是一个致力于传承中国传统建筑智慧的数字化平台，通过现代技术让千年匠心再次绽放光彩。'
              : 'ZHUZHI QIANNIAN is a digital platform dedicated to preserving Chinese traditional architectural wisdom, using modern technology to revive thousand-year-old craftsmanship.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon
            return (
              <div 
                key={idx} 
                className={`modern-card rounded-2xl p-6 text-center hover-lift shine-sweep transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${idx * 100 + 100}ms` }}
              >
                <div 
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110 hover:rotate-3 shadow-lg"
                  style={{ background: stat.gradient }}
                >
                  <IconComponent className="text-white" size={28} strokeWidth={1.5} />
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`modern-card rounded-2xl p-8 hover-lift shine-sweep transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${idx * 100 + 300}ms` }}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform hover:scale-110 hover:rotate-3"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: 'var(--text-primary)' }}
              >
                {feature.title}
              </h3>
              <p 
                className="leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className={`modern-card rounded-2xl p-8 mb-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="text-center mb-10">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: 'var(--brand-primary-glow)', color: 'var(--brand-primary)' }}
            >
              <Users size={14} />
              {lang === 'zh' ? '团队成员' : 'Our Team'}
            </div>
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('about.team')}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {team.map((member, idx) => (
              <div 
                key={idx} 
                className="text-center group stagger-item" 
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div 
                  className="w-24 h-24 mx-auto rounded-2xl mb-4 group-hover:scale-110 transition-all duration-300 overflow-hidden shadow-lg"
                  style={{ border: '3px solid var(--brand-primary)' }}
                >
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>{member.name}</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Competition Info */}
        <div 
          className={`modern-card rounded-2xl p-8 mb-16 transition-all duration-700 delay-[600ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          style={{ backgroundColor: 'var(--nav-bg)' }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0 relative">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center rotate-3 transition-transform hover:rotate-0 duration-300"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <span className="text-4xl text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>赛</span>
              </div>
              <div 
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center text-white animate-pulse"
                style={{ backgroundColor: 'var(--temp-cool)' }}
              >
                <Award size={18} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
              >
                <Sparkles size={10} style={{ color: 'var(--brand-primary)' }} />
                2026 Competition Entry
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {lang === 'zh' ? '中国大学生计算机设计大赛' : 'China Collegiate Computing Competition'}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {lang === 'zh' 
                  ? '本项目是2026年中国大学生计算机设计大赛的参赛作品，主题为"古建筑与气候适应"，旨在通过数字技术展示传统建筑的可持续发展智慧。'
                  : 'This project is an entry for the 2026 China Collegiate Computing Competition, themed "Ancient Architecture and Climate Adaptation," showcasing sustainable wisdom through digital technology.'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className={`modern-card rounded-2xl p-8 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}
            >
              <Mail size={14} />
              {lang === 'zh' ? '联系我们' : 'Contact Us'}
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('about.contact')}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {lang === 'zh' ? '欢迎与我们交流合作' : 'We welcome collaboration and feedback'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Mail, label: lang === 'zh' ? '邮箱联系' : 'Email Us', href: 'mailto:theveloxstudio@gmail.com' },
              { icon: Globe, label: lang === 'zh' ? '访问官网' : 'Visit Website', href: 'https://veloxstudio.tech' },
            ].map((item, idx) => (
              <a 
                key={idx} 
                href={item.href}
                className="btn-seal inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium group"
              >
                <item.icon size={18} />
                {item.label}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className={`text-center mt-12 text-sm transition-all duration-700 delay-[800ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ color: 'var(--text-muted)' }}>
          <p>{lang === 'zh' ? '© 2026 筑智千年团队 • 传承千年智慧，构建可持续未来' : '© 2026 ZHUZHI QIANNIAN Team • Preserving Wisdom, Building Sustainability'}</p>
        </div>
      </div>
    </div>
  )
}

export default About
