import type { EventDetails, ExpenseItem, TimelineTask, VendorItem, AIGeneratedPlan, EventIdea } from '../types'
import { calculateDueDate } from './dateUtils'

// Helper to generate future date
const getFutureDate = (days: number): string => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export interface DemoScenario {
  id: string
  event: EventDetails
  expenses: ExpenseItem[]
  tasks: TimelineTask[]
  vendors: VendorItem[]
  plan: AIGeneratedPlan
}

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  wedding: {
    id: 'demo-wedding',
    event: {
      id: 'demo-wedding',
      name: 'Aarav & Meera\'s Royal Palace Wedding',
      type: 'wedding',
      date: getFutureDate(120),
      location: 'Udaipur, Rajasthan',
      guestCount: 350,
      totalBudget: 2500000, // ₹25,00,000
      theme: 'Royal Rajputana Heritage with Marigold & Royal Violet accents',
      foodPreference: 'vegetarian',
      priorities: ['luxury', 'family-friendly'],
      importantRequirements: 'Lake view mandap ceremony, vintage car entry, live classical Shehnai & Sitar players, traditional Mewari feast.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expenses: [
      {
        id: 'exp-w1',
        eventId: 'demo-wedding',
        title: 'Heritage Palace Courtyard & Mandap Lawn Advance',
        category: 'venue',
        estimatedCost: 800000,
        actualCost: 800000,
        isPaid: true,
        vendorName: 'Fateh Garh Palace',
        notes: 'Includes lakeside lawn for Sangeet & main courtyard for Pheras',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w2',
        eventId: 'demo-wedding',
        title: 'Royal Mewari & Continental Feast (350 Guests x 3 meals)',
        category: 'catering',
        estimatedCost: 750000,
        actualCost: 700000,
        isPaid: true,
        vendorName: 'Maharaja Caterers',
        notes: 'Dal Baati Churma, Rajasthani Sweets live counter, mocktail bar',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w3',
        eventId: 'demo-wedding',
        title: 'Floral Mandap & Fairy Light Canopy Installation',
        category: 'decoration',
        estimatedCost: 400000,
        actualCost: 420000,
        isPaid: false,
        vendorName: 'Udaipur Royal Decor',
        notes: 'Fresh marigolds, tuberoses, brass diyas, and violet drapery',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w4',
        eventId: 'demo-wedding',
        title: 'Cinematic Drone & 3-Day Wedding Photography',
        category: 'photography',
        estimatedCost: 250000,
        actualCost: 240000,
        isPaid: true,
        vendorName: 'Stories by Kabir Films',
        notes: 'Pre-wedding teaser, 4K wedding film, drone coverage, 2 photobooks',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w5',
        eventId: 'demo-wedding',
        title: 'Sangeet DJ, Sound Setup & Rajasthani Folk Dancers',
        category: 'entertainment',
        estimatedCost: 150000,
        actualCost: 140000,
        isPaid: false,
        vendorName: 'Desert Beats Entertainment',
        notes: 'Kalbelia dance troupe + DJ sound system with wireless mics',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w6',
        eventId: 'demo-wedding',
        title: 'Vintage Doli Car & Guest Shuttle Buses',
        category: 'transport',
        estimatedCost: 80000,
        actualCost: 75000,
        isPaid: true,
        vendorName: 'Mewar Travels',
        notes: 'Airport pick-ups for outstation guests + 1958 vintage convertible',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-w7',
        eventId: 'demo-wedding',
        title: 'E-invites, Welcome Hampers & Puja Materials',
        category: 'miscellaneous',
        estimatedCost: 70000,
        actualCost: 65000,
        isPaid: true,
        vendorName: 'Kalyan Souvenirs',
        notes: 'Artisan sweet boxes with brass jharokha tokens for all guests',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 'task-w1',
        eventId: 'demo-wedding',
        title: 'Lock In Palace Venue & Secure Date Booking Deposit',
        description: 'Verify sound curfew rules, alcohol licenses, and guest accommodation wings.',
        category: 'Venue',
        dueDate: calculateDueDate(getFutureDate(120), 90),
        priority: 'high',
        completed: true,
        milestoneDaysBefore: 90
      },
      {
        id: 'task-w2',
        eventId: 'demo-wedding',
        title: 'Finalize Food Menu & Tasting with Head Chef',
        description: 'Test live counters: chaat, wood-fired pizzas, traditional Rajasthani desserts.',
        category: 'Catering',
        dueDate: calculateDueDate(getFutureDate(120), 60),
        priority: 'high',
        completed: true,
        milestoneDaysBefore: 60
      },
      {
        id: 'task-w3',
        eventId: 'demo-wedding',
        title: 'Send Digital & Physical Royal Scroll Invitations',
        description: 'Distribute WhatsApp interactive invites and courier engraved scrolls to elders.',
        category: 'Invitations',
        dueDate: calculateDueDate(getFutureDate(120), 45),
        priority: 'medium',
        completed: true,
        milestoneDaysBefore: 45
      },
      {
        id: 'task-w4',
        eventId: 'demo-wedding',
        title: 'Confirm Bridal Mehndi & Groom Sherwani Fittings',
        description: 'Schedule final trial with designer and coordinate footwear and turbans.',
        category: 'Attire & Styling',
        dueDate: calculateDueDate(getFutureDate(120), 30),
        priority: 'medium',
        completed: false,
        milestoneDaysBefore: 30
      },
      {
        id: 'task-w5',
        eventId: 'demo-wedding',
        title: 'Finalize Sangeet Tracklist & Choreographer Practice',
        description: 'Collate couple dance mix and family group performance sequences.',
        category: 'Entertainment',
        dueDate: calculateDueDate(getFutureDate(120), 14),
        priority: 'low',
        completed: false,
        milestoneDaysBefore: 14
      },
      {
        id: 'task-w6',
        eventId: 'demo-wedding',
        title: 'Reconfirm Guest Flight Pickups & Room Allocations',
        description: 'Share bus driver phone numbers and print welcome itinerary cards in rooms.',
        category: 'Logistics',
        dueDate: calculateDueDate(getFutureDate(120), 7),
        priority: 'high',
        completed: false,
        milestoneDaysBefore: 7
      },
      {
        id: 'task-w7',
        eventId: 'demo-wedding',
        title: 'Day-of Event Coordination & Varmala Cue Check',
        description: 'Inspect fireworks clearance, varmala rose petals, and pandit ji samagri list.',
        category: 'Execution',
        dueDate: getFutureDate(120),
        priority: 'high',
        completed: false,
        milestoneDaysBefore: 0
      }
    ],
    vendors: [
      {
        id: 'v-w1',
        eventId: 'demo-wedding',
        name: 'Fateh Garh Palace Resort',
        category: 'venue',
        contactPerson: 'Vikram Singh (Banquet Director)',
        phone: '+91 98290 12345',
        email: 'events@fatehgarhudaipur.com',
        estimatedCost: 800000,
        actualCost: 800000,
        status: 'booked',
        notes: 'Lawns booked for 2 days. Sound cutoff 10:00 PM outdoors.',
        isSample: true
      },
      {
        id: 'v-w2',
        eventId: 'demo-wedding',
        name: 'Maharaja Heritage Caterers',
        category: 'catering',
        contactPerson: 'Chef Rameshwar',
        phone: '+91 94140 67890',
        email: 'info@maharajacatering.in',
        estimatedCost: 750000,
        actualCost: 700000,
        status: 'booked',
        notes: 'Menu finalized with 100% pure vegetarian live counters.',
        isSample: true
      },
      {
        id: 'v-w3',
        eventId: 'demo-wedding',
        name: 'Udaipur Royal Decorators',
        category: 'decoration',
        contactPerson: 'Sunita Rathore',
        phone: '+91 98281 54321',
        email: 'sunita@udaipurdecor.com',
        estimatedCost: 400000,
        actualCost: 420000,
        status: 'shortlisted',
        notes: 'Reviewing 3D mockup for lakeside mandap lighting tomorrow.',
        isSample: true
      },
      {
        id: 'v-w4',
        eventId: 'demo-wedding',
        name: 'Stories by Kabir Films',
        category: 'photography',
        contactPerson: 'Kabir Verma',
        phone: '+91 99201 11223',
        email: 'kabir@storiesbykabir.com',
        estimatedCost: 250000,
        actualCost: 240000,
        status: 'booked',
        notes: 'Contract signed. 4 team members with 2 4K bodies + drone.',
        isSample: true
      },
      {
        id: 'v-w5',
        eventId: 'demo-wedding',
        name: 'Desert Beats Sangeet & Sound',
        category: 'entertainment',
        contactPerson: 'DJ Ankit',
        phone: '+91 98110 99887',
        email: 'ankit@desertbeats.in',
        estimatedCost: 150000,
        actualCost: 140000,
        status: 'contacted',
        notes: 'Awaiting revised quote for acoustic setup during phere.',
        isSample: true
      }
    ],
    plan: {
      conceptAndTheme: {
        title: 'Royal Rajputana Heritage with Modern Luxe',
        narrative: 'A grand destination wedding celebrating timeless Rajasthani royalty, candle-lit palace courtyards, vibrant floral mandaps, and serene Pichola lakeside vistas.',
        colorPalette: ['#8B5CF6', '#F59E0B', '#EC4899', '#1E1B4B', '#F3F4F6'],
        atmosphere: 'Majestic, culturally authentic, celebratory, and unforgettable.'
      },
      decorAndLighting: {
        suggestions: [
          'Floating brass urli bowls with fragrant marigolds and tea lights lining the grand entrance.',
          'Carved stone jharokha backdrops draped with royal violet and saffron chiffon.',
          'Warm amber fairy light canopy across the dinner lawns to simulate a starry night.'
        ],
        highlights: 'Central 4-pillar floral mandap set right at the water\'s edge.',
        lightingStyle: 'Warm 2700K ambient floodlights with accent uplights on palace stone pillars.'
      },
      foodAndCatering: {
        menuConcepts: [
          'Welcome drinks: Kesariya Thandai and Mint Kokum Spritzer in kulhads.',
          'Main course: Dal Baati Churma with 3 chutneys, Gatte ki Sabzi, Ker Sangri, and Paneer Mewari.',
          'Dessert studio: Live Jalebi & Rabdi counter, Malpua, and artisanal Kulfi sticks.'
        ],
        serviceStyle: 'Royal seated thali for elders + vibrant luxury buffet stations for youth.',
        dietaryNotes: '100% pure vegetarian with dedicated Jain preparation area.'
      },
      entertainmentAndActivities: {
        activities: [
          'Grand Baraat with vintage open-top convertible and royal brass band.',
          'Interactive folk welcome with Ghoomar dancers showering flower petals.',
          'High-energy Bollywood Sangeet night followed by unplugged Sufi music by the campfire.'
        ],
        scheduleHighlights: [
          'Day 1: Vibrant Mehendi & Sunset Sangeet Night',
          'Day 2 Morning: Haldi ceremony with marigold shower',
          'Day 2 Evening: Sunset Pheras & Grand Gala Dinner'
        ]
      },
      venueSelectionCriteria: {
        recommendedType: 'Heritage Palace Hotel or Lakeside Haveli Resort',
        capacityNeeded: '350 - 400 guests comfortable banquet & lawn seating',
        mustHaves: ['Outdoor lake-facing lawn', 'In-house banquet license', 'Sound barrier permit']
      },
      budgetAllocations: [
        { category: 'venue', percentage: 32, allocatedAmount: 800000, notes: 'Palace courtyards, mandap lawn & day rooms' },
        { category: 'catering', percentage: 30, allocatedAmount: 750000, notes: '3 elaborate feasts for 350 guests + live dessert counter' },
        { category: 'decoration', percentage: 16, allocatedAmount: 400000, notes: 'Floral mandap, fairy light ceiling & heritage props' },
        { category: 'photography', percentage: 10, allocatedAmount: 250000, notes: 'Full 3-day coverage, cinematic video, drone' },
        { category: 'entertainment', percentage: 6, allocatedAmount: 150000, notes: 'DJ, sound, folk dance troupe & Shehnai artists' },
        { category: 'transport', percentage: 3, allocatedAmount: 75000, notes: 'Guest airport shuttles & vintage bridal car' },
        { category: 'miscellaneous', percentage: 3, allocatedAmount: 75000, notes: 'Custom wedding favors, puja samagri & emergency buffer' }
      ],
      timelineMilestones: [
        { title: 'Lock Palace Venue & Sign Master Agreement', description: 'Ensure lawn permissions & sound cut-off timings are documented.', category: 'Venue', milestoneDaysBefore: 90, priority: 'high' },
        { title: 'Approve Food Tasting & Culinary Lineup', description: 'Finalize seasonal Rajasthani menu and Jain counter options.', category: 'Catering', milestoneDaysBefore: 60, priority: 'high' },
        { title: 'Dispatch Digital Royal Scrolls & Collect RSVPs', description: 'Coordinate outstation guest travel itineraries and room tags.', category: 'Guest Management', milestoneDaysBefore: 45, priority: 'medium' },
        { title: 'Finalize Lighting & Mandap Structural Test', description: 'Walk through electrical load with palace engineers.', category: 'Decor', milestoneDaysBefore: 30, priority: 'medium' },
        { title: 'Dry Run Sangeet & Sound Balance', description: 'Rehearse family dances and verify wireless microphones.', category: 'Entertainment', milestoneDaysBefore: 7, priority: 'medium' }
      ],
      vendorChecklist: [
        { name: 'Palace Resort Team', category: 'venue', estimatedCost: 800000, status: 'booked', notes: 'Advance paid, rooms blocked' },
        { name: 'Heritage Caterers', category: 'catering', estimatedCost: 750000, status: 'booked', notes: 'Menu signed' },
        { name: 'Royal Decorators', category: 'decoration', estimatedCost: 400000, status: 'shortlisted', notes: 'Evaluating 3D renders' },
        { name: 'Cinematic Films Studio', category: 'photography', estimatedCost: 250000, status: 'booked', notes: 'Contract executed' }
      ],
      personalizedRecommendations: [
        'Organize the Haldi outdoors at 10 AM with yellow marigold shower for breathtaking natural daylight photography.',
        'Set up a DIY Turban & Bindi corner for visiting guests to immerse themselves in Rajasthani traditions.',
        'Offer customized monogrammed cotton dupattas as light sun protection for day ceremonies.'
      ],
      costSavingAlternatives: [
        {
          tip: 'Swap imported Dutch roses for fresh local Kota marigolds and tuberose',
          potentialSavings: 75000,
          impact: 'Gives an authentic royal temple vibe with zero compromise on visual fullness'
        },
        {
          tip: 'Consolidate sound and lighting equipment through a single local Udaipur vendor',
          potentialSavings: 35000,
          impact: 'Avoids duplicate logistics and generator transportation fees'
        },
        {
          tip: 'Replace printed stationery with animated WhatsApp video invitations and QR code seating',
          potentialSavings: 25000,
          impact: 'Modern, eco-friendly, and enables instant RSVP tracking'
        }
      ],
      isAiGenerated: true,
      modelUsed: 'Eventora GenAI Engine (Heritage Suite)'
    }
  },

  birthday: {
    id: 'demo-birthday',
    event: {
      id: 'demo-birthday',
      name: 'Rohan\'s 25th Neon Cyberpunk Bash',
      type: 'birthday',
      date: getFutureDate(30),
      location: 'Koramangala, Bengaluru',
      guestCount: 45,
      totalBudget: 85000, // ₹85,000
      theme: 'Cyberpunk 2077: Neon Glow, Synthwave & Retro Arcade',
      foodPreference: 'all',
      priorities: ['affordability', 'balanced'],
      importantRequirements: 'UV blacklights, neon photobooth, craft mocktail counter, Nintendo Switch tournament on projector.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expenses: [
      {
        id: 'exp-b1',
        eventId: 'demo-birthday',
        title: 'Rooftop Cafe Lounge Rental (5 Hours)',
        category: 'venue',
        estimatedCost: 25000,
        actualCost: 25000,
        isPaid: true,
        vendorName: 'Skyline Studio Lounge',
        notes: 'Covers private terrace, sound system, and atmospheric dimmers',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-b2',
        eventId: 'demo-birthday',
        title: 'Gourmet Sliders, Pizza & Glowing Mocktails (45 pax)',
        category: 'catering',
        estimatedCost: 28000,
        actualCost: 26500,
        isPaid: false,
        vendorName: 'Artisan Kitchen BLR',
        notes: 'Unlimited finger foods + signature fluorescent tonic mocktail',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-b3',
        eventId: 'demo-birthday',
        title: 'UV Blacklights, Neon Signs & LED Glow Sticks',
        category: 'decoration',
        estimatedCost: 12000,
        actualCost: 11000,
        isPaid: true,
        vendorName: 'NeonForge Bengaluru',
        notes: 'Includes custom "Rohan Level 25" neon flex sign (keepsake)',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-b4',
        eventId: 'demo-birthday',
        title: 'Polaroid Instant Camera + 100 Films & Guestbook',
        category: 'photography',
        estimatedCost: 8000,
        actualCost: 7800,
        isPaid: true,
        vendorName: 'Fujifilm Rental Hub',
        notes: 'Guests take instant snaps and write personalized messages',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-b5',
        eventId: 'demo-birthday',
        title: 'Projector, Mario Kart Tournament & Synthwave Playlist',
        category: 'entertainment',
        estimatedCost: 6000,
        actualCost: 5500,
        isPaid: false,
        vendorName: 'GameZone Rentals',
        notes: '4 controllers, HDMI splitter, and extra speakers',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-b6',
        eventId: 'demo-birthday',
        title: 'Custom Cyberpunk Cake with Edible Neon Drip',
        category: 'miscellaneous',
        estimatedCost: 5000,
        actualCost: 5000,
        isPaid: true,
        vendorName: 'Batter & Bytes Bakery',
        notes: 'Dark chocolate truffle cake with glowing sugar glass accents',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 'task-b1',
        eventId: 'demo-birthday',
        title: 'Confirm Rooftop Lounge Date & Time Slot',
        description: 'Verify noise rules and outside food/beverage policies.',
        category: 'Venue',
        dueDate: calculateDueDate(getFutureDate(30), 20),
        priority: 'high',
        completed: true,
        milestoneDaysBefore: 20
      },
      {
        id: 'task-b2',
        eventId: 'demo-birthday',
        title: 'Order Custom Neon Sign "Level 25 Unlocked"',
        description: 'Send design file to neon manufacturer for 5-day delivery.',
        category: 'Decor',
        dueDate: calculateDueDate(getFutureDate(30), 15),
        priority: 'medium',
        completed: true,
        milestoneDaysBefore: 15
      },
      {
        id: 'task-b3',
        eventId: 'demo-birthday',
        title: 'Assemble Gaming Bracket & Test Projector Setup',
        description: 'Setup Mario Kart and Smash Bros brackets on digital leaderboards.',
        category: 'Activities',
        dueDate: calculateDueDate(getFutureDate(30), 7),
        priority: 'medium',
        completed: false,
        milestoneDaysBefore: 7
      },
      {
        id: 'task-b4',
        eventId: 'demo-birthday',
        title: 'Pick Up Cyberpunk Cake & Glow Bracelets',
        description: 'Ensure cool pack storage for cake and hand out glow sticks at door.',
        category: 'Logistics',
        dueDate: getFutureDate(30),
        priority: 'high',
        completed: false,
        milestoneDaysBefore: 0
      }
    ],
    vendors: [
      {
        id: 'v-b1',
        eventId: 'demo-birthday',
        name: 'Skyline Studio Lounge',
        category: 'venue',
        contactPerson: 'Kunal Sen',
        phone: '+91 99000 44556',
        email: 'info@skylinestudio.in',
        estimatedCost: 25000,
        actualCost: 25000,
        status: 'booked',
        notes: 'Private terrace booked from 6 PM to 11 PM.',
        isSample: true
      },
      {
        id: 'v-b2',
        eventId: 'demo-birthday',
        name: 'Artisan Kitchen BLR',
        category: 'catering',
        contactPerson: 'Chef Tanmay',
        phone: '+91 98450 11223',
        email: 'catering@artisankitchen.com',
        estimatedCost: 28000,
        actualCost: 26500,
        status: 'shortlisted',
        notes: 'Tasting scheduled this Thursday.',
        isSample: true
      },
      {
        id: 'v-b3',
        eventId: 'demo-birthday',
        name: 'NeonForge Bengaluru',
        category: 'decoration',
        contactPerson: 'Deepak Rao',
        phone: '+91 97310 99881',
        email: 'sales@neonforge.in',
        estimatedCost: 12000,
        actualCost: 11000,
        status: 'booked',
        notes: 'Neon sign in production. Delivery 3 days before party.',
        isSample: true
      }
    ],
    plan: {
      conceptAndTheme: {
        title: 'Neon Cyberpunk 2077 Retro Rave',
        narrative: 'An electric night of ultraviolet glows, holographic visuals, synthwave rhythms, and multiplayer retro gaming tournaments to celebrate a quarter-century milestone.',
        colorPalette: ['#06B6D4', '#EC4899', '#8B5CF6', '#10B981', '#0F172A'],
        atmosphere: 'High-energy, futuristic, social, and ultra-photogenic.'
      },
      decorAndLighting: {
        suggestions: [
          'High-intensity 395nm UV blacklight tubes that illuminate white and neon clothing.',
          'Custom LED neon flex sign "Rohan Level 25" mounted on a wire grid photowall.',
          'Floating glow sticks, cyberpunk glasses, and luminescent body paint bar.'
        ],
        highlights: 'Interactive glowing graffiti wall with UV-reactive dry erase markers.',
        lightingStyle: 'Deep violet base with pulsing cyan and neon pink strobe highlights.'
      },
      foodAndCatering: {
        menuConcepts: [
          'Sliders & Bao: Crispy paneer bao and smokey barbecue chicken sliders.',
          'Glow Mocktail Station: Blue Curacao Lemonade that glows bright cyan under blacklight.',
          'Loaded Taco & Nacho bar with guacamole, jalapeno salsa, and queso dip.'
        ],
        serviceStyle: 'Continuous cocktail pass-arounds and grab-and-go finger food stations.',
        dietaryNotes: '50% vegetarian, 50% non-vegetarian clearly designated with LED tags.'
      },
      entertainmentAndActivities: {
        activities: [
          'Nintendo Switch Mario Kart 8 Deluxe 8-player bracket tournament on 120" wall.',
          'Cyberpunk Polaroid photobooth with futuristic LED visor props and graffiti backdrop.',
          'Curated Synthwave / Nu-Disco music playlist synced to smart LED bars.'
        ],
        scheduleHighlights: [
          '7:00 PM: Welcome neon face painting and signature glow drinks',
          '8:30 PM: Mario Kart tournament quarterfinals and food rush',
          '10:00 PM: Cyberpunk cake cutting with sparklers & EDM dance floor'
        ]
      },
      venueSelectionCriteria: {
        recommendedType: 'Private Rooftop Lounge or Boutique Industrial Studio',
        capacityNeeded: '40 - 50 guests with dedicated gaming & lounge areas',
        mustHaves: ['Dimming / blackout capability for UV effect', 'Quality sound setup', 'Wall space for projection']
      },
      budgetAllocations: [
        { category: 'catering', percentage: 33, allocatedAmount: 28000, notes: 'Finger foods, snacks & glow mocktail bar' },
        { category: 'venue', percentage: 29, allocatedAmount: 25000, notes: 'Terrace venue rental for 5 hours' },
        { category: 'decoration', percentage: 14, allocatedAmount: 12000, notes: 'UV lights, neon sign & photowall props' },
        { category: 'photography', percentage: 10, allocatedAmount: 8000, notes: 'Polaroid camera rental & 100 film prints' },
        { category: 'entertainment', percentage: 8, allocatedAmount: 7000, notes: 'Projector rental & gaming console tournament gear' },
        { category: 'miscellaneous', percentage: 6, allocatedAmount: 5000, notes: 'Custom theme cake, sparklers & glow accessories' }
      ],
      timelineMilestones: [
        { title: 'Lock Rooftop Venue & Agree on Sound Curfew', description: 'Confirm projector wall space and outdoor power outlets.', category: 'Venue', milestoneDaysBefore: 20, priority: 'high' },
        { title: 'Finalize Custom Neon Sign & Order UV Tubes', description: 'Verify dimensions and cable extensions for terrace mounting.', category: 'Decor', milestoneDaysBefore: 15, priority: 'medium' },
        { title: 'Collect Guest Song Requests & Food Choices', description: 'Setup shared Spotify collaborative playlist and confirm RSVP tally.', category: 'Music', milestoneDaysBefore: 7, priority: 'medium' },
        { title: 'Pick Up Cake & Assemble Glow Packs', description: 'Prepare guest welcome badges with retro gamer tags.', category: 'Execution', milestoneDaysBefore: 0, priority: 'high' }
      ],
      vendorChecklist: [
        { name: 'Skyline Terrace Lounge', category: 'venue', estimatedCost: 25000, status: 'booked', notes: 'Advance paid' },
        { name: 'Artisan Catering Co', category: 'catering', estimatedCost: 28000, status: 'shortlisted', notes: 'Menu finalized' },
        { name: 'NeonForge Studio', category: 'decoration', estimatedCost: 12000, status: 'booked', notes: 'In production' }
      ],
      personalizedRecommendations: [
        'Include a "Cyberpunk Dress Code: Neon, Silver, or Black" note on invitations to amplify the blacklight aesthetic.',
        'Use tonic water in mocktails—its quinine content naturally fluoresces vivid cyan blue under UV light without artificial dyes.',
        'Have a designated friend capture video reels of the final Mario Kart race for Instagram.'
      ],
      costSavingAlternatives: [
        {
          tip: 'Rent a Polaroid camera with films instead of hiring a full-day photographer',
          potentialSavings: 15000,
          impact: 'Gives guests instant tangible keepsakes and a fun interactive party activity'
        },
        {
          tip: 'Use a curated high-bitrate Spotify playlist instead of a private club DJ',
          potentialSavings: 12000,
          impact: 'Allows total playlist customization with zero awkward song transitions'
        },
        {
          tip: 'Order finger food platters instead of a formal sit-down meal',
          potentialSavings: 8000,
          impact: 'Perfect for casual mingling and prevents heavy food waste'
        }
      ],
      isAiGenerated: true,
      modelUsed: 'Eventora GenAI Engine (Boutique Party Suite)'
    }
  },

  community: {
    id: 'demo-community',
    event: {
      id: 'demo-community',
      name: 'Green Horizon Eco & Sustainable Living Fair',
      type: 'community',
      date: getFutureDate(60),
      location: 'Bandra Amphitheatre & Gardens, Mumbai',
      guestCount: 600,
      totalBudget: 350000, // ₹3,50,000
      theme: 'Zero-Waste, Upcycled Living & Community Gardening',
      foodPreference: 'vegan',
      priorities: ['sustainability', 'family-friendly', 'affordability'],
      importantRequirements: 'Zero single-use plastic, community composting station, kids clay workshop, acoustic indie performances.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    expenses: [
      {
        id: 'exp-c1',
        eventId: 'demo-community',
        title: 'Public Amphitheatre & Municipal Grounds Permit',
        category: 'venue',
        estimatedCost: 65000,
        actualCost: 65000,
        isPaid: true,
        vendorName: 'BMC Ward Office & Parks Dept',
        notes: 'Covers full day permit, sanitation crew, and security deposit',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c2',
        eventId: 'demo-community',
        title: 'Biodegradable Areca Palm Ware & Organic Millet Snacks',
        category: 'catering',
        estimatedCost: 110000,
        actualCost: 105000,
        isPaid: false,
        vendorName: 'Prakriti Organic Collective',
        notes: 'Water stations with steel dispensers, millet bhel, herbal teas',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c3',
        eventId: 'demo-community',
        title: 'Bamboo Stalls, Khadi Banners & Potted Plant Partitions',
        category: 'decoration',
        estimatedCost: 60000,
        actualCost: 58000,
        isPaid: true,
        vendorName: 'Gramin Eco Crafts',
        notes: '100% recyclable, zero flex banners, reusable jute signage',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c4',
        eventId: 'demo-community',
        title: 'Community Photographer & High School Media Volunteers',
        category: 'photography',
        estimatedCost: 25000,
        actualCost: 22000,
        isPaid: false,
        vendorName: 'FrameWorks Collective',
        notes: 'Highlight video for NGO sponsors and high-res event gallery',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c5',
        eventId: 'demo-community',
        title: 'Acoustic Sound System, Pottery Wheel & Upcycling Demos',
        category: 'entertainment',
        estimatedCost: 45000,
        actualCost: 42000,
        isPaid: true,
        vendorName: 'SoundGarden Acoustics',
        notes: 'Microphones for panel discussions + live indie acoustic duos',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c6',
        eventId: 'demo-community',
        title: 'Waste Segregation Stations & Composting Transport',
        category: 'transport',
        estimatedCost: 25000,
        actualCost: 24000,
        isPaid: true,
        vendorName: 'CleanMumbai Green Shuttles',
        notes: 'Transport wet waste directly to community biogas facility',
        createdAt: new Date().toISOString()
      },
      {
        id: 'exp-c7',
        eventId: 'demo-community',
        title: 'First Aid Booth, Safety Badges & Volunteer T-Shirts',
        category: 'miscellaneous',
        estimatedCost: 20000,
        actualCost: 19000,
        isPaid: true,
        vendorName: 'Khadi Seva Kendra',
        notes: 'Organic cotton volunteer badges and emergency kit station',
        createdAt: new Date().toISOString()
      }
    ],
    tasks: [
      {
        id: 'task-c1',
        eventId: 'demo-community',
        title: 'Secure Municipal Parks & Police Sound Permissions',
        description: 'Submit route map, fire safety NOC, and acoustic decibel certificate.',
        category: 'Permissions',
        dueDate: calculateDueDate(getFutureDate(60), 45),
        priority: 'high',
        completed: true,
        milestoneDaysBefore: 45
      },
      {
        id: 'task-c2',
        eventId: 'demo-community',
        title: 'Recruit 30 College Student Volunteers & Brief Leads',
        description: 'Assign teams for registration, workshop assist, and zero-waste segregation.',
        category: 'Volunteers',
        dueDate: calculateDueDate(getFutureDate(60), 30),
        priority: 'high',
        completed: true,
        milestoneDaysBefore: 30
      },
      {
        id: 'task-c3',
        eventId: 'demo-community',
        title: 'Finalize 20 Eco-Artisan Stalls & Workshop Timetable',
        description: 'Review natural soap makers, seed paper artists, and terrace gardening mentors.',
        category: 'Stalls',
        dueDate: calculateDueDate(getFutureDate(60), 20),
        priority: 'medium',
        completed: true,
        milestoneDaysBefore: 20
      },
      {
        id: 'task-c4',
        eventId: 'demo-community',
        title: 'Set Up 4-Bin Waste Segregation & Water Refill Hubs',
        description: 'Label Wet Organic, Dry Paper, Glass/Metal, and Reject with pictorial signs.',
        category: 'Logistics',
        dueDate: calculateDueDate(getFutureDate(60), 7),
        priority: 'high',
        completed: false,
        milestoneDaysBefore: 7
      },
      {
        id: 'task-c5',
        eventId: 'demo-community',
        title: 'Event Morning Safety Briefing & Sound Check',
        description: 'Distribute volunteer walkie-talkies and test amphitheatre acoustic mics.',
        category: 'Execution',
        dueDate: getFutureDate(60),
        priority: 'high',
        completed: false,
        milestoneDaysBefore: 0
      }
    ],
    vendors: [
      {
        id: 'v-c1',
        eventId: 'demo-community',
        name: 'BMC Parks & Grounds Department',
        category: 'venue',
        contactPerson: 'Sanjay Jadhav',
        phone: '+91 98200 77665',
        email: 'parks.bandra@mcgm.gov.in',
        estimatedCost: 65000,
        actualCost: 65000,
        status: 'booked',
        notes: 'Official permit issued with sound allowance until 9 PM.',
        isSample: true
      },
      {
        id: 'v-c2',
        eventId: 'demo-community',
        name: 'Prakriti Organic Collective',
        category: 'catering',
        contactPerson: 'Anjali Sharma',
        phone: '+91 98330 33441',
        email: 'contact@prakritiorganic.in',
        estimatedCost: 110000,
        actualCost: 105000,
        status: 'booked',
        notes: 'Supply agreement signed for 600 compostable meal packs.',
        isSample: true
      },
      {
        id: 'v-c3',
        eventId: 'demo-community',
        name: 'Gramin Eco Crafts & Bamboo',
        category: 'decoration',
        contactPerson: 'Gopal Patil',
        phone: '+91 97690 88776',
        email: 'gopal@gramincrafts.org',
        estimatedCost: 60000,
        actualCost: 58000,
        status: 'booked',
        notes: '20 modular bamboo stalls to be erected morning of event.',
        isSample: true
      }
    ],
    plan: {
      conceptAndTheme: {
        title: 'Green Horizon: Community Eco-Living & Zero-Waste Fair',
        narrative: 'A community-led gathering celebrating urban composting, organic agriculture, clean energy, and conscious artisan crafts in an open-air public garden setting.',
        colorPalette: ['#10B981', '#06B6D4', '#84CC16', '#3B82F6', '#1E293B'],
        atmosphere: 'Inclusive, educational, joyful, and environmentally transformative.'
      },
      decorAndLighting: {
        suggestions: [
          'Hand-painted cotton and jute pennants suspended between eucalyptus trees.',
          'Living plant partition walls using local potted ferns and crotons (given away to attendees afterwards).',
          'Solar-powered warm festoon lighting powered by a mobile micro-photovoltaic cart.'
        ],
        highlights: 'Central upcycled art installation crafted by neighbourhood school children.',
        lightingStyle: 'Natural daylight focus with soft solar-powered ambient lanterns for sunset.'
      },
      foodAndCatering: {
        menuConcepts: [
          'Cold-pressed seasonal sugarcane, kokum, and bael juices served in reusable glasses.',
          'Organic sprouted millet bhel, steamed momos, and ragi laddoos.',
          'Community bring-your-own-cup tea and filter coffee counter.'
        ],
        serviceStyle: 'Self-serve hygienic buffet with wash-and-reuse stainless steel plate station.',
        dietaryNotes: '100% plant-based / vegan and nut-allergy safe options clearly marked.'
      },
      entertainmentAndActivities: {
        activities: [
          'Terrace gardening & kitchen waste composting masterclass by master horticulturists.',
          'Kids hands-on clay pottery & seed bomb rolling workshop.',
          'Unplugged acoustic folk music by local college singer-songwriters.'
        ],
        scheduleHighlights: [
          '10:00 AM: Inaugural panel & farmers market opens',
          '2:00 PM: Kids zero-waste quiz and pottery showcase',
          '5:00 PM: Sunset acoustic music and tree sapling distribution'
        ]
      },
      venueSelectionCriteria: {
        recommendedType: 'Public Municipal Park, Botanical Garden, or Community Amphitheatre',
        capacityNeeded: '500 - 800 rolling visitors throughout the day',
        mustHaves: ['Tree shade & open circulation', 'Potable water connection', 'Wheelchair accessibility']
      },
      budgetAllocations: [
        { category: 'catering', percentage: 31, allocatedAmount: 110000, notes: 'Organic snacks, herbal drinks & reusable dishwashing' },
        { category: 'venue', percentage: 19, allocatedAmount: 65000, notes: 'Municipal ground permit & safety deposit' },
        { category: 'decoration', percentage: 17, allocatedAmount: 60000, notes: 'Bamboo stalls, jute signs & live potted plants' },
        { category: 'entertainment', percentage: 13, allocatedAmount: 45000, notes: 'Acoustic PA system & workshop equipment' },
        { category: 'transport', percentage: 7, allocatedAmount: 25000, notes: 'Compost transport & equipment loading shuttles' },
        { category: 'photography', percentage: 7, allocatedAmount: 25000, notes: 'Student media team & event highlight reel' },
        { category: 'miscellaneous', percentage: 6, allocatedAmount: 20000, notes: 'First aid stall, badges & emergency reserve' }
      ],
      timelineMilestones: [
        { title: 'Apply for BMC Ward Permit & Green NOC', description: 'Submit event description and zero-plastic affidavit.', category: 'Permits', milestoneDaysBefore: 45, priority: 'high' },
        { title: 'Screen & Select 20 Sustainable Vendor Stalls', description: 'Verify zero-plastic packaging guidelines with every exhibitor.', category: 'Vendors', milestoneDaysBefore: 30, priority: 'high' },
        { title: 'Conduct Volunteer Orientation & First Aid Training', description: 'Assign sector captains for waste hubs and entry queues.', category: 'Volunteers', milestoneDaysBefore: 14, priority: 'medium' },
        { title: 'Erect Bamboo Stalls & Setup Solar Sound Array', description: 'Dry-run microphones and acoustic monitor levels.', category: 'Execution', milestoneDaysBefore: 0, priority: 'high' }
      ],
      vendorChecklist: [
        { name: 'Municipal Parks Board', category: 'venue', estimatedCost: 65000, status: 'booked', notes: 'Sanction order approved' },
        { name: 'Prakriti Organic Catering', category: 'catering', estimatedCost: 110000, status: 'booked', notes: 'Areca palm plates included' },
        { name: 'Gramin Bamboo Crafts', category: 'decoration', estimatedCost: 60000, status: 'booked', notes: 'Setup crew ready' }
      ],
      personalizedRecommendations: [
        'Place "Bring Your Own Bottle" reminders on digital posters to reduce required water tumbler stocks by 70%.',
        'Partner with a local nursery to sponsor 300 free native saplings (Neem, Gulmohar, Tulsi) as event exit gifts.',
        'Set up a live digital "Carbon Offset & Waste Diverted" tally board at the exit to inspire attendees.'
      ],
      costSavingAlternatives: [
        {
          tip: 'Use bamboo frames and jute fabric instead of metal trussing and vinyl flex banners',
          potentialSavings: 35000,
          impact: 'Eliminates toxic plastic flex while enhancing the rustic, authentic community vibe'
        },
        {
          tip: 'Engage local college music clubs for acoustic sets instead of commercial stage performers',
          potentialSavings: 30000,
          impact: 'Offers emerging youth artists a stage while maintaining a gentle, park-friendly acoustic soundscape'
        },
        {
          tip: 'Rent potted plants from local nursery cooperatives instead of cut flower bouquets',
          potentialSavings: 20000,
          impact: 'Zero floral waste; plants are returned or adopted by community members'
        }
      ],
      isAiGenerated: true,
      modelUsed: 'Eventora GenAI Engine (Community & Eco Suite)'
    }
  }
}

export const INITIAL_IDEAS: EventIdea[] = [
  {
    id: 'idea-1',
    title: 'Zero-Waste Marigold Blessing Station',
    category: 'Sustainable Ideas',
    description: 'Provide guests with woven palm cones filled with dried organic marigold petals and neem leaves instead of synthetic glitter or confetti.',
    estimatedBudgetImpact: 'Saves ~₹15,000 compared to synthetic confetti cannons',
    tags: ['Eco-friendly', 'Traditional', 'Weddings'],
    isSaved: true
  },
  {
    id: 'idea-2',
    title: 'Fluorescent Tonic Glow Bar',
    category: 'Food & Beverage',
    description: 'Use natural quinine in tonic water with blueberry and mint syrups under 395nm blacklight for an electric glowing beverage without artificial chemical dyes.',
    estimatedBudgetImpact: 'Budget neutral (~₹2,500 total syrups and tonic)',
    tags: ['Neon', 'Mocktails', 'Birthdays'],
    isSaved: true
  },
  {
    id: 'idea-3',
    title: 'Living Bonsai & Succulent Table Centerpieces',
    category: 'Decor & Theme',
    description: 'Replace short-lived cut flowers with miniature potted succulents and jades. Invite guests to adopt their table centerpiece at the end of the evening.',
    estimatedBudgetImpact: 'Cuts floral wastage by 100% and doubles as wedding favor',
    tags: ['Sustainable', 'Favors', 'Centerpiece'],
    isSaved: false
  },
  {
    id: 'idea-4',
    title: 'QR Code Collaborative Photo Mosaic',
    category: 'Activities & Tech',
    description: 'Place tabletop cards with a direct QR upload link. Guest camera snaps are displayed in real-time on a digital screen wall forming a live photo mosaic.',
    estimatedBudgetImpact: 'Saves ~₹30,000 on extra roving paparazzi photographers',
    tags: ['Interactive', 'Tech', 'Memories'],
    isSaved: false
  },
  {
    id: 'idea-5',
    title: 'Acoustic Sufi & Folk Firepit Jam',
    category: 'Entertainment',
    description: 'Arrange circular low-cushion baithak seating around a safe central firepit or brass lamp array for an intimate post-dinner acoustic unplugged session.',
    estimatedBudgetImpact: 'Saves ~₹40,000 compared to a heavy stage trussing setup',
    tags: ['Intimate', 'Soulful', 'All Events'],
    isSaved: false
  },
  {
    id: 'idea-6',
    title: 'DIY Street Food & Chaat Cart Row',
    category: 'Food & Beverage',
    description: 'Commission local traditional vendors (Pani Puri, Kathi Roll, Dosa) with branded cart decor. Guests love the theatrical experience and authentic flavors.',
    estimatedBudgetImpact: 'Reduces catering cost by ~20-25% per plate',
    tags: ['Authentic', 'Crowd-Pleaser', 'Budget Friendly'],
    isSaved: true
  }
]
