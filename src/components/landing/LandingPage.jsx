import React from 'react';
import { 
  Utensils, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Truck, 
  Leaf, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Scale, 
  MapPin, 
  HeartHandshake, 
  Users, 
  PhoneCall, 
  Globe, 
  ChevronRight,
  Split,
  FileText,
  Star
} from 'lucide-react';
import { translations } from '../../utils/translations';

export default function LandingPage({
  lang = 'en',
  setLang,
  onOpenAuth,
  onNavigateToPricing,
  metrics
}) {
  const t = translations[lang] || translations.en;

  const impactStats = [
    {
      label: t.mealsRescued,
      value: metrics?.total_meals_rescued ? metrics.total_meals_rescued.toLocaleString() : '15,420',
      sub: 'Safe meals served to communities',
      icon: Utensils,
      color: 'text-primary'
    },
    {
      label: t.co2Mitigated,
      value: metrics?.total_co2_avoided_kg ? `${(metrics.total_co2_avoided_kg / 1000).toFixed(1)} T` : '38.5 T',
      sub: '2.5 kg CO₂ prevented per meal',
      icon: Leaf,
      color: 'text-status-success'
    },
    {
      label: t.foodDiverted,
      value: metrics?.total_food_saved_tonnes ? `${metrics.total_food_saved_tonnes} T` : '4.6 T',
      sub: 'Diverted from city landfills',
      icon: Scale,
      color: 'text-amber-500'
    },
    {
      label: t.activePartners,
      value: metrics?.active_ngo_partners || 54,
      sub: 'Verified shelters in Delhi NCR',
      icon: Building2,
      color: 'text-blue-500'
    }
  ];

  const partners = [
    { name: 'NSUT Campus Dining Hall', type: 'University Donor' },
    { name: 'Taj Palace Banquet Kitchen', type: 'Hospitality Partner' },
    { name: 'Akshaya Patra Foundation', type: 'Verified Shelter' },
    { name: 'Robin Hood Army Delhi', type: 'Volunteer Brigade' },
    { name: 'Feeding India Shelter', type: 'Community Kitchen' },
    { name: 'Bikanervala Sweets', type: 'Bakery Donor' }
  ];

  return (
    <div className="min-h-screen bg-surface-bg text-txt-primary flex flex-col antialiased selection:bg-primary selection:text-white">
      
      {/* 1. PUBLIC LANDING NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-orange">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display text-navy">
                Food<span className="text-primary">Bridge</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-orange-100 text-primary text-[10px] font-extrabold tracking-wide uppercase">
                Redistribution SaaS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-txt-secondary">
            <a href="#about" className="hover:text-primary transition-colors">{t.aboutUs}</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">{t.howItWorks}</a>
            <a href="#safety" className="hover:text-primary transition-colors">Safety & AI</a>
            <a href="#impact" className="hover:text-primary transition-colors">{t.impact}</a>
            <a href="#pricing" className="hover:text-primary transition-colors">{t.pricing}</a>
          </div>

          {/* Right Actions: Language Switcher & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-surface-subtle text-xs font-bold text-txt-secondary flex items-center gap-1.5 transition-colors touch-target"
              title="Toggle English / Hindi"
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-txt-primary hover:text-primary transition-colors touch-target"
            >
              {t.login}
            </button>

            <button
              onClick={() => onOpenAuth('register')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm shadow-orange transition-all touch-target flex items-center gap-1.5"
            >
              <span>{t.joinNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-white via-orange-50/20 to-surface-bg border-b border-border">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-primary text-xs font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Hunger • Zero Landfill Waste</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-navy font-display tracking-tight leading-[1.12]">
                {t.heroTitle}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-txt-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.heroSubtitle}
              </p>

              {/* Primary Dual Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => onOpenAuth('register', 'DONOR')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-extrabold text-sm sm:text-base shadow-orange transition-all touch-target flex items-center justify-center gap-2"
                >
                  <Utensils className="w-5 h-5 stroke-[2.5]" />
                  <span>List Surplus Food</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register', 'NGO')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-navy hover:bg-navy-dark text-white font-bold text-sm sm:text-base border border-navy-light shadow-md transition-all touch-target flex items-center justify-center gap-2"
                >
                  <Building2 className="w-5 h-5 text-orange-400" />
                  <span>Register as NGO Shelter</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register', 'VOLUNTEER')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-border hover:bg-white text-txt-primary font-bold text-sm transition-colors touch-target flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Volunteer Courier</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-txt-secondary">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>FSSAI Compliant Audits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>Cryptographic QR Handshake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span>100% Free for Charities</span>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Visual Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Showcase Card */}
                <div className="fb-card p-6 shadow-xl border-border bg-white relative space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center font-bold">
                        🍱
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Live Rescue Match</span>
                        <h4 className="text-sm font-extrabold text-navy">Taj Palace Banquet Kitchen</h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-status-success" />
                      <span>96% Fresh</span>
                    </span>
                  </div>

                  {/* Food Item Snapshot */}
                  <div className="p-3.5 rounded-xl bg-surface-subtle border border-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-txt-primary">Fresh Paneer Butter Masala & 200 Rotis</span>
                      <span className="font-extrabold text-primary">150 Servings</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-txt-secondary">
                      <span>Temp: <strong>Heated Cambros (&gt;65°C)</strong></span>
                      <span>Safe Shelf Life: <strong>4.8 Hours</strong></span>
                    </div>
                  </div>

                  {/* Smart Split Badge */}
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex items-center justify-between text-blue-900">
                    <div className="flex items-center gap-2">
                      <Split className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">Smart Proximity Split</span>
                        <span className="text-[10px] text-blue-800">Assigned across Akshaya Patra & Robin Hood Army</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-extrabold">
                      ETA 18m
                    </span>
                  </div>

                  {/* QR Handshake Simulation Snippet */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center font-mono text-[10px]">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-txt-primary block">QR Handshake #HS-77A9</span>
                        <span className="text-[10px] text-txt-muted">OTP: 582-901</span>
                      </div>
                    </div>
                    <span className="text-status-success font-extrabold text-xs">
                      🌱 +375 kg CO₂ saved
                    </span>
                  </div>

                </div>

                {/* Floating Stats Pill */}
                <div className="absolute -bottom-6 -left-4 sm:-left-6 p-3.5 rounded-2xl bg-navy text-white border border-navy-light shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-orange-200">Average Match Time</div>
                    <div className="text-base font-extrabold text-white">12.4 Minutes</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. IMPACT NUMBERS STRIP */}
      <section id="impact" className="py-12 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, idx) => (
              <div key={idx} className="p-4 sm:p-6 rounded-2xl bg-surface-subtle border border-border flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-white border border-border flex items-center justify-center flex-shrink-0 shadow-sm ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-navy font-display">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-bold text-txt-primary mt-0.5">{stat.label}</div>
                  <div className="text-[11px] text-txt-secondary mt-0.5">{stat.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-surface-bg border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-orange-100 px-3 py-1 rounded-full">
              Operation Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-navy font-display mt-3">
              How FoodBridge Works in 3 Clear Steps
            </h2>
            <p className="text-sm text-txt-secondary mt-2">
              From commercial banquet kitchen to verified community plate in under 45 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="fb-card p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white font-extrabold text-lg flex items-center justify-center shadow-orange">
                1
              </div>
              <h3 className="text-lg font-bold text-navy">{t.step1Title}</h3>
              <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
                {t.step1Desc}
              </p>
              <div className="pt-2 text-[11px] font-bold text-primary flex items-center gap-1">
                <span>✓ Takes under 30 seconds</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="fb-card p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-navy">{t.step2Title}</h3>
              <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
                {t.step2Desc}
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-600 flex items-center gap-1">
                <span>✓ Prevents localized oversupply</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="fb-card p-6 sm:p-8 space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-navy">{t.step3Title}</h3>
              <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
                {t.step3Desc}
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>✓ Tamper-evident ledger record</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. AI FRESHNESS & FOOD SAFETY SECTION */}
      <section id="safety" className="py-16 sm:py-24 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Safety First
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-navy font-display">
                {t.aiFreshnessTitle}
              </h2>
              <p className="text-sm sm:text-base text-txt-secondary leading-relaxed">
                {t.aiFreshnessExplainer}
              </p>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle border border-border">
                  <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-txt-primary block">Thermal Decay Formulas</strong>
                    <span className="text-txt-secondary text-xs">Evaluates elapsed time against Category A (Ambient) vs Category B (Cold Chain) holding thresholds.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle border border-border">
                  <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-txt-primary block">Automated Allergen Flagging</strong>
                    <span className="text-txt-secondary text-xs">Detects dairy, gluten, nuts, and eggs to prevent adverse allergic reactions at recipient shelters.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-subtle border border-border">
                  <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-txt-primary block">SHA-256 Tamper-Proof Hash</strong>
                    <span className="text-txt-secondary text-xs">Creates an immutable cryptographic hash certifying the initial freshness declaration.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Graphic */}
            <div className="fb-card-navy p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-navy-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-white text-sm">Gemini AI Safety Scorecard</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  PASSED (94.5%)
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-txt-muted">
                  <span>Dish: Dal Makhani & Jeera Rice</span>
                  <span className="text-white font-bold">180 Servings</span>
                </div>
                <div className="flex justify-between items-center text-txt-muted">
                  <span>Holding Temperature: Heated (&gt;65°C)</span>
                  <span className="text-emerald-400 font-bold">Optimal Safe State</span>
                </div>
                <div className="flex justify-between items-center text-txt-muted">
                  <span>Detected Allergens</span>
                  <span className="text-amber-400 font-bold">Dairy, Gluten</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-card border border-navy-border text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">AI Recommendation:</span>
                "Food is within safe thermal window. Priority dispatch to nearby shelter within 4 hours recommended."
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. PARTNER LOGOS */}
      <section className="py-12 bg-surface-bg border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-center block text-xs font-bold uppercase tracking-wider text-txt-muted mb-8">
            Trusted By Premier Food Donors & Verified Shelters Across Delhi NCR
          </span>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {partners.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-border text-center shadow-sm">
                <span className="font-extrabold text-xs text-navy block">{p.name}</span>
                <span className="text-[10px] text-txt-muted block mt-0.5">{p.type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PRICING TEASER SECTION */}
      <section id="pricing" className="py-16 sm:py-24 bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-orange-100 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy font-display mt-3">
            Core Food Donation is Always 100% Free
          </h2>
          <p className="text-sm text-txt-secondary max-w-2xl mx-auto mt-2">
            Non-profits, shelters, and volunteers pay nothing forever. Commercial enterprises pay for advanced automation, multi-branch POS integrations, and ESG compliance.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onNavigateToPricing}
              className="px-6 py-3 rounded-xl bg-navy hover:bg-navy-dark text-white font-bold text-sm shadow-md transition-all touch-target flex items-center gap-2"
            >
              <span>Explore All 4 Subscription Tiers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-navy-dark text-white pt-12 pb-8 border-t border-navy-card">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-navy-card text-xs">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-lg font-extrabold text-white font-display">FoodBridge</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                National food waste redistribution infrastructure powered by AI inspection, proximity matching, and cryptographic verification handshakes.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-white block">Platform</span>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#safety" className="hover:text-white transition-colors">AI Safety Screening</a></li>
                <li><a href="#impact" className="hover:text-white transition-colors">Live Impact Stats</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">SaaS Subscriptions</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-white block">Legal & Compliance</span>
              <ul className="space-y-1.5 text-slate-400">
                <li>FSSAI License #10014011001890</li>
                <li>Section 80G Certified Redistribution</li>
                <li>ESG Scope 3 Emissions Ledger</li>
                <li>Privacy Policy & Terms</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-bold text-white block">Emergency Dispatch</span>
              <p className="text-slate-400 leading-relaxed">
                24/7 Food Rescue Helpline: <br />
                <strong className="text-orange-400 text-sm font-mono">+91 1800 200 4567</strong>
              </p>
              <span className="text-[11px] text-slate-500 block">Delhi NCR Regional Operational Hub</span>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © 2026 UNION FOOD BRIDGE. All rights reserved.
            </div>
            <div>
              Designed for National Impact • Built with FastAPI, React & Gemini AI
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
