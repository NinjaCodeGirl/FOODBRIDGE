import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  HelpCircle, 
  ArrowRight, 
  CreditCard, 
  X, 
  FileText, 
  Sliders, 
  AlertCircle,
  Clock,
  ChevronDown,
  Info
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';

export default function PricingPage({
  currentPlan = 'COMMUNITY_FREE',
  onSelectPlan,
  onOpenEnterpriseModal,
  role = 'DONOR'
}) {
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'ANNUAL'
  const [activeFaq, setActiveFaq] = useState(null);
  const [showSandboxCheckout, setShowSandboxCheckout] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState(null);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);

  // Form states for checkout
  const [checkoutGstin, setCheckoutGstin] = useState('07AAAAA0000A1Z5');
  const [checkoutOrg, setCheckoutOrg] = useState('Taj Palace Banquet Kitchen');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Enterprise form
  const [enterpriseForm, setEnterpriseForm] = useState({
    orgName: 'The Oberoi Group Hotels',
    contactPerson: 'Aditya Mehra (VP Sustainability & Operations)',
    email: 'aditya.mehra@oberoigroup.com',
    phone: '+91 98111 22334',
    branches: '15-50',
    estimatedMonthlyKg: '4500',
    requirements: 'Centralized multi-city dashboard, ESG Scope 3 emissions reporting, custom FSSAI audit exports, and API integration with Oracle Opera POS.'
  });
  const [enterpriseSubmitted, setEnterpriseSubmitted] = useState(false);

  // Subscription Plans
  const plans = [
    {
      id: 'COMMUNITY_FREE',
      name: 'Community Free',
      tagline: 'For NGOs, shelters, community kitchens, and small food outlets.',
      monthlyPrice: 0,
      annualPrice: 0,
      highlightBadge: 'Essential & 100% Free Forever',
      isFree: true,
      buttonLabel: currentPlan === 'COMMUNITY_FREE' ? 'Current Active Plan' : 'Free Always',
      description: 'Zero barrier to entry. Every essential food rescue tool is permanently free to maximize food diversion.',
      features: [
        'Unlimited food donation listings',
        'Food-safety & shelf-life eligibility checks',
        'Intelligent proximity matching (< 5 km)',
        'Donation claiming & shelter acceptance',
        'Essential pickup & transit tracking',
        'Secure QR & 6-digit OTP handover',
        'Basic donation history & receipt logs',
        'Standard email & community support'
      ],
      notIncluded: [
        'Automated recurring donation schedules',
        'Multi-staff account management',
        'Centralized multi-location dashboard',
        'Automated ESG & impact reporting'
      ]
    },
    {
      id: 'FOOD_PARTNER_PRO',
      name: 'Food Partner Pro',
      tagline: 'For independent restaurants, cafés, banquet halls, and small boutique hotels.',
      monthlyPrice: 999,
      annualPrice: 9990, // ~₹832/mo (17% off)
      highlightBadge: 'Most Popular for Restaurants',
      isPopular: true,
      buttonLabel: currentPlan === 'FOOD_PARTNER_PRO' ? 'Current Plan' : 'Upgrade to Pro',
      description: 'Eliminate daily manual posting, automate pickup coordination, and track food waste reduction effortlessly.',
      features: [
        'Everything in Community Free, plus:',
        'Automated recurring donation scheduling',
        'Staff account management (up to 5 staff)',
        'Monthly verified carbon & meal impact reports',
        'Kitchen surplus analytics & waste heatmaps',
        'Instant WhatsApp & SMS operational alerts',
        'Downloadable donation & handoff history (CSV/PDF)',
        'Priority proximity boost for faster volunteer dispatch',
        'Standard business-hours email & phone support'
      ],
      notIncluded: [
        'Multi-branch group management',
        'Custom enterprise ERP/POS integrations'
      ]
    },
    {
      id: 'BUSINESS_PLUS',
      name: 'Business Plus',
      tagline: 'For hotel chains, large caterers, restaurant groups, and cloud kitchen clusters.',
      monthlyPrice: 2999,
      annualPrice: 29990, // ~₹2499/mo (17% off)
      highlightBadge: 'Multi-Location Operations',
      buttonLabel: currentPlan === 'BUSINESS_PLUS' ? 'Current Plan' : 'Upgrade to Business Plus',
      description: 'Centralized oversight, branch benchmarking, compliance exports, and bulk donation dispatch.',
      features: [
        'Everything in Food Partner Pro, plus:',
        'Multi-location management (up to 15 branches)',
        'Centralized group analytics & consolidated reports',
        'Branch-wise surplus & efficiency benchmarking',
        'Automated daily/weekly executive summary digests',
        'Bulk donation dispatch & algorithmic batch splitting',
        'Exportable FSSAI-aligned compliance records',
        'Food loss prediction & inventory insights',
        'Priority 2-hour SLA email & dedicated phone hotline'
      ],
      notIncluded: [
        'Dedicated CSR program management & audit covenants',
        'Custom white-label dashboards'
      ]
    },
    {
      id: 'ENTERPRISE_CSR',
      name: 'Enterprise & CSR',
      tagline: 'For national hotel chains, IT campus cafeterias, corporate food courts, and CSR programs.',
      monthlyPrice: 'Custom',
      annualPrice: 'Custom',
      highlightBadge: 'Custom Institutional Scale',
      isEnterprise: true,
      buttonLabel: 'Request Custom Quote',
      description: 'End-to-end food waste mitigation, institutional CSR program governance, and direct ERP/POS integration.',
      features: [
        'Everything in Business Plus, plus:',
        'Unlimited branches across multiple cities & states',
        'CSR program management & verified funding tracking',
        'Custom ESG & BRSR (Business Responsibility) reporting',
        'Direct REST API webhooks & Oracle Opera/POS integrations',
        'Dedicated Account Manager & Logistics Dispatch Coordinator',
        'Verified food-rescue impact certification with auditable trail',
        'Custom SLA guarantees (99.9% uptime, 30-min response)',
        'Custom master service agreements & procurement invoicing'
      ],
      notIncluded: []
    }
  ];

  const faqs = [
    {
      q: 'Will FoodBridge ever charge for essential food donation and rescue?',
      a: 'Never. The core food redistribution features—listing surplus food, matching with shelters, claiming food, and verified QR/OTP handshakes—are permanently free. Paid plans provide operational automation, multi-branch governance, and analytics for commercial establishments that want advanced SaaS tooling.'
    },
    {
      q: 'Are food donations eligible for Section 80G tax deductions?',
      a: 'No. Under the Indian Income Tax Act, Section 80G deductions apply strictly to monetary donations made to eligible charitable trusts, not in-kind food donations. FoodBridge provides verified operational records, ESG sustainability data, and food-safety traceability logs, not tax-deduction receipts.'
    },
    {
      q: 'How does the Sandbox Payment / Demo checkout work?',
      a: 'FoodBridge provides a fully functional simulated billing environment. You can test upgrading to Pro or Business Plus, generate simulated tax invoices (INV-FB-YYYYMM-XXXX), and test plan entitlements without charging real credit cards.'
    },
    {
      q: 'Can an NGO or Shelter use FoodBridge for free forever?',
      a: 'Yes! NGOs, orphanages, and shelters never pay any fees. All claiming, route coordination, and handover verification are 100% free for community partners.'
    },
    {
      q: 'Can we cancel or downgrade at any time?',
      a: 'Yes, anytime from your Subscription Settings. If you downgrade, your account immediately returns to the Community Free plan. You will never lose access to your active food donations or historical listing records.'
    }
  ];

  const handleStartCheckout = (plan) => {
    if (plan.id === 'COMMUNITY_FREE') {
      if (onSelectPlan) onSelectPlan('COMMUNITY_FREE');
      return;
    }
    if (plan.id === 'ENTERPRISE_CSR') {
      setShowEnterpriseModal(true);
      return;
    }
    setSelectedCheckoutPlan(plan);
    setShowSandboxCheckout(true);
  };

  const handleCompleteSandboxCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setShowSandboxCheckout(false);
        if (onSelectPlan) {
          onSelectPlan(selectedCheckoutPlan.id);
        }
      }, 1500);
    }, 1200);
  };

  const handleEnterpriseSubmit = (e) => {
    e.preventDefault();
    setEnterpriseSubmitted(true);
    setTimeout(() => {
      setEnterpriseSubmitted(false);
      setShowEnterpriseModal(false);
      if (onOpenEnterpriseModal) onOpenEnterpriseModal(enterpriseForm);
    }, 1800);
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-bold border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent, Mission-Driven B2B SaaS</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-txt-primary tracking-tight">
          Scalable Plans for Sustainable Food Partners
        </h1>
        <p className="text-sm sm:text-base text-txt-secondary leading-relaxed">
          Essential redistribution is <span className="font-bold text-primary">always 100% free</span>. 
          Upgrade to unlock automated scheduling, multi-location governance, and verified ESG compliance reporting.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1 rounded-2xl bg-surface-subtle border border-border">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-white text-txt-primary shadow-sm'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                billingCycle === 'ANNUAL' ? 'bg-white text-primary' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const displayPrice = billingCycle === 'ANNUAL' && typeof plan.annualPrice === 'number'
            ? Math.round(plan.annualPrice / 12)
            : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-white border transition-all duration-300 flex flex-col justify-between p-6 ${
                plan.isPopular
                  ? 'border-primary ring-2 ring-primary/20 shadow-elevation md:-translate-y-2'
                  : isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-border hover:border-gray-300 shadow-sm'
              }`}
            >
              {/* Highlight Badge */}
              {plan.highlightBadge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm ${
                    plan.isPopular
                      ? 'bg-primary text-white'
                      : plan.isFree
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-surface-subtle text-txt-secondary border border-border'
                  }`}>
                    {plan.highlightBadge}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div>
                <div className="mt-2">
                  <h3 className="text-lg font-bold text-txt-primary flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-txt-secondary mt-1 min-h-[34px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-border">
                  {typeof displayPrice === 'number' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-txt-primary tracking-tight">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-txt-secondary font-medium">
                        / month
                      </span>
                    </div>
                  ) : (
                    <div className="text-2xl font-extrabold text-txt-primary">
                      Custom Quote
                    </div>
                  )}

                  {billingCycle === 'ANNUAL' && typeof plan.annualPrice === 'number' && plan.annualPrice > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Billed annually at ₹{plan.annualPrice.toLocaleString('en-IN')}/year
                    </div>
                  )}
                  {plan.isFree && (
                    <div className="text-[11px] text-txt-muted font-medium mt-1">
                      No credit card required. Free for verified NGOs & small donors.
                    </div>
                  )}
                  {plan.isEnterprise && (
                    <div className="text-[11px] text-txt-muted font-medium mt-1">
                      Volume-based tailored procurement contracts.
                    </div>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-txt-secondary block">
                    What's included:
                  </span>
                  <ul className="space-y-2.5 text-xs text-txt-primary">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 leading-snug">
                        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5 stroke-[2.5]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.notIncluded && plan.notIncluded.length > 0 && (
                    <div className="pt-3 border-t border-border/60">
                      <ul className="space-y-1.5 text-[11px] text-txt-muted">
                        {plan.notIncluded.map((item, nIdx) => (
                          <li key={nIdx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => handleStartCheckout(plan)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm touch-target ${
                    isCurrent
                      ? 'bg-gray-100 text-txt-secondary cursor-default border border-border'
                      : plan.isPopular
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : plan.isEnterprise
                      ? 'bg-slate-900 hover:bg-slate-800 text-white'
                      : 'bg-white hover:bg-gray-50 text-txt-primary border border-border'
                  }`}
                >
                  <span>{isCurrent ? 'Current Plan' : plan.buttonLabel}</span>
                  {!isCurrent && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto p-5 rounded-2xl bg-surface-subtle border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-txt-primary">
              100% Protected Redistribution Guarantee
            </h4>
            <p className="text-xs text-txt-secondary">
              Essential food donation and claiming are permanently free of paywalls. Paid tiers only support advanced business SaaS features.
            </p>
          </div>
        </div>
        <div className="text-xs text-txt-secondary font-medium whitespace-nowrap flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Demo / Sandbox Mode Available</span>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-txt-primary">
            Detailed Plan Comparison
          </h2>
          <p className="text-xs sm:text-sm text-txt-secondary">
            Clear separation between free community rescue and commercial automation.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-subtle border-b border-border">
                <th className="p-4 font-bold text-txt-primary w-2/5">Capability / Feature</th>
                <th className="p-4 font-bold text-txt-primary text-center">Community Free</th>
                <th className="p-4 font-bold text-txt-primary text-center">Food Partner Pro</th>
                <th className="p-4 font-bold text-txt-primary text-center">Business Plus</th>
                <th className="p-4 font-bold text-txt-primary text-center">Enterprise & CSR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* Category: Essential Rescue */}
              <tr className="bg-gray-50/70">
                <td colSpan={5} className="p-3 font-extrabold text-[11px] uppercase tracking-wider text-txt-muted">
                  Essential Food Redistribution (Free Forever)
                </td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Surplus Food Donation Listing</td>
                <td className="p-4 text-center font-bold text-primary">Unlimited</td>
                <td className="p-4 text-center font-bold text-primary">Unlimited</td>
                <td className="p-4 text-center font-bold text-primary">Unlimited</td>
                <td className="p-4 text-center font-bold text-primary">Unlimited</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Automated Shelf-Life & FSSAI Checks</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Proximity Matching & Allocation</td>
                <td className="p-4 text-center text-primary font-bold">Basic (5 km)</td>
                <td className="p-4 text-center text-primary font-bold">Intelligent Matrix</td>
                <td className="p-4 text-center text-primary font-bold">Intelligent Matrix</td>
                <td className="p-4 text-center text-primary font-bold">Multi-Hub Routing</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">QR Handshake & 6-Digit OTP Handover</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
                <td className="p-4 text-center text-primary font-bold">✓ Included</td>
              </tr>

              {/* Category: Operational Automation */}
              <tr className="bg-gray-50/70">
                <td colSpan={5} className="p-3 font-extrabold text-[11px] uppercase tracking-wider text-txt-muted">
                  Kitchen Operational Automation
                </td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Repeat Donation Scheduling</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-primary font-bold">✓ Weekly/Daily</td>
                <td className="p-4 text-center text-primary font-bold">✓ Multi-Shift</td>
                <td className="p-4 text-center text-primary font-bold">✓ Custom Cron</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Staff Account Management</td>
                <td className="p-4 text-center text-txt-muted">1 User</td>
                <td className="p-4 text-center text-txt-primary font-semibold">Up to 5 Users</td>
                <td className="p-4 text-center text-txt-primary font-semibold">Up to 25 Users</td>
                <td className="p-4 text-center text-primary font-bold">Unlimited SSO</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Multi-Location Centralized Dashboard</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">Single Outlet</td>
                <td className="p-4 text-center text-primary font-bold">Up to 15 Outlets</td>
                <td className="p-4 text-center text-primary font-bold">Unlimited Across Cities</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Bulk Donation Dispatch & NGO Splitting</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-primary font-bold">✓ Automated</td>
                <td className="p-4 text-center text-primary font-bold">✓ Dynamic Multi-Hub</td>
              </tr>

              {/* Category: Compliance & CSR */}
              <tr className="bg-gray-50/70">
                <td colSpan={5} className="p-3 font-extrabold text-[11px] uppercase tracking-wider text-txt-muted">
                  Compliance, ESG & CSR Governance
                </td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">Verified Environmental Impact Reports</td>
                <td className="p-4 text-center text-txt-muted">Basic Summary</td>
                <td className="p-4 text-center text-txt-primary font-semibold">Monthly PDF</td>
                <td className="p-4 text-center text-primary font-bold">Audited ESG/BRSR</td>
                <td className="p-4 text-center text-primary font-bold">Custom Scope 3 Ledger</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">CSR Program Management & Fund Tracking</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-primary font-bold">✓ Dedicated Module</td>
              </tr>
              <tr>
                <td className="p-4 text-txt-primary font-medium">REST API & ERP/POS Webhooks</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-txt-muted">—</td>
                <td className="p-4 text-center text-primary font-bold">✓ Full API Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-bold text-txt-primary text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-white overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-txt-primary flex items-center justify-between gap-3 hover:bg-gray-50"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-txt-muted transition-transform flex-shrink-0 ${
                  activeFaq === idx ? 'rotate-180 text-primary' : ''
                }`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-txt-secondary leading-relaxed border-t border-border/50 bg-surface-subtle">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Sandbox Checkout Modal */}
      {showSandboxCheckout && selectedCheckoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-lg p-6 bg-white shadow-elevation relative space-y-5">
            <button
              onClick={() => setShowSandboxCheckout(false)}
              className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Sandbox / Simulated Billing Mode</span>
              </div>
              <h3 className="text-lg font-bold text-txt-primary mt-2">
                Subscribe to {selectedCheckoutPlan.name}
              </h3>
              <p className="text-xs text-txt-secondary">
                Simulated transaction workflow. No real financial credentials or payment cards will be charged.
              </p>
            </div>

            {/* Plan Summary */}
            <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex items-center justify-between text-xs">
              <div>
                <span className="text-txt-secondary block">Selected Plan:</span>
                <span className="font-bold text-txt-primary text-sm">{selectedCheckoutPlan.name}</span>
              </div>
              <div className="text-right">
                <span className="text-txt-secondary block">Total Amount:</span>
                <span className="font-extrabold text-primary text-base">
                  ₹{billingCycle === 'ANNUAL' ? selectedCheckoutPlan.annualPrice.toLocaleString('en-IN') : selectedCheckoutPlan.monthlyPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-txt-muted"> / {billingCycle === 'ANNUAL' ? 'year' : 'month'}</span>
                </span>
              </div>
            </div>

            {/* Billing Organization Details */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-txt-secondary font-medium block">Organization / Entity Name</label>
                <input
                  type="text"
                  value={checkoutOrg}
                  onChange={(e) => setCheckoutOrg(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-txt-secondary font-medium block">GSTIN / Tax Registration (Optional)</label>
                <input
                  type="text"
                  value={checkoutGstin}
                  onChange={(e) => setCheckoutGstin(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Simulated Card / Payment Selection */}
              <div className="p-3 rounded-xl border border-dashed border-primary/40 bg-primary-light/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Simulated Razorpay / UPI Test Mode</span>
                </div>
                <p className="text-[11px] text-txt-secondary">
                  Testing Token: <code className="bg-white px-1.5 py-0.5 rounded border border-border text-txt-primary">tok_sandbox_foodbridge_test</code>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSandboxCheckout(false)}
                className="flex-1 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteSandboxCheckout}
                disabled={isProcessing || checkoutSuccess}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Sandbox...</span>
                  </>
                ) : checkoutSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Subscription Activated!</span>
                  </>
                ) : (
                  <span>Confirm Test Subscription</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Enterprise Sales Inquiry Modal */}
      {showEnterpriseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-lg p-6 bg-white shadow-elevation relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEnterpriseModal(false)}
              className="absolute top-4 right-4 p-2 text-txt-secondary hover:text-txt-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                <Building2 className="w-3 h-3" />
                <span>Enterprise & CSR Partnerships</span>
              </div>
              <h3 className="text-lg font-bold text-txt-primary mt-2">
                Request Custom Enterprise Quotation
              </h3>
              <p className="text-xs text-txt-secondary">
                Tailored multi-city surplus redistribution, dedicated logistics management, and custom ESG/BRSR compliance.
              </p>
            </div>

            {enterpriseSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="font-bold text-base text-txt-primary">Inquiry Received</h4>
                <p className="text-xs text-txt-secondary max-w-sm mx-auto">
                  Reference: <code className="font-bold text-txt-primary">INQ-ENT-{Date.now().toString().slice(-6)}</code>. Our enterprise solutions architect will contact you within 4 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnterpriseSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-txt-secondary font-medium block">Company / Organization Name</label>
                  <input
                    type="text"
                    required
                    value={enterpriseForm.orgName}
                    onChange={(e) => setEnterpriseForm({ ...enterpriseForm, orgName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-txt-secondary font-medium block">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={enterpriseForm.contactPerson}
                      onChange={(e) => setEnterpriseForm({ ...enterpriseForm, contactPerson: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-txt-secondary font-medium block">Work Email</label>
                    <input
                      type="email"
                      required
                      value={enterpriseForm.email}
                      onChange={(e) => setEnterpriseForm({ ...enterpriseForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-txt-secondary font-medium block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={enterpriseForm.phone}
                      onChange={(e) => setEnterpriseForm({ ...enterpriseForm, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-txt-secondary font-medium block">Number of Branches</label>
                    <select
                      value={enterpriseForm.branches}
                      onChange={(e) => setEnterpriseForm({ ...enterpriseForm, branches: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="1-5">1 - 5 Locations</option>
                      <option value="6-15">6 - 15 Locations</option>
                      <option value="15-50">15 - 50 Locations</option>
                      <option value="50+">50+ Enterprise Multi-City</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-txt-secondary font-medium block">Estimated Monthly Surplus Volume (kg)</label>
                  <input
                    type="number"
                    value={enterpriseForm.estimatedMonthlyKg}
                    onChange={(e) => setEnterpriseForm({ ...enterpriseForm, estimatedMonthlyKg: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-txt-secondary font-medium block">Reporting & Integration Needs</label>
                  <textarea
                    rows={3}
                    value={enterpriseForm.requirements}
                    onChange={(e) => setEnterpriseForm({ ...enterpriseForm, requirements: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] text-txt-secondary leading-relaxed">
                  Notice: Inquiries are stored in our secure enterprise queue. CSR programs are monitored in compliance with Companies Act Section 135 criteria.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Submit Enterprise Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
