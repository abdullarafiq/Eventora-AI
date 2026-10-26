import React, { useState, useEffect, useMemo } from 'react'
import {
  Users, Plus, Phone, Mail, Edit2, Trash2,
  Filter, X, ShieldCheck
} from 'lucide-react'
import type { EventDetails, VendorItem, VendorStatus } from '../types'
import { getActiveEvent, getVendors, saveVendor, deleteVendor } from '../utils/storage'
import { formatINR } from '../utils/formatCurrency'

const VENDOR_STATUSES: { id: VendorStatus; label: string; color: string }[] = [
  { id: 'to_contact', label: 'To Contact', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  { id: 'contacted', label: 'Contacted', color: 'bg-indigo-950/50 text-indigo-300 border-indigo-700/40' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-cyan-950/50 text-cyan-300 border-cyan-700/40' },
  { id: 'booked', label: 'Booked', color: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/40' },
  { id: 'completed', label: 'Completed', color: 'bg-purple-950/50 text-purple-300 border-purple-700/40' },
]

export const VendorManagementPage: React.FC = () => {
  const [event, setEvent] = useState<EventDetails | null>(() => getActiveEvent())
  const [vendors, setVendors] = useState<VendorItem[]>(() => {
    const active = getActiveEvent()
    return active ? getVendors(active.id) : []
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null)

  // Form State
  const [formName, setFormName] = useState<string>('')
  const [formCategory, setFormCategory] = useState<string>('venue')
  const [formContactPerson, setFormContactPerson] = useState<string>('')
  const [formPhone, setFormPhone] = useState<string>('')
  const [formEmail, setFormEmail] = useState<string>('')
  const [formEstimatedCost, setFormEstimatedCost] = useState<number>(0)
  const [formActualCost, setFormActualCost] = useState<number>(0)
  const [formStatus, setFormStatus] = useState<VendorStatus>('to_contact')
  const [formNotes, setFormNotes] = useState<string>('')
  const [formError, setFormError] = useState<string>('')

  const reloadData = () => {
    const active = getActiveEvent()
    setEvent(active)
    if (active) {
      setVendors(getVendors(active.id))
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

  // Stats
  const totalVendors = vendors.length
  const bookedVendors = vendors.filter(v => v.status === 'booked' || v.status === 'completed').length
  const bookedPercent = totalVendors > 0 ? Math.round((bookedVendors / totalVendors) * 100) : 0
  const totalEstimatedCost = vendors.reduce((s, v) => s + (v.estimatedCost || 0), 0)

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchStatus = statusFilter === 'all' || v.status === statusFilter
      const matchCat = categoryFilter === 'all' || v.category === categoryFilter
      return matchStatus && matchCat
    })
  }, [vendors, statusFilter, categoryFilter])

  const openAddModal = () => {
    setEditingVendor(null)
    setFormName('')
    setFormCategory('venue')
    setFormContactPerson('')
    setFormPhone('')
    setFormEmail('')
    setFormEstimatedCost(0)
    setFormActualCost(0)
    setFormStatus('to_contact')
    setFormNotes('')
    setFormError('')
    setIsModalOpen(true)
  }

  const openEditModal = (vendor: VendorItem) => {
    setEditingVendor(vendor)
    setFormName(vendor.name)
    setFormCategory(vendor.category)
    setFormContactPerson(vendor.contactPerson || '')
    setFormPhone(vendor.phone || '')
    setFormEmail(vendor.email || '')
    setFormEstimatedCost(vendor.estimatedCost)
    setFormActualCost(vendor.actualCost || 0)
    setFormStatus(vendor.status)
    setFormNotes(vendor.notes || '')
    setFormError('')
    setIsModalOpen(true)
  }

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError('Vendor name is required')
      return
    }
    if (!event) return

    const vendorItem: VendorItem = {
      id: editingVendor ? editingVendor.id : `ven-${Date.now()}`,
      eventId: event.id,
      name: formName.trim(),
      category: formCategory as any,
      contactPerson: formContactPerson.trim() || undefined,
      phone: formPhone.trim() || undefined,
      email: formEmail.trim() || undefined,
      estimatedCost: Number(formEstimatedCost) || 0,
      actualCost: Number(formActualCost) || undefined,
      status: formStatus,
      notes: formNotes.trim() || undefined,
      isSample: editingVendor ? editingVendor.isSample : false
    }

    saveVendor(vendorItem)
    setIsModalOpen(false)
    reloadData()
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this vendor from checklist?')) {
      deleteVendor(id)
      reloadData()
    }
  }

  const handleQuickStatusChange = (vendor: VendorItem, nextStatus: VendorStatus) => {
    saveVendor({ ...vendor, status: nextStatus })
    reloadData()
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 max-w-md mx-auto">
          <Users className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Event Selected</h2>
          <p className="text-xs text-slate-400">Please choose or create an event to track vendors.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Top Banner & Stats */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Service Directory & Contracts</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300">{event.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Vendor Management Hub</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Organize caterers, decorators, venues, photographers, and entertainment partners in one central place.
          </p>
        </div>

        {/* Stats & Add Button */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {bookedVendors} / {totalVendors}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vendors Booked</div>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-violet-950/40 border border-violet-500/30 text-center">
            <div className="text-2xl font-black text-violet-300 font-mono">{formatINR(totalEstimatedCost)}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Committed Cost</div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Booking Progress Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Contracting & Booking Progress</span>
          <span className="text-cyan-400 font-mono">{bookedPercent}% Confirmed</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${bookedPercent}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Statuses ({totalVendors})
          </button>
          {VENDOR_STATUSES.map(s => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s.label} ({vendors.filter(v => v.status === s.id).length})
            </button>
          ))}
        </div>

        {/* Category Dropdown Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-white capitalize focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {['venue', 'catering', 'decoration', 'photography', 'entertainment', 'makeup', 'invitations', 'equipment', 'transport', 'miscellaneous'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVendors.map((vendor) => {
          const statusObj = VENDOR_STATUSES.find(s => s.id === vendor.status) || VENDOR_STATUSES[0]
          return (
            <div
              key={vendor.id}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header: Category + Sample vs User Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 capitalize">
                    {vendor.category}
                  </span>

                  {vendor.isSample ? (
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5">
                      Sample Baseline
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-cyan-400" />
                      <span>User Verified</span>
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-white leading-snug">{vendor.name}</h3>

                {/* Contact info if available */}
                <div className="space-y-1 text-xs text-slate-300 pt-1">
                  {vendor.contactPerson && (
                    <div className="text-slate-400 text-[11px]">Contact: <span className="text-white font-medium">{vendor.contactPerson}</span></div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Mail className="w-3 h-3 text-violet-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="text-xs text-slate-400 italic bg-white/5 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Bottom: Cost + Quick Status Select + Actions */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400">Estimate: </span>
                    <strong className="font-mono text-cyan-300 font-bold">{formatINR(vendor.estimatedCost)}</strong>
                  </div>
                  {vendor.actualCost ? (
                    <div className="text-xs">
                      <span className="text-slate-400">Actual: </span>
                      <strong className="font-mono text-emerald-300 font-bold">{formatINR(vendor.actualCost)}</strong>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={vendor.status}
                    onChange={(e) => handleQuickStatusChange(vendor, e.target.value as VendorStatus)}
                    className={`text-[11px] font-bold uppercase rounded-lg px-2.5 py-1.5 border transition-colors cursor-pointer ${statusObj.color}`}
                  >
                    {VENDOR_STATUSES.map(st => (
                      <option key={st.id} value={st.id} className="bg-slate-900 text-white capitalize">
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit vendor"
                      aria-label={`Edit ${vendor.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete vendor"
                      aria-label={`Delete ${vendor.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-full glass-panel p-10 rounded-3xl border border-white/10 text-center text-xs text-slate-500">
            No vendors match the selected filter.
          </div>
        )}
      </div>

      {/* Vendor Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0d0f28] border border-cyan-500/30 shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingVendor ? 'Edit Vendor Record' : 'Add New Vendor Partner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Royal Rajputana Banquets & Caterers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs capitalize focus:outline-hidden focus:border-cyan-500"
                  >
                    {['venue', 'catering', 'decoration', 'photography', 'entertainment', 'makeup', 'invitations', 'equipment', 'transport', 'miscellaneous'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs capitalize focus:outline-hidden focus:border-cyan-500"
                  >
                    {VENDOR_STATUSES.map(st => (
                      <option key={st.id} value={st.id}>{st.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="info@..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Estimated Cost (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formEstimatedCost}
                    onChange={(e) => setFormEstimatedCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs font-mono focus:outline-hidden focus:border-cyan-500"
                  />
                  <div className="text-[10px] text-cyan-300 mt-1">{formatINR(formEstimatedCost)}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Actual Contract Cost</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formActualCost}
                    onChange={(e) => setFormActualCost(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs font-mono focus:outline-hidden focus:border-cyan-500"
                  />
                  <div className="text-[10px] text-emerald-300 mt-1">{formatINR(formActualCost)}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Notes & Inclusions</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Includes 3-tier cake, stage trussing, and 4 wireless microphones"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/15 text-white text-xs focus:outline-hidden focus:border-cyan-500"
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md cursor-pointer"
                >
                  {editingVendor ? 'Save Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
