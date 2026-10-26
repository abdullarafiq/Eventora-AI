import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, CheckCircle2, DollarSign, Calendar, Users, Lightbulb, Palette, Utensils, Music, Building, Check, FileText } from 'lucide-react'
import type { EventDetails, AIGeneratedPlan, ExpenseItem, TimelineTask, VendorItem } from '../types'
import { getActiveEvent, getEventPlan, saveEventPlan, saveExpense, saveTask, saveVendor } from '../utils/storage'
import { formatINR } from '../utils/formatCurrency'
import { calculateDueDate } from '../utils/dateUtils'
import { generateClientPlan } from '../utils/aiClientFallback'

interface AiPlannerPageProps {
  onNavigateTab: (tab: string) => void
  onOpenCreateWizard: () => void
}

export const AiPlannerPage: React.FC<AiPlannerPageProps> = ({ onNavigateTab, onOpenCreateWizard }) => {
  const [event, setEvent] = useState<EventDetails | null>(() => getActiveEvent())
  const [plan, setPlan] = useState<AIGeneratedPlan | null>(() => {
    const active = getActiveEvent()
    return active ? getEventPlan(active.id) : null
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<'concept' | 'decor' | 'food' | 'entertainment' | 'venue' | 'budget' | 'timeline' | 'vendors' | 'savings'>('concept')
  const [applySuccess, setApplySuccess] = useState<boolean>(false)
  const [customPrompt, setCustomPrompt] = useState<string>('')

  const reloadData = () => {
    const active = getActiveEvent()
    setEvent(active)
    if (active) {
      const existingPlan = getEventPlan(active.id)
      setPlan(existingPlan)
    }
  }

  useEffect(() => {
    window.addEventListener('eventora_active_event_changed', reloadData)
    window.addEventListener('eventora_data_updated', reloadData)
    return () => {
      window.removeEventListener('eventora_active_event_changed', reloadData)
      window.removeEventListener('eventora_data_updated', reloadData)
    }
  }, [])

  const handleGeneratePlan = async () => {
    if (!event) return
    setLoading(true)
    setApplySuccess(false)

    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            ...event,
            importantRequirements: customPrompt ? `${event.importantRequirements}. Additional request: ${customPrompt}` : event.importantRequirements
          }
        })
      })

      if (response.ok) {
        const generated: AIGeneratedPlan = await response.json()
        saveEventPlan(event.id, generated)
        setPlan(generated)
      } else {
        throw new Error('API request returned error')
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable, generating via dynamic client engine:', err)
      const generated = generateClientPlan({
        ...event,
        importantRequirements: customPrompt ? `${event.importantRequirements}. Note: ${customPrompt}` : event.importantRequirements
      })
      saveEventPlan(event.id, generated)
      setPlan(generated)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyBlueprintToTracker = () => {
    if (!plan || !event) return

    // Inject budget allocation baselines into expense tracker if empty
    plan.budgetAllocations.forEach(alloc => {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: event.id,
        title: `${alloc.category.toUpperCase()}: ${alloc.notes.split(',')[0]}`,
        category: alloc.category,
        estimatedCost: alloc.allocatedAmount,
        actualCost: 0,
        isPaid: false,
        createdAt: new Date().toISOString()
      }
      saveExpense(newExp)
    })

    // Inject timeline milestones
    plan.timelineMilestones.forEach(m => {
      const newTask: TimelineTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: event.id,
        title: m.title,
        description: m.description,
        category: m.category,
        dueDate: calculateDueDate(event.date, m.milestoneDaysBefore),
        priority: m.priority,
        completed: false,
        milestoneDaysBefore: m.milestoneDaysBefore
      }
      saveTask(newTask)
    })

    // Inject vendors
    plan.vendorChecklist.forEach(v => {
      const newVendor: VendorItem = {
        id: `ven-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        eventId: event.id,
        name: v.name,
        category: v.category as any,
        estimatedCost: v.estimatedCost,
        status: v.status,
        notes: v.notes,
        isSample: false
      }
      saveVendor(newVendor)
    })

    setApplySuccess(true)
    setTimeout(() => setApplySuccess(false), 4000)
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Event Selected</h2>
          <p className="text-xs text-slate-400 mb-6">Create your event or switch to one of the demo scenarios to view its AI plan.</p>
          <button
            onClick={onOpenCreateWizard}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 cursor-pointer shadow-lg"
          >
            Create Event Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner / Event Context */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/30">
                {event.type}
              </span>
              <span className="text-xs text-slate-400">
                {event.location} • {event.guestCount} Guests
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                Budget: {formatINR(event.totalBudget)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Theme: <strong className="text-violet-300">{event.theme}</strong> • Diet: <strong className="capitalize text-slate-200">{event.foodPreference}</strong>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Synthesizing...' : plan ? 'Regenerate Plan' : 'Generate AI Plan'}</span>
            </button>

            {plan && (
              <button
                onClick={handleApplyBlueprintToTracker}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-violet-500/30 flex items-center gap-2 cursor-pointer transition-all"
                title="Populate your expenses and timeline with this AI blueprint"
              >
                {applySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{applySuccess ? 'Applied to Trackers!' : 'Apply to Event Plan'}</span>
              </button>
            )}

            {applySuccess && (
              <button
                onClick={() => onNavigateTab('budget')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 cursor-pointer transition-colors"
              >
                Open Budget →
              </button>
            )}
          </div>
        </div>

        {/* Custom AI Prompt Input */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Ask AI for special tweaks (e.g. 'Emphasize outdoor acoustic music', 'Include gluten-free dessert ideas')..."
            className="w-full px-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
          />
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-violet-950/80 hover:bg-violet-900 text-violet-200 border border-violet-500/30 shrink-0 cursor-pointer transition-colors"
          >
            Refine with AI
          </button>
        </div>
      </div>

      {/* Model Attribution Badge */}
      {plan && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Generated via <strong className="text-slate-200">{plan.modelUsed || 'Eventora AI Intelligent Engine'}</strong></span>
          </div>
          <span className="text-slate-400">
            * All prices are realistic estimations for planning purposes, not binding quotes.
          </span>
        </div>
      )}

      {/* Navigation Pills for 9 Plan Sections */}
      {plan && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'concept', label: 'Theme & Concept', icon: Palette },
            { id: 'decor', label: 'Decor & Lighting', icon: Sparkles },
            { id: 'food', label: 'Food & Catering', icon: Utensils },
            { id: 'entertainment', label: 'Entertainment & Flow', icon: Music },
            { id: 'venue', label: 'Venue Criteria', icon: Building },
            { id: 'budget', label: 'Budget Allocations', icon: DollarSign },
            { id: 'timeline', label: 'Milestones', icon: Calendar },
            { id: 'vendors', label: 'Vendor Checklist', icon: Users },
            { id: 'savings', label: 'Cost-Saving Alternatives', icon: Lightbulb },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeSection === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'glass-panel text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Content Display Panels */}
      {plan ? (
        <div className="animate-fade-in">
          
          {/* SECTION 1: THEME & CONCEPT */}
          {activeSection === 'concept' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">Concept Blueprint</div>
                  <h3 className="text-2xl font-bold text-white">{plan.conceptAndTheme.title}</h3>
                  <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                    {plan.conceptAndTheme.narrative}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-violet-950/30 border border-violet-500/20">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Atmosphere & Mood</div>
                  <div className="text-sm text-violet-200 font-medium">{plan.conceptAndTheme.atmosphere}</div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Curated Color Palette</h4>
                  <div className="flex flex-wrap gap-4">
                    {plan.conceptAndTheme.colorPalette.map((hex, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-white/10">
                        <div className="w-8 h-8 rounded-lg shadow-md border border-white/20" style={{ backgroundColor: hex }} />
                        <span className="font-mono text-xs text-slate-200 uppercase">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personalized recommendations sidebar */}
              <div className="md:col-span-4 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-violet-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Personalized Tips</span>
                </div>
                <div className="space-y-3">
                  {plan.personalizedRecommendations.map((rec, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: DECOR & LIGHTING */}
          {activeSection === 'decor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                <div className="flex items-center gap-2.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Decoration Blueprint</span>
                </div>
                <div className="space-y-3">
                  {plan.decorAndLighting.suggestions.map((sug, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
                <div className="flex items-center gap-2.5 text-pink-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Focal Stage & Lighting Masterplan</span>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/20">
                  <div className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-1">Highlight Anchor</div>
                  <p className="text-xs sm:text-sm text-slate-200">{plan.decorAndLighting.highlights}</p>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Lighting Architecture</div>
                  <p className="text-xs sm:text-sm text-slate-200">{plan.decorAndLighting.lightingStyle}</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FOOD & CATERING */}
          {activeSection === 'food' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Gastronomy & Beverage Plan</div>
                  <h3 className="text-xl font-bold text-white mt-1">Curated Culinary Experience</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {plan.foodAndCatering.serviceStyle}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plan.foodAndCatering.menuConcepts.map((menu, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300 mb-2">Station {i + 1}</div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{menu}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-200 font-medium">
                  <strong>Dietary Protocol:</strong> {plan.foodAndCatering.dietaryNotes}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ENTERTAINMENT & ACTIVITIES */}
          {activeSection === 'entertainment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Signature Activities</div>
                <div className="space-y-3">
                  {plan.entertainmentAndActivities.activities.map((act, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm text-slate-200 flex items-start gap-3">
                      <Music className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Event Run-of-Show Phases</div>
                <div className="space-y-3">
                  {plan.entertainmentAndActivities.scheduleHighlights.map((hl, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm text-slate-200 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {i + 1}
                      </span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: VENUE CRITERIA */}
          {activeSection === 'venue' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Location & Infrastructure</div>
                <h3 className="text-xl font-bold text-white mt-1">Venue Selection Specifications</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Recommended Venue Category</div>
                  <div className="text-base font-bold text-white">{plan.venueSelectionCriteria.recommendedType}</div>
                  <div className="text-xs text-cyan-300 font-mono">
                    Capacity Target: {plan.venueSelectionCriteria.capacityNeeded}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Mandatory Must-Haves</div>
                  <div className="space-y-2">
                    {plan.venueSelectionCriteria.mustHaves.map((mh, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{mh}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: BUDGET ALLOCATIONS */}
          {activeSection === 'budget' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Mathematical Model</div>
                  <h3 className="text-xl font-bold text-white mt-1">Category-wise Budget Allocation</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Event Budget: </span>
                  <span className="text-base font-black text-amber-300 font-mono">{formatINR(event.totalBudget)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.budgetAllocations.map((alloc) => (
                  <div key={alloc.category} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200 capitalize">
                        {alloc.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-violet-400">{alloc.percentage}%</span>
                    </div>
                    <div className="text-base font-black text-white font-mono">{formatINR(alloc.allocatedAmount)}</div>
                    <p className="text-[11px] text-slate-400 leading-tight">{alloc.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: TIMELINE MILESTONES */}
          {activeSection === 'timeline' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Automated Schedule</div>
                <h3 className="text-xl font-bold text-white mt-1">Recommended Milestones</h3>
              </div>

              <div className="space-y-3">
                {plan.timelineMilestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-600/30 text-violet-300 border border-violet-500/30">
                          {m.milestoneDaysBefore === 0 ? 'Event Day' : `T-${m.milestoneDaysBefore} Days`}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{m.category}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{m.title}</div>
                      <p className="text-xs text-slate-300">{m.description}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase self-start sm:self-center ${
                      m.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: VENDOR CHECKLIST */}
          {activeSection === 'vendors' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Vendor Readiness</div>
                <h3 className="text-xl font-bold text-white mt-1">Vendor Checklist & Cost Baselines</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.vendorChecklist.map((ven, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-slate-400 capitalize">{ven.category}</span>
                        <span className="text-xs font-mono font-bold text-cyan-300">{formatINR(ven.estimatedCost)}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{ven.name}</div>
                      <p className="text-xs text-slate-300 mt-1">{ven.notes}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Target Status:</span>
                      <span className="capitalize font-semibold text-violet-300">{ven.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 9: COST-SAVING ALTERNATIVES */}
          {activeSection === 'savings' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Practical Optimization</div>
                <h3 className="text-xl font-bold text-white mt-1">AI Cost-Saving Alternatives</h3>
                <p className="text-xs text-slate-400 mt-1">Smart swaps that preserve aesthetics and guest experience while cutting unnecessary expenses.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plan.costSavingAlternatives.map((alt, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                        Alternative #{i + 1}
                      </div>
                      <div className="text-sm font-bold text-white mb-2 leading-snug">{alt.tip}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{alt.impact}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Potential Savings:</span>
                      <span className="font-mono text-sm font-black text-emerald-300">
                        {formatINR(alt.potentialSavings)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center max-w-xl mx-auto space-y-4">
          <Sparkles className="w-12 h-12 text-violet-400 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-white">Generate Your Event Blueprint</h3>
          <p className="text-xs sm:text-sm text-slate-300">
            Eventora AI will synthesize theme ideas, decor palettes, catering concepts, mathematically sound budget allocations, vendor checklists, and timeline milestones.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-xl shadow-violet-600/30 cursor-pointer"
          >
            {loading ? 'Synthesizing Blueprint...' : 'Click to Generate Blueprint Now'}
          </button>
        </div>
      )}

    </div>
  )
}
