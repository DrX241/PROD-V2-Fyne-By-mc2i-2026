import React, { useState, useEffect } from 'react';
import { Zap, ChevronDown, Lock, CheckCircle2, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MODULE_META: Record<string, { label: string; color: string }> = {
  cyber:          { label: 'I AM CYBER',         color: 'bg-indigo-500' },
  data:           { label: 'I AM DATA & IA',       color: 'bg-purple-500' },
  amoa:           { label: 'I AM mc2i',            color: 'bg-emerald-500' },
  'formation-data':{ label: 'FORMATION DATA',      color: 'bg-[#006a9e]' },
  evaluation:     { label: 'SI CHAMPION',          color: 'bg-amber-500' },
  playground:     { label: 'GÉNÉRATEUR',           color: 'bg-rose-500' },
};

const ALL_MODULE_KEYS = Object.keys(MODULE_META);

const PLAN_COLORS: Record<string, string> = {
  Gratuit:    'bg-gray-100 text-gray-600 border-gray-200',
  Starter:    'bg-blue-50 text-blue-600 border-blue-200',
  Pro:        'bg-indigo-50 text-indigo-600 border-indigo-200',
  Enterprise: 'bg-amber-50 text-amber-600 border-amber-200',
  Illimité:   'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export const UserSubscriptionBadge: React.FC = () => {
  const { user, refreshTokenUsage } = useAuth();
  const [open, setOpen] = useState(false);

  // Rafraîchit la consommation en arrière-plan toutes les 60s, et toutes les 15s quand le panel est ouvert
  useEffect(() => {
    const id = setInterval(refreshTokenUsage, open ? 15_000 : 60_000);
    return () => clearInterval(id);
  }, [open, refreshTokenUsage]);

  if (!user) return null;

  const plan = user.subscriptionLabel ?? 'Gratuit';
  const quota = user.tokenQuota ?? 100000;
  const used = user.tokenUsedMonth ?? 0;
  const enabledModules: string[] = user.modulesEnabled ?? ALL_MODULE_KEYS;
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';
  const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
  const planStyle = PLAN_COLORS[plan] ?? PLAN_COLORS['Gratuit'];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all hover:shadow-sm ${planStyle}`}
      >
        <Package className="h-3.5 w-3.5" />
        {plan}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 font-medium">Abonnement</div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${planStyle}`}>
                  <Package className="h-3 w-3" />
                  {plan}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Tokens ce mois</div>
                <div className="text-sm font-bold text-gray-800">
                  {used.toLocaleString()}
                  <span className="text-xs font-normal text-gray-400"> / {quota === 0 ? '∞' : quota.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Token bar */}
            {quota > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-[#006a9e]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct > 85 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                    <Zap className="h-3 w-3" /> Quota presque atteint
                  </div>
                )}
              </div>
            )}

            {/* Modules */}
            <div className="text-xs text-gray-500 font-medium mb-2">Modules</div>
            <div className="space-y-1.5">
              {ALL_MODULE_KEYS.map(key => {
                const meta = MODULE_META[key];
                const active = isAdmin || enabledModules.includes(key);
                return (
                  <div key={key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${active ? 'bg-gray-50 text-gray-700' : 'text-gray-300'}`}>
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? meta.color : 'bg-gray-200'}`} />
                    <span className="flex-1">{meta.label}</span>
                    {active
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      : <Lock className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    }
                  </div>
                );
              })}
            </div>

            {!isAdmin && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">Contactez votre administrateur pour modifier votre abonnement.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
