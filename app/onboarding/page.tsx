"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const [dob, setDob] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dob, consent }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Unable to save onboarding details.");
      setLoading(false);
      return;
    }

    router.push("/demo");
  };

  return (
    <div className="min-h-screen bg-muted/40 px-6 py-16">
      <Card className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Parent onboarding
          </p>
          <h1 className="font-display text-3xl">Confirm age & consent</h1>
          <p className="text-sm text-muted-foreground">
            We use this information to meet COPPA requirements and secure your
            child&apos;s learning data.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Parent date of birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(event) => setDob(event.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(value) => setConsent(Boolean(value))}
            />
            <Label htmlFor="consent" className="text-sm text-muted-foreground">
              I consent to Ozzie collecting learning progress data for my child.
            </Label>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button onClick={handleSubmit} disabled={!dob || !consent || loading}>
          {loading ? "Saving..." : "Continue to demo"}
        </Button>
      </Card>
    </div>
  );
}
