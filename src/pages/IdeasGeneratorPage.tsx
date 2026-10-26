import React, { useState, useEffect } from 'react'
import {
  Sparkles, Bookmark, BookmarkCheck, Plus, Check, Search
} from 'lucide-react'
import type { EventIdea, EventDetails, TimelineTask } from '../types'
import { getActiveEvent, getSavedIdeas, saveIdea, toggleSaveIdea, saveTask } from '../utils/storage'
import { calculateDueDate } from '../utils/dateUtils'

export const IdeasGeneratorPage: React.FC = () => {
  const [event, setEvent] = useState<EventDetails | null>(getActiveEvent())
  const [ideas, setIdeas] = useState<EventIdea[]>(getSavedIdeas())
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [addedTaskId, setAddedTaskId] = useState<string | null>(null)

  const reloadData = () => {
    setEvent(getActiveEvent())
    setIdeas(getSavedIdeas())
  }

  useEffect(() => {
    window.addEventListener('eventora_active_event_changed', reloadData)
    window.addEventListener('eventora_data_updated', reloadData)
    return () => {
      window.removeEventListener('eventora_active_event_changed', reloadData)
      window.removeEventListener('eventora_data_updated', reloadData)
    }
  }, [])

  const categories = [
    'all',
    'Sustainable Ideas',
    'Food & Beverage',
    'Decor & Theme',
    'Activities & Tech',
    'Entertainment',
    'Cost Optimization'
  ]

  const filteredIdeas = ideas.filter(idea => {
    const matchCat = categoryFilter === 'all' || idea.category === categoryFilter
    const matchSaved = !showSavedOnly || idea.isSaved
    const matchSearch = !searchQuery || 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchCat && matchSaved && matchSearch
  })

  const handleToggleBookmark = (ideaId: string) => {
    toggleSaveIdea(ideaId)
    setIdeas(getSavedIdeas())
  }

  const handleAddToPlan = (idea: EventIdea) => {
    if (!event) return

    const newTask: TimelineTask = {
      id: `task-idea-${Date.now()}`,
      eventId: event.id,
      title: `Explore Idea: ${idea.title}`,
      description: `${idea.description} (${idea.estimatedBudgetImpact})`,
      category: idea.category,
      dueDate: calculateDueDate(event.date, 30),
      priority: 'medium',
      completed: false,
      milestoneDaysBefore: 30
    }

    saveTask(newTask)
    setAddedTaskId(idea.id)
    setTimeout(() => setAddedTaskId(null), 3000)
  }

  const handleGenerateFreshIdeas = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event?.type || 'wedding',
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          userPrompt: searchQuery || undefined,
          budget: event?.totalBudget
        })
      })

      if (response.ok) {
        const fresh: EventIdea[] = await response.json()
        fresh.forEach(item => saveIdea(item))
        setIdeas(getSavedIdeas())
      }
    } catch (err) {
      console.warn('Backend unavailable, injecting heuristic inspiration:', err)
      // Fallback custom idea injection
      const fallbackIdea: EventIdea = {
        id: `idea-local-${Date.now()}`,
        title: searchQuery ? `Creative Concept: ${searchQuery}` : 'Thematic Interactive Guest Wall',
        category: categoryFilter !== 'all' ? categoryFilter : 'Decor & Theme',
        description: 'Provide an artistic interactive board with Polaroid snaps, written audio-guestbook recordings, and QR code souvenir playlists.',
        estimatedBudgetImpact: 'Budget positive (replaces 2 expensive single-use stage props)',
        tags: ['Interactive', 'Modern', event?.type || 'Event'],
        isSaved: false
      }
      saveIdea(fallbackIdea)
      setIdeas(getSavedIdeas())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Creative Ideation Studio</span>
            {event && <span className="text-xs text-slate-400">• Tailored for {event.name}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Personalized Ideas Generator</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Explore budget-friendly themes, zero-waste decor setups, novel guest activities, and practical ways to save without losing elegance.
          </p>
        </div>

        <button
          onClick={handleGenerateFreshIdeas}
          disabled={loading}
          className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all self-start lg:self-auto disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Thinking...' : 'Generate New Ideas'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ideas, themes, or keywords..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                categoryFilter === c
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Saved Only Toggle */}
        <button
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
            showSavedOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
          }`}
        >
          {showSavedOnly ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
          <span>Saved Ideas ({ideas.filter(i => i.isSaved).length})</span>
        </button>
      </div>

      {/* Ideas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => {
          const isAdded = addedTaskId === idea.id
          return (
            <div
              key={idea.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-600/20 text-violet-300 border border-violet-500/30">
                    {idea.category}
                  </span>

                  <button
                    onClick={() => handleToggleBookmark(idea.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                    title={idea.isSaved ? 'Remove from saved' : 'Save idea'}
                    aria-label={idea.isSaved ? `Unsave ${idea.title}` : `Save ${idea.title}`}
                  >
                    {idea.isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{idea.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{idea.description}</p>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-emerald-300 font-medium">
                  {idea.estimatedBudgetImpact}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {idea.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-white/5">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action: Add to Plan */}
              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={() => handleAddToPlan(idea)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Added to Timeline Tasks!' : 'Add to Event Plan'}</span>
                </button>
              </div>
            </div>
          )
        })}

        {filteredIdeas.length === 0 && (
          <div className="col-span-full glass-panel p-12 rounded-3xl border border-white/10 text-center text-xs text-slate-400">
            No ideas found matching your criteria. Try adjusting filters or click "Generate New Ideas".
          </div>
        )}
      </div>

    </div>
  )
}
