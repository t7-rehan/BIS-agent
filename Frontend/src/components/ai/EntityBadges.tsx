import React from 'react';
import { Tag, CheckCircle2, Shield, MapPin, Hash, Package } from 'lucide-react';

interface EntityBadgesProps {
  entities?: Record<string, any>;
}

export const EntityBadges: React.FC<EntityBadgesProps> = ({ entities }) => {
  if (!entities || Object.keys(entities).length === 0) {
    return null;
  }

  const items: { label: string; value: string; icon: React.ReactNode }[] = [];

  if (entities.product_name) {
    items.push({
      label: 'Product',
      value: String(entities.product_name),
      icon: <Package className="w-3 h-3 text-blue-600" />,
    });
  }

  if (entities.is_number) {
    items.push({
      label: 'Standard',
      value: String(entities.is_number),
      icon: <Hash className="w-3 h-3 text-indigo-600" />,
    });
  }

  if (entities.qco_name) {
    items.push({
      label: 'QCO',
      value: String(entities.qco_name),
      icon: <Shield className="w-3 h-3 text-amber-600" />,
    });
  }

  if (entities.state) {
    items.push({
      label: 'State/Region',
      value: String(entities.state),
      icon: <MapPin className="w-3 h-3 text-emerald-600" />,
    });
  }

  if (entities.huid) {
    items.push({
      label: 'HUID',
      value: String(entities.huid),
      icon: <CheckCircle2 className="w-3 h-3 text-purple-600" />,
    });
  }

  if (entities.scheme_name || entities.certification_type) {
    items.push({
      label: 'Scheme',
      value: String(entities.scheme_name || entities.certification_type),
      icon: <Tag className="w-3 h-3 text-rose-600" />,
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-100/90 text-slate-800 rounded-lg border border-slate-200 shadow-2xs"
        >
          {item.icon}
          <span className="text-slate-500 font-semibold">{item.label}:</span>
          <span className="font-bold text-slate-900">{item.value}</span>
        </span>
      ))}
    </div>
  );
};
