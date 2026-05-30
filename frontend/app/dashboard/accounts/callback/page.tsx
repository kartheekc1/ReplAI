"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiClient, ApiError } from "@/lib/api";

type Phase =
  | { kind: "exchanging" }
  | { kind: "success"; username: string }
  | { kind: "error"; message: string };

export default function InstagramCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>({ kind: "exchanging" });

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDesc = params.get("error_description");

    if (error) {
      setPhase({ kind: "error", message: errorDesc ?? error });
      return;
    }

    if (!code) {
      setPhase({ kind: "error", message: "Instagram did not return an authorization code." });
      return;
    }

    // CSRF check — the state we stored before redirect must match what came back
    const expected = sessionStorage.getItem("ig_oauth_state");
    if (expected && state && expected !== state) {
      setPhase({ kind: "error", message: "Security check failed. Please try connecting again." });
      return;
    }
    sessionStorage.removeItem("ig_oauth_state");

    // Hand the code off to FastAPI — it exchanges + persists the account
    apiClient
      .post<{ username: string }>("/instagram/callback", { code })
      .then((acct) => {
        setPhase({ kind: "success", username: acct.username });
        setTimeout(() => router.replace("/dashboard/accounts"), 1500);
      })
      .catch((e) => {
        const msg =
          e instanceof ApiError
            ? `${e.status}: ${e.message}`
            : "Could not complete the connection.";
        setPhase({ kind: "error", message: msg });
      });
  }, [params, router]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="w-full max-w-md p-8 text-center">
        {phase.kind === "exchanging" && (
          <>
            <Loader2 size={36} className="mx-auto animate-spin text-brand" />
            <h1 className="mt-4 text-lg font-semibold">Finishing connection…</h1>
            <p className="mt-1 text-sm text-muted">
              Exchanging your Instagram authorization with ReplAI.
            </p>
          </>
        )}
        {phase.kind === "success" && (
          <>
            <CheckCircle2 size={40} className="mx-auto text-success" />
            <h1 className="mt-4 text-lg font-semibold">Connected!</h1>
            <p className="mt-1 text-sm text-muted">
              @{phase.username} is now linked. Taking you back…
            </p>
          </>
        )}
        {phase.kind === "error" && (
          <>
            <AlertTriangle size={40} className="mx-auto text-warning" />
            <h1 className="mt-4 text-lg font-semibold">Connection failed</h1>
            <p className="mt-1 text-sm text-muted">{phase.message}</p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="ghost" onClick={() => router.push("/dashboard/accounts")}>
                Back to accounts
              </Button>
              <Button variant="primary" onClick={() => router.push("/dashboard/accounts")}>
                Try again
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
