import React from 'react';
import { OrderStatusStage } from '../../types/order';
import { ORDER_STAGES } from '../../utils/constants';

interface StatusChipProps {
  stage: OrderStatusStage;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ stage, className = '' }) => {
  const meta = ORDER_STAGES[stage];

  const getStyle = (s: OrderStatusStage) => {
    switch (s) {
      case 1:
        return 'bg-rose-50 text-burgundy-wine border-rose-200';
      case 2:
      case 7:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 3:
      case 4:
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 5:
        return 'bg-burgundy-wine text-white border-transparent';
      case 6:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 8:
      default:
        return 'bg-surface-subtle text-text-muted border-border-delicate';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-label-caps font-semibold border ${getStyle(
        stage
      )} ${className}`}
    >
      <span className="material-symbols-outlined text-[13px]">{meta.icon}</span>
      <span>{meta.name}</span>
    </span>
  );
};
