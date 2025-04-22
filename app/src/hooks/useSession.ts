// hooks/useSession.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export const useSession = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      fetch("/api/refresh-token", {
        method: "POST",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setAccessToken(data.accessToken);
        })
        .catch(() => {
          setAccessToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  return {
    data: accessToken ? { accessToken } : null,
    loading,
  };
};
