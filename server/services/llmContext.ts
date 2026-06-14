import { AsyncLocalStorage } from 'async_hooks';

export interface LlmRequestContext {
  userId: number;
  username: string;
  feature: string;
  session?: any; // Express session — optionnel, pour rafraîchir tokenUsedMonth
}

export const llmContextStore = new AsyncLocalStorage<LlmRequestContext>();

export function getLlmContext(): LlmRequestContext | undefined {
  return llmContextStore.getStore();
}

export function runWithLlmContext<T>(ctx: LlmRequestContext, fn: () => T): T {
  return llmContextStore.run(ctx, fn);
}
