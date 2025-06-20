import { test, expect } from "@playwright/test";
import { DASHBOARD_CLIENT, DASHBOARD_SERVER, LOGIN_CLIENT, LOGIN_SERVER, REGISTER_CLIENT, REGISTER_SERVER, STATUS_CODE_CREATED, STATUS_CODE_FORBIDDEN, STATUS_CODE_SUCCESS }  from "../variables";

// Checking for a 403 status code from a network response
test("Should not allow to access Dashboard", async ({ page }) => {
  let isForbidden = false;

  // server port is 5000
  page.on("response", (response) => {
    if (
      response.url() === DASHBOARD_SERVER  &&
      response.status() === STATUS_CODE_FORBIDDEN
    ) {
      isForbidden = true;
    }
  });

  // navigating to actual /dashboard FE route
  await page.goto(DASHBOARD_CLIENT);

  await page
    .waitForResponse(
      (response) =>
        response.url() === DASHBOARD_SERVER &&
        response.status() === STATUS_CODE_FORBIDDEN
    )
    .catch(() => {
      console.error(
        "403 response for accessing dashboard was not received:",
        error
      );
    });

  expect(isForbidden).toBe(true);
});