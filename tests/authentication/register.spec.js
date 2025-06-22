import { test, expect } from "@playwright/test";
import {
  REGISTER_CLIENT,
  REGISTER_SERVER,
  ALL_DATA,
  STATUS_CODE_CREATED,
  STATUS_CODE_BAD_REQUEST,
  STATUS_CODE_SUCCESS,
  USER
} from "../utility"

test("Should allow to register User", async ({ page }) => {
  await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', USER.username);
  await page.fill('input[placeholder="Password"]', USER.password);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === REGISTER_SERVER && res.status() === STATUS_CODE_CREATED
    ),
    page.click('button:text("Register")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_CREATED);
  const responseBody = await response.json();
  expect(responseBody.message).toBe("User created");
});

test("Should not allow to register User", async ({ page }) => {
  await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', "");
  await page.fill('input[placeholder="Password"]', "");

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === REGISTER_SERVER &&
        res.status() === STATUS_CODE_BAD_REQUEST
    ),
    page.click('button:text("Register")'),
  ]);

  expect(response.status()).toBe(STATUS_CODE_BAD_REQUEST);
});

test.afterEach(async ({ request }) => {

  const response = await request.delete(`${ALL_DATA}`);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(STATUS_CODE_SUCCESS);

})