import React, { useState, useEffect, useMemo } from 'react'
import {
  DollarSign, AlertTriangle, Plus, Trash2, Edit2,
  PieChart as PieIcon, BarChart3, X
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import type { EventDetails, ExpenseItem, BudgetCategory } from '../types'
import { getActiveEvent, getExpenses, saveExpense, deleteExpense } from '../utils/storage'
import { formatINR, formatCompactINR } from '../utils/formatCurrency'

const CATEGORY_COLORS: Record<string, string> = {
  venue: '#8B5CF6',        // Violet
  catering: '#F59E0B',     // Amber
  decoration: '#EC4899',   // Pink
  photography: '#06B6D4',  // Cyan
  entertainment: '#10B981',// Emerald
  transport: '#6366F1',    // Indigo
  miscellaneous: '#64748B' // Slate
}

export const BudgetDashboardPage: React.FC = () => {
  const [event, setEvent] = useState<EventDetails | null>(() => getActiveEvent())
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const active = getActiveEvent()
    return active ? getExpenses(active.id) : []
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState<string>('')
  const [formCategory, setFormCategory] = useState<BudgetCategory>('venue')
  const [formEstimated, setFormEstimated] = useState<number>(0)
  const [formActual, setFormActual] = useState<number>(0)
  const [formPaid, setFormPaid] = useState<boolean>(false)
  const [formVendor, setFormVendor] = useState<string>('')
  const [formNotes, setFormNotes] = useState<string>('')
  const [formError, setFormError] = useState<string>('')

  const reloadData = () => {
    const active = getActiveEvent()
    setEvent(active)
    if (active) {
      setExpenses(getExpenses(active.id))
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

  // Calculations
  const totalBudget = event?.totalBudget || 0
  const totalEstimated = useMemo(() => expenses.reduce((sum, e) => sum + (e.estimatedCost || 0), 0), [expenses])
  const totalActual = useMemo(() => expenses.reduce((sum, e) => sum + (e.actualCost || 0), 0), [expenses])
  const remainingBudget = totalBudget - (totalActual > 0 ? totalActual : totalEstimated)
  const isOverBudget = remainingBudget < 0
  const budgetSpentPercentage = totalBudget > 0 ? Math.min(100, Math.round(((totalActual > 0 ? totalActual : totalEstimated) / totalBudget) * 100)) : 0

  // Category Aggregates for Charts
  const categoryData = useMemo(() => {
    const map: Record<string, { category: string; estimated: number; actual: number }> = {}
    const categories: BudgetCategory[] = ['venue', 'catering', 'decoration', 'photography', 'entertainment', 'transport', 'miscellaneous']
    
    categories.forEach(c => {
      map[c] = { category: c, estimated: 0, actual: 0 }
    })

    expenses.forEach(e => {
      if (map[e.category]) {
        map[e.category].estimated += (e.estimatedCost || 0)
        map[e.category].actual += (e.actualCost || 0)
      }
    })

    return Object.values(map).filter(item => item.estimated > 0 || item.actual > 0)
  }, [expenses])

  const pieData = useMemo(() => {
    return categoryData.map(c => ({
      name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
      value: c.actual > 0 ? c.actual : c.estimated,
      color: CATEGORY_COLORS[c.category] || '#A855F7'
    }))
  }, [categoryData])

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses
    return expenses.filter(e => e.category === selectedCategory)
  }, [expenses, selectedCategory])

  const openAddModal = () => {
    setEditingExpense(null)
    setFormTitle('')
    setFormCategory('venue')
    setFormEstimated(0)
    setFormActual(0)
    setFormPaid(false)
    setFormVendor('')
    setFormNotes('')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (exp: ExpenseItem) => {
    setEditingExpense(exp)
    setFormTitle(exp.title)
    setFormCategory(exp.category)
    setFormEstimated(exp.estimatedCost)
    setFormActual(exp.actualCost)
    setFormPaid(exp.isPaid)
    setFormVendor(exp.vendorName || '')
    setFormNotes(exp.notes || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormError('Please enter an expense title')
      return
    }
    if (formEstimated < 0 || formActual < 0) {
      setFormError('Amounts cannot be negative')
      return
    }
    if (!event) return

    const expenseItem: ExpenseItem = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      eventId: event.id,
      title: formTitle.trim(),
      category: formCategory,
      estimatedCost: Number(formEstimated) || 0,
      actualCost: Number(formActual) || 0,
      isPaid: formPaid,
      vendorName: formVendor.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString()
    }

    saveExpense(expenseItem)
    setIsModalOpen(false)
    reloadData()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this expense line item?')) {
      deleteExpense(id)
      reloadData()
    }
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 max-w-md mx-auto">
          <DollarSign className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Event Found</h2>
          <p className="text-xs text-slate-400">Please create an event first to track its budget.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Financial Command Center</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Smart Budget Dashboard</h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Over-Budget Alert Banner */}
      {isOverBudget && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-white">Budget Deficit Warning</div>
              <p className="text-xs text-rose-200 mt-0.5">
                Total expenditure exceeds the allocated budget by <strong>{formatINR(Math.abs(remainingBudget))}</strong>. Consider reviewing the cost-saving suggestions below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCategory('venue')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-200 bg-rose-900/60 border border-rose-500/40 hover:bg-rose-900 self-start sm:self-center cursor-pointer"
          >
            Review High Cost Items
          </button>
        </div>
      )}

      {/* Top 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Budget */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Total Target Budget</div>
          <div className="text-2xl font-black text-white font-mono">{formatINR(totalBudget)}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400"></span>
            <span>Allocated baseline</span>
          </div>
        </div>

        {/* Estimated Expenses */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Projected Estimates</div>
          <div className="text-2xl font-black text-cyan-300 font-mono">{formatINR(totalEstimated)}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>{expenses.length} itemized lines</span>
          </div>
        </div>

        {/* Actual Expenses */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Actual Realized Cost</div>
          <div className="text-2xl font-black text-pink-300 font-mono">{formatINR(totalActual)}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400"></span>
            <span>Committed & paid so far</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className={`glass-panel p-6 rounded-3xl border relative overflow-hidden ${
          isOverBudget ? 'border-rose-500/50 bg-rose-950/20' : 'border-emerald-500/30 bg-emerald-950/10'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {isOverBudget ? 'Deficit' : 'Remaining Balance'}
          </div>
          <div className={`text-2xl font-black font-mono ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatINR(remainingBudget)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
            <span>{budgetSpentPercentage}% budget utilized</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Row: Category Donut & Estimated vs Actual Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400">Expenditure Share</div>
              <h3 className="text-lg font-bold text-white">Category Distribution</h3>
            </div>
            <PieIcon className="w-5 h-5 text-violet-400" />
          </div>

          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{ backgroundColor: '#0e1026', borderColor: '#8b5cf6', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No expense entries yet. Add one above.
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 px-2 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated vs Actual Bar Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Comparison</div>
              <h3 className="text-lg font-bold text-white">Estimated vs Actual Spending</h3>
            </div>
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252849" />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => val.slice(0, 4).toUpperCase()}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(val) => formatCompactINR(val)}
                  />
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{ backgroundColor: '#0e1026', borderColor: '#06b6d4', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="estimated" name="Estimated" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No expense entries yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Expense Management Table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Itemized Expenses</h3>
            <p className="text-xs text-slate-400">Manage individual quotations, payments, and vendor contracts.</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'venue', 'catering', 'decoration', 'photography', 'entertainment', 'transport', 'miscellaneous'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Item Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Vendor</th>
                <th className="py-3 px-3 font-mono">Estimated</th>
                <th className="py-3 px-3 font-mono">Actual</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {exp.title}
                    {exp.notes && <div className="text-[10px] text-slate-400 font-normal mt-0.5">{exp.notes}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[exp.category]}25`,
                        color: CATEGORY_COLORS[exp.category] || '#ffffff'
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{exp.vendorName || '—'}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-200">{formatINR(exp.estimatedCost)}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-cyan-300">{formatINR(exp.actualCost)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.isPaid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {exp.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit expense"
                        aria-label={`Edit ${exp.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Delete expense"
                        aria-label={`Delete ${exp.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                    No expense records found in this category. Click "Add Expense Item" to record one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal (Add / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0d0f28] border border-violet-500/30 shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingExpense ? 'Edit Expense Item' : 'Add New Expense Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Expense Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Stage Sound & Truss Lighting"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500 capitalize"
                  >
                    {['venue', 'catering', 'decoration', 'photography', 'entertainment', 'transport', 'miscellaneous'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Vendor Partner Name</label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder="e.g. Mewar Lights"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Estimated Cost (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formEstimated}
                    onChange={(e) => setFormEstimated(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs font-mono focus:outline-hidden focus:border-violet-500"
                  />
                  <div className="text-[10px] text-amber-300 mt-1">{formatINR(formEstimated)}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Actual Realized Cost (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formActual}
                    onChange={(e) => setFormActual(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs font-mono focus:outline-hidden focus:border-violet-500"
                  />
                  <div className="text-[10px] text-cyan-300 mt-1">{formatINR(formActual)}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. 50% advance paid, balance due morning of event"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formPaidCheckbox"
                  checked={formPaid}
                  onChange={(e) => setFormPaid(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="formPaidCheckbox" className="text-xs text-slate-200 cursor-pointer">
                  Mark this expense as fully paid
                </label>
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
                  {editingExpense ? 'Save Changes' : 'Add Line Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
