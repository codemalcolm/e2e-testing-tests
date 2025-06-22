import {
  test,
  expect
} from "@playwright/test";
import {
  DASHBOARD_CLIENT,
  DASHBOARD_SERVER,
  STATUS_CODE_FORBIDDEN
} from "../utility";

test("Should not allow to access Dashboard", async ({ page }) => {
  let isForbidden = false;

  page.on("response", (response) => {
    if (
      response.url() === DASHBOARD_SERVER &&
      response.status() === STATUS_CODE_FORBIDDEN
    ) {
      isForbidden = true;
    }
  });

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