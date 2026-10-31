import React from 'react';
import { 
  Utensils, 
  LayoutDashboard, 
  PlusCircle, 
  Package, 
  Truck, 
  BarChart3, 
  Bell, 
  Settings, 
  Search, 
  BookmarkCheck, 
  Layers, 
  ShieldCheck, 
  User, 
  History, 
  MapPin, 
  HelpCircle,
  LogOut,
  ChevronRight,
  CreditCard,
  FileText,
  TrendingUp,
  PieChart,
  Tag
} from 'lucide-react';

export default function Sidebar({
  role = 'DONOR', // 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN'
  activeTab,
  setActiveTab,
  unreadNotifications = 2,
  onOpenOnboarding,
  className = ''
}) {
  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case 'DONOR':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'donations', label: 'My Donations', icon: Package },
          { id: 'post', label: 'Post Food', icon: PlusCircle, isHighlight: true },
          { id: 'pickups', label: 'Pickups', icon: Truck },
          { id: 'compliance', label: 'Compliance & Audit', icon: ShieldCheck },
          { id: 'pricing', label: 'Plans & Pricing', icon: Tag },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'NGO':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'find-food', label: 'Find Food', icon: Search, isHighlight: true },
          { id: 'claims', label: 'My Claims', icon: BookmarkCheck },
          { id: 'pickups', label: 'Incoming Pickups', icon: Truck },
          { id: 'compliance', label: 'Safety & Audit', icon: ShieldCheck },
          { id: 'capacity', label: 'Capacity', icon: Layers },
          { id: 'pricing', label: 'Pricing (Free NGO)', icon: Tag },
          { id: 'impact', label: 'Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'VOLUNTEER':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'pickups', label: 'Available Pickups', icon: Truck, isHighlight: true },
          { id: 'my-pickups', label: 'My Pickups', icon: Package },
          { id: 'compliance', label: 'Audit Handshakes', icon: ShieldCheck },
          { id: 'history', label: 'History', icon: History },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'ADMIN':
      default:
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp, isHighlight: true },
          { id: 'unit-economics', label: 'Unit Economics', icon: PieChart },
          { id: 'compliance', label: 'Audit & Compliance', icon: ShieldCheck },
          { id: 'donations', label: 'All Surplus', icon: Package },
          { id: 'pickups', label: 'Allocations & Route', icon: Truck },
          { id: 'pricing', label: 'Plan Matrix', icon: Tag },
          { id: 'impact', label: 'System Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Audit Alerts', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  const roleLabels = {
    DONOR: 'Commercial Food Donor',
    NGO: 'Verified Recipient Shelter',
    VOLUNTEER: 'Certified Volunteer Courier',
    ADMIN: 'Platform Administrator'
  };

  return (
    <aside
      className={`w-64 bg-white border-r border-border h-screen sticky top-0 flex flex-col justify-between p-4 select-none z-30 ${className}`}
      aria-label="Main sidebar navigation"
    >
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-txt-primary">
                Food<span className="text-primary">Bridge</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-light text-primary border border-primary/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-txt-secondary leading-tight truncate">
              Surplus Redistribution
            </p>
          </div>
        </div>

        {/* Current Active Role Badge */}
        <div className="mt-3 mx-2 px-3 py-2 rounded-xl bg-surface-subtle border border-border/80">
          <div className="text-[10px] uppercase font-bold tracking-wider text-txt-muted">
            Workspace Role
          </div>
          <div className="text-xs font-bold text-primary truncate mt-0.5">
            {roleLabels[role]}
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="mt-5 space-y-1" aria-label="Role navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all touch-target ${
                  isActive
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : item.isHighlight
                    ? 'text-primary hover:bg-primary-light/40 font-bold'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-gray-50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.isHighlight ? 'text-primary' : 'text-txt-muted'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-primary' : 'bg-status-warning/20 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Quick Guide Footer */}
      <div className="space-y-2 pt-4 border-t border-border">
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-txt-secondary hover:text-txt-primary hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>How It Works Guide</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-txt-muted" />
          </button>
        )}

        {/* User Snapshot Card */}
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {role.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-txt-primary truncate">
              {role === 'DONOR' ? 'Taj Palace Kitchen' : role === 'NGO' ? 'Akshaya Patra Lead' : role === 'VOLUNTEER' ? 'Arjun Sharma' : 'Platform Lead'}
            </p>
            <p className="text-[10px] text-txt-secondary truncate">
              {role === 'DONOR' ? 'Verified Commercial Donor' : role === 'NGO' ? 'Verified Shelter' : 'Active Volunteer'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
