import { useState, useEffect } from 'react'
import { Sparkles, Calendar, DollarSign, Clock, Users, Lightbulb, PlusCircle, RotateCcw, Menu, X, ChevronDown } from 'lucide-react'
import { getEvents, getActiveEvent, setActiveEventId, resetToDemoState } from '../utils/storage'
import type { EventDetails } from '../types'
import { formatCompactINR } from '../utils/formatCurrency'

interface NavbarProps {
  currentTab: string
  setCurrentTab: (tab: string) => void
  onOpenCreateWizard: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCreateWizard }) => {
  const [events, setEvents] = useState<EventDetails[]>(getEvents())
  const [activeEvent, setActiveEvent] = useState<EventDetails | null>(getActiveEvent())
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const reloadEvents = () => {
    setEvents(getEvents())
    setActiveEvent(getActiveEvent())
  }

  useEffect(() => {
    window.addEventListener('eventora_active_event_changed', reloadEvents)
    window.addEventListener('eventora_data_updated', reloadEvents)
    window.addEventListener('eventora_data_reset', reloadEvents)
    return () => {
      window.removeEventListener('eventora_active_event_changed', reloadEvents)
      window.removeEventListener('eventora_data_updated', reloadEvents)
      window.removeEventListener('eventora_data_reset', reloadEvents)
    }
  }, [])

  const handleSelectEvent = (id: string) => {
    setActiveEventId(id)
    setActiveEvent(events.find(e => e.id === id) || null)
    setIsEventMenuOpen(false)
  }

  const handleReset = () => {
    if (window.confirm('Reset all demo scenarios to initial hackathon defaults? (Custom changes will be reloaded)')) {
      resetToDemoState()
      reloadEvents()
    }
  }

  const navItems = [
    { id: 'landing', label: 'Home', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'ai-planner', label: 'AI Planner', icon: Sparkles, badge: 'GenAI' },
    { id: 'budget', label: 'Smart Budget', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'ideas', label: 'Ideas Hub', icon: Lightbulb },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-violet-900/30 bg-[#070814]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-3 text-left group cursor-pointer"
              aria-label="Eventora AI Home"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                <div className="w-full h-full rounded-[11px] bg-[#0c0e24] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  Eventora <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-violet-300/80 -mt-0.5">
                  3D GenAI Event Engine
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-white bg-violet-600/20 border border-violet-500/40 shadow-sm shadow-violet-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Active Event Selector */}
            {activeEvent && currentTab !== 'landing' && (
              <div className="relative">
                <button
                  onClick={() => setIsEventMenuOpen(!isEventMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-violet-500/30 text-xs text-slate-200 hover:border-violet-500/60 transition-all cursor-pointer"
                  title="Switch Active Event"
                  aria-expanded={isEventMenuOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold max-w-[110px] sm:max-w-[160px] truncate">{activeEvent.name}</span>
                  <span className="text-violet-400 font-mono hidden sm:inline">({formatCompactINR(activeEvent.totalBudget)})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isEventMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0e1026] border border-violet-500/30 shadow-2xl p-2 z-50 backdrop-blur-2xl">
                    <div className="px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 border-b border-white/5">
                      Switch Event
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {events.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => handleSelectEvent(ev.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex flex-col gap-0.5 transition-colors cursor-pointer ${
                            ev.id === activeEvent.id ? 'bg-violet-600/25 text-white border border-violet-500/40' : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="font-semibold text-white truncate">{ev.name}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="capitalize">{ev.type}</span>
                            <span className="text-violet-300 font-mono">{formatCompactINR(ev.totalBudget)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between px-2">
                      <button
                        onClick={() => {
                          setIsEventMenuOpen(false)
                          onOpenCreateWizard()
                        }}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create New</span>
                      </button>
                      <button
                        onClick={handleReset}
                        className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                        title="Reload 3 Built-in Scenarios"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Demos</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Plan New Event CTA */}
            <button
              onClick={onOpenCreateWizard}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-md shadow-violet-600/30 hover:shadow-violet-600/50 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Plan Event</span>
              <span className="sm:hidden">Plan</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-t border-violet-900/40 bg-[#070814]/98 backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-violet-600/25 border border-violet-500/50'
                      : 'text-slate-300 hover:text-white bg-slate-900/60 border border-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                handleReset()
                setIsMobileMenuOpen(false)
              }}
              className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Scenarios</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
