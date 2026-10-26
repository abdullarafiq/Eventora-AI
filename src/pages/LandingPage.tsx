import React, { lazy, Suspense } from 'react'
import { Sparkles, ArrowRight, ShieldCheck, PieChart, CalendarCheck, Users, Wand2, Compass, Layers, CheckCircle2, ChevronRight, Zap } from 'lucide-react'
import { DEMO_SCENARIOS } from '../utils/demoData'
import { setActiveEventId } from '../utils/storage'

const ThreeCelebrationScene = lazy(() => import('../components/ThreeCelebrationScene').then(m => ({ default: m.ThreeCelebrationScene })))

interface LandingPageProps {
  onPlanEvent: () => void
  onExploreDemo: () => void
  onNavigateTab: (tab: string) => void
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlanEvent,
  onExploreDemo,
  onNavigateTab
}) => {
  const handleLoadScenario = (scenarioKey: 'wedding' | 'birthday' | 'community') => {
    const sc = DEMO_SCENARIOS[scenarioKey]
    if (sc) {
      setActiveEventId(sc.id)
      onExploreDemo()
    }
  }

  const features = [
    {
      id: 'ai-planning',
      title: 'GenAI Planning Assistant',
      description: 'Generates cohesive themes, lighting concepts, dietary menus, venue criteria, and cost-saving alternatives in seconds.',
      icon: Wand2,
      color: 'from-violet-500 to-indigo-600',
      actionTab: 'ai-planner'
    },
    {
      id: 'smart-budget',
      title: 'Smart INR Budget Manager',
      description: 'Visual category allocations, live estimated vs actual tracking, and AI-driven warnings when approaching limits.',
      icon: PieChart,
      color: 'from-cyan-500 to-blue-600',
      actionTab: 'budget'
    },
    {
      id: 'timeline-automation',
      title: 'Timeline Automation',
      description: 'Dynamic 90-60-30-14-7 day milestones intelligently adapted to your target event date with overdue alerts.',
      icon: CalendarCheck,
      color: 'from-pink-500 to-rose-600',
      actionTab: 'timeline'
    },
    {
      id: 'vendor-hub',
      title: 'Vendor Management Hub',
      description: 'Streamlined tracking across 8 key event categories from initial outreach and shortlisting to confirmed booking.',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
      actionTab: 'vendors'
    }
  ]

  const steps = [
    {
      step: '01',
      title: 'Tell AI Your Vision',
      description: 'Specify your event type, guest count, city, and total budget in INR. Add any theme or dietary preferences.',
      icon: Compass
    },
    {
      step: '02',
      title: 'AI Generates Full Blueprint',
      description: 'Our GenAI engine creates structured budget buckets, vendor checklists, decor suggestions, and daily timelines.',
      icon: Sparkles
    },
    {
      step: '03',
      title: 'Manage & Celebrate',
      description: 'Track real-time expenses, check off milestones, and collaborate seamlessly with your vendors until event day.',
      icon: Layers
    }
  ]

  return (
    <div className="relative overflow-hidden">
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-20 left-1/4 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-60 right-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 text-xs font-semibold backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
              <span>Next-Gen Event Intelligence Engine</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Your Dream Event.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-300">
                Perfectlly Planned
              </span>{' '}
              by AI.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Eventora AI turns the complexity of weddings, birthdays, and community gatherings into a seamless, joyful journey. Get custom themes, structured INR budgets, intelligent timelines, and vendor checklists customized to your exact guest count.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onPlanEvent}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Plan My Event</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-violet-500/30 hover:border-violet-500/60 shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-5 h-5 text-cyan-400" />
                <span>Explore Live Demo</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Hallucinated Numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>INR Currency Formatting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span>No API Key Needed (Demo Mode)</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Celebration Visualizer */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-square rounded-3xl p-1 bg-gradient-to-b from-violet-500/30 via-cyan-500/20 to-transparent shadow-2xl shadow-violet-900/40">
              <div className="w-full h-full rounded-[23px] overflow-hidden bg-[#0a0c20]/90 border border-white/10 relative">
                <Suspense fallback={
                  <div className="w-full h-full min-h-[380px] flex items-center justify-center bg-[#0a0c20]/90">
                    <div className="flex flex-col items-center gap-2">
                      <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
                      <span className="text-xs text-slate-400">Loading 3D Celebration...</span>
                    </div>
                  </div>
                }>
                  <ThreeCelebrationScene className="w-full h-full min-h-[380px]" interactive={true} />
                </Suspense>
                
                {/* Floating Metric Card Overlay */}
                <div className="absolute top-4 left-4 z-10 glass-panel px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 flex items-center justify-center text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Engine</div>
                    <div className="text-xs font-bold text-white">Eventora GenAI 3.0</div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 z-10 glass-panel px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Budget Guard</div>
                    <div className="text-xs font-bold text-white">₹ Recalculation Live</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Instant Demo Scenarios Selector Section */}
      <section className="py-12 bg-slate-950/60 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">Pre-Loaded Hackathon Showcases</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Instant Scenarios</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md mt-2 md:mt-0">
              Select any curated event to test budget balances, timelines, AI recommendations, and vendor bookings immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Scenario 1: Wedding */}
            <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 hover:border-violet-500/70 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-600/30 text-violet-300 border border-violet-500/30">
                    Grand Wedding
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-300">₹25.0 Lakh</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                  Royal Udaipur Palace Wedding
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  Lakeside mandap, 350 guests, Rajasthani royal feast, cinematic drone crew, and 7 vendors.
                </p>
              </div>

              <button
                onClick={() => handleLoadScenario('wedding')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600/30 hover:bg-violet-600 border border-violet-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Wedding Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scenario 2: Birthday */}
            <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 hover:border-cyan-500/70 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-600/30 text-cyan-300 border border-cyan-500/30">
                    Boutique Birthday
                  </span>
                  <span className="font-mono text-sm font-bold text-cyan-300">₹85,000</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Neon Cyberpunk 25th Bash
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  Bengaluru rooftop lounge, UV blacklights, Mario Kart bracket, 45 guests, and fluorescent drinks.
                </p>
              </div>

              <button
                onClick={() => handleLoadScenario('birthday')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600/30 hover:bg-cyan-600 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Birthday Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scenario 3: Community Event */}
            <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 hover:border-emerald-500/70 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
                    Community Eco-Fair
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-300">₹3.5 Lakh</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Green Horizon Zero-Waste Fair
                </h3>
                <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                  Bandra amphitheatre, 600 visitors, zero single-use plastic, 30 student volunteers, and acoustic sets.
                </p>
              </div>

              <button
                onClick={() => handleLoadScenario('community')}
                className="mt-6 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Launch Community Demo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">Comprehensive Capabilities</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Built for Every Phase of Event Planning</h2>
          <p className="text-sm text-slate-300 mt-3">
            From initial brainstorm to day-of run of show, Eventora AI delivers deep structure, live mathematical accuracy, and creative inspiration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            return (
              <div
                key={feat.id}
                className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} p-[1px] mb-5`}>
                    <div className="w-full h-full rounded-[15px] bg-[#0c0e24] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                </div>

                <button
                  onClick={() => onNavigateTab(feat.actionTab)}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  <span>Open {feat.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Three Step "How It Works" Section */}
      <section className="py-20 bg-gradient-to-b from-slate-950/40 via-violet-950/20 to-slate-950/40 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Effortless Workflow</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Eventora AI Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st) => {
              const Icon = st.icon
              return (
                <div key={st.step} className="relative glass-panel p-8 rounded-3xl border border-white/10 flex flex-col items-start">
                  <div className="text-4xl font-black text-violet-500/30 mb-4">{st.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-4">
                    <Icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{st.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{st.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#05060f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full rounded-[7px] bg-[#0c0e24] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold text-white">Eventora AI</span>
              <p className="text-xs text-slate-400">3D GenAI Event Planning Assistant</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button onClick={() => onNavigateTab('dashboard')} className="hover:text-white transition-colors cursor-pointer">Dashboard</button>
            <button onClick={() => onNavigateTab('ai-planner')} className="hover:text-white transition-colors cursor-pointer">AI Blueprint</button>
            <button onClick={() => onNavigateTab('budget')} className="hover:text-white transition-colors cursor-pointer">Smart Budget</button>
            <button onClick={() => onNavigateTab('timeline')} className="hover:text-white transition-colors cursor-pointer">Timeline Planner</button>
            <button onClick={() => onNavigateTab('vendors')} className="hover:text-white transition-colors cursor-pointer">Vendor Directory</button>
            <button onClick={() => onNavigateTab('ideas')} className="hover:text-white transition-colors cursor-pointer">Creative Ideas</button>
          </div>

          <div className="text-xs text-slate-400">
            Engineered with React 19, TypeScript, Tailwind CSS & Three.js
          </div>
        </div>
      </footer>

    </div>
  )
}
