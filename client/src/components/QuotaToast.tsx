import React, { useState, useEffect } from 'react';
import { Zap, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QuotaDetail {
  message: string;
  tokenUsedMonth: number;
  tokenQuota: number;
}

export const QuotaToast: React.FC = () => {
  const [detail, setDetail] = useState<QuotaDetail | null>(null);
  const { refreshTokenUsage } = useAuth();

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<QuotaDetail>).detail;
      setDetail(d);
      // Rafraîchit le badge de consommation
      refreshTokenUsage();
    };
    window.addEventListener('quota-exceeded', handler);
    return () => window.removeEventListener('quota-exceeded', handler);
  }, [refreshTokenUsage]);

  if (!detail) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full">
      <div className="bg-white border border-red-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 bg-red-100 rounded-xl p-2 mt-0.5">
          <Zap className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Quota de tokens épuisé</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {detail.tokenUsedMonth.toLocaleString()} / {detail.tokenQuota.toLocaleString()} tokens utilisés ce mois.
            Contactez votre administrateur pour augmenter votre quota.
          </p>
        </div>
        <button
          onClick={() => setDetail(null)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
