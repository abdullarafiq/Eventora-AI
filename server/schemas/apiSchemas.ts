import { z } from 'zod'

export const EventDetailsSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  type: z.enum(['wedding', 'birthday', 'community', 'custom']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date YYYY-MM-DD required'),
  location: z.string().min(2, 'Location is required'),
  guestCount: z.number().int().positive('Guest count must be at least 1'),
  totalBudget: z.number().positive('Budget must be greater than 0'),
  theme: z.string().min(2, 'Theme is required'),
  foodPreference: z.enum(['all', 'vegetarian', 'vegan', 'jain', 'halal', 'multi-cuisine']),
  priorities: z.array(z.string()).default([]),
  importantRequirements: z.string().optional().default('')
})

export const GeneratePlanRequestSchema = z.object({
  event: EventDetailsSchema
})

export const GenerateIdeasRequestSchema = z.object({
  eventType: z.enum(['wedding', 'birthday', 'community', 'custom']).optional(),
  category: z.string().optional(),
  userPrompt: z.string().optional(),
  budget: z.number().optional()
})

export const BudgetAdvisorRequestSchema = z.object({
  totalBudget: z.number().positive(),
  expenses: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    category: z.string(),
    estimatedCost: z.number(),
    actualCost: z.number().default(0),
    isPaid: z.boolean().default(false)
  }))
})
