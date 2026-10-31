import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Truck, 
  User, 
  Search, 
  BookmarkCheck, 
  MapPin, 
  History 
} from 'lucide-react';

export default function MobileBottomNav({
  role = 'DONOR',
  activeTab,
  setActiveTab,
  className = ''
}) {
  const getTabs = () => {
    switch (role) {
      case 'DONOR':
        return [
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'donations', label: 'Donations', icon: Package },
          { id: 'post', label: 'Post', icon: Plus, isAction: true },
          { id: 'pickups', label: 'Pickups', icon: Truck },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'NGO':
        return [
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'find-food', label: 'Find Food', icon: Search, isAction: true },
          { id: 'claims', label: 'Claims', icon: BookmarkCheck },
          { id: 'pickups', label: 'Pickups', icon: Truck },
          { id: 'settings', label: 'Profile', icon: User },
        ];
      case 'VOLUNTEER':
        return [
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'pickups', label: 'Pickups', icon: Truck, isAction: true },
          { id: 'map', label: 'Route', icon: MapPin },
          { id: 'history', label: 'History', icon: History },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      default:
        return [
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'donations', label: 'Surplus', icon: Package },
          { id: 'pickups', label: 'Pickups', icon: Truck, isAction: true },
          { id: 'impact', label: 'Impact', icon: LayoutDashboard },
          { id: 'settings', label: 'Settings', icon: User },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <nav
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border pb-safe select-none shadow-lg ${className}`}
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isAction) {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group touch-target focus:outline-none"
                aria-label={tab.label}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-active:scale-95 ${
                  isActive ? 'bg-primary-dark text-white ring-4 ring-primary-light' : 'bg-primary text-white'
                }`}>
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[11px] font-bold text-primary mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 flex-1 touch-target transition-colors ${
                isActive ? 'text-primary' : 'text-txt-secondary hover:text-txt-primary'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
