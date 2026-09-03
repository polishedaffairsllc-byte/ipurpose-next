import { expect, test } from "@playwright/test";
import { normalizeIanaTimezone as normalizeServerTimezone } from "@/lib/ai/timezone";
import { normalizeIanaTimezone as normalizeMobileTimezone } from "../mobile/src/lib/timezone";
import { resolveVisualEnvironment } from "../mobile/src/lib/visualEnvironment";

const validators = [normalizeServerTimezone, normalizeMobileTimezone];

test.describe("mobile timezone preference", () => {
  test("accepts and canonicalizes supported IANA timezone values", () => {
    for (const validate of validators) {
      expect(validate(" America/New_York ")).toBe("America/New_York");
      expect(validate("Europe/London")).toBe("Europe/London");
      expect(validate("UTC")).toBe("UTC");
    }
  });

  test("rejects empty, malformed, and oversized timezone values", () => {
    for (const validate of validators) {
      expect(validate("")).toBeNull();
      expect(validate("Not/A_Timezone")).toBeNull();
      expect(validate("x".repeat(101))).toBeNull();
      expect(validate(null)).toBeNull();
    }
  });

  test("uses the preferred timezone when resolving Auto environments", () => {
    const preference = { mode: "auto", manualTheme: "depth" } as const;
    const instant = new Date("2026-01-01T12:30:00.000Z");

    expect(resolveVisualEnvironment(preference, instant, "America/New_York"))
      .toBe("renewal");
    expect(resolveVisualEnvironment(preference, instant, "UTC"))
      .toBe("warmth");
    expect(resolveVisualEnvironment(preference, instant, "Asia/Tokyo"))
      .toBe("depth");
  });
});
