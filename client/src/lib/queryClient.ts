import { QueryClient, QueryFunction } from "@tanstack/react-query";

export class QuotaExceededError extends Error {
  public readonly tokenUsedMonth: number;
  public readonly tokenQuota: number;
  constructor(message: string, tokenUsedMonth: number, tokenQuota: number) {
    super(message);
    this.name = 'QuotaExceededError';
    this.tokenUsedMonth = tokenUsedMonth;
    this.tokenQuota = tokenQuota;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Quota exceeded — parse structured JSON to give UI a rich error
    if (res.status === 429) {
      try {
        const data = await res.clone().json();
        if (data?.quotaExceeded) {
          throw new QuotaExceededError(data.message, data.tokenUsedMonth ?? 0, data.tokenQuota ?? 0);
        }
      } catch (e) {
        if (e instanceof QuotaExceededError) throw e;
      }
    }
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  try {
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
          ...options?.headers,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error(`Network error for ${url}:`, error);
      throw new Error(`Erreur réseau: Impossible de contacter le serveur.`);
    }

    try {
      await throwIfResNotOk(res);
      return await res.json();
    } catch (responseError) {
      console.error(`API response error for ${url}:`, responseError);
      throw responseError;
    }
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
