import { describe, it, expect, beforeEach } from 'vitest'
import { formatINR, formatCompactINR } from '../src/utils/formatCurrency'
import { calculateDaysRemaining, calculateDueDate, isTaskOverdue, formatDateReadable } from '../src/utils/dateUtils'
import { generateDeterministicPlan } from '../server/services/aiGenerator'
import { generateClientPlan } from '../src/utils/aiClientFallback'
import { DEMO_SCENARIOS } from '../src/utils/demoData'
import { clampAmount, isValidPositiveNumber, clampGuestCount, MONETARY_LIMITS } from '../src/utils/validation'
import { EventDetailsSchema } from '../server/schemas/apiSchemas'
import {
  saveEvent, getEvents, deleteEvent, getExpenses, saveExpense,
  getTasks, saveTask, getVendors, saveVendor, exportAllData, importAllData, resetToDemoState
} from '../src/utils/storage'
import type { EventDetails, ExpenseItem, TimelineTask, VendorItem } from '../src/types'

const memoryStorage = new Map<string, string>()

// Headless polyfills for Node test runner
if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.getItem) {
  globalThis.localStorage = {
    getItem: (key: string) => memoryStorage.get(key) || null,
    setItem: (key: string, val: string) => { memoryStorage.set(key, String(val)) },
    removeItem: (key: string) => { memoryStorage.delete(key) },
    clear: () => memoryStorage.clear(),
    length: 0,
    key: () => null
  } as any
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false })
  } as any
}

describe('Currency Formatter - Indian Rupee (INR)', () => {
  it('formats standard amounts with Indian numbering system commas', () => {
    expect(formatINR(150000)).toBe('₹1,50,000')
    expect(formatINR(2500000)).toBe('₹25,00,000')
    expect(formatINR(85000)).toBe('₹85,000')
    expect(formatINR(0)).toBe('₹0')
  })

  it('handles negative amounts correctly for budget deficits', () => {
    expect(formatINR(-50000)).toBe('-₹50,000')
    expect(formatINR(-1250000)).toBe('-₹12,50,000')
  })

  it('formats compact representations for metrics', () => {
    expect(formatCompactINR(2500000)).toBe('₹25 L')
    expect(formatCompactINR(150000)).toBe('₹1.5 L')
    expect(formatCompactINR(75000)).toBe('₹75 K')
    expect(formatCompactINR(10000000)).toBe('₹1 Cr')
  })

  it('handles null, undefined, and non-numeric inputs gracefully', () => {
    expect(formatINR(null)).toBe('₹0')
    expect(formatINR(undefined)).toBe('₹0')
    expect(formatINR('invalid')).toBe('₹0')
    expect(formatCompactINR(0)).toBe('₹0')
  })
})

describe('Monetary & Input Boundary Validation', () => {
  it('clamps negative and invalid values to safe minimums', () => {
    expect(clampAmount(-500)).toBe(0)
    expect(clampAmount('not-a-number')).toBe(0)
    expect(clampAmount(null)).toBe(0)
    expect(clampAmount(undefined)).toBe(0)
  })

  it('clamps runaway values to maximum allowed expense limit', () => {
    const hugeValue = MONETARY_LIMITS.MAX_EXPENSE + 1000000
    expect(clampAmount(hugeValue)).toBe(MONETARY_LIMITS.MAX_EXPENSE)
  })

  it('parses formatted numeric strings with currency symbols and commas', () => {
    expect(clampAmount('₹1,50,000')).toBe(150000)
    expect(clampAmount('25,000.50')).toBe(25001)
  })

  it('validates positive numbers accurately', () => {
    expect(isValidPositiveNumber(100)).toBe(true)
    expect(isValidPositiveNumber(0.5)).toBe(true)
    expect(isValidPositiveNumber(0)).toBe(false)
    expect(isValidPositiveNumber(-10)).toBe(false)
    expect(isValidPositiveNumber('text')).toBe(false)
  })

  it('clamps guest count within realistic thresholds', () => {
    expect(clampGuestCount(0)).toBe(MONETARY_LIMITS.MIN_GUESTS)
    expect(clampGuestCount(-10)).toBe(MONETARY_LIMITS.MIN_GUESTS)
    expect(clampGuestCount(100000)).toBe(MONETARY_LIMITS.MAX_GUESTS)
    expect(clampGuestCount(250)).toBe(250)
  })
})

describe('Date & Milestone Utilities', () => {
  it('calculates days remaining accurately', () => {
    const today = new Date()
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const futureStr = futureDate.toISOString().split('T')[0]
    
    const days = calculateDaysRemaining(futureStr)
    expect(days).toBeGreaterThanOrEqual(29)
    expect(days).toBeLessThanOrEqual(31)
  })

  it('calculates negative days remaining for past events', () => {
    const pastDate = '2020-01-01'
    const days = calculateDaysRemaining(pastDate)
    expect(days).toBeLessThan(0)
  })

  it('calculates milestone due dates backwards from event date', () => {
    const eventDate = '2026-12-31'
    const due30DaysBefore = calculateDueDate(eventDate, 30)
    expect(due30DaysBefore).toBe('2026-12-01')

    const dueEventDay = calculateDueDate(eventDate, 0)
    expect(dueEventDay).toBe('2026-12-31')
  })

  it('formats dates in readable Indian English format', () => {
    expect(formatDateReadable('2026-11-20')).toContain('2026')
    expect(formatDateReadable('2026-11-20')).toContain('Nov')
    expect(formatDateReadable('invalid-date')).toBe('invalid-date')
  })

  it('detects overdue tasks when past due date and not completed', () => {
    const pastDate = '2020-01-01'
    expect(isTaskOverdue(pastDate, false)).toBe(true)
    expect(isTaskOverdue(pastDate, true)).toBe(false) // Completed task is never overdue
  })

  it('marks future tasks as not overdue', () => {
    const futureDate = '2099-01-01'
    expect(isTaskOverdue(futureDate, false)).toBe(false)
  })
})

describe('AI Heuristic Generator Engine', () => {
  const baseEvent = {
    name: 'Rohan & Ananya Wedding',
    type: 'wedding' as const,
    date: '2026-11-20',
    location: 'Udaipur',
    guestCount: 200,
    totalBudget: 1500000,
    theme: 'Royal Marigold Heritage',
    foodPreference: 'vegetarian' as const,
    priorities: ['luxury', 'family-friendly']
  }

  it('generates complete structured event blueprint with valid INR proportions', () => {
    const plan = generateDeterministicPlan(baseEvent)

    expect(plan).toBeDefined()
    expect(plan.conceptAndTheme.title).toContain('Rohan & Ananya')
    expect(plan.budgetAllocations.length).toBe(7)
    
    // Check that category percentages sum up to 100%
    const totalPercentage = plan.budgetAllocations.reduce((sum, b) => sum + b.percentage, 0)
    expect(totalPercentage).toBe(100)

    // Check that category allocations sum up close to totalBudget
    const sumAllocated = plan.budgetAllocations.reduce((sum, b) => sum + b.allocatedAmount, 0)
    expect(sumAllocated).toBeGreaterThan(1450000)
    expect(sumAllocated).toBeLessThanOrEqual(1550000)

    expect(plan.timelineMilestones.length).toBeGreaterThanOrEqual(4)
    expect(plan.vendorChecklist.length).toBeGreaterThanOrEqual(4)
    expect(plan.costSavingAlternatives.length).toBeGreaterThanOrEqual(3)
  })

  it('produces positive calculated potential savings in all alternatives', () => {
    const plan = generateDeterministicPlan(baseEvent)
    plan.costSavingAlternatives.forEach(alt => {
      expect(alt.potentialSavings).toBeGreaterThan(0)
      expect(alt.tip.length).toBeGreaterThan(10)
    })
  })

  it('adapts allocations for birthday parties with smaller budgets', () => {
    const mockBirthday = {
      name: 'Priya 21st Bash',
      type: 'birthday' as const,
      date: '2026-08-15',
      location: 'Bengaluru',
      guestCount: 35,
      totalBudget: 60000,
      theme: 'Neon Retro Rave',
      foodPreference: 'all' as const,
      priorities: ['affordability']
    }

    const plan = generateDeterministicPlan(mockBirthday)
    expect(plan.conceptAndTheme.title).toContain('Priya')
    const catering = plan.budgetAllocations.find(b => b.category === 'catering')
    expect(catering?.allocatedAmount).toBeGreaterThan(0)
    expect(catering?.allocatedAmount).toBeLessThan(60000)
  })

  it('generates client fallback plan identically matching domain types', () => {
    const clientPlan = generateClientPlan({
      ...baseEvent,
      id: 'test-evt',
      importantRequirements: 'Need lake view',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    })
    expect(clientPlan.isAiGenerated).toBe(true)
    expect(clientPlan.budgetAllocations.length).toBe(7)
    expect(clientPlan.timelineMilestones.length).toBe(6)
  })
})

describe('Zod Schema Validation & Security Boundaries', () => {
  it('validates a compliant event creation payload', () => {
    const validData = {
      name: 'Festival of Lights',
      type: 'community',
      date: '2026-11-05',
      location: 'Ahmedabad',
      guestCount: 500,
      totalBudget: 400000,
      theme: 'Diyas & Rangoli',
      foodPreference: 'vegetarian',
      priorities: ['sustainability', 'family-friendly']
    }
    const result = EventDetailsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid dates or negative guest counts', () => {
    const invalidData = {
      name: 'Bad Event',
      type: 'birthday',
      date: 'not-a-date',
      location: 'Delhi',
      guestCount: -5,
      totalBudget: -1000,
      theme: 'Theme',
      foodPreference: 'all'
    }
    const result = EventDetailsSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})

describe('State Persistence & Cascading Deletions', () => {
  beforeEach(async () => {
    await resetToDemoState()
  })

  it('saves, retrieves, and cascades deletion of an event and its dependencies', () => {
    const testEventId = `evt-test-${Date.now()}`
    const testEvent: EventDetails = {
      id: testEventId,
      name: 'Unit Test Gala',
      type: 'custom',
      date: '2026-12-15',
      location: 'Mumbai',
      guestCount: 80,
      totalBudget: 200000,
      theme: 'Modern Minimalist',
      foodPreference: 'all',
      priorities: ['balanced'],
      importantRequirements: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    saveEvent(testEvent)
    expect(getEvents().some(e => e.id === testEventId)).toBe(true)

    // Add associated expense, task, and vendor
    const exp: ExpenseItem = {
      id: `exp-${testEventId}`,
      eventId: testEventId,
      title: 'Sound System',
      category: 'entertainment',
      estimatedCost: 15000,
      actualCost: 14000,
      isPaid: true,
      createdAt: new Date().toISOString()
    }
    saveExpense(exp)
    expect(getExpenses(testEventId).length).toBe(1)

    const task: TimelineTask = {
      id: `task-${testEventId}`,
      eventId: testEventId,
      title: 'Book Audio Engineer',
      description: 'Check mixing console',
      category: 'Production',
      dueDate: '2026-12-01',
      priority: 'high',
      completed: false,
      milestoneDaysBefore: 14
    }
    saveTask(task)
    expect(getTasks(testEventId).length).toBe(1)

    const vendor: VendorItem = {
      id: `ven-${testEventId}`,
      eventId: testEventId,
      name: 'Mumbai Audio Pros',
      category: 'entertainment',
      estimatedCost: 15000,
      status: 'booked'
    }
    saveVendor(vendor)
    expect(getVendors(testEventId).length).toBe(1)

    // Delete event and verify cascading cleanup
    deleteEvent(testEventId)
    expect(getEvents().some(e => e.id === testEventId)).toBe(false)
    expect(getExpenses(testEventId).length).toBe(0)
    expect(getTasks(testEventId).length).toBe(0)
    expect(getVendors(testEventId).length).toBe(0)
  })

  it('exports and imports backup state safely', () => {
    const exportedJSON = exportAllData()
    expect(typeof exportedJSON).toBe('string')
    const parsed = JSON.parse(exportedJSON)
    expect(parsed.version).toBe('1.0')
    expect(Array.isArray(parsed.events)).toBe(true)

    // Verify import accepts valid payload
    const importSuccess = importAllData(exportedJSON)
    expect(importSuccess).toBe(true)

    // Verify import rejects invalid payload
    const importCorrupt = importAllData('{ "invalid": true }')
    expect(importCorrupt).toBe(false)
  })
})

describe('Demo Scenarios Data Integrity', () => {
  it('contains the three required comprehensive scenarios with authentic budgets', () => {
    expect(DEMO_SCENARIOS.wedding).toBeDefined()
    expect(DEMO_SCENARIOS.birthday).toBeDefined()
    expect(DEMO_SCENARIOS.community).toBeDefined()

    expect(DEMO_SCENARIOS.wedding.event.totalBudget).toBe(2500000)
    expect(DEMO_SCENARIOS.birthday.event.totalBudget).toBe(85000)
    expect(DEMO_SCENARIOS.community.event.totalBudget).toBe(350000)

    // Verify all demo scenarios have non-empty tasks and expenses
    Object.values(DEMO_SCENARIOS).forEach(scenario => {
      expect(scenario.expenses.length).toBeGreaterThan(0)
      expect(scenario.tasks.length).toBeGreaterThan(0)
      expect(scenario.vendors.length).toBeGreaterThan(0)
      expect(scenario.plan.budgetAllocations.length).toBeGreaterThanOrEqual(6)
    })
  })
})
