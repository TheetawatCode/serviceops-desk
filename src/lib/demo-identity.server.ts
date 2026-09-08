import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import {
  DEMO_IDENTITY_COOKIE_NAME,
  resolveDemoIdentity,
  signDemoIdentityId,
  validateRequestedDemoIdentity,
} from "@/lib/demo-identity-cookie";
import {
  getSeededDemoIdentity,
  type SeededDemoIdentityId,
} from "@/lib/demo-identities";
import type { PersonSummary } from "@/lib/job-types";
import { prisma } from "@/lib/prisma";

const personSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

function getCookieSecret() {
  const secret = process.env.DEMO_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("DEMO_COOKIE_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

async function loadIdentity(id: SeededDemoIdentityId): Promise<PersonSummary | null> {
  return prisma.user.findUnique({ where: { id }, select: personSelect });
}

export const getActiveDemoIdentity = cache(async () => {
  const cookieStore = await cookies();
  return resolveDemoIdentity(
    cookieStore.get(DEMO_IDENTITY_COOKIE_NAME)?.value,
    getCookieSecret(),
    loadIdentity,
  );
});

export function findValidatedDemoIdentity(requestedId: unknown) {
  return validateRequestedDemoIdentity(requestedId, loadIdentity);
}

export function createSignedDemoIdentityCookie(identityId: string) {
  const identity = getSeededDemoIdentity(identityId);
  if (!identity) throw new Error("Cannot sign an identity outside the seeded allowlist.");
  return signDemoIdentityId(identity.id, getCookieSecret());
}
