export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
  
    if (!res.ok) {
      // Attempt to parse error response
      let errorBody: unknown;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = { message: res.statusText };
      }
  
      // Ensure the error is an Error object
      const error = new Error(
        (errorBody as { message?: string })?.message || "Something went wrong"
      );
      throw error;
    }
  
    return res.json();
  }
  