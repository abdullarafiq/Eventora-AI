import React, { useState, useEffect, useMemo } from 'react'
import {
  Clock, CheckCircle2, Circle, AlertCircle, Plus, Trash2, Edit2,
  Calendar, X
} from 'lucide-react'
import type { EventDetails, TimelineTask } from '../types'
import { getActiveEvent, getTasks, saveTask, deleteTask } from '../utils/storage'
import { calculateDaysRemaining, formatDateReadable, isTaskOverdue, calculateDueDate } from '../utils/dateUtils'

export const TimelinePlannerPage: React.FC = () => {
  const [event, setEvent] = useState<EventDetails | null>(() => getActiveEvent())
  const [tasks, setTasks] = useState<TimelineTask[]>(() => {
    const active = getActiveEvent()
    return active ? getTasks(active.id) : []
  })
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'high'>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingTask, setEditingTask] = useState<TimelineTask | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formCategory, setFormCategory] = useState<string>('General')
  const [formDueDate, setFormDueDate] = useState<string>('')
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [formError, setFormError] = useState<string>('')

  const reloadData = () => {
    const active = getActiveEvent()
    setEvent(active)
    if (active) {
      setTasks(getTasks(active.id))
    }
  }

  useEffect(() => {
    window.addEventListener('eventora_active_event_changed', reloadData)
    window.addEventListener('eventora_data_updated', reloadData)
    return () => {
      window.removeEventListener('eventora_active_event_changed', reloadData)
      window.removeEventListener('eventora_data_updated', reloadData)
    }
  }, [])

  const daysRemaining = event ? calculateDaysRemaining(event.date) : 0

  // Metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const overdueTasks = tasks.filter(t => isTaskOverdue(t.dueDate, t.completed)).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filter === 'pending') return !t.completed
        if (filter === 'completed') return t.completed
        if (filter === 'overdue') return isTaskOverdue(t.dueDate, t.completed)
        if (filter === 'high') return t.priority === 'high'
        return true
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [tasks, filter])

  const handleToggleTask = (task: TimelineTask) => {
    const updated = { ...task, completed: !task.completed }
    saveTask(updated)
    reloadData()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this timeline task?')) {
      deleteTask(id)
      reloadData()
    }
  }

  const openAddModal = () => {
    setEditingTask(null)
    setFormTitle('')
    setFormDescription('')
    setFormCategory('General')
    setFormDueDate(event ? calculateDueDate(event.date, 14) : new Date().toISOString().split('T')[0])
    setFormPriority('medium')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (task: TimelineTask) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormDescription(task.description)
    setFormCategory(task.category)
    setFormDueDate(task.dueDate)
    setFormPriority(task.priority)
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormError('Task title is required')
      return
    }
    if (!formDueDate) {
      setFormError('Due date is required')
      return
    }
    if (!event) return

    const taskItem: TimelineTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      eventId: event.id,
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory.trim() || 'General',
      dueDate: formDueDate,
      priority: formPriority,
      completed: editingTask ? editingTask.completed : false,
      milestoneDaysBefore: Math.max(0, calculateDaysRemaining(formDueDate))
    }

    saveTask(taskItem)
    setIsModalOpen(false)
    reloadData()
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 max-w-md mx-auto">
          <Clock className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Event Selected</h2>
          <p className="text-xs text-slate-400">Please choose or create an event to access its preparation timeline.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner & Countdown */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-pink-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Automated Milestone Schedule</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Event Timeline Planner</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Target Event Date: <strong className="text-white">{formatDateReadable(event.date)}</strong>
          </p>
        </div>

        {/* Days Countdown & Progress */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-violet-950/40 border border-violet-500/30 text-center">
            <div className="text-2xl font-black text-violet-300 font-mono">
              {daysRemaining > 0 ? daysRemaining : '0'}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {daysRemaining > 0 ? 'Days Remaining' : 'Event Day!'}
            </div>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
            <div className="text-2xl font-black text-cyan-300 font-mono">{completionPercentage}%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Milestones Done</div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-lg shadow-violet-600/30 flex items-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & In-App Reminders */}
      <div className="space-y-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Overall Timeline Readiness</span>
            <span className="text-violet-400 font-mono">{completedTasks} of {totalTasks} Tasks Completed</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Overdue Alert Banner if any */}
        {overdueTasks > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs text-rose-200">
                You have <strong>{overdueTasks} overdue task{overdueTasks > 1 ? 's' : ''}</strong> that require immediate attention to keep preparation on track.
              </div>
            </div>
            <button
              onClick={() => setFilter('overdue')}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-rose-300 bg-rose-900/50 border border-rose-500/30 hover:bg-rose-900 transition-colors cursor-pointer shrink-0"
            >
              Show Overdue
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `All Tasks (${totalTasks})` },
            { id: 'pending', label: `Pending (${totalTasks - completedTasks})` },
            { id: 'completed', label: `Completed (${completedTasks})` },
            { id: 'overdue', label: `Overdue (${overdueTasks})` },
            { id: 'high', label: 'High Priority' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Timeline Cards */}
      <div className="space-y-3">
        {filteredTasks.map((t) => {
          const overdue = isTaskOverdue(t.dueDate, t.completed)
          return (
            <div
              key={t.id}
              className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                t.completed
                  ? 'border-white/5 bg-slate-950/40 opacity-70'
                  : overdue
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : 'border-white/10 hover:border-violet-500/40'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  onClick={() => handleToggleTask(t)}
                  className="mt-0.5 text-slate-400 hover:text-violet-400 transition-colors cursor-pointer shrink-0"
                  aria-label={t.completed ? `Mark ${t.title} incomplete` : `Mark ${t.title} complete`}
                >
                  {t.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-violet-400" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {t.category}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      t.priority === 'high' ? 'bg-rose-500/20 text-rose-300' :
                      t.priority === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {t.priority}
                    </span>
                    {overdue && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                        Overdue
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm font-bold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-xs text-slate-400 leading-relaxed">{t.description}</p>
                  )}
                </div>
              </div>

              {/* Due Date & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDateReadable(t.dueDate)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {t.milestoneDaysBefore > 0 ? `T-${t.milestoneDaysBefore} days before` : 'Event Day'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Edit task"
                    aria-label={`Edit ${t.title}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete task"
                    aria-label={`Delete ${t.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredTasks.length === 0 && (
          <div className="glass-panel p-10 rounded-2xl border border-white/10 text-center text-xs text-slate-500">
            No milestones found matching this filter.
          </div>
        )}
      </div>

      {/* Task Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0d0f28] border border-violet-500/30 shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingTask ? 'Edit Milestone Task' : 'Add New Milestone'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Confirm floral mandap 3D rendering with decorator"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Description / Details</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  placeholder="Check lighting clearances, generator backups, and delivery timings"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Venue, Catering, Decor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500 capitalize"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              {formError && <p className="text-xs text-rose-400">{formError}</p>}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md cursor-pointer"
                >
                  {editingTask ? 'Save Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
