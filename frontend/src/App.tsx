import { useState, useRef, useEffect } from 'react'
import {
  Input, Button, Typography, Tag, Space, message,
  Badge, Avatar
} from 'antd'
import {
  SearchOutlined, PlayCircleOutlined,
  TeamOutlined, DollarCircleOutlined,
  WarningOutlined, CheckCircleOutlined, QuestionCircleOutlined,
  SoundOutlined, FireOutlined, BarChartOutlined, BookOutlined,
  RocketOutlined, GlobalOutlined, FileTextOutlined,
  ThunderboltOutlined, EyeOutlined, ClockCircleOutlined,
  AimOutlined, PauseCircleOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

const { Title, Paragraph, Text } = Typography

const API_URL = 'http://localhost:4000'

interface IntelData {
  company: string
  prospect: string
  scrapedData: any
  searchResults: any
  summary: {
    companyOverview: string
    painPoints: string[]
    talkingPoints: string[]
    objections: string[]
    personalConnection: string
    discoveryQuestions: string[]
    redFlags: string[]
    greenFlags: string[]
  }
}

type AppState = 'input' | 'researching' | 'intel' | 'practice'

interface LogItem {
  id: string
  icon: React.ReactNode
  text: string
  subtext?: string
  status: 'pending' | 'active' | 'complete'
  progress?: number
}

function App() {
  const [state, setState] = useState<AppState>('input')
  const [companyUrl, setCompanyUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [prospectName, setProspectName] = useState('')
  const [yourProduct, setYourProduct] = useState('B2B Sales Platform')
  const [intel, setIntel] = useState<IntelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversation, setConversation] = useState<{role: 'ai' | 'user', text: string}[]>([])
  const [showModal, setShowModal] = useState(false)
  const [responseInput, setResponseInput] = useState('')

  // Agent activity log state
  const [logItems, setLogItems] = useState<LogItem[]>([])

  const speak = (text: string) => {
    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = 0.9
    utterance.rate = 1

    const voices = speechSynthesis.getVoices()
    const maleVoice = voices.find(v =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('mark')
    )
    if (maleVoice) utterance.voice = maleVoice

    utterance.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  const addMessage = (role: 'ai' | 'user', text: string) => {
    setConversation(prev => [...prev, { role, text }])
  }

  const startResearch = async () => {
    if (!companyUrl) {
      message.error('Please enter a company website URL')
      return
    }

    setLoading(true)
    setState('researching')

    // Initialize activity log
    setLogItems([
      { id: '1', icon: <GlobalOutlined />, text: 'Connecting to website', subtext: companyUrl, status: 'active' },
      { id: '2', icon: <FileTextOutlined />, text: 'Extracting company intel', subtext: 'About, team, products', status: 'pending' },
      { id: '3', icon: <SearchOutlined />, text: 'Searching for news & funding', subtext: 'Recent mentions', status: 'pending' },
      { id: '4', icon: <ThunderboltOutlined />, text: 'Analyzing with AI', subtext: 'Generating pitch strategy', status: 'pending' },
    ])

    try {
      const response = await axios.post(`${API_URL}/api/research/full-research`, {
        companyUrl,
        prospectName,
        companyName: companyName || new URL(companyUrl).hostname,
        yourProduct
      })

      if (response.data.success) {
        // Update log to show completion
        setLogItems(prev => prev.map(item => ({ ...item, status: 'complete' as const })))
        setIntel(response.data)
        setTimeout(() => {
          setState('intel')
          message.success('Research complete!')
        }, 800)
      }
    } catch (error: any) {
      console.error('Research failed:', error)
      message.error(`Research failed: ${error.response?.data?.error || error.message}`)
      setState('input')
    } finally {
      setLoading(false)
    }
  }

  const startPractice = () => {
    setConversation([])
    setState('practice')

    // Initial greeting from AI after short delay
    setTimeout(() => {
      const greeting = `Hi, I'm ${prospectName || 'the prospect'} from ${intel?.company}. Thanks for making time. Walk me through what you do and why I should care?`
      addMessage('ai', greeting)
      speak(greeting)
    }, 1000)
  }

  const submitResponse = () => {
    if (!responseInput.trim()) return

    addMessage('user', responseInput)
    setShowModal(false)
    setResponseInput('')

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Interesting. But here's my concern - how is this different from what we already have?",
        "Okay, but what would that actually look like for our team?",
        "I like the direction, but I need to understand the ROI better.",
        "Hmm, you've got my attention. Go on.",
        "That's a fair point. Tell me more about implementation.",
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      addMessage('ai', response)
      speak(response)
    }, 1200)
  }

  const endPractice = () => {
    setIsSpeaking(false)
    setIsListening(false)
    speechSynthesis.cancel()
    setState('intel')
  }

  // Simulate log progression during research
  useEffect(() => {
    if (state === 'researching') {
      const timers = [
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '1' ? { ...item, status: 'complete' } : item
          ))
        }, 1500),
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '2' ? { ...item, status: 'active', progress: 50 } : item
          ))
        }, 1800),
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '2' ? { ...item, status: 'complete' } : item
          ))
        }, 2500),
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '3' ? { ...item, status: 'active' } : item
          ))
        }, 2800),
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '3' ? { ...item, status: 'complete' } : item
          ))
        }, 3500),
        setTimeout(() => {
          setLogItems(prev => prev.map(item =>
            item.id === '4' ? { ...item, status: 'active' } : item
          ))
        }, 3800),
      ]

      return () => timers.forEach(clearTimeout)
    }
  }, [state])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <AimOutlined style={{ fontSize: 20, color: 'white' }} />
          </div>
          <span className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>
            Pitch Twin
          </span>
        </div>
        <Badge
          status={state === 'practice' ? 'processing' : 'success'}
          text={state === 'practice' ? 'AI Practice Session' : 'Ready to Research'}
          style={{ fontSize: 13 }}
        />
      </header>

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">

          {/* INPUT STATE */}
          {state === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="input-container"
            >
              <div className="hero-section">
                <Title style={{ fontSize: 42, marginBottom: 16 }}>
                  <span className="gradient-text">Practice with their AI twin</span>
                </Title>
                <Paragraph>
                  5 minutes before your call, get complete intel and practice
                  with an AI that knows everything about your prospect.
                </Paragraph>
              </div>

              <div className="input-card">
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div className="input-label">
                      <GlobalOutlined />
                      Company Website
                    </div>
                    <Input
                      size="large"
                      placeholder="https://stripe.com"
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div className="input-label">
                        <TeamOutlined />
                        Prospect Name
                      </div>
                      <Input
                        size="large"
                        placeholder="John Smith"
                        value={prospectName}
                        onChange={(e) => setProspectName(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="input-label">
                        <DollarCircleOutlined />
                        Company Name
                      </div>
                      <Input
                        size="large"
                        placeholder="Acme Inc"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="input-label">
                      <RocketOutlined />
                      Your Product
                    </div>
                    <Input
                      size="large"
                      placeholder="What are you selling?"
                      value={yourProduct}
                      onChange={(e) => setYourProduct(e.target.value)}
                    />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    onClick={startResearch}
                    loading={loading}
                    icon={<FireOutlined />}
                    style={{
                      height: 52,
                      fontSize: 16,
                      marginTop: 8
                    }}
                  >
                    {loading ? 'Researching...' : 'Generate Pitch Prep'}
                  </Button>
                </Space>
              </div>
            </motion.div>
          )}

          {/* RESEARCHING STATE */}
          {state === 'researching' && (
            <motion.div
              key="researching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="researching-container"
            >
              <div className="agent-status">
                <div className="agent-orb-container">
                  <div className="orb-glow" />
                  <div className="agent-orb thinking active">
                    <ThunderboltOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                </div>

                <div>
                  <Title level={2} style={{ marginBottom: 8 }}>
                    Researching <span className="gradient-text">{companyName || 'Company'}</span>
                  </Title>
                  <Paragraph>Our AI agent is gathering intelligence...</Paragraph>
                </div>

                <div className="activity-log">
                  <div className="activity-log-title">
                    <EyeOutlined /> Agent Activity
                  </div>
                  {logItems.map((item) => (
                    <div key={item.id} className="log-item">
                      <div className={`log-icon ${item.status}`}>
                        {item.status === 'complete' ? <CheckCircleOutlined /> :
                         item.status === 'active' ? <ClockCircleOutlined spin /> :
                         <ClockCircleOutlined />}
                      </div>
                      <div className="log-content">
                        <div className="log-text">{item.text}</div>
                        {item.subtext && <div className="log-subtext">{item.subtext}</div>}
                        {item.progress && (
                          <div className="log-progress">
                            <div className="log-progress-bar" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INTEL STATE */}
          {state === 'intel' && intel && (
            <motion.div
              key="intel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="intel-container"
            >
              <div className="intel-header">
                <div className="intel-title-section">
                  <Title level={2} style={{ marginBottom: 8 }}>
                    Pitch Intelligence: <span className="gradient-text">{intel.company}</span>
                  </Title>
                  <Paragraph style={{ margin: 0 }}>
                    Prepared for call with {prospectName || 'the prospect'}
                  </Paragraph>
                </div>
                <Button
                  type="primary"
                  size="large"
                  onClick={startPractice}
                  icon={<PlayCircleOutlined />}
                  className="practice-btn"
                >
                  Start Voice Practice
                </Button>
              </div>

              <div className="intel-grid">
                {/* Company Overview */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon green">
                      <DollarCircleOutlined />
                    </div>
                    <span className="intel-card-title">Company Overview</span>
                  </div>
                  <div className="intel-card-body">
                    {intel.summary.companyOverview}
                  </div>
                </div>

                {/* Pain Points */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon orange">
                      <WarningOutlined />
                    </div>
                    <span className="intel-card-title">Pain Points</span>
                  </div>
                  <div>
                    {intel.summary.painPoints.map((point, i) => (
                      <Tag key={i} className="tag-pain" style={{ marginBottom: 8 }}>
                        {point}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Talking Points */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon indigo">
                      <AimOutlined />
                    </div>
                    <span className="intel-card-title">Talking Points</span>
                  </div>
                  <div>
                    {intel.summary.talkingPoints.map((point, i) => (
                      <Tag key={i} className="tag-talk" style={{ marginBottom: 8 }}>
                        {point}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Discovery Questions */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon purple">
                      <BookOutlined />
                    </div>
                    <span className="intel-card-title">Discovery Questions</span>
                  </div>
                  <div>
                    {intel.summary.discoveryQuestions.map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                        <QuestionCircleOutlined style={{ color: '#8b5cf6', marginTop: 3, flexShrink: 0 }} />
                        <Text style={{ color: '#475569', fontSize: 14 }}>{q}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="intel-grid">
                {/* Objections */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon red">
                      <PauseCircleOutlined />
                    </div>
                    <span className="intel-card-title">Expected Objections</span>
                  </div>
                  <div>
                    {intel.summary.objections.map((obj, i) => (
                      <Tag key={i} className="tag-objection" style={{ marginBottom: 8 }}>
                        {obj}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Buying Signals */}
                <div className="intel-card">
                  <div className="intel-card-header">
                    <div className="intel-card-icon blue">
                      <BarChartOutlined />
                    </div>
                    <span className="intel-card-title">Buying Signals</span>
                  </div>
                  <div>
                    {intel.summary.greenFlags.map((flag, i) => (
                      <Tag key={i} className="tag-green" icon={<CheckCircleOutlined />} style={{ marginBottom: 8 }}>
                        {flag}
                      </Tag>
                    ))}
                    {intel.summary.redFlags.map((flag, i) => (
                      <Tag key={i} className="tag-red" icon={<WarningOutlined />} style={{ marginBottom: 8 }}>
                        {flag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PRACTICE STATE */}
          {state === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="practice-container"
            >
              <div className="practice-orb-wrapper">
                <div className="orb-glow" />
                <div className={`agent-orb ${isSpeaking ? 'active' : ''}`}>
                  <SoundOutlined style={{ fontSize: 32, color: 'white' }} />
                </div>
              </div>

              <div className="practice-status">
                {isSpeaking ? (
                  <><ThunderboltOutlined /> <span>AI is speaking...</span></>
                ) : isListening ? (
                  <><SoundOutlined /> <span>Listening...</span></>
                ) : (
                  <><TeamOutlined /> <span>Your turn to respond</span></>
                )}
              </div>

              <div className="conversation-history">
                {conversation.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>

              <div className="practice-controls">
                <button
                  className="mic-btn"
                  onClick={() => setShowModal(true)}
                  title="Type your response"
                >
                  <SoundOutlined style={{ fontSize: 24, color: 'white' }} />
                </button>
                <button className="end-btn" onClick={endPractice}>
                  End Practice
                </button>
              </div>

              {/* Response Modal */}
              {showModal && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'fade-in 0.2s ease-out'
                  }}
                  onClick={() => setShowModal(false)}
                >
                  <div
                    style={{
                      background: 'white',
                      borderRadius: 16,
                      padding: 24,
                      width: '90%',
                      maxWidth: 500,
                      boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
                      animation: 'expand-in 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Title level={4} style={{ marginBottom: 16 }}>Your Response</Title>
                    <Input.TextArea
                      rows={4}
                      placeholder="Type your response..."
                      value={responseInput}
                      onChange={(e) => setResponseInput(e.target.value)}
                      style={{ marginBottom: 16, fontSize: 15 }}
                      autoFocus
                      onPressEnter={(e) => {
                        if (!e.shiftKey) {
                          e.preventDefault()
                          submitResponse()
                        }
                      }}
                    />
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button
                        type="primary"
                        onClick={submitResponse}
                        disabled={!responseInput.trim()}
                      >
                        Send
                      </Button>
                    </Space>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="footer">
        <Text className="footer-text">
          Built with Firecrawl + ElevenLabs for the 11Labs Hackathon 2026
        </Text>
      </footer>
    </div>
  )
}

export default App
