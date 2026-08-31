import { expect, test } from "@playwright/test";

test("Google Review route serves its scoped theme", async ({ request }) => {
  const response = await request.get("/google-review");

  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("iPurpose — Google Review");
  expect(body).toMatch(
    /(?:GoogleReview_page__|GoogleReview-module__[A-Za-z0-9_-]+__page)/
  );
});
