import { createHash } from 'crypto';
import { db } from '../db';
import { llmCache } from '@shared/schema';
import { eq } from 'drizzle-orm';

const memoryCache = new Map<string, { response: string; expiresAt: number | null }>();

function hashKey(prompt: string, domain: string): string {
  return createHash('sha256').update(`${domain}:${prompt}`).digest('hex').slice(0, 64);
}

export async function getCached(prompt: string, domain: string): Promise<string | null> {
  const key = hashKey(prompt, domain);
  const now = Date.now();

  const mem = memoryCache.get(key);
  if (mem && (!mem.expiresAt || mem.expiresAt > now)) {
    return mem.response;
  }

  try {
    const rows = await db.select().from(llmCache).where(eq(llmCache.cacheKey, key)).limit(1);
    if (rows.length > 0) {
      const row = rows[0];
      if (!row.expiresAt || row.expiresAt.getTime() > now) {
        memoryCache.set(key, { response: row.response, expiresAt: row.expiresAt?.getTime() ?? null });
        db.update(llmCache)
          .set({ hits: row.hits + 1, updatedAt: new Date() })
          .where(eq(llmCache.cacheKey, key))
          .catch(() => {});
        return row.response;
      }
    }
  } catch (e) {
    console.warn('[dbCache] Erreur lecture cache:', e);
  }

  return null;
}

export async function setCached(
  prompt: string,
  domain: string,
  response: string,
  ttlDays?: number
): Promise<void> {
  const key = hashKey(prompt, domain);
  const expiresAt = ttlDays ? new Date(Date.now() + ttlDays * 86400_000) : null;

  memoryCache.set(key, { response, expiresAt: expiresAt?.getTime() ?? null });

  try {
    await db.insert(llmCache).values({
      cacheKey: key,
      domain,
      prompt: prompt.slice(0, 5000),
      response,
      expiresAt,
    }).onConflictDoUpdate({
      target: llmCache.cacheKey,
      set: { response, updatedAt: new Date(), expiresAt },
    });
  } catch (e) {
    console.warn('[dbCache] Erreur écriture cache:', e);
  }
}
