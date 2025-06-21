import {
  test,
  expect
} from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_POSTS_SERVER,
  USER_INFO_SERVER,
  DASHBOARD_CLIENT,
  DASHBOARD_SERVER
} from "../url";
import {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_FORBIDDEN,
} from "../statuscode";

test("Shouldn't fetch user posts", async ({ page }) => {
  let isNotFetched = false;

  page.on("response", (response) => {
    if (
      response.url() === USER_POSTS_SERVER &&
      response.status() === STATUS_CODE_FORBIDDEN
    ) {
      isNotFetched = true;
    }
  });

  await page.goto(USER_INFO_CLIENT);

  await page
    .waitForResponse(
      (response) =>
        response.url() === USER_POSTS_SERVER &&
        response.status() === STATUS_CODE_FORBIDDEN
    )
    .catch((error) => {
      console.error(
        "403 response for fetching user info was not received:",
        error
      );
    });

  expect(isNotFetched).toBe(true);
});

// Test for editing username
test("Should allow editing username", async ({ page }) => {
  // Login to obtain auth
  let loggedIn = false;
  page.on("response", r => {
    if (r.url() === LOGIN_SERVER && r.status() === STATUS_CODE_SUCCESS) loggedIn = true;
  });
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', "e2euser");
  await page.fill('input[placeholder="Password"]', "password123");
  await Promise.all([
    page.waitForResponse(r => r.url() === LOGIN_SERVER && r.status() === STATUS_CODE_SUCCESS),
    page.click('button:text("Login")')
  ]);
  expect(loggedIn).toBe(true);

  // Navigate to user page and edit
  await page.goto(USER_INFO_CLIENT);
  await page.waitForSelector('button:text("Edit Username")');
  await page.click('button:text("Edit Username")');
  await page.fill('input[placeholder="Enter new username"]', "updatedUser");
  await page.click('button:text("Save")');

  // Verify backend change
  let sawUpdate = false;
  const updateResponse = await page.waitForResponse(r => r.url() === USER_INFO_SERVER && r.status() === STATUS_CODE_SUCCESS);
  sawUpdate = updateResponse.ok();
  const updated = await updateResponse.json();
  expect(updated.username).toBe("updatedUser");
  expect(sawUpdate).toBe(true);

  // Verify access to dashboard now allowed (sanity)
  let dashOK = false;
  page.on("response", r => {
    if (r.url() === DASHBOARD_SERVER && r.status() === STATUS_CODE_SUCCESS) dashOK = true;
  });
  await page.goto(DASHBOARD_CLIENT);
  await page.waitForResponse(r => r.url() === DASHBOARD_SERVER && r.status() === STATUS_CODE_SUCCESS);
  expect(dashOK).toBe(true);
});

