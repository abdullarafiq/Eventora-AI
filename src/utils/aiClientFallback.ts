import type { EventDetails, AIGeneratedPlan, BudgetAllocationItem } from '../types'

function calculateCategoryAmounts(totalBudget: number, proportions: Record<string, number>): BudgetAllocationItem[] {
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

export function generateClientPlan(event: EventDetails): AIGeneratedPlan {
  const isLuxury = event.priorities.includes('luxury')
  const isBudget = event.priorities.includes('affordability')
  const isEco = event.priorities.includes('sustainability')

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

  let colorPalette = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#1E1B4B']
  if (isEco) {
    colorPalette = ['#10B981', '#06B6D4', '#84CC16', '#3B82F6', '#1E293B']
  } else if (event.type === 'birthday') {
    colorPalette = ['#06B6D4', '#EC4899', '#8B5CF6', '#F59E0B', '#0F172A']
  } else if (event.type === 'wedding') {
    colorPalette = ['#8B5CF6', '#F59E0B', '#EC4899', '#E11D48', '#312E81']
  }

  return {
    conceptAndTheme: {
      title: `${event.name} — ${event.theme || 'Curated Signature Experience'}`,
      narrative: `An immersive ${event.type} experience designed in ${event.location} for ${event.guestCount} guests, prioritizing ${event.priorities.join(' & ') || 'joy, elegance, and celebration'}.`,
      colorPalette,
      atmosphere: isLuxury 
        ? 'Sophisticated, opulent, grand, and culturally resonant.' 
        : isEco 
        ? 'Organic, earthy, sustainable, vibrant, and welcoming.' 
        : 'Electric, lively, photogenic, and heartwarming.'
    },
    decorAndLighting: {
      suggestions: [
        `Signature thematic entrance installation inspired by ${event.theme}`,
        `Warm architectural uplighting with complementary ${colorPalette[0]} accent washes`,
        isEco 
          ? 'Living potted flora, khadi banners, and terracotta craft elements' 
          : 'Layered fabric drapery with fairy light waterfall backdrop'
      ],
      highlights: `Central focal stage with dynamic ${colorPalette[1]} backlighting and customized monogram signage`,
      lightingStyle: 'Layered 2700K warm ambient flood with programmable RGB mood highlights'
    },
    foodAndCatering: {
      menuConcepts: [
        `Curated live welcome drink counter featuring regional coolers and fresh juices`,
        `Multi-station ${event.foodPreference} menu with regional delicacies of ${event.location}`,
        `Artisan dessert bar featuring traditional warm sweets and fusion pastries`
      ],
      serviceStyle: event.guestCount > 150 ? 'Gourmet buffet stations with live chef counters' : 'Pass-around appetizers with synchronized dining',
      dietaryNotes: `${event.foodPreference.toUpperCase()} catering preparation with hygiene certification and clear allergen labelling`
    },
    entertainmentAndActivities: {
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
    },
    venueSelectionCriteria: {
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
    },
    budgetAllocations,
    timelineMilestones: [
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
    ],
    vendorChecklist: [
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
    ],
    personalizedRecommendations: [
      `For ${event.guestCount} guests in ${event.location}, plan a minimum 1.25x hydration station buffer during daytime hours.`,
      `Incorporate ${event.theme} into your digital RSVP website so guests know what attire will look best in photos.`,
      isBudget 
        ? 'Opt for digital WhatsApp video invitations with interactive RSVP buttons to save on printing and postage.'
        : 'Offer bespoke personalized welcome gifts highlighting local artisans of the region.'
    ],
    costSavingAlternatives: [
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
    ],
    isAiGenerated: true,
    modelUsed: 'Eventora AI Intelligent Heuristic Engine (Demo Mode)'
  }
}
