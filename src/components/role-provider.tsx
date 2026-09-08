"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { PersonSummary } from "@/lib/job-types";

type RoleContextValue = {
  identity: PersonSummary;
  setIdentity: (identity: PersonSummary) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({
  children,
  initialIdentity,
}: {
  children: ReactNode;
  initialIdentity: PersonSummary;
}) {
  const [identity, setIdentity] = useState(initialIdentity);

  const value = useMemo<RoleContextValue>(
    () => ({ identity, setIdentity }),
    [identity],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useDemoRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useDemoRole must be used within RoleProvider.");
  return context;
}
