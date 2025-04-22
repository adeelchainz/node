import { useAuthStore } from "@/store/auth.store";

interface FetcherOptions extends RequestInit {
  withCredentials?: boolean;
}

export async function fetcher<T>(url: string, options?: FetcherOptions): Promise<T> {
  const { withCredentials, ...restOptions } = options ?? {};
  const token = useAuthStore.getState().accessToken;
    const res = await fetch(url, {
      ...restOptions,
      credentials: withCredentials ? "include" : "same-origin",
            ...options,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
  
    if (res.status === 401) {
      // try refreshing
      const refreshed = await fetch("/api/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (refreshed.ok) {
        const { accessToken } = await refreshed.json();
        useAuthStore.getState().setAccessToken(accessToken);
  
        // Retry original request with new token
        const retry = await fetch(url, {
          ...restOptions,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!retry.ok) throw new Error("Retry failed");
        return retry.json();
      } else {
        useAuthStore.getState().setAccessToken(null);
        throw new Error("Session expired");
      }
    }
  
    return res.json();
  }
  