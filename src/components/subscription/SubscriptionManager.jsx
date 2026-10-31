import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  ArrowUpRight, 
  Download, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Building, 
  FileText, 
  Clock, 
  Layers, 
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';

export default function SubscriptionManager({
  currentPlan = 'FOOD_PARTNER_PRO',
  onNavigateToPricing,
  onDowngradeToFree,
  orgName = 'Taj Palace Banquet Kitchen'
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Entitlements depending on currentPlan
  const planDetails = {
    COMMUNITY_FREE: {
      name: 'Community Free',
      badge: 'Essential Free Tier',
      price: '₹0 / month',
      status: 'Active (Permanent)',
      renewalDate: 'No expiration — Free Forever',
      staffLimit: '1 Staff Member',
      branchLimit: '1 Location',
      retention: '30 Days History',
      entitlements: [
        { label: 'Essential Food Donation Listing', active: true },
        { label: 'FSSAI Safety & Freshness Check', active: true },
        { label: 'Intelligent Proximity Matching', active: true },
        { label: 'QR Handshake & 6-Digit OTP Handover', active: true },
        { label: 'Automated Recurring Donation Scheduling', active: false },
        { label: 'Staff Account Management', active: false },
        { label: 'Multi-Branch Centralized Governance', active: false },
        { label: 'Exportable FSSAI Audit & ESG Reports', active: false }
      ]
    },
    FOOD_PARTNER_PRO: {
      name: 'Food Partner Pro',
      badge: 'Commercial Pro Tier',
      price: '₹999 / month',
      status: 'Active (Sandbox Verified)',
      renewalDate: new Date(Date.now() + 28 * 24 * 3600 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      staffLimit: '3 of 5 Staff Accounts in Use',
      branchLimit: '1 Commercial Kitchen',
      retention: '1 Year Audit Logs',
      entitlements: [
        { label: 'Essential Food Donation Listing', active: true },
        { label: 'FSSAI Safety & Freshness Check', active: true },
        { label: 'Intelligent Proximity Matching', active: true },
        { label: 'QR Handshake & 6-Digit OTP Handover', active: true },
        { label: 'Automated Recurring Donation Scheduling', active: true },
        { label: 'Staff Account Management (Up to 5)', active: true },
        { label: 'Priority Proximity Dispatch Boost', active: true },
        { label: 'Downloadable Donation History & Receipts', active: true },
        { label: 'Multi-Branch Centralized Governance', active: false },
        { label: 'CSR Program Ledger Management', active: false }
      ]
    },
    BUSINESS_PLUS: {
      name: 'Business Plus',
      badge: 'Multi-Location Enterprise',
      price: '₹2,999 / month',
      status: 'Active (Sandbox Verified)',
      renewalDate: new Date(Date.now() + 28 * 24 * 3600 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      staffLimit: '12 of 25 Staff Accounts in Use',
      branchLimit: '4 of 15 Branches Active',
      retention: '3 Years Regulatory Retention',
      entitlements: [
        { label: 'Essential Food Donation Listing', active: true },
        { label: 'FSSAI Safety & Freshness Check', active: true },
        { label: 'Intelligent Proximity Matching', active: true },
        { label: 'QR Handshake & 6-Digit OTP Handover', active: true },
        { label: 'Automated Recurring Donation Scheduling', active: true },
        { label: 'Staff Account Management (Up to 25)', active: true },
        { label: 'Multi-Branch Centralized Governance', active: true },
        { label: 'Branch-Wise Performance Benchmarking', active: true },
        { label: 'Bulk Batch Auto-Splitting Across Shelters', active: true },
        { label: 'Exportable FSSAI Audit & ESG Reports', active: true }
      ]
    },
    ENTERPRISE_CSR: {
      name: 'Enterprise & CSR Partner',
      badge: 'Institutional Tier',
      price: 'Custom Annual Contract',
      status: 'Active (Corporate SLA)',
      renewalDate: 'Dec 31, 2026',
      staffLimit: 'Unlimited Enterprise SSO',
      branchLimit: 'Unlimited Multi-City Outlets',
      retention: '7 Years Statutory Compliance',
      entitlements: [
        { label: 'All Platform Features & Modules', active: true },
        { label: 'CSR Program Management & Fund Tracking', active: true },
        { label: 'REST API & Webhooks Access', active: true },
        { label: 'Dedicated Account Manager', active: true },
        { label: 'Custom BRSR / Scope 3 Carbon Audit', active: true }
      ]
    }
  };

  const activePlanInfo = planDetails[currentPlan] || planDetails.FOOD_PARTNER_PRO;

  // Mock Billing History
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-FB-202610-0982',
      date: '17 Oct 2026',
      period: '17 Oct 2026 – 16 Nov 2026',
      amount: currentPlan === 'BUSINESS_PLUS' ? '₹2,999' : currentPlan === 'COMMUNITY_FREE' ? '₹0' : '₹999',
      plan: activePlanInfo.name,
      status: 'PAID (SANDBOX)',
      downloadUrl: '#'
    },
    {
      id: 'INV-FB-202609-0741',
      date: '17 Sep 2026',
      period: '17 Sep 2026 – 16 Oct 2026',
      amount: '₹999',
      plan: 'Food Partner Pro',
      status: 'PAID (SANDBOX)',
      downloadUrl: '#'
    },
    {
      id: 'INV-FB-202608-0519',
      date: '17 Aug 2026',
      period: '17 Aug 2026 – 16 Sep 2026',
      amount: '₹999',
      plan: 'Food Partner Pro',
      status: 'PAID (SANDBOX)',
      downloadUrl: '#'
    }
  ]);

  const handleDownloadInvoice = (invId) => {
    setDownloadingId(invId);
    setTimeout(() => {
      setDownloadingId(null);
      // Generate clean simulated receipt
      const content = `FOODBRIDGE B2B SAAS TAX INVOICE (DEMO / SANDBOX)
Invoice No: ${invId}
Date: 17 Oct 2026
Organization: ${orgName}
GSTIN: 07AAAAA0000A1Z5
SAC Code: 998314 (IT SaaS Services)
Plan: ${activePlanInfo.name}
Amount: ${activePlanInfo.price}
Status: VERIFIED & SETTLED (SANDBOX SIMULATION)
Platform: FoodBridge Surplus Food Redistribution Technologies Pvt. Ltd.
Notice: Operational SaaS subscription invoice. Not a tax-deductible charitable donation receipt.`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Subscription & Billing Governance"
        subtitle="Manage your Food Partner SaaS plan, active entitlements, staff seats, and downloadable tax invoices"
        badge={activePlanInfo.badge}
        action={
          <button
            onClick={onNavigateToPricing}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm touch-target"
          >
            <span>Change Plan / Compare Tiers</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        }
      />

      {/* Main Grid: Plan Status + Entitlements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Subscription Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="fb-card p-6 bg-white border border-border space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-txt-muted">
                  Current Membership
                </span>
                <h3 className="text-xl font-extrabold text-txt-primary mt-1">
                  {activePlanInfo.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {activePlanInfo.status}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-txt-secondary">Subscription Cost:</span>
                <span className="font-extrabold text-primary text-base">{activePlanInfo.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-txt-secondary">Next Renewal:</span>
                <span className="font-semibold text-txt-primary">{activePlanInfo.renewalDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-txt-secondary">Payment Method:</span>
                <span className="font-semibold text-txt-primary flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-primary" />
                  <span>Sandbox Auto-Debit (•••• 4242)</span>
                </span>
              </div>
            </div>

            {/* Quota gauges */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-txt-primary block">
                Resource Allocations
              </span>
              <div className="p-3 rounded-xl border border-border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-txt-muted" />
                    <span>Staff Team Seats</span>
                  </span>
                  <span className="font-bold text-txt-primary">{activePlanInfo.staffLimit}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-txt-secondary flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-txt-muted" />
                    <span>Active Kitchen Locations</span>
                  </span>
                  <span className="font-bold text-txt-primary">{activePlanInfo.branchLimit}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <button
                onClick={onNavigateToPricing}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition-all"
              >
                Upgrade to Higher Tier
              </button>

              {currentPlan !== 'COMMUNITY_FREE' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-status-danger hover:bg-red-50 transition-colors"
                >
                  Downgrade to Community Free
                </button>
              )}
            </div>
          </div>

          {/* Sandbox Info Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Sandbox Billing Simulation</span>
            </div>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              This organization is running in simulated billing mode. You can test upgrading, downgrading, and downloading invoices without live transaction fees.
            </p>
          </div>
        </div>

        {/* Right Column: Entitlements + Billing History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entitlements Checklist */}
          <div className="fb-card p-6 bg-white border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-txt-primary">
                  Active Plan Entitlements & Features
                </h3>
                <p className="text-xs text-txt-secondary">
                  Real-time server-enforced permissions for your organization.
                </p>
              </div>
              <span className="text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                {activePlanInfo.entitlements.filter(e => e.active).length} of {activePlanInfo.entitlements.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {activePlanInfo.entitlements.map((ent, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    ent.active
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-gray-50/60 border-border text-txt-muted'
                  }`}
                >
                  <span className="font-semibold">{ent.label}</span>
                  {ent.active ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-txt-muted px-1.5 py-0.5 rounded bg-gray-200">
                      Upgrade
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Paywall assurance notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-surface-subtle border border-border flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-txt-secondary leading-relaxed">
                <span className="font-bold text-txt-primary">Essential Redistribution Promise: </span>
                Listing food, matching with verified shelters, and confirming handovers will <span className="font-semibold text-emerald-800">never be restricted by a paywall</span> even if your subscription expires.
              </p>
            </div>
          </div>

          {/* Billing & Invoices History */}
          <div className="fb-card p-6 bg-white border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-txt-primary">
                  Billing History & Tax Invoices
                </h3>
                <p className="text-xs text-txt-secondary">
                  Download monthly GST invoices and payment summaries.
                </p>
              </div>
              <span className="text-xs font-semibold text-txt-muted">
                All amounts in INR (₹)
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-txt-secondary font-semibold">
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Billing Period</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-txt-primary">{inv.id}</td>
                      <td className="p-3 text-txt-secondary">{inv.period}</td>
                      <td className="p-3 text-txt-primary font-medium">{inv.plan}</td>
                      <td className="p-3 text-right font-extrabold text-txt-primary">{inv.amount}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(inv.id)}
                          disabled={downloadingId === inv.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-gray-100 text-txt-primary font-semibold text-xs transition-colors"
                        >
                          {downloadingId === inv.id ? (
                            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-primary" />
                          )}
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-txt-muted">
              Note: Tax invoices are generated for software service subscriptions under SAC 998314. These are commercial service receipts and do not represent Section 80G charitable certificates.
            </p>
          </div>
        </div>
      </div>

      {/* Downgrade Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-md p-6 bg-white shadow-elevation relative space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-txt-primary">
                Downgrade to Community Free Plan?
              </h3>
              <p className="text-xs text-txt-secondary mt-1">
                You will retain full access to essential food donation listings, intelligent matching, and handover confirmations. 
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border text-xs space-y-1.5 text-txt-secondary">
              <p className="font-semibold text-txt-primary">What changes:</p>
              <p>• Automated recurring schedules will be paused</p>
              <p>• Staff seats will be limited to 1 primary account</p>
              <p>• Advanced kitchen waste analytics will be hidden</p>
              <p className="text-emerald-800 font-semibold">✓ Zero disruption to active surplus food rescues</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold text-xs"
              >
                Keep Current Plan
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  if (onDowngradeToFree) onDowngradeToFree();
                }}
                className="flex-1 py-2.5 rounded-xl bg-status-danger hover:bg-red-700 text-white font-bold text-xs shadow-sm"
              >
                Confirm Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
