import { NextResponse } from "next/server";

import { DEMO_IDENTITY_COOKIE_NAME } from "@/lib/demo-identity-cookie";
import {
  createSignedDemoIdentityCookie,
  findValidatedDemoIdentity,
} from "@/lib/demo-identity.server";

export async function POST(request: Request) {
  let requestedId: unknown;

  try {
    const body: unknown = await request.json();
    requestedId =
      body && typeof body === "object" && "identityId" in body
        ? body.identityId
        : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const identity = await findValidatedDemoIdentity(requestedId);
  if (!identity) {
    return NextResponse.json(
      { error: "Choose one of the seeded demo identities." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ identity });
  response.cookies.set({
    name: DEMO_IDENTITY_COOKIE_NAME,
    value: createSignedDemoIdentityCookie(identity.id),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
