import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Sliders, 
  Info, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  PieChart, 
  ArrowRight,
  Layers
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import StatCard from '../ui/StatCard';

export default function UnitEconomicsDashboard({
  onNavigateToRevenue
}) {
  // Configurable Simulator Assumptions
  const [payingOrgs, setPayingOrgs] = useState(86);
  const [avgFeePerOrg, setAvgFeePerOrg] = useState(2149); // INR / month
  const [rescuesPerMonth, setRescuesPerMonth] = useState(3800); // Food batches rescued
  const [mealsPerRescue, setMealsPerRescue] = useState(120);

  // Unit Cost Assumptions
  const [cloudTechMonthly, setCloudTechMonthly] = useState(16500); // Fixed cloud / DB / hosting
  const [aiCostPerListing, setAiCostPerListing] = useState(0.85); // INR vision & shelf-life AI call
  const [smsCostPerRescue, setSmsCostPerRescue] = useState(0.40); // INR OTP & alert SMS
  const [logisticsCoordPerRescue, setLogisticsCoordPerRescue] = useState(12.50); // Volunteer support & packaging subsidy
  const [supportCostMonthly, setSupportCostMonthly] = useState(24000); // Dedicated ops coordinator

  // Dynamic Calculations
  const monthlyRevenue = payingOrgs * avgFeePerOrg;
  const totalVariableCosts = (rescuesPerMonth * (aiCostPerListing + smsCostPerRescue + logisticsCoordPerRescue));
  const totalFixedCosts = cloudTechMonthly + supportCostMonthly;
  const totalMonthlyCost = totalVariableCosts + totalFixedCosts;
  
  const costPerRescue = (totalMonthlyCost / rescuesPerMonth).toFixed(2);
  const costPerMeal = (totalMonthlyCost / (rescuesPerMonth * mealsPerRescue)).toFixed(2);
  
  const contributionMarginAmount = monthlyRevenue - totalVariableCosts;
  const contributionMarginPercent = ((contributionMarginAmount / monthlyRevenue) * 100).toFixed(1);
  const netMonthlyOperatingResult = monthlyRevenue - totalMonthlyCost;
  
  // Break-even paying organizations
  const unitContributionPerOrg = avgFeePerOrg - (totalVariableCosts / (payingOrgs || 1));
  const breakEvenOrgs = unitContributionPerOrg > 0 
    ? Math.ceil(totalFixedCosts / unitContributionPerOrg)
    : 'N/A';

  const resetDefaults = () => {
    setPayingOrgs(86);
    setAvgFeePerOrg(2149);
    setRescuesPerMonth(3800);
    setMealsPerRescue(120);
    setCloudTechMonthly(16500);
    setAiCostPerListing(0.85);
    setSmsCostPerRescue(0.40);
    setLogisticsCoordPerRescue(12.50);
    setSupportCostMonthly(24000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <PageHeader
        title="Unit-Economics & Financial Sustainability Simulator"
        subtitle="Mission-driven startup unit economics, operational cost per food rescue, contribution margins, and break-even projections"
        badge="Sustainability Model"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={resetDefaults}
              className="px-3.5 py-2 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Assumptions</span>
            </button>
            {onNavigateToRevenue && (
              <button
                onClick={onNavigateToRevenue}
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Live Admin Revenue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        }
      />

      {/* Mandatory Statutory & Simulation Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>Simulated Financial Modeling Disclaimer:</span>
        </div>
        <p className="text-[11px] text-amber-900 leading-relaxed">
          The values presented in this dashboard are interactive projections derived from configurable startup operational assumptions. 
          They are intended for unit-economics analysis, break-even planning, and sustainability evaluation, not audited GAAP/IFRS financial statements.
        </p>
      </div>

      {/* Key Sustainability Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cost per Food Rescue"
          value={`₹${costPerRescue}`}
          change={`₹${costPerMeal} per meal`}
          trend="down"
          color="emerald"
        />
        <StatCard
          title="Contribution Margin"
          value={`${contributionMarginPercent}%`}
          change={`₹${Math.round(contributionMarginAmount).toLocaleString('en-IN')} gross`}
          trend="up"
          color="primary"
        />
        <StatCard
          title="Monthly Net Result"
          value={`${netMonthlyOperatingResult >= 0 ? '+' : ''}₹${Math.round(netMonthlyOperatingResult).toLocaleString('en-IN')}`}
          change={netMonthlyOperatingResult >= 0 ? 'Operating Surplus' : 'Net Burn'}
          trend={netMonthlyOperatingResult >= 0 ? 'up' : 'down'}
          color={netMonthlyOperatingResult >= 0 ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Break-Even Threshold"
          value={`${breakEvenOrgs} Food Partners`}
          change={`${payingOrgs >= breakEvenOrgs ? 'Achieved Self-Sufficiency' : `${breakEvenOrgs - payingOrgs} more to break even`}`}
          trend="up"
          color="blue"
        />
      </div>

      {/* Two Column Layout: Interactive Assumptions vs Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Interactive Assumptions Sliders */}
        <div className="fb-card p-6 bg-white border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Simulated Assumptions & Levers</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-txt-muted bg-surface-subtle px-2 py-0.5 rounded">
              Interactive
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Paying Orgs */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-txt-secondary">Active Paying Food Partners:</span>
                <span className="font-bold text-primary">{payingOrgs} Outlets</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="2"
                value={payingOrgs}
                onChange={(e) => setPayingOrgs(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-txt-muted">
                <span>10 Seed</span>
                <span>150 Growth</span>
                <span>300 Scale</span>
              </div>
            </div>

            {/* Average Revenue Per Org */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-txt-secondary">Average Monthly Fee per Partner (ARPU):</span>
                <span className="font-bold text-primary">₹{avgFeePerOrg} / mo</span>
              </div>
              <input
                type="range"
                min="999"
                max="5000"
                step="50"
                value={avgFeePerOrg}
                onChange={(e) => setAvgFeePerOrg(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Rescues per month */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-txt-secondary">Monthly Surplus Rescues Completed:</span>
                <span className="font-bold text-primary">{rescuesPerMonth.toLocaleString('en-IN')} pickups</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="100"
                value={rescuesPerMonth}
                onChange={(e) => setRescuesPerMonth(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Logistics Coordination Subsidy */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-txt-secondary">Logistics & Courier Subsidy per Rescue:</span>
                <span className="font-bold text-primary">₹{logisticsCoordPerRescue.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="0.5"
                value={logisticsCoordPerRescue}
                onChange={(e) => setLogisticsCoordPerRescue(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* AI and API Costs */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-txt-secondary">Vision AI & Safety Verification Cost:</span>
                <span className="font-bold text-primary">₹{aiCostPerListing.toFixed(2)} / call</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={aiCostPerListing}
                onChange={(e) => setAiCostPerListing(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Operational Result & Cost Distribution */}
        <div className="fb-card p-6 bg-white border border-border space-y-5">
          <h3 className="text-base font-bold text-txt-primary flex items-center gap-2">
            <PieChart className="w-4 h-4 text-primary" />
            <span>Projected Monthly Operating Result</span>
          </h3>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-txt-primary">Total SaaS Monthly Revenue:</span>
              <span className="font-extrabold text-primary text-base">₹{Math.round(monthlyRevenue).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex justify-between text-txt-secondary">
                <span>Field Logistics & Delivery Subsidy:</span>
                <span className="font-semibold text-txt-primary">₹{Math.round(rescuesPerMonth * logisticsCoordPerRescue).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-txt-secondary">
                <span>Vision AI & Verification APIs:</span>
                <span className="font-semibold text-txt-primary">₹{Math.round(rescuesPerMonth * aiCostPerListing).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-txt-secondary">
                <span>SMS & WhatsApp Handshake Alerts:</span>
                <span className="font-semibold text-txt-primary">₹{Math.round(rescuesPerMonth * smsCostPerRescue).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-txt-secondary">
                <span>Cloud Infrastructure & DB Storage:</span>
                <span className="font-semibold text-txt-primary">₹{cloudTechMonthly.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-txt-secondary">
                <span>Customer Ops & Support Personnel:</span>
                <span className="font-semibold text-txt-primary">₹{supportCostMonthly.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="font-bold text-txt-primary">Total Monthly Platform Cost:</span>
              <span className="font-extrabold text-status-danger text-base">₹{Math.round(totalMonthlyCost).toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-3 border-t-2 border-primary/20 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-txt-primary text-sm block">Net Operating Result:</span>
                <span className="text-[10px] text-txt-muted">Revenue minus total operating costs</span>
              </div>
              <span className={`font-black text-lg ${
                netMonthlyOperatingResult >= 0 ? 'text-primary' : 'text-status-danger'
              }`}>
                {netMonthlyOperatingResult >= 0 ? '+' : ''}₹{Math.round(netMonthlyOperatingResult).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Break-even Visualization */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold block">Self-Sustaining Unit Economics:</span>
            <p className="text-[11px] leading-relaxed">
              At ₹{avgFeePerOrg}/month ARPU, FoodBridge requires just <strong>{breakEvenOrgs} commercial food partners</strong> to become fully self-funding, allowing hundreds of recipient shelters to rescue surplus food with zero ongoing platform subsidies.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
