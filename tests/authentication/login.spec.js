import { test, expect,} from "@playwright/test";
import { LOGIN_CLIENT, LOGIN_SERVER, REGISTER_CLIENT, REGISTER_SERVER, STATUS_CODE_BAD_REQUEST, STATUS_CODE_CREATED, STATUS_CODE_FORBIDDEN, STATUS_CODE_SUCCESS }  from "../variables";


test.beforeEach(async({page}) =>{

 await page.goto(REGISTER_CLIENT);

  await page.fill('input[placeholder="Username"]', "users");
  await page.fill('input[placeholder="Password"]', "263");

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

  await page.fill('input[placeholder="Username"]', "e2euser");
  await page.fill('input[placeholder="Password"]', "password123");

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


test("Should deny access", async ({ page }) => {
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
  await page.fill('input[placeholder="Username"]', "unknownUser");
  await page.fill('input[placeholder="Password"]', "password123");

  const badRequestPromise = page.waitForResponse(
    response =>
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_BAD_REQUEST,
    { timeout: 5_000 }
  );  

    await page.click('button:text("Login")');

 try {
    await badRequestPromise;
  } catch (error) {
    console.error("400 response for login was not received:", error);
  }

  expect(isLoggedIn).toBe(false);
});