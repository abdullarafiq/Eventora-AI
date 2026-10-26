# ✨ Eventora AI — 3D GenAI Event Planning Assistant

> **"Your Dream Event. Perfectly Planned by AI."**  
> An intelligent event-planning platform combining modern SaaS dashboards, generative AI event intelligence, and an interactive 3D WebGL visual celebration canvas.

---

## 🌟 Product Vision & Capabilities

**Eventora AI** solves the core challenges of organizing weddings, milestone birthdays, and community gatherings by transforming fragmented logistics into a cohesive, mathematically verified, and beautifully animated workflow.

### Key Highlights:
1. **Interactive 3D Celebration Experience**:
   - Built with **Three.js** featuring floating metallic celebration balloons, holographic geometric torus rings, crystal gems, and a dynamic gold/violet/cyan/pink particle spark system.
   - Real-time mouse coordinate parallax responsiveness.
   - Built-in accessibility controls: **Reduced Motion Toggle** and **Pause/Resume** button directly in the canvas overlay, with a graceful 2D fallback for unsupported devices.
2. **Multi-Step Event Creation Wizard**:
   - Step 1: Core Basics (Event Type, Title, Target Date, Location).
   - Step 2: Scale & Budget (Guest Count slider, Indian Rupee ₹ inputs with real-time formatting).
   - Step 3: Aesthetics & Priorities (Theme, Food preferences, Priorities like Luxury, Eco-Friendly, Budget-Conscious).
   - Instant auto-fill presets for hackathon judges (`Palace Wedding`, `Retro Birthday`, `Eco-Fest`).
   - Confetti particle explosion upon creation (`canvas-confetti`).
3. **10-Deliverable GenAI Planning Assistant**:
   - Event Concept & Narrative Theme
   - Decoration & Architectural Lighting
   - Regional Food & Catering Studio
   - Entertainment Flow & Run of Show
   - Venue Selection Criteria & Must-Haves
   - Categorized Budget Allocations (adds up to 100% of user's INR budget)
   - T-90, T-60, T-30, T-14, T-7 Day Milestone Timelines
   - Categorized Vendor Checklist
   - Personalized Heuristic Recommendations
   - Practical Cost-Saving Alternatives (calculated potential INR savings)
   - **One-Click "Apply to Event Plan"**: Injects AI recommendations straight into the live budget tracker and task timeline!
4. **Smart Budget Dashboard**:
   - Total Budget, Estimated Cost, Actual Realized Cost, Remaining Balance / Deficit.
   - Indian Rupee Currency System (`₹25,00,000`, `₹1.5 L`, `₹85 K`).
   - Interactive Recharts Donut Chart (Expenditure Category Distribution).
   - Interactive Recharts Bar Chart (Projected vs. Actual Realized Spending).
   - Full Expense CRUD with category filtering, payment status, and vendor links.
   - Real-time Overbudget Warning with specific cost-reduction suggestions.
5. **Event Timeline Planner**:
   - Dynamic milestones based on the actual event date (`T-90`, `T-60`, `T-30`, etc.).
   - Due date tracking, priority tags (`High`, `Medium`, `Low`), task checkboxes.
   - Automatic overdue task detection (highlighted in red with in-app alerts).
   - Live completion meter percentage bar.
6. **Vendor Management Hub**:
   - 9 Event Categories: Venue, Catering, Decor, Photography, Entertainment, Makeup, Invitations, Transport, Logistics.
   - Status tracking: `To Contact`, `Contacted`, `Shortlisted`, `Booked`, `Completed`.
   - Clear badge separation between **User Verified Entry** and **Sample Baseline**.
   - Vendor booking progress bar.
7. **Personalized Creative Ideas Generator**:
   - Searchable ideas library with bookmarks and category filters.
   - Dynamic prompt generation for custom queries.
   - One-click "Add to Event Plan" button that turns any creative idea into an actionable milestone task.
8. **Executive Main Dashboard**:
   - Central command center displaying live countdown to event day, budget status, upcoming milestones, vendor status summary, and multi-event switcher.

---

## 🏛️ Architecture & Tech Stack

```
Eventora-AI/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx                   # Top navigation with live event switcher & reset demo
│   │   ├── ThreeCelebrationScene.tsx    # 3D Three.js celebration scene with WebGL fallback
│   │   └── EventCreationWizard.tsx      # Multi-step validated event wizard with presets
│   ├── pages/
│   │   ├── LandingPage.tsx              # Hero, 3D canvas, demo scenario launcher, features
│   │   ├── DashboardPage.tsx            # Executive event overview, countdown, metrics
│   │   ├── AiPlannerPage.tsx            # 10-deliverable GenAI assistant & custom prompt refinement
│   │   ├── BudgetDashboardPage.tsx      # Recharts visualizations & expense CRUD
│   │   ├── TimelinePlannerPage.tsx      # Milestone scheduling & overdue alerts
│   │   ├── VendorManagementPage.tsx     # Vendor pipeline & contact tracker
│   │   └── IdeasGeneratorPage.tsx       # Creative ideation hub & bookmarking
│   ├── types/
│   │   └── index.ts                     # TypeScript domain models
│   ├── utils/
│   │   ├── formatCurrency.ts            # Indian Rupee (INR) formatter with Lakh/Crore compact
│   │   ├── dateUtils.ts                 # Milestones, countdowns, overdue detection
│   │   ├── storage.ts                   # LocalStorage persistence & scenario seeder
│   │   ├── demoData.ts                  # 3 comprehensive Indian event scenarios
│   │   └── aiClientFallback.ts          # Deterministic dynamic heuristic plan engine
│   ├── App.tsx                          # Core state, navigation & modal controller
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Tailwind v4 & glassmorphism theme tokens
├── server/
│   ├── index.ts                         # Express 5 server with CORS & rate limiting
│   ├── routes/
│   │   └── ai.ts                        # /api/ai/generate-plan, generate-ideas, budget-advisor
│   ├── services/
│   │   └── aiGenerator.ts               # Gemini 1.5 / OpenAI GPT-4o-mini integration & demo engine
│   ├── middleware/
│   │   └── rateLimiter.ts               # Sliding window rate limiter (40 req/min/IP)
│   └── schemas/
│       └── apiSchemas.ts                # Zod schemas for request validation
├── tests/
│   └── eventora.test.ts                 # Vitest test suite
└── package.json
```

---

## 🎭 3 Built-in Hackathon Scenarios

Eventora AI includes 3 realistic scenarios pre-configured with authentic Indian locations, guest scales, and INR budgets:

| Scenario | Type | Budget (INR) | Guests | Theme & Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav & Meera's Royal Wedding** | Wedding | ₹25,00,000 | 350 | Heritage palace in Udaipur, lakeside mandap, Rajasthani royal feast, drone photography, 7 vendors. |
| **Rohan's 25th Cyberpunk Bash** | Birthday | ₹85,00,000 / ₹85,000 | 45 | Bengaluru rooftop lounge, UV blacklights, Mario Kart projector tournament, fluorescent glow mocktails. |
| **Green Horizon Eco-Fair** | Community | ₹3,50,000 | 600 | Bandra amphitheatre, zero single-use plastic, organic millet snacks, 30 student volunteers, indie acoustic sets. |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested)
- **npm**: v9.0.0 or higher

### Installation
```bash
# Clone or navigate to the repository
cd Eventora-AI

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Contents of `.env`:
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Optional: Add your Google Gemini or OpenAI API Key
# If left empty, Eventora AI uses its built-in Intelligent Heuristic Demo Engine
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### Running Locally
```bash
# Run both the Express backend (port 3001) and Vite frontend (port 5173) concurrently:
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Start Express Backend API
npm run server

# Terminal 2: Start Vite Client
npm run client
```

Open your browser at **[http://localhost:5173](http://localhost:5173)**.

---

## 🧪 Testing Suite

Run the Vitest test suite:
```bash
npm test
```
The test suite covers:
- Indian Rupee Currency formatting (`formatINR`, `formatCompactINR`, negative balances)
- Date milestone calculations (`calculateDaysRemaining`, `calculateDueDate`, `isTaskOverdue`)
- AI Heuristic Plan generator structure & budget sum integrity
- Demo scenarios data integrity

---

## 🔒 Security & Evaluation Parameters

1. **Security**:
   - Zero exposure of API keys in client-side bundles.
   - Express server enforces strict CORS, 1MB JSON body limits, and in-memory sliding window rate-limiting (40 requests/min).
   - Zod schema validation on all incoming API requests.
2. **Efficiency**:
   - Three.js animation loop pauses when minimized; reduced motion toggle for low-power devices.
   - Lightweight procedural geometries and particle buffers avoiding heavy GLTF asset downloads.
   - Instant client fallback if backend is offline.
3. **Accessibility**:
   - High text contrast on dark navy background (`#070814`).
   - Accessible names on icon buttons and ARIA roles for 3D canvas and dialogs.
   - Dedicated "Motion Off" control for users sensitive to 3D movement.
4. **Hackathon Demo Mode**:
   - Full functionality is available **without requiring any API key** or credit card.
   - Built-in "Reset Demos" button in the navigation bar to instantly restore clean scenario states.

---

## 👥 Hackathon Presentation Guide

1. **Start on Landing Page**: Show the hero typography and the live 3D floating balloons and confetti scene. Rotate the scene with your mouse.
2. **Launch a Scenario**: Click **"Launch Wedding Demo"** to show instant data loading for a ₹25 Lakh Udaipur destination wedding.
3. **Show AI Blueprint**: Open **"AI Planner"** to walk through the 10 deliverables, then click **"Apply to Event Plan"**.
4. **Show Smart Budget**: Open **"Smart Budget"** to showcase the Recharts donut & bar charts, add a new expense (e.g. ₹25,000 for Fireworks), and see the live balance recalculate.
5. **Check Timeline & Vendors**: Toggle task checkboxes in **"Timeline"** to see the progress bar animate, and update vendor status in **"Vendors"**.
6. **Create New Event**: Click **"Plan Event"** in the top bar, click the **"Retro Birthday"** auto-fill preset, and generate a new custom plan with confetti animation!
