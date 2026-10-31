import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Clock, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  ExternalLink, 
  X,
  Share2
} from 'lucide-react';
import { createWhatsAppLink } from '../../utils/whatsapp';

export default function NotificationDropdown({
  isOpen,
  onClose,
  role = 'RESTAURANT',
  onNotificationClick
}) {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Surplus Food Request',
      message: 'Akshaya Patra Foundation requested 60 portions of Cooked Meals.',
      event_type: 'FOOD_REQUEST_RECEIVED',
      timestamp: '5 mins ago',
      is_read: false,
      action_url: '/deliveries/deliv-401',
      priority: 'HIGH'
    },
    {
      id: 'notif-2',
      title: 'Volunteer Courier Assigned',
      message: 'Arjun Sharma (Van DL-3C-9821) accepted pickup mission. ETA: 18 mins.',
      event_type: 'VOLUNTEER_APPROACHING',
      timestamp: '12 mins ago',
      is_read: false,
      action_url: '/deliveries/deliv-401',
      priority: 'NORMAL'
    },
    {
      id: 'notif-3',
      title: 'Beneficiary Distribution Audited',
      message: '120 portions distributed to 110 beneficiaries with independent witness signature.',
      event_type: 'DISTRIBUTION_COMPLETED',
      timestamp: '2 hours ago',
      is_read: true,
      action_url: '/audit',
      priority: 'NORMAL'
    }
  ]);

  // Fetch live notifications from backend
  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/notifications?role=${role}&limit=10`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length > 0) {
          setNotifications(data.map(n => ({
            ...n,
            timestamp: new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })));
        }
      })
      .catch(() => {});
  }, [isOpen, role]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    fetch(`/api/notifications/mark-all-read?role=${role}`, { method: 'POST' }).catch(() => {});
  };

  const handleItemClick = (n) => {
    // mark item read
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
    fetch(`/api/notifications/mark-read/${n.id}`, { method: 'POST' }).catch(() => {});
    if (onNotificationClick) onNotificationClick(n);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-border py-3 z-50 animate-fadeIn text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-extrabold text-navy text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-primary font-bold text-[10px]">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-txt-muted hover:text-navy hover:bg-surface-subtle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-txt-muted">
            <Bell className="w-8 h-8 text-txt-muted/50 mx-auto mb-2" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 hover:bg-surface-subtle transition-colors cursor-pointer flex items-start gap-3 ${
                !n.is_read ? 'bg-orange-50/40' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                n.event_type.includes('DELAY')
                  ? 'bg-amber-100 text-status-warning'
                  : n.event_type.includes('COMPLETED') || n.event_type.includes('DELIVERED')
                  ? 'bg-emerald-100 text-status-success'
                  : 'bg-orange-100 text-primary'
              }`}>
                {n.event_type.includes('DELAY') ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : n.event_type.includes('COMPLETED') || n.event_type.includes('DELIVERED') ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : n.event_type.includes('VOLUNTEER') ? (
                  <Truck className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className={`text-xs truncate ${!n.is_read ? 'font-extrabold text-navy' : 'font-semibold text-txt-primary'}`}>
                    {n.title}
                  </h5>
                  <span className="text-[10px] text-txt-muted flex-shrink-0 ml-1">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-txt-secondary line-clamp-2 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pt-2.5 border-t border-border flex items-center justify-between text-[11px] text-txt-muted">
        <span>⚡ Real-time WebSocket & WhatsApp sync</span>
      </div>

    </div>
  );
}

