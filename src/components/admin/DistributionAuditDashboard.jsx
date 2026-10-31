import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, X, Eye,
  Filter, Download, Flag, ChevronDown, ChevronUp, BarChart3,
  FileText, TrendingUp, AlertCircle
} from 'lucide-react';

export default function DistributionAuditDashboard() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [decisionMap, setDecisionMap] = useState({});

  const summaryMetrics = [
    { label: 'Total Received', value: '530', sublabel: 'Servings across 2 events', icon: '📦', color: 'text-navy' },
    { label: 'Total Distributed', value: '455', sublabel: '85.8% redistribution rate', icon: '🍽️', color: 'text-primary' },
    { label: 'Beneficiaries Served', value: '430', sublabel: 'Unique individuals', icon: '🧑‍🤝‍🧑', color: 'text-blue-700' },
    { label: 'Independently Verified', value: '1 / 2', sublabel: 'Events with witness sign-off', icon: '🔏', color: 'text-status-success' },
    { label: 'Pending Admin Review', value: '1', sublabel: 'Awaiting decision', icon: '⏳', color: 'text-amber-600' },
    { label: 'Flagged Discrepancies', value: '0', sublabel: 'No active disputes', icon: '🚨', color: 'text-red-600' },
  ];

  const auditEvents = [
    {
      id: 'dist-event-001',
      event_code: 'DIST-202610-8812',
      donation_id: 'list-001',
      ngo_name: 'Akshaya Patra Foundation Shelter',
      food_category: 'COOKED_MEALS',
      quantity_received: 180,
      servings_distributed: 175,
      servings_remaining: 5,
      servings_spoiled: 0,
      servings_rejected: 0,
      beneficiary_count: 160,
      witness_confirmed: true,
      witness_name: 'Dr. Anita Desai',
      witness_organization: 'Delhi Civic Welfare Council',
      status: 'VERIFIED',
      audit_status: 'ADMIN_AUDITED',
      admin_audit_notes: 'All evidence and independent certification confirmed compliant.',
      distribution_date: new Date().toLocaleDateString()
    },
    {
      id: 'dist-event-002',
      event_code: 'DIST-202610-9941',
      donation_id: 'list-002',
      ngo_name: 'Robin Hood Army Janakpuri',
      food_category: 'COOKED_MEALS',
      quantity_received: 350,
      servings_distributed: 280,
      servings_remaining: 70,
      servings_spoiled: 0,
      servings_rejected: 0,
      beneficiary_count: 270,
      witness_confirmed: false,
      witness_name: null,
      witness_organization: null,
      status: 'IN_PROGRESS',
      audit_status: 'PENDING_AUDIT',
      admin_audit_notes: null,
      distribution_date: new Date().toLocaleDateString()
    }
  ];

  const handleDecision = (eventId, decision) => {
    setDecisionMap(prev => ({ ...prev, [eventId]: decision }));
  };

  const getStatusBadge = (status, auditStatus) => {
    if (auditStatus === 'ADMIN_AUDITED') return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-status-success border border-emerald-200">✅ Audited & Closed</span>;
    if (status === 'FLAGGED') return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200">🚨 Flagged Dispute</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">⏳ Pending Audit</span>;
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="fb-card p-5 bg-white border border-border shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center font-black text-lg shadow-inner">
              🔍
            </div>
            <div>
              <h2 className="font-extrabold text-navy text-lg">Distribution Audit Dashboard</h2>
              <p className="text-xs text-txt-secondary">
                Platform-level governance and reconciliation compliance review for all distribution events.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-navy text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-slate-800">
              <Download className="w-3.5 h-3.5" />
              Export CSV Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryMetrics.map(m => (
          <div key={m.label} className="fb-card p-4 bg-white border border-border shadow-sm text-center space-y-1">
            <div className="text-2xl">{m.icon}</div>
            <div className={`text-xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-[10px] font-bold text-navy">{m.label}</div>
            <div className="text-[10px] text-txt-muted leading-tight">{m.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Reconciliation Compliance Check */}
      <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-3">
        <h3 className="font-bold text-navy text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Reconciliation Formula Compliance Check
          <span className="text-[11px] font-mono bg-surface-subtle px-2 py-0.5 rounded text-txt-muted">
            Received = Distributed + Remaining + Spoiled + Rejected
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-subtle text-left">
                {['Event Code', 'NGO', 'Received', 'Dist.', 'Remain', 'Spoiled', 'Rejected', 'Sum Check', 'Discrepancy'].map(h => (
                  <th key={h} className="px-3 py-2 text-txt-secondary font-bold text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditEvents.map(evt => {
                const sumCheck = evt.servings_distributed + evt.servings_remaining + evt.servings_spoiled + evt.servings_rejected;
                const isBalanced = sumCheck === evt.quantity_received;
                return (
                  <tr key={evt.id} className="border-t border-gray-100 hover:bg-surface-subtle/50">
                    <td className="px-3 py-2 font-mono font-bold text-navy text-[11px]">{evt.event_code}</td>
                    <td className="px-3 py-2 text-txt-secondary max-w-[120px] truncate">{evt.ngo_name}</td>
                    <td className="px-3 py-2 font-bold text-navy">{evt.quantity_received}</td>
                    <td className="px-3 py-2 font-bold text-primary">{evt.servings_distributed}</td>
                    <td className="px-3 py-2 font-bold text-status-success">{evt.servings_remaining}</td>
                    <td className="px-3 py-2 text-txt-muted">{evt.servings_spoiled}</td>
                    <td className="px-3 py-2 text-txt-muted">{evt.servings_rejected}</td>
                    <td className="px-3 py-2 font-mono font-bold">{sumCheck}</td>
                    <td className="px-3 py-2">
                      {isBalanced
                        ? <span className="text-status-success font-bold flex items-center gap-1 text-[11px]"><CheckCircle2 className="w-3 h-3" /> Balanced</span>
                        : <span className="text-red-600 font-bold flex items-center gap-1 text-[11px]"><AlertTriangle className="w-3 h-3" /> Off by {Math.abs(evt.quantity_received - sumCheck)}</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Event Review Table */}
      <div className="fb-card p-4 bg-white border border-border shadow-sm space-y-3">
        <h3 className="font-bold text-navy text-sm flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Event Audit Queue — Admin Review & Decision
        </h3>

        <div className="space-y-4">
          {auditEvents.map(evt => {
            const isExpanded = expandedRow === evt.id;
            const decision = decisionMap[evt.id];

            return (
              <div key={evt.id} className={`rounded-xl border overflow-hidden transition-all ${
                isExpanded ? 'border-primary shadow-sm' : 'border-border'
              }`}>
                {/* Row Summary */}
                <div
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-surface-subtle/50"
                  onClick={() => setExpandedRow(isExpanded ? null : evt.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-black text-navy text-sm">{evt.event_code}</span>
                    <span className="text-xs text-txt-secondary">{evt.ngo_name}</span>
                    {getStatusBadge(evt.status, decision || evt.audit_status)}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-navy">{evt.quantity_received} Received</span>
                    <span className="text-txt-muted">→</span>
                    <span className="font-bold text-primary">{evt.servings_distributed} Distributed</span>
                    <span className="text-txt-muted">→</span>
                    <span className="font-bold text-blue-700">{evt.beneficiary_count} Beneficiaries</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-txt-muted" /> : <ChevronDown className="w-4 h-4 text-txt-muted" />}
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4 bg-surface-subtle/30 animate-fadeIn">
                    {/* Witness Status */}
                    <div>
                      {evt.witness_confirmed ? (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
                          <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                          <span className="text-navy">
                            <strong>Independently Witnessed</strong> by {evt.witness_name} — {evt.witness_organization}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="text-amber-900">
                            <strong>No independent witness attestation recorded.</strong> Admin must review supporting photographic evidence before approval.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Admin Audit Decision Buttons */}
                    {evt.audit_status !== 'ADMIN_AUDITED' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Admin Governance Decision</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleDecision(evt.id, 'ADMIN_AUDITED')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                              decision === 'ADMIN_AUDITED'
                                ? 'bg-status-success text-white ring-2 ring-emerald-300'
                                : 'bg-emerald-50 text-status-success border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve & Close Audit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(evt.id, 'DISPUTED')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                              decision === 'DISPUTED'
                                ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Flag for Investigation
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(evt.id, 'REJECTED')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                              decision === 'REJECTED'
                                ? 'bg-red-600 text-white ring-2 ring-red-300'
                                : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject — Non-Compliant
                          </button>
                        </div>

                        {decision && (
                          <div className="bg-white border border-border rounded-xl p-3 text-xs space-y-2">
                            <label className="block font-bold text-navy">Admin Decision Notes</label>
                            <textarea
                              placeholder="Add audit notes, evidence references, or reasons for your decision..."
                              rows={2}
                              className="w-full p-2.5 rounded-lg border border-border text-navy text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              className="px-4 py-2 bg-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Commit Governance Decision
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Already Audited Notes */}
                    {evt.admin_audit_notes && (
                      <div className="bg-white border border-border rounded-xl p-3 text-xs">
                        <span className="font-bold text-navy block mb-1">Admin Audit Notes:</span>
                        <p className="text-txt-secondary">{evt.admin_audit_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

