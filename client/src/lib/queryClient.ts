import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options?: RequestInit,
): Promise<Response> {
  try {
    // Gérer les erreurs de réseau
    let res;
    try {
      res = await fetch(url, {
        method,
        body: data ? JSON.stringify(data) : undefined,
        ...options,
        headers: {
          "Content-Type": "application/json",
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
      return res;
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
