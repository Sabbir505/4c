import { useState, useRef, useEffect } from 'react'
import { Send, Camera, Loader2, Bot, User, X, Image as ImageIcon, Minimize2, Maximize2, Trash2, Search, BookOpen, PenLine, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '../context/LanguageContext'
import { chatWithAIStream, analyzeImageStream, type Message as AIMessage, type AssistantPhase } from '../services/aiService'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
}

const detectMessageLanguage = (text: string): 'zh' | 'en' => {
  if (/\p{Script=Han}/u.test(text)) return 'zh'
  return 'en'
}

const FLOATING_CHAT_STORAGE_KEY = 'zhuzhi-floating-chat-history'

const FloatingAIChat = () => {
  const { lang } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const welcomeMessage: Message = {
    role: 'assistant',
    content: lang === 'zh'
      ? '你好！我是「虚拟建筑师」🏛️，可以为你解答关于传统中国建筑与气候适应的问题。\n\n📸 也支持上传建筑照片进行识别分析！'
      : 'Hello! I\'m "The Virtual Architect" 🏛️, here to answer your questions about traditional Chinese architecture and climate adaptation.\n\n📸 You can also upload building photos for analysis!'
  }

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(FLOATING_CHAT_STORAGE_KEY)
      return saved ? JSON.parse(saved) : [welcomeMessage]
    } catch {
      return [welcomeMessage]
    }
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingImage, setPendingImage] = useState<{ base64: string; previewUrl: string } | null>(null)
  const [responseLang, setResponseLang] = useState<'zh' | 'en'>(lang)
  const [assistantPhase, setAssistantPhase] = useState<AssistantPhase>('thinking')
  const [hasStreamStarted, setHasStreamStarted] = useState(false)
  const [activityTick, setActivityTick] = useState(0)
  const streamingAssistantIndexRef = useRef<number | null>(null)
  const chunkBufferRef = useRef('')
  const flushTimerRef = useRef<number | null>(null)

  // Persist chat history
  useEffect(() => {
    localStorage.setItem(FLOATING_CHAT_STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isOpen])

  useEffect(() => {
    if (!loading || hasStreamStarted) return
    const timer = setInterval(() => {
      setActivityTick(prev => prev + 1)
    }, 950)
    return () => clearInterval(timer)
  }, [loading, hasStreamStarted])

  const flushBufferedChunks = () => {
    const content = chunkBufferRef.current
    const targetIndex = streamingAssistantIndexRef.current
    if (!content || targetIndex === null) return
    chunkBufferRef.current = ''
    setMessages(prev => {
      if (!prev[targetIndex] || prev[targetIndex].role !== 'assistant') return prev
      const next = [...prev]
      next[targetIndex] = { ...next[targetIndex], content: `${next[targetIndex].content}${content}` }
      return next
    })
  }

  const scheduleFlush = () => {
    if (flushTimerRef.current !== null) return
    flushTimerRef.current = window.setInterval(() => {
      flushBufferedChunks()
    }, 45)
  }

  const stopFlush = () => {
    flushBufferedChunks()
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current)
      flushTimerRef.current = null
    }
  }

  const clearChat = () => {
    setMessages([welcomeMessage])
    setPendingImage(null)
    localStorage.removeItem(FLOATING_CHAT_STORAGE_KEY)
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await fileToBase64(file)
      const previewUrl = URL.createObjectURL(file)
      setPendingImage({ base64, previewUrl })
    } catch {
      // silently fail
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl)
      setPendingImage(null)
    }
  }

  const handleSend = async () => {
    if (loading) return
    if (!input.trim() && !pendingImage) return

    const userText = input.trim()
    const imageToSend = pendingImage
    const requestLang = detectMessageLanguage(userText || '')
    setResponseLang(requestLang)

    const languageDirective = requestLang === 'zh'
      ? '\n\n请使用中文回答，保持专业且简洁。'
      : '\n\nPlease respond in English, keeping the answer professional and concise.'
    const modelPrompt = userText ? `${userText}${languageDirective}` : userText

    setInput('')
    setPendingImage(null)

    const userMessage: Message = {
      role: 'user',
      content: userText || (requestLang === 'zh' ? '请分析这张建筑照片' : 'Please analyze this building photo'),
      image: imageToSend ? imageToSend.previewUrl : undefined,
    }
    setMessages(prev => {
      const next = [...prev, userMessage, { role: 'assistant' as const, content: '' }]
      streamingAssistantIndexRef.current = next.length - 1
      return next
    })
    setLoading(true)
    setHasStreamStarted(false)
    setActivityTick(0)
    setAssistantPhase('thinking')

    try {
      if (imageToSend) {
        await analyzeImageStream(imageToSend.base64, modelPrompt || undefined, requestLang, {
          onPhase: (phase) => setAssistantPhase(phase),
          onToken: (chunk) => {
            setHasStreamStarted(true)
            chunkBufferRef.current += chunk
            scheduleFlush()
          }
        })
      } else {
        const history: AIMessage[] = messages.map(m => ({ role: m.role, content: m.content }))
        await chatWithAIStream(modelPrompt, history, {
          onPhase: (phase) => setAssistantPhase(phase),
          onToken: (chunk) => {
            setHasStreamStarted(true)
            chunkBufferRef.current += chunk
            scheduleFlush()
          }
        })
      }
    } catch {
      stopFlush()
      setMessages(prev => {
        const targetIndex = streamingAssistantIndexRef.current
        if (targetIndex !== null && prev[targetIndex]?.role === 'assistant') {
          const next = [...prev]
          next[targetIndex] = {
            ...next[targetIndex],
            content: next[targetIndex].content || (requestLang === 'zh' ? '抱歉，发生了错误。请重试。' : 'Sorry, an error occurred. Please try again.')
          }
          return next
        }
        const next = [...prev]
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === 'assistant') {
            next[i] = {
              ...next[i],
              content: next[i].content || (requestLang === 'zh' ? '抱歉，发生了错误。请重试。' : 'Sorry, an error occurred. Please try again.')
            }
            break
          }
        }
        return next
      })
    } finally {
      stopFlush()
      streamingAssistantIndexRef.current = null
      setLoading(false)
    }
  }

  const phaseHeadline = responseLang === 'zh'
    ? {
        thinking: '正在理解你的问题',
        researching: '正在检索相关知识',
        writing: '正在组织回答',
      }
    : {
        thinking: 'Understanding your question',
        researching: 'Gathering relevant context',
        writing: 'Composing response',
      }

  const dynamicActivities = responseLang === 'zh'
    ? [
        { icon: Search, label: '分析提问意图与场景' },
        { icon: BookOpen, label: '匹配建筑与气候知识' },
        { icon: Sparkles, label: '提炼关键结论与建议' },
        { icon: PenLine, label: '生成结构化回复内容' },
      ]
    : [
        { icon: Search, label: 'Analyzing intent and context' },
        { icon: BookOpen, label: 'Matching architecture-climate knowledge' },
        { icon: Sparkles, label: 'Extracting key takeaways' },
        { icon: PenLine, label: 'Drafting structured response' },
      ]

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(var(--brand-primary-rgb,139,92,46),0.4)] z-[9999] group"
          style={{ background: 'var(--gradient-brand)' }}
          title={lang === 'zh' ? 'AI 建筑顾问' : 'AI Architecture Consultant'}
        >
          <Bot size={24} className="text-white" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'var(--gradient-brand)' }} />
          {/* Tooltip */}
          <span
            className="absolute right-16 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none"
            style={{ backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
          >
            {lang === 'zh' ? 'AI 建筑顾问' : 'AI Consultant'}
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-[9999] shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'bottom-4 right-4 left-4 top-20 sm:left-auto sm:w-[600px] sm:top-20 sm:bottom-4'
              : 'bottom-6 right-6 w-[380px] h-[520px]'
          }`}
          style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                <span className="text-sm text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>匠</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">
                  {lang === 'zh' ? '虚拟建筑师' : 'Virtual Architect'}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/70 text-[10px]">
                    {lang === 'zh' ? '在线 · 支持图片' : 'Online · Photo support'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
                title={lang === 'zh' ? '清空聊天' : 'Clear chat'}
              >
                <Trash2 size={14} className="text-white/80" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
                title={isExpanded ? (lang === 'zh' ? '缩小' : 'Minimize') : (lang === 'zh' ? '放大' : 'Expand')}
              >
                {isExpanded ? <Minimize2 size={14} className="text-white/80" /> : <Maximize2 size={14} className="text-white/80" />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsExpanded(false) }}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/20"
                title={lang === 'zh' ? '关闭' : 'Close'}
              >
                <X size={14} className="text-white/80" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 mr-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                      style={{ background: 'var(--gradient-brand)' }}
                    >
                      <span className="text-[10px] text-white" style={{ fontFamily: "'Noto Serif SC', serif" }}>匠</span>
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                  }`}
                  style={msg.role === 'user'
                    ? { background: 'var(--gradient-brand)', color: 'white' }
                    : { backgroundColor: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }
                  }
                >
                  {msg.image && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={msg.image} alt="Uploaded" className="w-full max-h-40 object-cover rounded-lg" />
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    loading && idx === streamingAssistantIndexRef.current && !msg.content.trim() ? (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Loader2 size={12} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
                          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                            {phaseHeadline[assistantPhase]}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {dynamicActivities.map((item, activityIdx) => {
                            const Icon = item.icon
                            const activeIndex = activityTick % dynamicActivities.length
                            const isActive = activityIdx === activeIndex
                            return (
                              <div key={item.label} className="flex items-center gap-2" style={{ opacity: isActive ? 1 : 0.45 }}>
                                <Icon size={10} className={isActive ? 'animate-pulse' : ''} style={{ color: 'var(--brand-primary)' }} />
                                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs leading-relaxed [&_h1]:text-sm [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:font-bold [&_h3]:mt-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:font-bold [&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <div className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 ml-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                      style={{ background: 'var(--gradient-brand)' }}
                    >
                      <User size={12} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="p-3 flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-card)', borderTop: '1px solid var(--border-default)' }}
          >
            {/* Pending image preview */}
            {pendingImage && (
              <div className="mb-2 relative inline-block">
                <img
                  src={pendingImage.previewUrl}
                  alt="Pending upload"
                  className="h-16 w-16 object-cover rounded-lg border-2"
                  style={{ borderColor: 'var(--brand-primary)' }}
                />
                <button
                  onClick={removePendingImage}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                >
                  <X size={10} />
                </button>
                <div
                  className="absolute bottom-0 left-0 right-0 text-center text-[8px] py-0.5 rounded-b-lg font-medium"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white' }}
                >
                  <ImageIcon size={7} className="inline mr-0.5" />
                  {lang === 'zh' ? '已附图' : 'Attached'}
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

            <div
              className="flex gap-2 p-2 rounded-lg items-center"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={pendingImage
                  ? (lang === 'zh' ? '关于图片的问题（可选）...' : 'Ask about this photo (optional)...')
                  : (lang === 'zh' ? '询问建筑与气候...' : 'Ask about architecture...')
                }
                className="flex-1 px-2 py-1 bg-transparent text-xs focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-1.5 rounded-lg transition-all disabled:opacity-50 flex-shrink-0"
                style={{
                  backgroundColor: pendingImage ? 'var(--brand-primary)' : 'transparent',
                  color: pendingImage ? 'white' : 'var(--text-muted)',
                }}
                title={lang === 'zh' ? '上传建筑照片' : 'Upload building photo'}
              >
                <Camera size={16} />
              </button>
              <button
                onClick={handleSend}
                disabled={loading || (!input.trim() && !pendingImage)}
                className="btn-seal px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingAIChat
