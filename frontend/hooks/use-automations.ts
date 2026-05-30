"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

type AutomationIn = {
  account_id: string;
  name: string;
  trigger_type?: "comment" | "story_reply" | "dm";
  post_id?: string | null;
  keywords: string[];
  message: string;
  cta_label?: string | null;
  cta_url?: string | null;
  require_follow?: boolean;
  reply_publicly?: boolean;
  status?: "active" | "paused" | "draft";
};

export function useAutomations() {
  return useQuery({
    queryKey: ["automations"],
    queryFn: () => apiClient.get<unknown[]>("/automations"),
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AutomationIn) => apiClient.post("/automations", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "paused" }) =>
      apiClient.post(`/automations/${id}/${status === "active" ? "resume" : "pause"}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/automations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
}
