import { test, expect } from "@playwright/test";

// Checking for a 403 status code from a network response
test("Dashboard access denied", async ({ page }) => {
  let isForbidden = false;

  // server port is 5000
  page.on("response", (response) => {
    if (
      response.url() === "http://localhost:5000/dashboard" &&
      response.status() === 403
    ) {
      isForbidden = true;
    }
  });

  // navigating to actual /dashboard FE route
  await page.goto("http://localhost:3000/dashboard");

  await page
    .waitForResponse(
      (response) =>
        response.url() === "http://localhost:5000/dashboard" &&
        response.status() === 403
    )
    .catch(() => {});

  expect(isForbidden).toBe(true);
});
