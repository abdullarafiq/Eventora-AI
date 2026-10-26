import { useState, useEffect, useCallback } from 'react'
import type { EventDetails } from '../types'
import { getActiveEvent, getEvents } from '../utils/storage'

/**
 * Custom hook to subscribe to Eventora AI active event state and updates.
 * Eliminates duplicated subscription logic across pages and prevents cascading renders.
 */
export function useEventoraEvent() {
  const [activeEvent, setActiveEvent] = useState<EventDetails | null>(() => getActiveEvent())
  const [allEvents, setAllEvents] = useState<EventDetails[]>(() => getEvents())

  const refresh = useCallback(() => {
    setActiveEvent(getActiveEvent())
    setAllEvents(getEvents())
  }, [])

  useEffect(() => {
    window.addEventListener('eventora_active_event_changed', refresh)
    window.addEventListener('eventora_data_updated', refresh)
    window.addEventListener('eventora_data_reset', refresh)

    return () => {
      window.removeEventListener('eventora_active_event_changed', refresh)
      window.removeEventListener('eventora_data_updated', refresh)
      window.removeEventListener('eventora_data_reset', refresh)
    }
  }, [refresh])

  return {
    activeEvent,
    allEvents,
    refresh
  }
}
