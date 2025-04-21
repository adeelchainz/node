/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

type Method = "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiMutationConfig<TData, TVariables> {
  url: string | ((variables: TVariables) => string);
  method?: Method;
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables, unknown>,
    "mutationFn"
  >;
}

export function useApiMutation<TData = unknown, TVariables = unknown>({
  url,
  method = "POST",
  options,
}: ApiMutationConfig<TData, TVariables>) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const URL = typeof url === "function" ? url(variables) : url;
      return fetcher<TData>(URL, {
        method,
        body: JSON.stringify(variables),
      });
    },
    ...options,
  });
}

type QueryKeyType = [string, Record<string, any>?];

export function useApiQuery<T>(
  endpoint: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error, T, QueryKeyType>, "queryKey" | "queryFn">
) {
  const queryKey: QueryKeyType = [endpoint, params];

  const queryFn = () => {
    const search = params ? `?${new URLSearchParams(params).toString()}` : "";
    return fetcher<T>(`${endpoint}${search}`);
  };

  return useQuery<T, Error, T, QueryKeyType>({
    queryKey,
    queryFn,
    ...(options ?? {}),
  });
}
