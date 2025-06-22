import { test, expect } from "@playwright/test";
import {
  REGISTER_CLIENT,
  REGISTER_SERVER,
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_INFO_SERVER,
  DASHBOARD_CLIENT,
  DASHBOARD_SERVER,
  STATUS_CODE_CREATED,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_FORBIDDEN,
  USER,
} from "../utility";

async function register(page, username, password) {
  await page.goto(REGISTER_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);

  const [response] = await Promise.all([
    page.waitForResponse(
      res =>
        res.url() === REGISTER_SERVER &&
        res.status() === STATUS_CODE_CREATED
    ),
    page.click('button:text("Register")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_CREATED);
}

async function login(page, username, password) {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);

  const [response] = await Promise.all([
    page.waitForResponse(
      res =>
        res.url() === LOGIN_SERVER &&
        res.status() === STATUS_CODE_SUCCESS
    ),
    page.click('button:text("Login")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);
}

test.beforeEach(async ({ page }) => {
  await register(page, USER.username, USER.password);
  await login(page, USER.username, USER.password);
  await page.goto(USER_INFO_CLIENT);
});

test("Should fetch user info, then logout and deny dashboard access", async ({ page }) => {
  const userInfoResponse = await page.waitForResponse(
    res =>
      res.url() === USER_INFO_SERVER &&
      res.status() === STATUS_CODE_SUCCESS
  );
  expect(userInfoResponse.status()).toBe(STATUS_CODE_SUCCESS);

  await page.click('button:text("Logout")');
  await page.context().clearCookies();

  await page.goto(DASHBOARD_CLIENT);
  const dashboardResponse = await page.waitForResponse(
    res =>
      res.url() === DASHBOARD_SERVER &&
      res.status() === STATUS_CODE_FORBIDDEN
  );
  expect(dashboardResponse.status()).toBe(STATUS_CODE_FORBIDDEN);
});
