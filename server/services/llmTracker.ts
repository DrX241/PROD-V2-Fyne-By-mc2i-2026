import { db } from '../db';
import { llmUsage, users } from '@shared/schema';
import { storage } from '../storage';
import { getLlmContext } from './llmContext';
import { eq } from 'drizzle-orm';

interface TrackParams {
  userId: number;
  username: string;
  model: string;
  feature: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  tokenUsedMonth: number;
  tokenQuota: number;
}

export async function checkTokenQuota(userId: number): Promise<QuotaCheckResult> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { allowed: true, tokenUsedMonth: 0, tokenQuota: 100000 };

    const quota: number = (user as any).tokenQuota ?? 100000;
    const used: number = (user as any).tokenUsedMonth ?? 0;

    // quota 0 = illimité (plan Illimité / admin)
    if (quota === 0) return { allowed: true, tokenUsedMonth: used, tokenQuota: 0 };

    return { allowed: used < quota, tokenUsedMonth: used, tokenQuota: quota };
  } catch (e) {
    console.warn('[llmTracker] Erreur vérification quota:', e);
    return { allowed: true, tokenUsedMonth: 0, tokenQuota: 100000 };
  }
}

export async function trackLlmUsage(params: TrackParams): Promise<void> {
  const total = params.totalTokens ?? (params.promptTokens ?? 0) + (params.completionTokens ?? 0);

  // Insérer dans llmUsage (non bloquant)
  try {
    await db.insert(llmUsage).values({
      userId: params.userId,
      username: params.username,
      model: params.model,
      feature: params.feature,
      promptTokens: params.promptTokens ?? 0,
      completionTokens: params.completionTokens ?? 0,
      totalTokens: total,
    });
  } catch (e) {
    console.warn('[llmTracker] Erreur enregistrement usage:', e);
  }

  // Incrémenter tokenUsedMonth et rafraîchir la session via AsyncLocalStorage
  try {
    const state = await storage.incrementTokenUsage(params.userId, total);
    const ctx = getLlmContext();
    if (ctx?.session?.user) {
      ctx.session.user.tokenUsedMonth = state.tokenUsedMonth;
    }
  } catch (e) {
    console.warn('[llmTracker] Erreur incrément quota:', e);
  }
}
