import {
  test,
  expect
} from "@playwright/test";
import {
  REGISTER_CLIENT,
  REGISTER_SERVER
} from "../url";
import {
STATUS_CODE_CREATED,
STATUS_CODE_BAD_REQUEST
} from "../statuscode";

test("Should allow to register User", async ({ page }) => {
  let isRegistered = false;

  page.on("response", (response) => {
    if (
      response.url() === REGISTER_SERVER &&
      response.status() === STATUS_CODE_CREATED
    ) {
      isRegistered = true;
    }
  });

  await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', "users");
  await page.fill('input[placeholder="Password"]', "263");

  await page.click('button:text("Register")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === REGISTER_SERVER &&
        response.status() === STATUS_CODE_CREATED
    );
  } catch (error) {
    console.error("201 response for registration was not received:", error);
  }

  expect(isRegistered).toBe(true);
});


test("Should not allow to register User", async ({ page }) => {
  let isRegistered = false;

  page.on("response", (response) => {
    if (
      response.url() === REGISTER_SERVER &&
      response.status() === STATUS_CODE_CREATED
    ) {
      isRegistered = true;
    }
  });

  await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', "");
  await page.fill('input[placeholder="Password"]', "");

  await page.click('button:text("Register")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === REGISTER_SERVER &&
        response.status() === STATUS_CODE_BAD_REQUEST
    );
  } catch (error) {
    console.error("201 response for registration was not received:", error);
  }

  expect(isRegistered).toBe(false);
});