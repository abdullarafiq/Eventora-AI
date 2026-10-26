import { Router, Request, Response } from 'express'
import { GeneratePlanRequestSchema, GenerateIdeasRequestSchema, BudgetAdvisorRequestSchema } from '../schemas/apiSchemas'
import { generateAIPlan } from '../services/aiGenerator'
import { rateLimiter } from '../middleware/rateLimiter'

const router = Router()

// Generate comprehensive AI Event Plan
router.post('/generate-plan', rateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = GeneratePlanRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      })
      return
    }

    const { event } = parseResult.data
    const plan = await generateAIPlan(event)
    res.json(plan)
  } catch (error: any) {
    console.error('Error generating AI plan:', error)
    res.status(500).json({
      error: 'Failed to generate plan. Please try again or use demo fallback.',
      message: error?.message || 'Internal server error'
    })
  }
})

// Generate personalized ideas
router.post('/generate-ideas', rateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = GenerateIdeasRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors.map(e => e.message)
      })
      return
    }

    const { eventType = 'wedding', category = 'general', userPrompt: _userPrompt = '' } = parseResult.data

    // Dynamic tailored idea generation
    const ideas = [
      {
        id: `idea-gen-${Date.now()}-1`,
        title: `Themed Interactive Entrance Experience for ${eventType}`,
        category: category || 'Decor & Welcome',
        description: `Set up a sensory arrival tunnel with ambient soundscapes, traditional floral showers, and customized digital welcome cards personalized to each RSVP.`,
        estimatedBudgetImpact: 'Moderate investment (~4% of total budget)',
        tags: ['Immersive', 'Welcome', eventType],
        isSaved: false
      },
      {
        id: `idea-gen-${Date.now()}-2`,
        title: `Live Artisan Food Studio & Interactive Counters`,
        category: 'Food & Beverage',
        description: `Introduce 3 micro-theatre food stations (e.g. woodfired culinary craft, liquid nitrogen kulfi, or artisanal herbal drink infusions) where guests watch preparation.`,
        estimatedBudgetImpact: 'Increases guest engagement without increasing plate count',
        tags: ['Gourmet', 'Interactive', 'Catering'],
        isSaved: false
      },
      {
        id: `idea-gen-${Date.now()}-3`,
        title: `Smart Eco-Conscious Plant Adoption Favors`,
        category: 'Sustainability',
        description: `Replace plastic or packaged gifts with miniature clay-potted indigenous jade, tulsi, or flowering plants with guest names calligraphed on seed paper.`,
        estimatedBudgetImpact: 'Saves 25-35% compared to commercial gift hampers',
        tags: ['Zero-Waste', 'Favors', 'Eco-Friendly'],
        isSaved: false
      },
      {
        id: `idea-gen-${Date.now()}-4`,
        title: `Unplugged Live Acoustic Sunset Transition`,
        category: 'Entertainment',
        description: `Smoothly transition from day ceremonies into the evening gala with a 45-minute live acoustic sitar/violin fusion set against golden hour lighting.`,
        estimatedBudgetImpact: 'Cost-effective alternative to multi-performer brass bands',
        tags: ['Acoustic', 'Atmosphere', 'Golden Hour'],
        isSaved: false
      }
    ]

    res.json(ideas)
  } catch {
    res.status(500).json({ error: 'Failed to generate ideas' })
  }
})

// Budget Advisor / Cost Reduction recommendations
router.post('/budget-advisor', rateLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = BudgetAdvisorRequestSchema.safeParse(req.body)
    if (!parseResult.success) {
      res.status(400).json({ error: 'Invalid budget parameters' })
      return
    }

    const { totalBudget, expenses } = parseResult.data

    const totalEstimated = expenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0)
    const totalActual = expenses.reduce((sum, e) => sum + (e.actualCost || e.estimatedCost || 0), 0)
    const isOverBudget = totalActual > totalBudget
    const difference = Math.abs(totalBudget - totalActual)

    const recommendations = []
    if (isOverBudget) {
      recommendations.push({
        title: 'Over-Budget Alert: High Priority Action Needed',
        description: `Current projected expenditure exceeds the budget by ₹${difference.toLocaleString('en-IN')}. Focus on renegotiating venue package terms or shifting flower varieties to local alternatives.`,
        severity: 'high'
      })
      recommendations.push({
        title: 'Optimize Catering Tier',
        description: 'Reduce appetizer variety from 8 to 5 items without diminishing portion sizes to save up to 12% on catering expenses.',
        severity: 'medium'
      })
    } else {
      recommendations.push({
        title: 'Healthy Budget Allocation',
        description: `You have ₹${(totalBudget - totalActual).toLocaleString('en-IN')} remaining in contingency buffer. Keep at least 5% reserved for unexpected last-minute additions.`,
        severity: 'low'
      })
    }

    res.json({
      totalBudget,
      totalEstimated,
      totalActual,
      isOverBudget,
      difference,
      recommendations
    })
  } catch {
    res.status(500).json({ error: 'Budget advisor failed' })
  }
})

export default router
