import { z } from 'zod'

export interface EventInput {
  id?: string
  name: string
  type: 'wedding' | 'birthday' | 'community' | 'custom'
  date: string
  location: string
  guestCount: number
  totalBudget: number
  theme: string
  foodPreference: 'all' | 'vegetarian' | 'vegan' | 'jain' | 'halal' | 'multi-cuisine'
  priorities: string[]
  importantRequirements?: string
}

export interface BudgetAllocation {
  category: 'venue' | 'catering' | 'decoration' | 'photography' | 'entertainment' | 'transport' | 'miscellaneous'
  percentage: number
  allocatedAmount: number
  notes: string
}

export interface MilestoneItem {
  title: string
  description: string
  category: string
  milestoneDaysBefore: number
  priority: 'high' | 'medium' | 'low'
}

export interface VendorChecklistItem {
  name: string
  category: string
  estimatedCost: number
  status: 'to_contact' | 'contacted' | 'shortlisted' | 'booked' | 'completed'
  notes: string
}

export interface CostSavingItem {
  tip: string
  potentialSavings: number
  impact: string
}

export interface GeneratedPlan {
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
  budgetAllocations: BudgetAllocation[]
  timelineMilestones: MilestoneItem[]
  vendorChecklist: VendorChecklistItem[]
  personalizedRecommendations: string[]
  costSavingAlternatives: CostSavingItem[]
  isAiGenerated: boolean
  modelUsed?: string
}

export async function generateAIPlan(event: EventInput): Promise<GeneratedPlan> {
  const geminiKey = process.env.GEMINI_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY

  if (geminiKey) {
    try {
      const plan = await callGeminiAPI(geminiKey, event)
      if (plan) return plan
    } catch (err) {
      console.warn('Gemini API request failed, falling back to intelligent template engine:', err)
    }
  } else if (openAiKey) {
    try {
      const plan = await callOpenAI(openAiKey, event)
      if (plan) return plan
    } catch (err) {
      console.warn('OpenAI API request failed, falling back to intelligent template engine:', err)
    }
  }

  // Fallback / Demo Mode: Deterministic dynamic generator
  return generateDeterministicPlan(event)
}

function calculateCategoryAmounts(totalBudget: number, proportions: Record<string, number>): BudgetAllocation[] {
  const categories: Array<'venue' | 'catering' | 'decoration' | 'photography' | 'entertainment' | 'transport' | 'miscellaneous'> = [
    'venue', 'catering', 'decoration', 'photography', 'entertainment', 'transport', 'miscellaneous'
  ]

  const notesMap: Record<string, string> = {
    venue: 'Primary hall, banquet spaces, lawn rentals & security deposit',
    catering: 'Welcome beverages, main meal courses, live dessert counters, service staff',
    decoration: 'Stage, entrance arch, ambient lighting, floral arrangements & draping',
    photography: 'Candid photography, cinematic video highlights, photobooks',
    entertainment: 'Sound systems, DJ, artists, games or cultural performances',
    transport: 'Guest transportation, equipment logistics & bridal/VIP shuttles',
    miscellaneous: 'Favors, invitations, puja/ritual supplies, contingency buffer'
  }

  return categories.map(cat => {
    const pct = proportions[cat] || 5
    const allocated = Math.round((totalBudget * pct) / 100)
    return {
      category: cat,
      percentage: pct,
      allocatedAmount: allocated,
      notes: notesMap[cat] || 'Category budget'
    }
  })
}

export function generateDeterministicPlan(event: EventInput): GeneratedPlan {
  const isLuxury = event.priorities.includes('luxury')
  const isBudget = event.priorities.includes('affordability')
  const isEco = event.priorities.includes('sustainability')

  // Proportions based on event type & priorities
  let proportions: Record<string, number>
  if (event.type === 'wedding') {
    proportions = isLuxury 
      ? { venue: 34, catering: 28, decoration: 16, photography: 11, entertainment: 5, transport: 3, miscellaneous: 3 }
      : { venue: 28, catering: 32, decoration: 14, photography: 10, entertainment: 6, transport: 5, miscellaneous: 5 }
  } else if (event.type === 'birthday') {
    proportions = { venue: 26, catering: 34, decoration: 15, photography: 9, entertainment: 10, transport: 2, miscellaneous: 4 }
  } else if (event.type === 'community') {
    proportions = { venue: 20, catering: 28, decoration: 14, photography: 8, entertainment: 14, transport: 8, miscellaneous: 8 }
  } else {
    proportions = { venue: 28, catering: 30, decoration: 15, photography: 10, entertainment: 7, transport: 5, miscellaneous: 5 }
  }

  const budgetAllocations = calculateCategoryAmounts(event.totalBudget, proportions)

  // Color palettes tailored to theme & type
  let colorPalette = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#1E1B4B']
  if (isEco) {
    colorPalette = ['#10B981', '#06B6D4', '#84CC16', '#3B82F6', '#1E293B']
  } else if (event.type === 'birthday') {
    colorPalette = ['#06B6D4', '#EC4899', '#8B5CF6', '#F59E0B', '#0F172A']
  } else if (event.type === 'wedding') {
    colorPalette = ['#8B5CF6', '#F59E0B', '#EC4899', '#E11D48', '#312E81']
  }

  // Concept & Themes
  const conceptAndTheme = {
    title: `${event.name} — ${event.theme || 'Curated Signature Experience'}`,
    narrative: `An immersive ${event.type} experience designed in ${event.location} for ${event.guestCount} guests, prioritizing ${event.priorities.join(' & ') || 'joy, harmony, and celebration'}.`,
    colorPalette,
    atmosphere: isLuxury 
      ? 'Sophisticated, opulent, grand, and culturally resonant.' 
      : isEco 
      ? 'Organic, earthy, sustainable, vibrant, and welcoming.' 
      : 'Electric, lively, photogenic, and heartwarming.'
  }

  // Decor & Lighting
  const decorAndLighting = {
    suggestions: [
      `Signature thematic entrance installation inspired by ${event.theme}`,
      `Warm architectural uplighting with complementary ${colorPalette[0]} accent washes`,
      isEco 
        ? 'Living potted flora, khadi banners, and terracotta craft elements' 
        : 'Layered fabric drapery with fairy light waterfall backdrop'
    ],
    highlights: `Central focal stage with dynamic ${colorPalette[1]} backlighting and customized monogram signage`,
    lightingStyle: 'Layered 2700K warm ambient flood with programmable RGB mood highlights'
  }

  // Food & Catering
  const foodAndCatering = {
    menuConcepts: [
      `Curated live welcome drink counter featuring regional coolers and fresh juices`,
      `Multi-station ${event.foodPreference} menu with regional delicacies of ${event.location}`,
      `Artisan dessert bar featuring traditional warm sweets and fusion pastries`
    ],
    serviceStyle: event.guestCount > 150 ? 'Gourmet buffet stations with live chef counters' : 'Pass-around appetizers with synchronized dining',
    dietaryNotes: `${event.foodPreference.toUpperCase()} catering preparation with hygiene certification and clear allergen labelling`
  }

  // Entertainment
  const entertainmentAndActivities = {
    activities: [
      `Curated music set tailored to ${event.type} milestone moments`,
      `Interactive photo experience with theme-matched props and instant digital sharing`,
      event.type === 'community' 
        ? 'Community workshops, live demos, and collaborative art installation' 
        : event.type === 'birthday' 
        ? 'Engaging trivia challenge and group party games' 
        : 'Choreographed sangeet sequences and traditional celebratory rituals'
    ],
    scheduleHighlights: [
      'Phase 1: Grand guest arrival, welcome beverages, and ambient acoustic music',
      'Phase 2: Main ceremonial or entertainment highlight and culinary feast',
      'Phase 3: High-energy celebration, open dance floor / social networking'
    ]
  }

  // Venue Criteria
  const venueSelectionCriteria = {
    recommendedType: event.type === 'wedding' 
      ? 'Heritage Palace, Resort Lawn, or Luxury Hotel Banquet' 
      : event.type === 'community' 
      ? 'Open Amphitheatre, Public Park, or Community Cultural Center' 
      : 'Rooftop Lounge, Boutique Studio, or Private Villa Terrace',
    capacityNeeded: `Comfortable seating and circulation for ${event.guestCount} guests`,
    mustHaves: [
      'Accessible parking and entry ramps for elders',
      'Reliable backup generator (minimum 25 KVA)',
      'Clean washroom facilities with dedicated maintenance staff'
    ]
  }

  // Milestones
  const timelineMilestones: MilestoneItem[] = [
    {
      title: 'Lock In Venue & Contract Review',
      description: 'Confirm sound curfew, guest capacity, and initial payment schedule.',
      category: 'Venue',
      milestoneDaysBefore: 60,
      priority: 'high'
    },
    {
      title: 'Finalize Catering Menu & Tasting',
      description: `Confirm ${event.foodPreference} menu options and tasting for key family/committee members.`,
      category: 'Catering',
      milestoneDaysBefore: 45,
      priority: 'high'
    },
    {
      title: 'Dispatch Digital Invitations & RSVP Tracker',
      description: 'Send interactive invites via WhatsApp/email and collect dietary preferences.',
      category: 'Invitations',
      milestoneDaysBefore: 30,
      priority: 'medium'
    },
    {
      title: 'Decor & Technical Equipment Rehearsal',
      description: 'Inspect lighting color temperatures, sound balance, and power lines.',
      category: 'Production',
      milestoneDaysBefore: 14,
      priority: 'medium'
    },
    {
      title: 'Final Guest Count & Run of Show',
      description: 'Reconfirm final headcount with caterer and distribute coordinator contact sheet.',
      category: 'Execution',
      milestoneDaysBefore: 7,
      priority: 'high'
    },
    {
      title: 'Event Day Master Coordination',
      description: 'Check vendor arrivals, stage cue timings, and welcome host readiness.',
      category: 'Event Day',
      milestoneDaysBefore: 0,
      priority: 'high'
    }
  ]

  // Vendors checklist
  const vendorChecklist: VendorChecklistItem[] = [
    {
      name: `${event.location} Premium Venue Partner`,
      category: 'venue',
      estimatedCost: budgetAllocations.find(b => b.category === 'venue')?.allocatedAmount || 100000,
      status: 'shortlisted',
      notes: 'Evaluate acoustics and outdoor lighting curfew'
    },
    {
      name: `Signature ${event.foodPreference} Caterers`,
      category: 'catering',
      estimatedCost: budgetAllocations.find(b => b.category === 'catering')?.allocatedAmount || 80000,
      status: 'to_contact',
      notes: 'Request live food tasting session'
    },
    {
      name: 'Artisan Event Stylists & Decor',
      category: 'decoration',
      estimatedCost: budgetAllocations.find(b => b.category === 'decoration')?.allocatedAmount || 40000,
      status: 'to_contact',
      notes: 'Review portfolio for entrance arch and stage design'
    },
    {
      name: 'Creative Lens Photography & Cinema',
      category: 'photography',
      estimatedCost: budgetAllocations.find(b => b.category === 'photography')?.allocatedAmount || 30000,
      status: 'contacted',
      notes: 'Confirm drone permissions and deliverable timelines'
    }
  ]

  // Recommendations
  const personalizedRecommendations = [
    `For ${event.guestCount} guests in ${event.location}, plan a minimum 1.25x hydration station buffer during daytime hours.`,
    `Incorporate ${event.theme} into your digital RSVP website so guests know what attire will look best in photos.`,
    isBudget 
      ? 'Opt for digital WhatsApp video invitations with interactive RSVP buttons to save on printing and postage.'
      : 'Offer bespoke personalized welcome gifts highlighting local artisans of the region.'
  ]

  // Cost saving
  const costSavingAlternatives: CostSavingItem[] = [
    {
      tip: 'Utilize local seasonal flowers and potted foliage instead of imported exotic stems',
      potentialSavings: Math.round(event.totalBudget * 0.05),
      impact: 'Reduces decor costs by 20-30% while retaining rich visual volume'
    },
    {
      tip: 'Bundle sound, lighting, and AV through the venue\'s empaneled provider',
      potentialSavings: Math.round(event.totalBudget * 0.03),
      impact: 'Avoids external vendor electricity surcharge and transport overhead'
    },
    {
      tip: 'Replace single-use paper stationery with digital QR code menus and digital photo walls',
      potentialSavings: Math.round(event.totalBudget * 0.015),
      impact: 'Eco-friendly and provides real-time flexibility for last-minute menu adjustments'
    }
  ]

  return {
    conceptAndTheme,
    decorAndLighting,
    foodAndCatering,
    entertainmentAndActivities,
    venueSelectionCriteria,
    budgetAllocations,
    timelineMilestones,
    vendorChecklist,
    personalizedRecommendations,
    costSavingAlternatives,
    isAiGenerated: true,
    modelUsed: 'Eventora AI Intelligent Heuristic Engine (Demo Mode)'
  }
}

async function callGeminiAPI(apiKey: string, event: EventInput): Promise<GeneratedPlan | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  
  const prompt = `
You are Eventora AI, a world-class luxury and smart event planner in India.
Generate a comprehensive, tailored event plan for the following event in strict JSON format:
Event Name: ${event.name}
Event Type: ${event.type}
Date: ${event.date}
Location: ${event.location}
Guest Count: ${event.guestCount}
Total Budget (INR): ${event.totalBudget}
Theme: ${event.theme}
Food Preference: ${event.foodPreference}
Priorities: ${event.priorities.join(', ')}
Important Requirements: ${event.importantRequirements || 'None'}

Return ONLY a valid JSON object matching this structure:
{
  "conceptAndTheme": { "title": string, "narrative": string, "colorPalette": string[], "atmosphere": string },
  "decorAndLighting": { "suggestions": string[], "highlights": string, "lightingStyle": string },
  "foodAndCatering": { "menuConcepts": string[], "serviceStyle": string, "dietaryNotes": string },
  "entertainmentAndActivities": { "activities": string[], "scheduleHighlights": string[] },
  "venueSelectionCriteria": { "recommendedType": string, "capacityNeeded": string, "mustHaves": string[] },
  "budgetAllocations": [
    { "category": "venue"|"catering"|"decoration"|"photography"|"entertainment"|"transport"|"miscellaneous", "percentage": number, "allocatedAmount": number, "notes": string }
  ],
  "timelineMilestones": [
    { "title": string, "description": string, "category": string, "milestoneDaysBefore": number, "priority": "high"|"medium"|"low" }
  ],
  "vendorChecklist": [
    { "name": string, "category": string, "estimatedCost": number, "status": "to_contact", "notes": string }
  ],
  "personalizedRecommendations": string[],
  "costSavingAlternatives": [
    { "tip": string, "potentialSavings": number, "impact": string }
  ]
}
Note: Ensure budgetAllocations percentages sum to 100, and allocatedAmount sums to approximately ${event.totalBudget} INR.
`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)
    if (!response.ok) return null

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const parsed = JSON.parse(text)
    parsed.isAiGenerated = true
    parsed.modelUsed = 'Google Gemini 1.5 Flash'
    return parsed
  } catch (err) {
    clearTimeout(timeout)
    return null
  }
}

async function callOpenAI(apiKey: string, event: EventInput): Promise<GeneratedPlan | null> {
  const url = 'https://api.openai.com/v1/chat/completions'
  const prompt = `Generate a complete event plan for ${event.name} (${event.type}, ${event.guestCount} guests, budget ₹${event.totalBudget} in ${event.location}) as JSON.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 18000)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)
    if (!response.ok) return null

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text) return null

    const parsed = JSON.parse(text)
    parsed.isAiGenerated = true
    parsed.modelUsed = 'OpenAI GPT-4o-mini'
    return parsed
  } catch (err) {
    clearTimeout(timeout)
    return null
  }
}
