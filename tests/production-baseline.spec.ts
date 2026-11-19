import { expect, test } from "@playwright/test";

test("Google Review route serves its scoped theme", async ({ request }) => {
  const response = await request.get("/google-review");

  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("iPurpose — Google Review");
  // Next.js may minify CSS module names; verify the emitted class and theme rules
  // together instead of depending on a particular compiler's hash format.
  const pageClasses = [...new Set(body.match(/[A-Za-z0-9_-]+_page(?:__[A-Za-z0-9_-]+)?/g) ?? [])];
  expect(pageClasses.length).toBeGreaterThan(0);
  const stylesheets = [...body.matchAll(/<link[^>]*href="([^"]+\.css)"[^>]*>/g)];
  expect(stylesheets.length).toBeGreaterThan(0);
  const css = (await Promise.all(stylesheets.map(async ([, href]) => {
    const stylesheet = await request.get(href);
    expect(stylesheet.ok()).toBe(true);
    return stylesheet.text();
  }))).join('\n');
  expect(pageClasses.some(name => new RegExp(`\\.${name}\\s*\\{`).test(css))).toBe(true);
  expect(css).toMatch(/--accent:\s*#125e7a/);
});
