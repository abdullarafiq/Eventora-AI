import { useState, useEffect, lazy, Suspense } from 'react'
import { Navbar } from './components/Navbar'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initializeStorage } from './utils/storage'
import type { EventDetails } from './types'

// Lazy-load pages and heavy modals for optimal bundle splitting
const EventCreationWizard = lazy(() => import('./components/EventCreationWizard').then(m => ({ default: m.EventCreationWizard })))
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AiPlannerPage = lazy(() => import('./pages/AiPlannerPage').then(m => ({ default: m.AiPlannerPage })))
const BudgetDashboardPage = lazy(() => import('./pages/BudgetDashboardPage').then(m => ({ default: m.BudgetDashboardPage })))
const TimelinePlannerPage = lazy(() => import('./pages/TimelinePlannerPage').then(m => ({ default: m.TimelinePlannerPage })))
const VendorManagementPage = lazy(() => import('./pages/VendorManagementPage').then(m => ({ default: m.VendorManagementPage })))
const IdeasGeneratorPage = lazy(() => import('./pages/IdeasGeneratorPage').then(m => ({ default: m.IdeasGeneratorPage })))

const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
    <div className="glass-panel h-36 rounded-3xl border border-white/5 bg-slate-900/40" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass-panel h-48 rounded-3xl border border-white/5 bg-slate-900/40" />
      <div className="glass-panel h-48 rounded-3xl border border-white/5 bg-slate-900/40" />
      <div className="glass-panel h-48 rounded-3xl border border-white/5 bg-slate-900/40" />
    </div>
  </div>
)

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing')
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false)

  useEffect(() => {
    initializeStorage()
  }, [])

  const handleEventCreated = (_newEvent: EventDetails) => {
    setCurrentTab('ai-planner')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#070814] text-slate-100">
        
        {/* Global Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenCreateWizard={() => setIsWizardOpen(true)}
        />

        {/* Main View Body with Suspense code-splitting */}
        <main className="flex-1">
          <Suspense fallback={<PageSkeleton />}>
            {currentTab === 'landing' && (
              <LandingPage
                onPlanEvent={() => setIsWizardOpen(true)}
                onExploreDemo={() => setCurrentTab('dashboard')}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardPage
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenCreateWizard={() => setIsWizardOpen(true)}
              />
            )}

            {currentTab === 'ai-planner' && (
              <AiPlannerPage
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onOpenCreateWizard={() => setIsWizardOpen(true)}
              />
            )}

            {currentTab === 'budget' && (
              <BudgetDashboardPage />
            )}

            {currentTab === 'timeline' && (
              <TimelinePlannerPage />
            )}

            {currentTab === 'vendors' && (
              <VendorManagementPage />
            )}

            {currentTab === 'ideas' && (
              <IdeasGeneratorPage />
            )}
          </Suspense>
        </main>

        {/* Event Creation Wizard Modal (Deferred) */}
        {isWizardOpen && (
          <Suspense fallback={null}>
            <EventCreationWizard
              isOpen={isWizardOpen}
              onClose={() => setIsWizardOpen(false)}
              onEventCreated={handleEventCreated}
            />
          </Suspense>
        )}

      </div>
    </ErrorBoundary>
  )
}

export default App
