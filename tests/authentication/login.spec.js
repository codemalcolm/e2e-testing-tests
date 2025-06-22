import { test, expect } from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_INFO_SERVER,
  USER,
  UNKNOWN_USER,
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST,
  uiRegister,
} from "../utility";


test.beforeEach(async ({ page }) => {
  await uiRegister(page, USER);
});

test("Should allow to login User", async ({ page }) => {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === LOGIN_SERVER && res.status() === STATUS_CODE_SUCCESS
    ),
    page.click('button:text("Login")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);

});

test("Should deny access without an unregistered user", async ({ page }) => {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', UNKNOWN_USER.username);
  await page.fill('input[placeholder="Password"]', UNKNOWN_USER.password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === LOGIN_SERVER && res.status() === STATUS_CODE_BAD_REQUEST
    ),
    page.click('button:text("Login")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_BAD_REQUEST)

});

test("should return user info", async ({ page }) => {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);
  await page.click('button:text("Login")');

  await page.waitForResponse(
    (response) =>
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
  );

  await page.goto(USER_INFO_CLIENT);

  const userInfoResponse = await page.waitForResponse(
    (response) =>
      response.url() === USER_INFO_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
  );

  const payload = await userInfoResponse.json();
  expect(payload).toHaveProperty("_id");
  expect(payload.username).toBe(USER.username);

  await expect(page.locator("text=Username: " + USER.username)).toBeVisible();
});