import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoleProvider, useDemoRole } from "@/components/role-provider";
import { RoleSwitcher } from "@/components/role-switcher";
import { seededDemoIdentities } from "@/lib/demo-identities";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

function CurrentRole() {
  const { identity } = useDemoRole();
  return <p>Current role: {identity.role}</p>;
}

describe("RoleSwitcher", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ identity: seededDemoIdentities[2] }),
      }),
    );
  });

  it("requests and announces a server-approved demo identity", async () => {
    const user = userEvent.setup();
    render(
      <RoleProvider initialIdentity={seededDemoIdentities[0]}>
        <RoleSwitcher />
        <CurrentRole />
      </RoleProvider>,
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: /choose demo identity/i }),
      seededDemoIdentities[2].id,
    );

    expect(await screen.findByText("Current role: STAFF")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/api/demo-identity",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ identityId: seededDemoIdentities[2].id }),
      }),
    );
    expect(refresh).toHaveBeenCalledOnce();
  });
});
