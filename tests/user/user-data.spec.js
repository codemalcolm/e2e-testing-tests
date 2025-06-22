import { test, expect } from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_POSTS_SERVER,
  USER_INFO_SERVER,
  DASHBOARD_CLIENT,
  DASHBOARD_SERVER,
  STATUS_CODE_SUCCESS, STATUS_CODE_FORBIDDEN,
  USER,
  REGISTER_CLIENT,
  REGISTER_SERVER,
  STATUS_CODE_CREATED,
} from "../utility";

async function register(page, username, password) {
  await page.goto(REGISTER_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === REGISTER_SERVER && res.status() === STATUS_CODE_CREATED
    ),
    await page.click('button:text("Register")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_CREATED);
}

async function login(page, username, password) {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === LOGIN_SERVER && res.status() === STATUS_CODE_SUCCESS
    ),
    await page.click('button:text("Login")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);
}

test("Shouldn't fetch user posts", async ({ page }) => {
  await page.goto(USER_INFO_CLIENT);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === USER_POSTS_SERVER &&
        res.status() === STATUS_CODE_FORBIDDEN
    ),
  ]);

  expect(response.status()).toBe(STATUS_CODE_FORBIDDEN);
});

// Test for editing username
test("Should allow editing username", async ({ page }) => {
  await register(page, USER.username, USER.password);
  await login(page, USER.username, USER.password);
  await page.goto(USER_INFO_CLIENT);
  await page.waitForSelector('button:text("Edit Username")');
  await page.click('button:text("Edit Username")');
  await page.fill('input[placeholder="Enter new username"]', "updatedUser");

  // Verify backend change

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === USER_INFO_SERVER && res.status() === STATUS_CODE_SUCCESS
    ),
    page.click('button:text("Save")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);
  const updated = await response.json();
  expect(updated.username).toBe("updatedUser");

  // Verify access to dashboard now allowed (sanity)
  let dashOK = false;
  page.on("response", (r) => {
    if (r.url() === DASHBOARD_SERVER && r.status() === STATUS_CODE_SUCCESS)
      dashOK = true;
  });
  await page.goto(DASHBOARD_CLIENT);
  await page.waitForResponse(
    (r) => r.url() === DASHBOARD_SERVER && r.status() === STATUS_CODE_SUCCESS
  );
  expect(dashOK).toBe(true);
});
