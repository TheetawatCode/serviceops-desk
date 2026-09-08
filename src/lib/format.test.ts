import { describe, expect, it } from "vitest";

import { getSlaState, humanize } from "@/lib/format";

describe("getSlaState", () => {
  const now = new Date("2026-09-08T02:00:00.000Z");

  it("marks active jobs according to the remaining SLA window", () => {
    expect(getSlaState("2026-09-08T08:00:00.000Z", "OPEN", now)).toBe("ON_TRACK");
    expect(getSlaState("2026-09-08T05:00:00.000Z", "IN_PROGRESS", now)).toBe(
      "AT_RISK",
    );
    expect(getSlaState("2026-09-08T01:59:00.000Z", "OPEN", now)).toBe("BREACHED");
  });

  it("marks resolved work complete regardless of due time", () => {
    expect(getSlaState("2026-09-01T00:00:00.000Z", "RESOLVED", now)).toBe(
      "COMPLETE",
    );
    expect(getSlaState("2026-09-01T00:00:00.000Z", "CLOSED", now)).toBe("COMPLETE");
  });
});

describe("humanize", () => {
  it("converts enum values to interface labels", () => {
    expect(humanize("IN_PROGRESS")).toBe("In Progress");
  });
});
