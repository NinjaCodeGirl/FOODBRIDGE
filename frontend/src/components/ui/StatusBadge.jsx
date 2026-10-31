import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  AlertOctagon, 
  XCircle, 
  FileEdit, 
  Radio, 
  Search, 
  HelpCircle 
} from 'lucide-react';

export const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: FileEdit,
  },
  POSTED: {
    label: 'Posted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Radio,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Search,
  },
  MATCHED: {
    label: 'Matched',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  PICKUP_ASSIGNED: {
    label: 'Pickup Assigned',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Truck,
  },
  COLLECTED: {
    label: 'Collected',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: PackageCheck,
  },
  DELIVERED: {
    label: 'Delivered',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    icon: CheckCircle2,
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: AlertOctagon,
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
  // Backward compatibility alias
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: Radio,
  }
};

export default function StatusBadge({ status = 'POSTED', size = 'md', className = '' }) {
  const normalizedKey = String(status).toUpperCase().replace(/[\s-]/g, '_');
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: HelpCircle,
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${className}`}
      aria-label={`Status: ${config.label}`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
