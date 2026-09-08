"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useDemoRole } from "@/components/role-provider";
import { seededDemoIdentities } from "@/lib/demo-identities";
import { humanize } from "@/lib/format";
import type { PersonSummary } from "@/lib/job-types";

export function RoleSwitcher() {
  const { identity, setIdentity } = useDemoRole();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function requestIdentity(identityId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/demo-identity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identityId }),
        });
        const result: { identity?: PersonSummary; error?: string } = await response.json();

        if (!response.ok || !result.identity) {
          throw new Error(result.error ?? "Could not change the demo identity.");
        }

        setIdentity(result.identity);
        router.refresh();
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not change the demo identity.",
        );
      }
    });
  }

  return (
    <div className="role-switcher">
      <div className="role-avatar" aria-hidden="true">
        {identity.name
          .split(" ")
          .map((part) => part[0])
          .join("")}
      </div>
      <label className="role-control">
        <span className="role-label">Viewing as</span>
        <span className="role-select-wrap">
          <select
            aria-label="Choose demo identity"
            value={identity.id}
            disabled={isPending}
            onChange={(event) => requestIdentity(event.target.value)}
          >
            {seededDemoIdentities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {humanize(item.role)}
              </option>
            ))}
          </select>
          <ChevronsUpDown size={14} aria-hidden="true" />
        </span>
      </label>
      <p className="sr-only" aria-live="polite">
        {isPending
          ? "Changing demo identity"
          : `Active demo identity: ${identity.name}, ${humanize(identity.role)}`}
      </p>
      {error ? (
        <p className="sr-only" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
