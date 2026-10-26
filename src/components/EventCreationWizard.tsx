import React, { useState } from 'react'
import { Sparkles, X, ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { EventDetails, EventType, FoodPreference } from '../types'
import { saveEvent, setActiveEventId } from '../utils/storage'
import { formatINR } from '../utils/formatCurrency'

interface EventCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: (event: EventDetails) => void
}

export const EventCreationWizard: React.FC<EventCreationWizardProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const [step, setStep] = useState<number>(1)
  const totalSteps = 3

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding')
  const [name, setName] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [guestCount, setGuestCount] = useState<number>(150)
  const [totalBudget, setTotalBudget] = useState<number>(1000000) // ₹10,00,000 default
  const [theme, setTheme] = useState<string>('')
  const [foodPreference, setFoodPreference] = useState<FoodPreference>('vegetarian')
  const [priorities, setPriorities] = useState<string[]>(['luxury'])
  const [importantRequirements, setImportantRequirements] = useState<string>('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  // Fast preset fillers for judges/users
  const handleApplyPreset = (preset: 'wedding' | 'birthday' | 'community') => {
    const today = new Date()
    if (preset === 'wedding') {
      const future = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
      setEventType('wedding')
      setName("Dev & Priya's Sunset Palace Wedding")
      setDate(future.toISOString().split('T')[0])
      setLocation('Jaipur, Rajasthan')
      setGuestCount(300)
      setTotalBudget(1800000)
      setTheme('Royal Rajputana Heritage with Marigold Glow')
      setFoodPreference('vegetarian')
      setPriorities(['luxury', 'family-friendly'])
      setImportantRequirements('Outdoor mandap, live shehnai & sitar welcome, royal thali dinner')
    } else if (preset === 'birthday') {
      const future = new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000)
      setEventType('birthday')
      setName("Kabir's Retro Arcade 21st Bash")
      setDate(future.toISOString().split('T')[0])
      setLocation('Indiranagar, Bengaluru')
      setGuestCount(40)
      setTotalBudget(75000)
      setTheme('Synthwave Neon & Retro Arcade')
      setFoodPreference('all')
      setPriorities(['affordability', 'balanced'])
      setImportantRequirements('UV reactive photo zone, Mario Kart projector tournament, craft mocktail bar')
    } else {
      const future = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)
      setEventType('community')
      setName('Green Leaf Urban Gardening & Farmers Market')
      setDate(future.toISOString().split('T')[0])
      setLocation('Cubbon Park Grounds, Bengaluru')
      setGuestCount(450)
      setTotalBudget(250000)
      setTheme('Zero-Waste, Upcycled & Sustainable Living')
      setFoodPreference('vegan')
      setPriorities(['sustainability', 'family-friendly'])
      setImportantRequirements('No single-use plastic, community composting workshop, indie acoustic stage')
    }
    setErrors({})
  }

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!name.trim()) errs.name = 'Please provide an event name'
      if (!date) errs.date = 'Please pick an event date'
      if (!location.trim()) errs.location = 'Please specify city or venue location'
    } else if (s === 2) {
      if (!guestCount || guestCount <= 0) errs.guestCount = 'Guest count must be at least 1'
      if (!totalBudget || totalBudget <= 0) errs.totalBudget = 'Total budget must be greater than ₹0'
    } else if (s === 3) {
      if (!theme.trim()) errs.theme = 'Please provide a preferred theme or vibe'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setErrors({})
    setStep(step - 1)
  }

  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter(item => item !== p))
    } else {
      setPriorities([...priorities, p])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    const newEvent: EventDetails = {
      id: `evt-${Date.now()}`,
      name: name.trim(),
      type: eventType,
      date,
      location: location.trim(),
      guestCount: Number(guestCount),
      totalBudget: Number(totalBudget),
      theme: theme.trim(),
      foodPreference,
      priorities,
      importantRequirements: importantRequirements.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveEvent(newEvent)
    setActiveEventId(newEvent.id)

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch {}

    onEventCreated(newEvent)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0d0f28] border border-violet-500/30 shadow-2xl shadow-violet-950/60 overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-violet-950/50 via-slate-900/50 to-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create New Event</h2>
              <p className="text-xs text-slate-400">Step {step} of {totalSteps}: {step === 1 ? 'Core Event Basics' : step === 2 ? 'Guest Scale & Budget' : 'Theme & Preferences'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close creation wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1.5">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Preset Shortcuts */}
        <div className="px-6 pt-4 pb-2 flex flex-wrap items-center gap-2 border-b border-white/5 bg-slate-900/30">
          <span className="text-[11px] font-semibold text-slate-400">⚡ Auto-fill Preset:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('wedding')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-950/60 text-violet-300 border border-violet-500/30 hover:bg-violet-900/60 transition-colors cursor-pointer"
          >
            Palace Wedding
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('birthday')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 transition-colors cursor-pointer"
          >
            Retro Birthday
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('community')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            Community Eco-Fest
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* STEP 1: Core Details */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Event Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['wedding', 'birthday', 'community', 'custom'] as EventType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer capitalize text-xs font-semibold ${
                        eventType === type
                          ? 'border-violet-500 bg-violet-600/25 text-white shadow-lg shadow-violet-500/20'
                          : 'border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg mb-1">
                        {type === 'wedding' ? '💍' : type === 'birthday' ? '🎂' : type === 'community' ? '🌱' : '✨'}
                      </div>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav & Diya's Sangeet & Reception"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 text-sm transition-all"
                />
                {errors.name && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white focus:outline-hidden focus:border-violet-500 text-sm transition-all"
                  />
                  {errors.date && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Location / City *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Udaipur, Rajasthan or Bengaluru"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 text-sm transition-all"
                  />
                  {errors.location && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.location}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scale & Budget */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Expected Number of Guests *
                  </label>
                  <span className="text-sm font-extrabold text-violet-400 font-mono">{guestCount} Guests</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white text-sm font-mono focus:outline-hidden focus:border-violet-500"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100, 250, 500].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGuestCount(cnt)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-violet-600/30 hover:text-white transition-colors cursor-pointer"
                    >
                      {cnt} pax
                    </button>
                  ))}
                </div>
                {errors.guestCount && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.guestCount}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Total Event Budget (INR ₹) *
                  </label>
                  <span className="text-lg font-black text-amber-300 font-mono">
                    {formatINR(totalBudget)}
                  </span>
                </div>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white text-base font-mono focus:outline-hidden focus:border-violet-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[50000, 150000, 500000, 1500000, 3000000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTotalBudget(amt)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-violet-600/30 hover:text-white transition-colors cursor-pointer"
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>
                {errors.totalBudget && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.totalBudget}</p>}
              </div>
            </div>
          )}

          {/* STEP 3: Theme, Preferences & Priorities */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Preferred Theme or Aesthetic *
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Royal Marigold Rajputana, Minimalist Botanical, Cyberpunk Neon"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 text-sm"
                />
                {errors.theme && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.theme}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Catering & Food Preference
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['vegetarian', 'all', 'vegan', 'jain', 'halal', 'multi-cuisine'] as FoodPreference[]).map(fp => (
                    <button
                      key={fp}
                      type="button"
                      onClick={() => setFoodPreference(fp)}
                      className={`px-2 py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                        foodPreference === fp
                          ? 'border-violet-500 bg-violet-600/30 text-white'
                          : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {fp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Key Priorities (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'luxury', label: '✨ Luxury & Opulence' },
                    { id: 'affordability', label: '💰 Budget Conscious' },
                    { id: 'sustainability', label: '🌱 Eco & Zero-Waste' },
                    { id: 'family-friendly', label: '👨‍👩‍👧 Family-Friendly' },
                    { id: 'balanced', label: '⚖️ Balanced Quality' }
                  ].map(p => {
                    const isSelected = priorities.includes(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePriority(p.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'border-violet-400 bg-violet-600/30 text-white'
                            : 'border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                        <span>{p.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Important Notes & Special Requirements
                </label>
                <textarea
                  value={importantRequirements}
                  onChange={(e) => setImportantRequirements(e.target.value)}
                  rows={2}
                  placeholder="e.g. Wheelchair access needed, lakeside ceremony, quiet seating for senior family members"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 text-xs"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 border border-white/10 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-xl shadow-violet-600/40 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Blueprint</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  )
}
