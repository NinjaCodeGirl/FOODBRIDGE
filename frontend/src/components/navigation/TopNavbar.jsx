import React from 'react';
import { 
  Menu, 
  Bell, 
  HelpCircle, 
  PlusCircle, 
  Utensils, 
  ShieldCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function TopNavbar({
  role = 'DONOR',
  setRole,
  onToggleDrawer,
  onOpenNotifications,
  unreadCount = 2,
  onOpenOnboarding,
  onPostFood,
  currentPlan = 'FOOD_PARTNER_PRO',
  onNavigateToSubscription,
  onNavigateToPricing,
  className = ''
}) {
  return (
    <header className={`sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-border pt-safe ${className}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile hamburger & Logo on mobile/tablet */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDrawer}
              className="lg:hidden p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-gray-100 transition-colors touch-target"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile / Tablet Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-txt-primary">
                Food<span className="text-primary">Bridge</span>
              </span>
            </div>
          </div>

          {/* Right: Actions, Role Selector & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Subscription Tier Badge for Donors */}
            {role === 'DONOR' && (
              <button
                onClick={onNavigateToSubscription || onNavigateToPricing}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-primary-light/60 hover:bg-primary-light border border-primary/20 text-primary text-[11px] font-extrabold transition-colors"
                title="Manage B2B SaaS Subscription"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span>{currentPlan === 'BUSINESS_PLUS' ? 'BUSINESS PLUS' : currentPlan === 'COMMUNITY_FREE' ? 'FREE TIER' : 'PRO PARTNER'}</span>
              </button>
            )}

            {/* Quick "+ Post Surplus Food" CTA on desktop for donors */}
            {role === 'DONOR' && onPostFood && (
              <button
                onClick={onPostFood}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm touch-target"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Post Food</span>
              </button>
            )}

            {/* How It Works Guide */}
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-gray-50 text-txt-secondary text-xs font-semibold transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>How It Works</span>
              </button>
            )}

            {/* Role Switcher Dropdown */}
            <div className="relative inline-block">
              <label htmlFor="role-select" className="sr-only">Switch active role</label>
              <div className="flex items-center bg-surface-subtle border border-border rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-transparent text-xs font-bold text-txt-primary pr-6 focus:outline-none cursor-pointer appearance-none"
                  aria-label="Select platform role"
                >
                  <option value="DONOR">🍽️ Donor (Commercial)</option>
                  <option value="NGO">🤝 NGO / Shelter</option>
                  <option value="VOLUNTEER">🚴 Volunteer Courier</option>
                  <option value="ADMIN">📊 Platform Admin</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-txt-muted absolute right-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-txt-secondary hover:text-txt-primary hover:bg-gray-100 transition-colors touch-target"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-danger ring-2 ring-white" />
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
