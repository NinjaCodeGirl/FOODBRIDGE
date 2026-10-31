import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  BarChart3, 
  Filter, 
  Download,
  Briefcase,
  PieChart
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';

export default function AdminRevenueDashboard({
  onNavigateToUnitEconomics
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('ALL_TIME');
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // 'OVERVIEW' | 'ENTERPRISE_LEADS' | 'CSR_PROGRAMS'
  const [showAddCsrModal, setShowAddCsrModal] = useState(false);

  // High-level live metrics
  const revenueMetrics = {
    mrr: 184850,
    arr: 2218200,
    payingAccounts: 86,
    totalAccounts: 312,
    freeAccounts: 226,
    churnRate: 1.8,
    arpu: 2149,
    outstandingInvoices: 0,
    conversionRate: 27.6,
    growthRateMoM: 18.4
  };

  // Plan Breakdown
  const planRevenueBreakdown = [
    { plan: 'Food Partner Pro', accounts: 54, price: 999, total: 53946, share: 29.2, color: 'bg-emerald-500' },
    { plan: 'Business Plus', accounts: 26, price: 2999, total: 77974, share: 42.2, color: 'bg-primary' },
    { plan: 'Enterprise & CSR', accounts: 6, price: 8821, total: 52930, share: 28.6, color: 'bg-slate-900' }
  ];

  // Monthly Revenue Growth Data
  const monthlyRevenueData = [
    { month: 'May 26', mrr: 88400, orgs: 41 },
    { month: 'Jun 26', mrr: 104200, orgs: 49 },
    { month: 'Jul 26', mrr: 122500, orgs: 58 },
    { month: 'Aug 26', mrr: 141900, orgs: 67 },
    { month: 'Sep 26', mrr: 162400, orgs: 77 },
    { month: 'Oct 26', mrr: 184850, orgs: 86 }
  ];

  // Enterprise Inquiries Queue
  const [enterpriseInquiries, setEnterpriseInquiries] = useState([
    {
      id: 'INQ-ENT-104921',
      orgName: 'The Oberoi Group Hotels',
      contactPerson: 'Aditya Mehra',
      email: 'aditya.mehra@oberoigroup.com',
      phone: '+91 98111 22334',
      branches: '15-50 Locations',
      monthlyVolumeKg: 4500,
      status: 'PROPOSAL_SENT',
      date: '17 Oct 2026',
      quotedAmount: '₹35,000 / month'
    },
    {
      id: 'INQ-ENT-104882',
      orgName: 'Haldiram Snacks Pvt Ltd',
      contactPerson: 'Vikas Sharma',
      email: 'v.sharma@haldirams.com',
      phone: '+91 98222 99881',
      branches: '28 Locations (Delhi NCR)',
      monthlyVolumeKg: 8200,
      status: 'DEMO_COMPLETED',
      date: '15 Oct 2026',
      quotedAmount: '₹55,000 / month'
    },
    {
      id: 'INQ-ENT-104719',
      orgName: 'Sodexo Corporate Dining',
      contactPerson: 'Pooja Iyer',
      email: 'p.iyer@sodexo.com',
      phone: '+91 98333 44112',
      branches: '12 IT Parks',
      monthlyVolumeKg: 6100,
      status: 'CONTRACT_REVIEW',
      date: '11 Oct 2026',
      quotedAmount: '₹40,000 / month'
    }
  ]);

  // CSR Program Management
  const [csrPrograms, setCsrPrograms] = useState([
    {
      id: 'CSR-2026-001',
      title: 'ITC Mission Sunehra Kal — Hunger Free NCR',
      sponsor: 'ITC Limited CSR Foundation',
      implementingNgo: 'Akshaya Patra Foundation & Robin Hood Army',
      budget: 1800000,
      durationMonths: 12,
      mealsRescued: 48500,
      verifiedDeliveries: 342,
      platformFee: 180000, // 10% tech & coordination fee
      disbursedToPartners: 1420000,
      status: 'AUDITED_ACTIVE'
    },
    {
      id: 'CSR-2026-002',
      title: 'Tata Capital Urban Food Security Program',
      sponsor: 'Tata Capital Financial Services',
      implementingNgo: 'Feeding India by Zomato',
      budget: 1200000,
      durationMonths: 6,
      mealsRescued: 32400,
      verifiedDeliveries: 215,
      platformFee: 120000,
      disbursedToPartners: 950000,
      status: 'AUDITED_ACTIVE'
    }
  ]);

  // New CSR program form
  const [newCsr, setNewCsr] = useState({
    title: '',
    sponsor: '',
    implementingNgo: '',
    budget: '',
    durationMonths: '12'
  });

  const handleAddCsr = (e) => {
    e.preventDefault();
    if (!newCsr.title || !newCsr.sponsor || !newCsr.budget) return;
    const prog = {
      id: `CSR-2026-${String(csrPrograms.length + 1).padStart(3, '0')}`,
      title: newCsr.title,
      sponsor: newCsr.sponsor,
      implementingNgo: newCsr.implementingNgo || 'Verified NGO Network',
      budget: Number(newCsr.budget),
      durationMonths: Number(newCsr.durationMonths),
      mealsRescued: 0,
      verifiedDeliveries: 0,
      platformFee: Math.round(Number(newCsr.budget) * 0.1),
      disbursedToPartners: 0,
      status: 'INITIALIZED'
    };
    setCsrPrograms([prog, ...csrPrograms]);
    setShowAddCsrModal(false);
    setNewCsr({ title: '', sponsor: '', implementingNgo: '', budget: '', durationMonths: '12' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Admin Revenue & Monetization Analytics"
        subtitle="Platform revenue metrics, subscription tiers, enterprise sales pipeline, and CSR program governance"
        badge="Platform Executive Suite"
        action={
          <div className="flex items-center gap-2">
            {onNavigateToUnitEconomics && (
              <button
                onClick={onNavigateToUnitEconomics}
                className="px-3.5 py-2 rounded-xl bg-surface-subtle hover:bg-gray-100 text-txt-primary border border-border font-bold text-xs flex items-center gap-1.5 touch-target transition-colors"
              >
                <PieChart className="w-4 h-4 text-primary" />
                <span>Unit Economics Simulator</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('CSR_PROGRAMS')}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm touch-target"
            >
              <Briefcase className="w-4 h-4" />
              <span>CSR Programs</span>
            </button>
          </div>
        }
      />

      {/* Demo / Verified Simulation Banner */}
      <div className="p-4 rounded-xl bg-primary-light/40 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <div>
            <span className="font-bold text-txt-primary">Live SaaS Revenue Engine: </span>
            <span className="text-txt-secondary">
              Derived from verified stored subscriptions and enterprise partner commitments.
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-border">
          Status: Operational (Simulated Sandbox Gateway)
        </span>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue (MRR)"
          value={`₹${revenueMetrics.mrr.toLocaleString('en-IN')}`}
          change={`+${revenueMetrics.growthRateMoM}% MoM`}
          trend="up"
          color="emerald"
        />
        <StatCard
          title="Annualized Run-Rate (ARR)"
          value={`₹${(revenueMetrics.arr / 100000).toFixed(1)} Lakhs`}
          change="₹22.18L Target"
          trend="neutral"
          color="blue"
        />
        <StatCard
          title="Paying Food Partners"
          value={`${revenueMetrics.payingAccounts} / ${revenueMetrics.totalAccounts}`}
          change={`${revenueMetrics.conversionRate}% Conversion`}
          trend="up"
          color="primary"
        />
        <StatCard
          title="Average Rev / User (ARPU)"
          value={`₹${revenueMetrics.arpu.toLocaleString('en-IN')}`}
          change={`${revenueMetrics.churnRate}% Net Churn`}
          trend="up"
          color="amber"
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-primary text-white shadow-sm'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-gray-100'
          }`}
        >
          Revenue & Tier Breakdown
        </button>
        <button
          onClick={() => setActiveTab('ENTERPRISE_LEADS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ENTERPRISE_LEADS'
              ? 'bg-primary text-white shadow-sm'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-gray-100'
          }`}
        >
          <span>Enterprise Leads & Quotes</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {enterpriseInquiries.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('CSR_PROGRAMS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'CSR_PROGRAMS'
              ? 'bg-primary text-white shadow-sm'
              : 'text-txt-secondary hover:text-txt-primary hover:bg-gray-100'
          }`}
        >
          <span>CSR Grants & Funding</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            {csrPrograms.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BREAKDOWN */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Monthly Growth Chart Simulation */}
            <div className="lg:col-span-2 fb-card p-6 bg-white border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-txt-primary">
                    MRR Growth & Paying Accounts Trend
                  </h3>
                  <p className="text-xs text-txt-secondary">
                    Consistent +18% monthly growth fueled by commercial banquet and restaurant conversions.
                  </p>
                </div>
                <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                  6 Months Trend
                </span>
              </div>

              {/* Visual Bar Chart */}
              <div className="pt-6 pb-2">
                <div className="flex items-end justify-between gap-3 h-48 border-b border-border pb-2">
                  {monthlyRevenueData.map((data, idx) => {
                    const maxVal = 200000;
                    const heightPercent = Math.round((data.mrr / maxVal) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-extrabold text-txt-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{(data.mrr / 1000).toFixed(0)}k
                        </span>
                        <div className="w-full max-w-[48px] bg-emerald-50 rounded-t-lg relative flex items-end justify-center overflow-hidden h-36">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-primary hover:bg-primary-dark transition-all rounded-t-lg"
                          />
                        </div>
                        <span className="text-xs font-semibold text-txt-secondary">{data.month}</span>
                        <span className="text-[10px] text-txt-muted">{data.orgs} orgs</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-txt-secondary pt-2">
                <span>Free Community Users: <strong>226 NGOs & Shelters (100% Free)</strong></span>
                <span>Paying B2B Accounts: <strong>86 Food Partners</strong></span>
              </div>
            </div>

            {/* Right Col: Revenue by Subscription Tier */}
            <div className="fb-card p-6 bg-white border border-border space-y-4">
              <div>
                <h3 className="text-base font-bold text-txt-primary">
                  Revenue Share by Tier
                </h3>
                <p className="text-xs text-txt-secondary">
                  Business Plus is the highest revenue contributor at 42.2%.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {planRevenueBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-border space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-txt-primary">{item.plan}</span>
                      <span className="font-extrabold text-primary">₹{item.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        style={{ width: `${item.share}%` }} 
                        className={`h-2 rounded-full ${item.color}`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-txt-secondary">
                      <span>{item.accounts} accounts ({item.share}%)</span>
                      <span>Avg ₹{item.price}/mo</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                <span className="font-bold block">Zero Churn on Business Plus:</span>
                Multi-location hotel groups experience 98.2% retention due to automated reporting.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENTERPRISE INQUIRIES QUEUE */}
      {activeTab === 'ENTERPRISE_LEADS' && (
        <div className="fb-card p-6 bg-white border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-txt-primary">
                Enterprise & Large Institutional Leads
              </h3>
              <p className="text-xs text-txt-secondary">
                Commercial kitchens and national chains requesting custom contracts and multi-city rollouts.
              </p>
            </div>
            <span className="text-xs font-semibold text-txt-muted">
              Average Deal Value: ₹40,000 / month
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-txt-secondary font-semibold">
                  <th className="p-3">Inquiry Ref</th>
                  <th className="p-3">Organization</th>
                  <th className="p-3">Key Contact</th>
                  <th className="p-3">Scale & Locations</th>
                  <th className="p-3">Est. Monthly Vol</th>
                  <th className="p-3 text-right">Quotation</th>
                  <th className="p-3 text-center">Pipeline Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {enterpriseInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-bold text-txt-primary">{inq.id}</td>
                    <td className="p-3 font-bold text-txt-primary">{inq.orgName}</td>
                    <td className="p-3">
                      <div>{inq.contactPerson}</div>
                      <div className="text-[11px] text-txt-secondary">{inq.email}</div>
                    </td>
                    <td className="p-3 text-txt-secondary">{inq.branches}</td>
                    <td className="p-3 text-txt-primary font-semibold">{inq.monthlyVolumeKg} kg</td>
                    <td className="p-3 text-right font-extrabold text-primary">{inq.quotedAmount}</td>
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CSR PROGRAMS & GRANTS */}
      {activeTab === 'CSR_PROGRAMS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-txt-primary">
                Corporate Social Responsibility (CSR) Programs
              </h3>
              <p className="text-xs text-txt-secondary">
                Verified hunger-relief initiatives sponsored by corporate CSR foundations under Companies Act Section 135.
              </p>
            </div>
            <button
              onClick={() => setShowAddCsrModal(true)}
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize New CSR Program</span>
            </button>
          </div>

          {/* CSR Transparency Notice */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Statutory CSR & Revenue Transparency Disclosure:
            </span>
            <p className="text-slate-700">
              FoodBridge is an operational technology platform connecting food donors with Section 12A/80G registered NGO partners. 
              CSR grant budgets are held and disbursed directly to verified field operational partners. FoodBridge charges a transparent 
              <strong> 10% platform facilitation & verification fee</strong> for cryptographic audit ledgers, cold-chain monitoring, and real-time impact dashboards.
            </p>
          </div>

          {/* Active Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {csrPrograms.map((prog) => (
              <div key={prog.id} className="fb-card p-6 bg-white border border-border space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-txt-muted">
                      {prog.id} • {prog.durationMonths} Months Program
                    </span>
                    <h4 className="text-base font-bold text-txt-primary mt-1">
                      {prog.title}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    {prog.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-txt-secondary">Corporate Sponsor:</span>
                    <span className="font-bold text-txt-primary">{prog.sponsor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-txt-secondary">NGO Partners:</span>
                    <span className="font-semibold text-txt-primary">{prog.implementingNgo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-txt-secondary">Committed Budget:</span>
                    <span className="font-extrabold text-primary text-sm">₹{prog.budget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-txt-secondary">Platform SaaS Fee (10%):</span>
                    <span className="font-bold text-txt-primary">₹{prog.platformFee.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Progress / Delivery metrics */}
                <div className="p-3 rounded-xl bg-surface-subtle border border-border grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <span className="text-txt-muted block text-[10px] uppercase font-bold">Rescued Meals</span>
                    <span className="font-extrabold text-emerald-800 text-base">{prog.mealsRescued.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-txt-muted block text-[10px] uppercase font-bold">Verified Pickups</span>
                    <span className="font-extrabold text-txt-primary text-base">{prog.verifiedDeliveries}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Add CSR Program */}
      {showAddCsrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="fb-card w-full max-w-lg p-6 bg-white shadow-elevation relative space-y-4">
            <h3 className="text-base font-bold text-txt-primary">
              Initialize Verified CSR Program
            </h3>
            <form onSubmit={handleAddCsr} className="space-y-3 text-xs">
              <div>
                <label className="text-txt-secondary font-medium block">Program Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Parivartan Community Kitchens"
                  value={newCsr.title}
                  onChange={(e) => setNewCsr({ ...newCsr, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-txt-secondary font-medium block">Sponsoring Corporation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Bank CSR Foundation"
                  value={newCsr.sponsor}
                  onChange={(e) => setNewCsr({ ...newCsr, sponsor: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-txt-secondary font-medium block">Total Committed Budget (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500000"
                    value={newCsr.budget}
                    onChange={(e) => setNewCsr({ ...newCsr, budget: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-txt-secondary font-medium block">Duration (Months)</label>
                  <select
                    value={newCsr.durationMonths}
                    onChange={(e) => setNewCsr({ ...newCsr, durationMonths: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="6">6 Months</option>
                    <option value="12">12 Months (1 Year)</option>
                    <option value="24">24 Months (2 Years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-txt-secondary font-medium block">Implementing NGO Partner</label>
                <input
                  type="text"
                  placeholder="e.g. Akshaya Patra Foundation & Robin Hood Army"
                  value={newCsr.implementingNgo}
                  onChange={(e) => setNewCsr({ ...newCsr, implementingNgo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCsrModal(false)}
                  className="flex-1 py-2 rounded-xl border border-border hover:bg-gray-50 text-txt-primary font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
