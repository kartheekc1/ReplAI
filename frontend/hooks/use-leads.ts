"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useLeads(params?: { q?: string; keyword?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.keyword) qs.set("keyword", params.keyword);

  return useQuery({
    queryKey: ["leads", params],
    queryFn: () =>
      apiClient.get<{ data: unknown[]; total: number }>(
        `/leads${qs.toString() ? `?${qs}` : ""}`
      ),
  });
}
