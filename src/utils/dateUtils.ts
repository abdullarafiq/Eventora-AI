/**
 * Utility functions for date calculations, milestones, and formatting
 */

export function calculateDaysRemaining(eventDate: string): number {
  const target = new Date(eventDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatDateReadable(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

/**
 * Calculates due date based on event date minus days before
 */
export function calculateDueDate(eventDateStr: string, daysBefore: number): string {
  const eventDate = new Date(eventDateStr)
  if (isNaN(eventDate.getTime())) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const dueDate = new Date(eventDate)
  dueDate.setDate(dueDate.getDate() - daysBefore)
  return dueDate.toISOString().split('T')[0]
}

export function isTaskOverdue(dueDateStr: string, completed: boolean): boolean {
  if (completed) return false
  const due = new Date(dueDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  return due.getTime() < today.getTime()
}
