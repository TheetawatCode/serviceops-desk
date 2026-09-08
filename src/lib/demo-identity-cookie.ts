import { createHmac, timingSafeEqual } from "node:crypto";

import {
  DEFAULT_DEMO_IDENTITY_ID,
  getSeededDemoIdentity,
  type SeededDemoIdentityId,
} from "@/lib/demo-identities";
import type { PersonSummary } from "@/lib/job-types";

export const DEMO_IDENTITY_COOKIE_NAME = "serviceops-demo-identity";

type IdentityLoader = (id: SeededDemoIdentityId) => Promise<PersonSummary | null>;

function signatureFor(identityId: SeededDemoIdentityId, secret: string) {
  return createHmac("sha256", secret).update(identityId).digest("base64url");
}

export function signDemoIdentityId(identityId: SeededDemoIdentityId, secret: string) {
  return `${identityId}.${signatureFor(identityId, secret)}`;
}

export function verifyDemoIdentityCookie(
  cookieValue: string | undefined,
  secret: string,
): SeededDemoIdentityId | null {
  if (!cookieValue) return null;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex < 1) return null;

  const identityId = cookieValue.slice(0, separatorIndex);
  const suppliedSignature = cookieValue.slice(separatorIndex + 1);
  const seededIdentity = getSeededDemoIdentity(identityId);
  if (!seededIdentity || !suppliedSignature) return null;

  const expected = Buffer.from(signatureFor(seededIdentity.id, secret));
  const supplied = Buffer.from(suppliedSignature);

  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return null;
  }

  return seededIdentity.id;
}

function matchesSeedDefinition(user: PersonSummary, id: SeededDemoIdentityId) {
  const definition = getSeededDemoIdentity(id);
  return (
    definition !== null &&
    user.id === definition.id &&
    user.email === definition.email &&
    user.role === definition.role
  );
}

export async function validateRequestedDemoIdentity(
  requestedId: unknown,
  loadIdentity: IdentityLoader,
): Promise<PersonSummary | null> {
  const definition = getSeededDemoIdentity(requestedId);
  if (!definition) return null;

  const user = await loadIdentity(definition.id);
  return user && matchesSeedDefinition(user, definition.id) ? user : null;
}

export async function resolveDemoIdentity(
  cookieValue: string | undefined,
  secret: string,
  loadIdentity: IdentityLoader,
): Promise<PersonSummary> {
  const verifiedId = verifyDemoIdentityCookie(cookieValue, secret);
  const requested = verifiedId
    ? await validateRequestedDemoIdentity(verifiedId, loadIdentity)
    : null;

  if (requested) return requested;

  const fallback = await validateRequestedDemoIdentity(
    DEFAULT_DEMO_IDENTITY_ID,
    loadIdentity,
  );
  if (!fallback) {
    throw new Error("The default seeded demo identity is missing from PostgreSQL.");
  }

  return fallback;
}
