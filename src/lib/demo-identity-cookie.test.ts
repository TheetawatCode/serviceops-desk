import { describe, expect, it, vi } from "vitest";

import {
  resolveDemoIdentity,
  signDemoIdentityId,
  validateRequestedDemoIdentity,
  verifyDemoIdentityCookie,
} from "@/lib/demo-identity-cookie";
import { seededDemoIdentities } from "@/lib/demo-identities";

const secret = "test-secret-with-more-than-thirty-two-characters";

describe("demo identity cookie", () => {
  it("resolves a valid signed identity through the database loader", async () => {
    const technician = seededDemoIdentities[1];
    const loadIdentity = vi.fn(async (id: string) =>
      id === technician.id ? technician : seededDemoIdentities[0],
    );

    const cookie = signDemoIdentityId(technician.id, secret);

    await expect(resolveDemoIdentity(cookie, secret, loadIdentity)).resolves.toEqual(
      technician,
    );
    expect(loadIdentity).toHaveBeenCalledWith(technician.id);
  });

  it("rejects a tampered signature and falls back to the seeded manager", async () => {
    const technician = seededDemoIdentities[1];
    const loadIdentity = vi.fn(async (id: string) =>
      seededDemoIdentities.find((identity) => identity.id === id) ?? null,
    );
    const cookie = `${signDemoIdentityId(technician.id, secret)}tampered`;

    expect(verifyDemoIdentityCookie(cookie, secret)).toBeNull();
    await expect(resolveDemoIdentity(cookie, secret, loadIdentity)).resolves.toEqual(
      seededDemoIdentities[0],
    );
  });

  it("rejects an identity that is not in the seeded allowlist", async () => {
    const loadIdentity = vi.fn(async () => seededDemoIdentities[0]);

    await expect(
      validateRequestedDemoIdentity("demo-admin-attacker", loadIdentity),
    ).resolves.toBeNull();
    expect(loadIdentity).not.toHaveBeenCalled();
  });

  it("rejects a database identity whose seeded role no longer matches", async () => {
    const manager = seededDemoIdentities[0];
    const loadIdentity = vi.fn(async () => ({ ...manager, role: "STAFF" as const }));

    await expect(validateRequestedDemoIdentity(manager.id, loadIdentity)).resolves.toBeNull();
  });
});
