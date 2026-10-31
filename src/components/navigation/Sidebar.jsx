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
  CreditCard,
  FileText,
  TrendingUp,
  PieChart,
  Tag,
  HeartHandshake,
  Navigation,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  role = 'DONOR',
  activeTab,
  setActiveTab,
  unreadNotifications = 2,
  onOpenOnboarding,
  className = ''
}) {
  const { currentUser } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'DONOR':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'donations', label: 'My Food Listings', icon: Package },
          { id: 'post', label: '+ Post Surplus Food', icon: PlusCircle, isHighlight: true },
          { id: 'pickups', label: 'Live Pickups', icon: Truck },
          { id: 'compliance', label: 'FSSAI Compliance', icon: ShieldCheck },
          { id: 'pricing', label: 'Plans & Pricing', icon: Tag },
          { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
          { id: 'impact', label: 'Impact & Leaderboard', icon: BarChart3 },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Kitchen Settings', icon: Settings },
        ];
      case 'NGO':
        return [
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'find-food', label: 'Browse Surplus Food', icon: Search, isHighlight: true },
          { id: 'map', label: 'Nearby Food Map', icon: MapPin },
          { id: 'requests', label: 'My Claims & Requests', icon: BookmarkCheck },
          { id: 'pickups', label: 'Incoming Transit', icon: Truck },
          { id: 'distributions', label: 'Distribution Records', icon: HeartHandshake },
          { id: 'compliance', label: 'Safety & Audit', icon: ShieldCheck },
          { id: 'pricing', label: 'Pricing (Free NGO)', icon: Tag },
          { id: 'impact', label: 'Impact & Leaderboard', icon: BarChart3 },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Shelter Settings', icon: Settings },
        ];
      case 'VOLUNTEER':
        return [
          { id: 'overview', label: 'Courier Console', icon: LayoutDashboard },
          { id: 'pickups', label: 'Active Pickup', icon: Truck, isHighlight: true },
          { id: 'history', label: 'Delivery History', icon: History },
          { id: 'compliance', label: 'Audit Handshakes', icon: ShieldCheck },
          { id: 'impact', label: 'Impact Leaderboard', icon: BarChart3 },
          { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotifications },
          { id: 'profile', label: 'Courier Profile', icon: User },
        ];
      case 'ADMIN':
      default:
        return [
          { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
          { id: 'revenue', label: 'B2B SaaS Revenue', icon: TrendingUp, isHighlight: true },
          { id: 'unit-economics', label: 'Unit Economics', icon: PieChart },
          { id: 'compliance', label: 'FSSAI Regulatory Ledger', icon: ShieldCheck },
          { id: 'donations', label: 'All Surplus Flow', icon: Package },
          { id: 'pickups', label: 'Dispatch Matrix', icon: Truck },
          { id: 'pricing', label: 'Plan Matrix', icon: Tag },
          { id: 'impact', label: 'Audited Impact', icon: BarChart3 },
          { id: 'notifications', label: 'Fraud & Safety Alerts', icon: Bell, badge: unreadNotifications },
          { id: 'settings', label: 'Governance Settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems();

  const roleLabels = {
    DONOR: 'Commercial Food Donor',
    NGO: 'Verified Recipient Shelter',
    VOLUNTEER: 'Certified Courier',
    ADMIN: 'Platform Governance'
  };

  return (
    <aside className={`w-64 bg-white border-r border-border min-h-[calc(100vh-5rem)] flex flex-col justify-between p-4 sticky top-20 ${className}`}>
      
      {/* Top Section */}
      <div className="space-y-6">
        
        {/* Active Role Card */}
        <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-txt-muted block">
            Active Workspace
          </span>
          <span className="font-extrabold text-xs text-navy block mt-0.5 truncate">
            {currentUser?.organizationName || roleLabels[role]}
          </span>
          <span className="text-[11px] text-primary font-bold">
            {roleLabels[role]}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all touch-target ${
                  isActive
                    ? 'bg-primary text-white shadow-orange font-extrabold'
                    : item.isHighlight
                    ? 'bg-orange-50 text-primary border border-orange-200 hover:bg-orange-100'
                    : 'text-txt-secondary hover:text-navy hover:bg-surface-subtle'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.isHighlight ? 'text-primary' : 'text-txt-muted'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-primary' : 'bg-orange-100 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Help & Documentation Box */}
      <div className="pt-4 border-t border-border space-y-2 text-xs">
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-txt-secondary hover:text-navy hover:bg-surface-subtle font-semibold transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>How FoodBridge Works</span>
          </button>
        )}
        <div className="px-3 text-[11px] text-txt-muted">
          FoodBridge OS v2.0 • FSSAI Audit Ledger
        </div>
      </div>

    </aside>
  );
}
