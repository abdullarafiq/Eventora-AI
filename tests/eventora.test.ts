import { describe, it, expect } from 'vitest'
import { formatINR, formatCompactINR } from '../src/utils/formatCurrency'
import { calculateDaysRemaining, calculateDueDate, isTaskOverdue } from '../src/utils/dateUtils'
import { generateDeterministicPlan } from '../server/services/aiGenerator'
import { DEMO_SCENARIOS } from '../src/utils/demoData'

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

  it('calculates milestone due dates backwards from event date', () => {
    const eventDate = '2026-12-31'
    const due30DaysBefore = calculateDueDate(eventDate, 30)
    expect(due30DaysBefore).toBe('2026-12-01')
  })

  it('detects overdue tasks when past due date and not completed', () => {
    const pastDate = '2020-01-01'
    expect(isTaskOverdue(pastDate, false)).toBe(true)
    expect(isTaskOverdue(pastDate, true)).toBe(false) // Completed task is never overdue
  })
})

describe('AI Heuristic Generator Engine', () => {
  it('generates complete structured event blueprint with valid INR proportions', () => {
    const mockEvent = {
      name: 'Rohan & Ananya Wedding',
      type: 'wedding' as const,
      date: '2026-11-20',
      location: 'Udaipur',
      guestCount: 200,
      totalBudget: 1500000, // ₹15,00,000
      theme: 'Royal Marigold Heritage',
      foodPreference: 'vegetarian' as const,
      priorities: ['luxury', 'family-friendly']
    }

    const plan = generateDeterministicPlan(mockEvent)

    expect(plan).toBeDefined()
    expect(plan.conceptAndTheme.title).toContain('Rohan & Ananya')
    expect(plan.budgetAllocations.length).toBe(7)
    
    // Check that category allocations sum up close to 100% and totalBudget
    const sumAllocated = plan.budgetAllocations.reduce((sum, b) => sum + b.allocatedAmount, 0)
    expect(sumAllocated).toBeGreaterThan(1450000)
    expect(sumAllocated).toBeLessThanOrEqual(1550000)

    expect(plan.timelineMilestones.length).toBeGreaterThanOrEqual(4)
    expect(plan.vendorChecklist.length).toBeGreaterThanOrEqual(4)
    expect(plan.costSavingAlternatives.length).toBeGreaterThanOrEqual(3)
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
})

describe('Demo Scenarios Data Integrity', () => {
  it('contains the three required comprehensive scenarios', () => {
    expect(DEMO_SCENARIOS.wedding).toBeDefined()
    expect(DEMO_SCENARIOS.birthday).toBeDefined()
    expect(DEMO_SCENARIOS.community).toBeDefined()

    expect(DEMO_SCENARIOS.wedding.event.totalBudget).toBe(2500000)
    expect(DEMO_SCENARIOS.birthday.event.totalBudget).toBe(85000)
    expect(DEMO_SCENARIOS.community.event.totalBudget).toBe(350000)
  })
})
