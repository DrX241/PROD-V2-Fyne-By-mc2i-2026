import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';

interface Props {
  tokenQuota?: number;
  tokenUsedMonth?: number;
  className?: string;
}

export const QuotaExceededBanner: React.FC<Props> = ({ tokenQuota, tokenUsedMonth, className = '' }) => (
  <div className={`flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
    <div className="flex-shrink-0 mt-0.5">
      <Zap className="h-5 w-5 text-red-500" />
    </div>
    <div>
      <p className="text-sm font-semibold text-red-700">Quota de tokens épuisé</p>
      <p className="text-xs text-red-500 mt-0.5">
        Vous avez utilisé{' '}
        <span className="font-bold">{(tokenUsedMonth ?? 0).toLocaleString()}</span>
        {tokenQuota ? ` / ${tokenQuota.toLocaleString()} tokens` : ' tokens'} ce mois.
        Contactez votre administrateur pour augmenter votre quota.
      </p>
    </div>
  </div>
);

export function isQuotaExceededError(data: any): boolean {
  return data?.quotaExceeded === true || (typeof data?.message === 'string' && data.message.includes('quota'));
}
