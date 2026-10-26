import React, { useState, useEffect } from 'react'
import {
  Sparkles, PlusCircle, CheckCircle2, Lightbulb, ChevronRight
} from 'lucide-react'
import type { EventDetails, ExpenseItem, TimelineTask, VendorItem, EventIdea } from '../types'
import {
  getEvents, getActiveEvent, getExpenses, getTasks, getVendors,
  getSavedIdeas, setActiveEventId
} from '../utils/storage'
import { formatINR, formatCompactINR } from '../utils/formatCurrency'
import { calculateDaysRemaining, formatDateReadable } from '../utils/dateUtils'

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void
  onOpenCreateWizard: () => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenCreateWizard
}) => {
  const [events, setEvents] = useState<EventDetails[]>(getEvents())
  const [activeEvent, setActiveEvent] = useState<EventDetails | null>(getActiveEvent())
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [tasks, setTasks] = useState<TimelineTask[]>([])
  const [vendors, setVendors] = useState<VendorItem[]>([])
  const [ideas, setIdeas] = useState<EventIdea[]>(getSavedIdeas())

  const reloadData = () => {
    const allEvents = getEvents()
    setEvents(allEvents)
    const active = getActiveEvent()
    setActiveEvent(active)
    if (active) {
      setExpenses(getExpenses(active.id))
      setTasks(getTasks(active.id))
      setVendors(getVendors(active.id))
    }
    setIdeas(getSavedIdeas())
  }

  useEffect(() => {
    reloadData()
    window.addEventListener('eventora_active_event_changed', reloadData)
    window.addEventListener('eventora_data_updated', reloadData)
    window.addEventListener('eventora_data_reset', reloadData)
    return () => {
      window.removeEventListener('eventora_active_event_changed', reloadData)
      window.removeEventListener('eventora_data_updated', reloadData)
      window.removeEventListener('eventora_data_reset', reloadData)
    }
  }, [])

  // Calculations for Active Event
  const daysRemaining = activeEvent ? calculateDaysRemaining(activeEvent.date) : 0
  const totalBudget = activeEvent?.totalBudget || 0
  const totalEstimated = expenses.reduce((s, e) => s + (e.estimatedCost || 0), 0)
  const totalActual = expenses.reduce((s, e) => s + (e.actualCost || 0), 0)
  const remainingBudget = totalBudget - (totalActual > 0 ? totalActual : totalEstimated)
  const isOverBudget = remainingBudget < 0

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalVendors = vendors.length
  const bookedVendors = vendors.filter(v => v.status === 'booked' || v.status === 'completed').length

  const recentTasks = tasks.slice(0, 4)
  const recentVendors = vendors.slice(0, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Welcome & Event Overview Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-600/30 text-violet-300 border border-violet-500/30">
                {activeEvent ? activeEvent.type : 'Event Planner'}
              </span>
              <span className="text-xs text-slate-400">
                {activeEvent ? `${activeEvent.location} • ${activeEvent.guestCount} Guests` : 'Welcome to Eventora AI'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {activeEvent ? activeEvent.name : 'Welcome to Eventora AI'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {activeEvent ? (
                <>Theme: <strong className="text-violet-300">{activeEvent.theme}</strong> • Target Date: <strong className="text-white">{formatDateReadable(activeEvent.date)}</strong></>
              ) : (
                'Create an event or explore one of the interactive demo scenarios below.'
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateWizard}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </button>

            <button
              onClick={() => onNavigateTab('ai-planner')}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-violet-500/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>AI Blueprint</span>
            </button>
          </div>
        </div>

        {/* Days Countdown & Quick Stats */}
        {activeEvent && (
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] uppercase font-bold text-slate-400">Event Countdown</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5">
                {daysRemaining > 0 ? `${daysRemaining} Days` : 'Today!'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] uppercase font-bold text-slate-400">Target Budget</div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                {formatCompactINR(totalBudget)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] uppercase font-bold text-slate-400">Timeline Progress</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-300 font-mono mt-0.5">
                {taskProgress}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="text-[11px] uppercase font-bold text-slate-400">Vendors Booked</div>
              <div className="text-xl sm:text-2xl font-black text-pink-300 font-mono mt-0.5">
                {bookedVendors} / {totalVendors}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Budget & Tasks */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Smart Budget Summary Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Budget Health</div>
                <h3 className="text-lg font-bold text-white">Expense Tracking Summary</h3>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Budget</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Projected Estimate</div>
                <div className="text-lg font-bold text-cyan-300 font-mono mt-1">{formatINR(totalEstimated)}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-xs text-slate-400">Actual Realized</div>
                <div className="text-lg font-bold text-pink-300 font-mono mt-1">{formatINR(totalActual)}</div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isOverBudget ? 'bg-rose-950/20 border-rose-500/40 text-rose-300' : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="text-xs opacity-80">{isOverBudget ? 'Budget Deficit' : 'Remaining Balance'}</div>
                <div className="text-lg font-bold font-mono mt-1">{formatINR(remainingBudget)}</div>
              </div>
            </div>

            {/* Spending progress meter */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Budget Spent Proportion</span>
                <span className="font-mono text-slate-200">
                  {totalBudget > 0 ? Math.round(((totalActual || totalEstimated) / totalBudget) * 100) : 0}% of {formatINR(totalBudget)}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, totalBudget > 0 ? ((totalActual || totalEstimated) / totalBudget) * 100 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pending Milestones / Tasks Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-pink-400">Preparation Flow</div>
                <h3 className="text-lg font-bold text-white">Upcoming Timeline Milestones</h3>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Timeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${t.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <div>
                      <div className={`font-semibold ${t.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {t.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{t.category} • Due {formatDateReadable(t.dueDate)}</div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}

              {recentTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  No timeline tasks yet. Open the Timeline planner or AI blueprint to generate them.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Vendors & Saved Ideas */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Vendor Quick Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Partners</div>
                <h3 className="text-base font-bold text-white">Vendor Status</h3>
              </div>
              <button
                onClick={() => onNavigateTab('vendors')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentVendors.map((v) => (
                <div key={v.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{v.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{v.category}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-950/40 text-cyan-300 border border-cyan-500/30">
                    {v.status.replace('_', ' ')}
                  </span>
                </div>
              ))}

              {recentVendors.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500">
                  No vendors recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Saved AI Ideas Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Saved Creative Ideas</h3>
              </div>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Explore</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {ideas.filter(i => i.isSaved).slice(0, 3).map((idea) => (
                <div key={idea.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1">
                  <div className="font-bold text-white">{idea.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Switcher for Other Events */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">All Planned Events</div>
            <div className="space-y-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setActiveEventId(ev.id)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    ev.id === activeEvent?.id
                      ? 'border-violet-500 bg-violet-600/25 text-white'
                      : 'border-white/5 bg-white/5 text-slate-300 hover:border-white/15'
                  }`}
                >
                  <div>
                    <div className="font-bold">{ev.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{ev.type} • {ev.location}</div>
                  </div>
                  <span className="font-mono text-violet-300 font-bold">{formatCompactINR(ev.totalBudget)}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
