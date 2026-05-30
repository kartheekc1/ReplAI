"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

type AnalyticsResponse = {
  comments_count: number;
  dms_count: number;
  leads_count: number;
  conversion_rate: number;
  revenue: number;
  top_keywords: { label: string; value: number }[];
  top_posts: { name: string; leads: number }[];
};

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiClient.get<AnalyticsResponse>("/analytics"),
  });
}
