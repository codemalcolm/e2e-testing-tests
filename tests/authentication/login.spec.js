import { test, expect, } from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  REGISTER_CLIENT,
  USER_INFO_CLIENT,
  USER_INFO_SERVER
} from "../url";
import {
  STATUS_CODE_SUCCESS,
  STATUS_CODE_BAD_REQUEST
} from "../statuscode";
import { USER, UNKNOWN_USER} from "../user-data"

test.beforeEach(async ({ page }) => {

  await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);

  await page.click('button:text("Register")');

})


test("Should allow to login User", async ({ page }) => {
  let isLoggedIn = false;

  page.on("response", (response) => {
    if (
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      isLoggedIn = true;
    }
  });

  await page.goto(LOGIN_CLIENT);

  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);

  await page.click('button:text("Login")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === LOGIN_SERVER &&
        response.status() === STATUS_CODE_SUCCESS
    );
  } catch (error) {
    console.error("200 response for login was not received:", error);
  }

  expect(isLoggedIn).toBe(true);
});


test("Should deny access without an unregistered user", async ({ page }) => {
  let isLoggedIn = false;

  page.on("response", (response) => {
    if (
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      isLoggedIn = true;
    }
  });

  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', UNKNOWN_USER.username);
  await page.fill('input[placeholder="Password"]', UNKNOWN_USER.password);

  await page.click('button:text("Login")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === LOGIN_SERVER &&
        response.status() === STATUS_CODE_BAD_REQUEST
    );
  } catch (error) {
    console.error("400 response for login was not received:", error);
  }

  expect(isLoggedIn).toBe(false);
});


test("should return user info", async ({ page }) => {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);
  await page.click('button:text("Login")');

  await page.waitForResponse(
    response =>
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
  );

  await page.goto(USER_INFO_CLIENT);

  const userInfoResponse = await page.waitForResponse(
    response =>
      response.url() === USER_INFO_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
  );

  const payload = await userInfoResponse.json();
  expect(payload).toHaveProperty("_id");
  expect(payload.username).toBe(USER.username);

  await expect(page.locator("text=Username: " + USER.username)).toBeVisible();
});
