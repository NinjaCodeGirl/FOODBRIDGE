import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import AdminRevenueDashboard from '../revenue/AdminRevenueDashboard';
import UnitEconomicsDashboard from '../revenue/UnitEconomicsDashboard';
import ComplianceRecords from '../compliance/ComplianceRecords';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  PieChart, 
  Sparkles,
  Lock,
  ArrowRight,
  Utensils,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard({
  metrics,
  listings = [],
  accounts = [],
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'revenue' | 'unit-economics' | 'compliance' | 'fraud'
  
  // Pending verification queue
  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'app-901',
      orgName: 'The Leela Palace Kitchens',
      role: 'RESTAURANT',
      fssaiNumber: '10019011003421',
      contactPerson: 'Chef Vikram Batra',
      submittedAt: 'Today, 10:15 AM',
      status: 'PENDING_AUDIT'
    },
    {
      id: 'app-902',
      orgName: 'Goonj Delhi Shelter Home',
      role: 'NGO',
      registrationNumber: 'DL/2019/0091823',
      contactPerson: 'Priya Narang',
      capacityMeals: 400,
      submittedAt: 'Yesterday, 06:40 PM',
      status: 'PENDING_AUDIT'
    }
  ]);

  const handleApproveOrg = (id, orgName) => {
    setPendingVerifications(prev => prev.filter(p => p.id !== id));
    if (onShowToast) onShowToast(`Organization "${orgName}" approved & cryptographic keys dispatched!`);
  };

  const handleRejectOrg = (id, orgName) => {
    setPendingVerifications(prev => prev.filter(p => p.id !== id));
    if (onShowToast) onShowToast(`Organization "${orgName}" application rejected.`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Platform Header */}
      <PageHeader
        title="FoodBridge Platform Governance & Admin Hub"
        subtitle="Super-Admin Console • FSSAI legal verification, B2B SaaS revenue, and fraud monitoring"
        badge="Super Admin"
      />

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-border space-x-2 sm:space-x-4 text-xs sm:text-sm font-bold overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform Overview', icon: ShieldCheck },
          { id: 'verifications', label: `Pending Verifications (${pendingVerifications.length})`, icon: Building2 },
          { id: 'revenue', label: 'B2B SaaS Revenue', icon: TrendingUp },
          { id: 'unit-economics', label: 'Unit Economics Simulator', icon: PieChart },
          { id: 'compliance', label: 'FSSAI Regulatory Ledger', icon: FileText },
          { id: 'fraud', label: 'Safety & Fraud Monitor', icon: AlertTriangle }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-txt-secondary hover:text-txt-primary'
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Rescued Meals"
              value={metrics?.total_meals_rescued ? metrics.total_meals_rescued.toLocaleString() : '15,420'}
              subtext="+14% this week"
              icon={Utensils}
            />
            <StatCard
              title="CO₂ Mitigated"
              value={metrics?.total_co2_avoided_kg ? `${(metrics.total_co2_avoided_kg / 1000).toFixed(1)} T` : '38.5 T'}
              subtext="Audited emissions"
              icon={TrendingUp}
            />
            <StatCard
              title="Commercial Donors"
              value="42 Partners"
              subtext="Banquets & Cloud Kitchens"
              icon={Building2}
            />
            <StatCard
              title="Verified NGO Shelters"
              value={metrics?.active_ngo_partners || 54}
              subtext="Delhi NCR Coverage"
              icon={ShieldCheck}
            />
          </div>

          {/* Quick Pending Verifications Banner */}
          {pendingVerifications.length > 0 && (
            <div className="fb-card p-5 border-l-4 border-l-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Pending Approval Queue</span>
                <h4 className="text-sm font-extrabold text-navy mt-0.5">
                  {pendingVerifications.length} organizations awaiting FSSAI / NGO legal document validation
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('verifications')}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-sm touch-target"
              >
                Review Applications
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. VERIFICATIONS QUEUE TAB */}
      {activeTab === 'verifications' && (
        <div className="fb-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <div>
              <h3 className="font-extrabold text-base text-navy">Legal Entity Verification Queue</h3>
              <p className="text-xs text-txt-secondary">Verify 14-digit FSSAI licenses for kitchens and 80G registrations for shelters</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-primary text-xs font-bold">
              {pendingVerifications.length} Pending
            </span>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-txt-secondary">
              All organization registration requests have been audited and approved.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVerifications.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-border bg-surface-subtle flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-navy text-sm">{p.orgName}</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-primary text-[10px] font-bold">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-txt-secondary mt-1">
                      {p.fssaiNumber ? `FSSAI License: ${p.fssaiNumber}` : `NGO Registration: ${p.registrationNumber}`}
                      {' • '}Contact: {p.contactPerson} ({p.submittedAt})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectOrg(p.id, p.orgName)}
                      className="px-3 py-1.5 rounded-lg border border-border hover:bg-gray-100 text-status-danger font-bold text-xs"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveOrg(p.id, p.orgName)}
                      className="px-4 py-1.5 rounded-lg bg-status-success hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                    >
                      Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. B2B SAAS REVENUE ANALYTICS TAB */}
      {activeTab === 'revenue' && (
        <AdminRevenueDashboard
          onNavigateToUnitEconomics={() => setActiveTab('unit-economics')}
        />
      )}

      {/* 4. UNIT ECONOMICS SIMULATOR TAB */}
      {activeTab === 'unit-economics' && (
        <UnitEconomicsDashboard
          onNavigateToRevenue={() => setActiveTab('revenue')}
        />
      )}

      {/* 5. COMPLIANCE & FSSAI REGULATORY LEDGER TAB */}
      {activeTab === 'compliance' && (
        <ComplianceRecords
          listings={listings}
          role="ADMIN"
        />
      )}

      {/* 6. FRAUD & FOOD SAFETY MONITOR TAB */}
      {activeTab === 'fraud' && (
        <div className="fb-card p-6 space-y-4">
          <h3 className="font-extrabold text-base text-navy">Cryptographic Integrity & Food Safety Alarms</h3>
          <p className="text-xs text-txt-secondary">Automated monitoring for expired donations, double scans, or cold chain violations</p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-status-success flex-shrink-0" />
                <span>Zero duplicate QR handshake attempts detected across last 3,210 verified pickups.</span>
              </div>
              <span className="font-bold text-status-success">Normal</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border text-txt-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                <span>All 14 active Category B (Cold Chain) listings maintained required &lt;4°C transport temperatures.</span>
              </div>
              <span className="font-bold text-txt-primary">Compliant</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
