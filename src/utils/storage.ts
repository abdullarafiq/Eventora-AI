import type { EventDetails, ExpenseItem, TimelineTask, VendorItem, AIGeneratedPlan, EventIdea } from '../types'

const STORAGE_KEYS = {
  ACTIVE_EVENT_ID: 'eventora_active_event_id',
  EVENTS: 'eventora_events',
  EXPENSES: 'eventora_expenses',
  TASKS: 'eventora_tasks',
  VENDORS: 'eventora_vendors',
  PLANS: 'eventora_plans',
  SAVED_IDEAS: 'eventora_saved_ideas',
  REDUCED_MOTION: 'eventora_reduced_motion',
}

/**
 * Initializes local storage on-demand with default scenarios if empty (dynamic import to avoid blocking critical bundle)
 */
export async function initializeStorage(): Promise<void> {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const { DEMO_SCENARIOS, INITIAL_IDEAS } = await import('./demoData')
    const defaultScenarios = Object.values(DEMO_SCENARIOS)
    
    const events: EventDetails[] = defaultScenarios.map(s => s.event)
    const expenses: ExpenseItem[] = defaultScenarios.flatMap(s => s.expenses)
    const tasks: TimelineTask[] = defaultScenarios.flatMap(s => s.tasks)
    const vendors: VendorItem[] = defaultScenarios.flatMap(s => s.vendors)
    const plans: Record<string, AIGeneratedPlan> = {}
    defaultScenarios.forEach(s => {
      plans[s.id] = s.plan
    })

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors))
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans))
    localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(INITIAL_IDEAS))
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, 'demo-wedding')
    window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'initialized' }))
  }
}

// Event getters & setters
export function getEvents(): EventDetails[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEvent(event: EventDetails): void {
  const events = getEvents()
  const index = events.findIndex(e => e.id === event.id)
  if (index >= 0) {
    events[index] = event
  } else {
    events.unshift(event)
  }
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
  setActiveEventId(event.id)
}

export function deleteEvent(eventId: string): void {
  const events = getEvents().filter(e => e.id !== eventId)
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))

  // Also clean up related items
  const expenses = getExpenses(eventId).filter(e => e.eventId !== eventId)
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))

  const tasks = getTasks(eventId).filter(t => t.eventId !== eventId)
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))

  const vendors = getVendors(eventId).filter(v => v.eventId !== eventId)
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors))

  if (getActiveEventId() === eventId) {
    if (events.length > 0) {
      setActiveEventId(events[0].id)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT_ID)
    }
  }
}

export function getActiveEventId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID)
}

export function setActiveEventId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id)
  window.dispatchEvent(new CustomEvent('eventora_active_event_changed', { detail: id }))
}

export function getActiveEvent(): EventDetails | null {
  const id = getActiveEventId()
  const events = getEvents()
  if (!id && events.length > 0) {
    return events[0]
  }
  return events.find(e => e.id === id) || events[0] || null
}

// Expenses
export function getExpenses(eventId?: string): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES)
    const all: ExpenseItem[] = raw ? JSON.parse(raw) : []
    return eventId ? all.filter(e => e.eventId === eventId) : all
  } catch {
    return []
  }
}

export function saveExpense(expense: ExpenseItem): void {
  const all = getExpenses()
  const index = all.findIndex(e => e.id === expense.id)
  if (index >= 0) {
    all[index] = expense
  } else {
    all.push(expense)
  }
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'expenses' }))
}

export function deleteExpense(expenseId: string): void {
  const all = getExpenses().filter(e => e.id !== expenseId)
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'expenses' }))
}

// Tasks
export function getTasks(eventId?: string): TimelineTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
    const all: TimelineTask[] = raw ? JSON.parse(raw) : []
    return eventId ? all.filter(t => t.eventId === eventId) : all
  } catch {
    return []
  }
}

export function saveTask(task: TimelineTask): void {
  const all = getTasks()
  const index = all.findIndex(t => t.id === task.id)
  if (index >= 0) {
    all[index] = task
  } else {
    all.push(task)
  }
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'tasks' }))
}

export function deleteTask(taskId: string): void {
  const all = getTasks().filter(t => t.id !== taskId)
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'tasks' }))
}

// Vendors
export function getVendors(eventId?: string): VendorItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VENDORS)
    const all: VendorItem[] = raw ? JSON.parse(raw) : []
    return eventId ? all.filter(v => v.eventId === eventId) : all
  } catch {
    return []
  }
}

export function saveVendor(vendor: VendorItem): void {
  const all = getVendors()
  const index = all.findIndex(v => v.id === vendor.id)
  if (index >= 0) {
    all[index] = vendor
  } else {
    all.push(vendor)
  }
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'vendors' }))
}

export function deleteVendor(vendorId: string): void {
  const all = getVendors().filter(v => v.id !== vendorId)
  localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(all))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'vendors' }))
}

// AI Plans
export function getEventPlan(eventId: string): AIGeneratedPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS)
    if (!raw) return null
    const plans: Record<string, AIGeneratedPlan> = JSON.parse(raw)
    return plans[eventId] || null
  } catch {
    return null
  }
}

export function saveEventPlan(eventId: string, plan: AIGeneratedPlan): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS)
    const plans: Record<string, AIGeneratedPlan> = raw ? JSON.parse(raw) : {}
    plans[eventId] = plan
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans))
    window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'plan' }))
  } catch (err) {
    console.error('Failed to save plan', err)
  }
}

// Ideas
export function getSavedIdeas(): EventIdea[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_IDEAS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveIdea(idea: EventIdea): void {
  const ideas = getSavedIdeas()
  const index = ideas.findIndex(i => i.id === idea.id)
  if (index >= 0) {
    ideas[index] = idea
  } else {
    ideas.unshift(idea)
  }
  localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(ideas))
  window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'ideas' }))
}

export function toggleSaveIdea(ideaId: string): void {
  const ideas = getSavedIdeas()
  const target = ideas.find(i => i.id === ideaId)
  if (target) {
    target.isSaved = !target.isSaved
    localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(ideas))
    window.dispatchEvent(new CustomEvent('eventora_data_updated', { detail: 'ideas' }))
  }
}

// Motion preference
export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const saved = localStorage.getItem(STORAGE_KEYS.REDUCED_MOTION)
  if (saved !== null) return saved === 'true'
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function setReducedMotion(reduced: boolean): void {
  localStorage.setItem(STORAGE_KEYS.REDUCED_MOTION, String(reduced))
  window.dispatchEvent(new CustomEvent('eventora_motion_toggled', { detail: reduced }))
}

// Reset data to demo state
export async function resetToDemoState(): Promise<void> {
  localStorage.removeItem(STORAGE_KEYS.EVENTS)
  localStorage.removeItem(STORAGE_KEYS.EXPENSES)
  localStorage.removeItem(STORAGE_KEYS.TASKS)
  localStorage.removeItem(STORAGE_KEYS.VENDORS)
  localStorage.removeItem(STORAGE_KEYS.PLANS)
  localStorage.removeItem(STORAGE_KEYS.SAVED_IDEAS)
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_EVENT_ID)
  await initializeStorage()
  window.dispatchEvent(new CustomEvent('eventora_data_reset'))
}

// Export / Import entire state
export function exportAllData(): string {
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    events: getEvents(),
    expenses: getExpenses(),
    tasks: getTasks(),
    vendors: getVendors(),
    plans: localStorage.getItem(STORAGE_KEYS.PLANS) ? JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS)!) : {},
    ideas: getSavedIdeas()
  }
  return JSON.stringify(data, null, 2)
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr)
    if (!data.events || !Array.isArray(data.events)) return false

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(data.events))
    if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses))
    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks))
    if (data.vendors) localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(data.vendors))
    if (data.plans) localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans))
    if (data.ideas) localStorage.setItem(STORAGE_KEYS.SAVED_IDEAS, JSON.stringify(data.ideas))

    if (data.events.length > 0) {
      setActiveEventId(data.events[0].id)
    }
    window.dispatchEvent(new CustomEvent('eventora_data_reset'))
    return true
  } catch (e) {
    console.error('Import failed', e)
    return false
  }
}
