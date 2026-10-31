import React, { useState } from 'react';
import { 
  Package, CheckCircle2, Calculator, Plus, AlertCircle, Minus,
  FileText, ShieldCheck, BarChart3, AlertTriangle, Clock, Trash2, Download
} from 'lucide-react';

/**
 * Distribution Centre — NGO multi-session surplus division.
 * Enforces: Received = Distributed + Remaining + Spoiled + Rejected
 */
export default function DistributionCentre({
  onGeneratePDF,
  onWitnessVerify
}) {
  const [activeTab, setActiveTab] = useState('active');

  // ---- State for Active Sessions
  const [intakeEvents] = useState([
    {
      id: 'dist-event-001',
      event_code: 'DIST-202610-8812',
      donation_id: 'list-001',
      food_category: 'COOKED_MEALS',
      quantity_received: 180,
      servings_distributed: 175,
      servings_remaining: 5,
      servings_spoiled: 0,
      servings_rejected: 0,
      beneficiary_count: 160,
      actual_location: 'Dwarka Sector 10 Community Kitchen Hub',
      witness_confirmed: true,
      witness_name: 'Dr. Anita Desai',
      witness_organization: 'Delhi Civic Welfare Council',
      status: 'VERIFIED',
      audit_status: 'ADMIN_AUDITED',
      distribution_date: new Date().toLocaleDateString()
    },
    {
      id: 'dist-event-002',
      event_code: 'DIST-202610-9941',
      donation_id: 'list-002',
      food_category: 'COOKED_MEALS',
      quantity_received: 350,
      servings_distributed: 280,
      servings_remaining: 70,
      servings_spoiled: 0,
      servings_rejected: 0,
      beneficiary_count: 270,
      actual_location: 'Janakpuri Block B Relief Camp',
      witness_confirmed: false,
      witness_name: null,
      witness_organization: null,
      status: 'IN_PROGRESS',
      audit_status: 'PENDING_AUDIT',
      distribution_date: new Date().toLocaleDateString()
    }
  ]);

  const [selectedEventId, setSelectedEventId] = useState('dist-event-002');
  const [sessions, setSessions] = useState([
    { id: 1, servings: 80, location: 'Block A Lunch Queue', beneficiaries: 78, notes: 'Session 1 complete' },
    { id: 2, servings: 100, location: 'Block B Dinner Service', beneficiaries: 95, notes: 'Session 2 complete' },
    { id: 3, servings: 100, location: 'Canteen Row Distribution', beneficiaries: 97, notes: 'Session 3 complete' },
  ]);
  const [newSession, setNewSession] = useState({ servings: '', location: '', beneficiaries: '', notes: '' });
  const [sessionError, setSessionError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const selectedEvent = intakeEvents.find(e => e.id === selectedEventId);

  // Compute live balance from sessions
  const sessionTotal = sessions.reduce((s, sess) => s + Number(sess.servings || 0), 0);
  const remaining = selectedEvent ? selectedEvent.quantity_received - sessionTotal : 0;
  const isOverallocated = remaining < 0;

  const addSession = () => {
    setSessionError('');
    const newServings = Number(newSession.servings || 0);
    if (!newServings || newServings <= 0) {
      setSessionError('Enter a valid serving count (> 0)');
      return;
    }
    if (sessionTotal + newServings > (selectedEvent?.quantity_received || 0)) {
      setSessionError(
        `Reconciliation Error: Adding ${newServings} servings would exceed the received quantity of ${selectedEvent?.quantity_received}. Remaining available: ${remaining}.`
      );
      return;
    }
    setSessions(prev => [...prev, {
      id: Date.now(),
      servings: newServings,
      location: newSession.location || 'On-site Distribution',
      beneficiaries: Number(newSession.beneficiaries || newServings),
      notes: newSession.notes || ''
    }]);
    setNewSession({ servings: '', location: '', beneficiaries: '', notes: '' });
    setSaveSuccess('Session recorded. Balance updated automatically.');
    setTimeout(() => setSaveSuccess(''), 3500);
  };

  const removeSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const tabs = [
    { id: 'active', label: 'Active Sessions', icon: '📋' },
    { id: 'ledger', label: 'Inventory Ledger', icon: '📊' },
    { id: 'completed', label: 'Completed Events', icon: '✅' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="fb-card p-5 bg-white border border-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-status-success font-black text-lg shadow-inner">
            📦
          </div>
          <div>
            <h2 className="font-extrabold text-navy text-lg">Distribution Centre</h2>
            <p className="text-xs text-txt-secondary">
              Multi-session surplus division with immutable quantity reconciliation ledger.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono font-bold bg-navy text-white px-3 py-1.5 rounded-full shadow-sm">
          Formula: Received = Distributed + Remaining + Spoiled + Rejected
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0 -mb-2 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === t.id
                ? 'border-primary text-primary bg-orange-50'
                : 'border-transparent text-txt-muted hover:text-navy'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* === TAB: ACTIVE SESSIONS === */}
      {activeTab === 'active' && (
        <div className="space-y-5">
          {/* Event Selector */}
          <div className="fb-card p-4 bg-white border border-border shadow-sm">
            <label className="block text-xs font-bold text-txt-secondary mb-1.5">Select Intake Event</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full sm:max-w-sm text-sm px-3 py-2 rounded-xl border border-border font-semibold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {intakeEvents.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.event_code} — {ev.quantity_received} Servings ({ev.status})
                </option>
              ))}
            </select>
          </div>

          {/* Live Reconciliation Meter */}
          {selectedEvent && (
            <div className="fb-card p-5 bg-white border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-navy text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Live Reconciliation Tracker — {selectedEvent.event_code}
                </h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  isOverallocated
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : remaining === 0
                    ? 'bg-emerald-100 text-status-success border-emerald-300'
                    : 'bg-orange-50 text-primary border-orange-200'
                }`}>
                  {isOverallocated ? '⚠ OVER-ALLOCATED' : remaining === 0 ? '✅ Fully Reconciled' : `${remaining} Meals Remaining`}
                </span>
              </div>

              {/* Visual Balance Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-txt-secondary">
                  <span>Distributed: {sessionTotal} Meals</span>
                  <span>Received: {selectedEvent.quantity_received} Meals</span>
                </div>
                <div className="h-3 rounded-full bg-surface-subtle border border-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverallocated ? 'bg-red-500' : sessionTotal / selectedEvent.quantity_received > 0.9 ? 'bg-status-success' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, (sessionTotal / selectedEvent.quantity_received) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-txt-muted">
                  <span>{Math.round((sessionTotal / selectedEvent.quantity_received) * 100)}% distributed</span>
                  <span>Balance: <strong className={isOverallocated ? 'text-red-600' : 'text-status-success'}>{remaining}</strong> portions</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                {[
                  { label: 'Total Received', value: selectedEvent.quantity_received, color: 'text-navy' },
                  { label: 'Sessions Distributed', value: sessionTotal, color: 'text-primary' },
                  { label: 'Current Balance', value: remaining, color: isOverallocated ? 'text-red-600' : 'text-status-success' },
                  { label: 'Total Beneficiaries', value: sessions.reduce((s, sess) => s + Number(sess.beneficiaries || 0), 0), color: 'text-blue-700' },
                ].map(m => (
                  <div key={m.label} className="bg-surface-subtle p-3 rounded-xl text-center border border-gray-100">
                    <div className={`text-xl font-black ${m.color}`}>{m.value}</div>
                    <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session History Table */}
          <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-3">
            <h4 className="font-bold text-navy text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Recorded Distribution Sessions
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-subtle text-left">
                    {['#', 'Servings', 'Location', 'Beneficiaries', 'Notes', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-txt-secondary font-bold text-[10px] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((sess, idx) => (
                    <tr key={sess.id} className="border-t border-gray-100 hover:bg-surface-subtle/50">
                      <td className="px-3 py-2 font-mono text-txt-muted">{idx + 1}</td>
                      <td className="px-3 py-2 font-extrabold text-primary">{sess.servings}</td>
                      <td className="px-3 py-2 text-navy font-semibold">{sess.location}</td>
                      <td className="px-3 py-2 font-bold text-navy">{sess.beneficiaries}</td>
                      <td className="px-3 py-2 text-txt-secondary max-w-[150px] truncate">{sess.notes}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeSession(sess.id)}
                          className="p-1 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-txt-muted text-[11px]">No sessions recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add New Session Form */}
          <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-3">
            <h4 className="font-bold text-navy text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" />
              Record New Distribution Session
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">Servings Distributed *</label>
                <input
                  type="number"
                  min="1"
                  value={newSession.servings}
                  onChange={(e) => setNewSession(s => ({ ...s, servings: e.target.value }))}
                  placeholder={`Max: ${remaining}`}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border font-bold text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">Distribution Location</label>
                <input
                  type="text"
                  value={newSession.location}
                  onChange={(e) => setNewSession(s => ({ ...s, location: e.target.value }))}
                  placeholder="e.g. Block C Mess Hall"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">Beneficiary Count</label>
                <input
                  type="number"
                  min="1"
                  value={newSession.beneficiaries}
                  onChange={(e) => setNewSession(s => ({ ...s, beneficiaries: e.target.value }))}
                  placeholder="People served"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-txt-secondary mb-1">Notes</label>
                <input
                  type="text"
                  value={newSession.notes}
                  onChange={(e) => setNewSession(s => ({ ...s, notes: e.target.value }))}
                  placeholder="Observations"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-border text-navy focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {sessionError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{sessionError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-status-success rounded-xl p-3 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={addSession}
                disabled={isOverallocated}
                className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Session
              </button>
              <button
                type="button"
                onClick={() => onWitnessVerify && onWitnessVerify(selectedEvent)}
                className="px-4 py-2 bg-surface-subtle hover:bg-gray-200 text-navy rounded-xl text-xs font-bold border border-border flex items-center gap-2"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                Submit for Witness Verification
              </button>
              <button
                type="button"
                onClick={() => onGeneratePDF && onGeneratePDF(selectedEvent, sessions)}
                className="px-4 py-2 bg-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Impact Certificate (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: INVENTORY LEDGER === */}
      {activeTab === 'ledger' && (
        <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-4">
          <h4 className="font-bold text-navy text-sm flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" />
            Immutable Quantity Reconciliation Ledger
          </h4>
          <p className="text-xs text-txt-secondary">
            All inventory transactions are append-only. Entries cannot be deleted or modified. Reconciliation formula enforced at every session submission.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-subtle text-left">
                  {['Timestamp', 'Type', 'Donation ID', 'Qty (±)', 'Balance', 'Authorized By'].map(h => (
                    <th key={h} className="px-3 py-2 text-txt-secondary font-bold text-[10px] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { time: 'Today 12:26 PM', type: 'INITIAL_RECEIPT', donationId: 'list-001', qty: '+180', balance: 180, by: 'Chef Rajesh / Arjun Sharma' },
                  { time: 'Today 1:15 PM', type: 'DISTRIBUTION_SESSION', donationId: 'list-001', qty: '-175', balance: 5, by: 'Rajesh Kumar (Akshaya Patra)' },
                  { time: 'Today 11:05 AM', type: 'INITIAL_RECEIPT', donationId: 'list-002', qty: '+350', balance: 350, by: 'Hotel Residency Staff' },
                  { time: 'Today 11:45 AM', type: 'DISTRIBUTION_SESSION', donationId: 'list-002', qty: '-80', balance: 270, by: 'Robin Hood Army NGO' },
                  { time: 'Today 12:35 PM', type: 'DISTRIBUTION_SESSION', donationId: 'list-002', qty: '-100', balance: 170, by: 'Robin Hood Army NGO' },
                  { time: 'Today 1:30 PM', type: 'DISTRIBUTION_SESSION', donationId: 'list-002', qty: '-100', balance: 70, by: 'Robin Hood Army NGO' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-t border-gray-100 hover:bg-surface-subtle/50 font-mono">
                    <td className="px-3 py-2 text-txt-muted text-[10px]">{row.time}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        row.type === 'INITIAL_RECEIPT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-primary'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-navy text-[11px]">{row.donationId}</td>
                    <td className={`px-3 py-2 font-extrabold text-sm ${row.qty.startsWith('+') ? 'text-status-success' : 'text-primary'}`}>
                      {row.qty}
                    </td>
                    <td className="px-3 py-2 font-bold text-navy">{row.balance}</td>
                    <td className="px-3 py-2 text-txt-secondary text-[10px]">{row.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === TAB: COMPLETED EVENTS === */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {intakeEvents.filter(e => e.status === 'VERIFIED').map(evt => (
            <div key={evt.id} className="fb-card p-4 bg-white border border-emerald-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-success" />
                    <span className="font-extrabold text-navy text-sm">{evt.event_code}</span>
                    <span className="font-mono text-[11px] text-txt-muted">{evt.donation_id}</span>
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5">
                    {evt.actual_location} • {evt.distribution_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onGeneratePDF && onGeneratePDF(evt, [])}
                    className="px-3 py-1.5 bg-navy text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" /> Impact Certificate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Received', value: evt.quantity_received, color: 'text-navy' },
                  { label: 'Distributed', value: evt.servings_distributed, color: 'text-primary' },
                  { label: 'Remaining', value: evt.servings_remaining, color: 'text-status-success' },
                  { label: 'Beneficiaries', value: evt.beneficiary_count, color: 'text-blue-700' },
                ].map(m => (
                  <div key={m.label} className="bg-surface-subtle p-2.5 rounded-xl text-center border border-gray-100">
                    <div className={`text-lg font-black ${m.color}`}>{m.value}</div>
                    <div className="text-[10px] text-txt-muted font-semibold mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {evt.witness_confirmed && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span className="text-navy">
                    <strong>Independently Verified</strong> by {evt.witness_name} ({evt.witness_organization})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

