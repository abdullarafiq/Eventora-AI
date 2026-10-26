import { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { AiPlannerPage } from './pages/AiPlannerPage'
import { BudgetDashboardPage } from './pages/BudgetDashboardPage'
import { TimelinePlannerPage } from './pages/TimelinePlannerPage'
import { VendorManagementPage } from './pages/VendorManagementPage'
import { IdeasGeneratorPage } from './pages/IdeasGeneratorPage'
import { EventCreationWizard } from './components/EventCreationWizard'
import { initializeStorage } from './utils/storage'
import type { EventDetails } from './types'

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing')
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false)

  useEffect(() => {
    // Seed initial local storage with the 3 rich demo events if empty
    initializeStorage()
  }, [])

  const handleEventCreated = (_newEvent: EventDetails) => {
    // Automatically switch to AI planner so user immediately sees their generated plan!
    setCurrentTab('ai-planner')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070814] text-slate-100">
      
      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateWizard={() => setIsWizardOpen(true)}
      />

      {/* Main View Body */}
      <main className="flex-1">
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
      </main>

      {/* Event Creation Wizard Modal */}
      <EventCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onEventCreated={handleEventCreated}
      />

    </div>
  )
}

export default App
