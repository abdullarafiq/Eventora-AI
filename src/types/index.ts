export type EventType = 'wedding' | 'birthday' | 'community' | 'custom'

export type EventPriority = 'affordability' | 'luxury' | 'sustainability' | 'family-friendly' | 'balanced'

export type FoodPreference = 'all' | 'vegetarian' | 'vegan' | 'jain' | 'halal' | 'multi-cuisine'

export type BudgetCategory = 
  | 'venue' 
  | 'catering' 
  | 'decoration' 
  | 'photography' 
  | 'entertainment' 
  | 'transport' 
  | 'miscellaneous'

export type VendorStatus = 'to_contact' | 'contacted' | 'shortlisted' | 'booked' | 'completed'

export interface EventDetails {
  id: string
  name: string
  type: EventType
  date: string // YYYY-MM-DD
  location: string
  guestCount: number
  totalBudget: number // INR
  theme: string
  foodPreference: FoodPreference
  priorities: string[]
  importantRequirements: string
  createdAt: string
  updatedAt: string
}

export interface BudgetAllocationItem {
  category: BudgetCategory
  percentage: number
  allocatedAmount: number
  notes: string
}

export interface ExpenseItem {
  id: string
  eventId: string
  title: string
  category: BudgetCategory
  estimatedCost: number
  actualCost: number
  isPaid: boolean
  vendorName?: string
  notes?: string
  createdAt: string
}

export interface TimelineTask {
  id: string
  eventId: string
  title: string
  description: string
  category: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  milestoneDaysBefore: number
}

export interface VendorItem {
  id: string
  eventId: string
  name: string
  category: BudgetCategory | 'makeup' | 'invitations' | 'equipment'
  contactPerson?: string
  phone?: string
  email?: string
  estimatedCost: number
  actualCost?: number
  status: VendorStatus
  notes?: string
  isSample?: boolean
}

export interface CostSavingAlternative {
  tip: string
  potentialSavings: number
  impact: string
}

export interface AIGeneratedPlan {
  conceptAndTheme: {
    title: string
    narrative: string
    colorPalette: string[]
    atmosphere: string
  }
  decorAndLighting: {
    suggestions: string[]
    highlights: string
    lightingStyle: string
  }
  foodAndCatering: {
    menuConcepts: string[]
    serviceStyle: string
    dietaryNotes: string
  }
  entertainmentAndActivities: {
    activities: string[]
    scheduleHighlights: string[]
  }
  venueSelectionCriteria: {
    recommendedType: string
    capacityNeeded: string
    mustHaves: string[]
  }
  budgetAllocations: BudgetAllocationItem[]
  timelineMilestones: Array<{
    title: string
    description: string
    category: string
    milestoneDaysBefore: number
    priority: 'high' | 'medium' | 'low'
  }>
  vendorChecklist: Array<{
    name: string
    category: BudgetCategory | 'makeup' | 'invitations' | 'equipment'
    estimatedCost: number
    status: VendorStatus
    notes: string
  }>
  personalizedRecommendations: string[]
  costSavingAlternatives: CostSavingAlternative[]
  isAiGenerated: boolean
  modelUsed?: string
}

export interface EventIdea {
  id: string
  title: string
  category: string
  description: string
  estimatedBudgetImpact: string
  tags: string[]
  isSaved?: boolean
  sourceEventType?: EventType
}
