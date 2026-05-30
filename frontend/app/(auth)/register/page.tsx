"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email to verify your account.");
    router.push("/login");
  }

  async function onGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="grid w-full max-w-[920px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
      <div>
        <span className="eyebrow"><span className="dot" /> Free 14-day trial</span>
        <h1 className="display mt-5 text-[40px]">
          Start automating in <em>under 5 minutes</em>
        </h1>
        <p className="lead mt-4 max-w-[420px]">
          Join 10,000+ creators turning every Instagram comment into a customer. No credit card required.
        </p>
        <ul className="mt-7 flex flex-col gap-2.5 text-sm">
          {[
            "Free 14-day trial of every feature",
            "Cancel anytime, no questions asked",
            "Setup support if you get stuck",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/10 text-brand">
                <Check size={12} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="card-rv p-8">
        <Button onClick={onGoogle} variant="ghost" className="w-full" size="lg">
          <GoogleIcon /> Continue with Google
        </Button>
        <div className="my-6 flex items-center gap-3 text-[12px] text-subtle">
          <div className="h-px flex-1 bg-line" />
          OR SIGN UP WITH EMAIL
          <div className="h-px flex-1 bg-line" />
        </div>
        <form onSubmit={onSignUp} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? "Creating account..." : "Create account"} <ArrowRight size={16} />
          </Button>
          <p className="text-center text-[12.5px] text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.4 2.4-7.2 2.4-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
