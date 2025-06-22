import { expect } from "@playwright/test";

export const USER = { username: "e2euser", password: "password123" };
export const UNKNOWN_USER = { username: "unknownUser", password: "password123" };

export const DASHBOARD_SERVER = "http://localhost:5000/dashboard";
export const DASHBOARD_CLIENT = "http://localhost:3000/dashboard";
export const REGISTER_SERVER = "http://localhost:5000/register";
export const REGISTER_CLIENT = "http://localhost:3000/register";
export const LOGIN_SERVER = "http://localhost:5000/login";
export const LOGIN_CLIENT = "http://localhost:3000/login";
export const USER_INFO_SERVER = "http://localhost:5000/user-info";
export const USER_INFO_CLIENT = "http://localhost:3000/user-page";
export const USER_POSTS_SERVER = "http://localhost:5000/user-info/posts";
export const HOMEPAGE_POST_CLIENT = "http://localhost:5000/posts"
export const HOMEPAGE_POST_SERVER = "http://localhost:5000/posts"
export const ALL_POST_SERVER = "http://localhost:5000/posts"
export const ALL_DATA = "http://localhost:5000/data"

export const STATUS_CODE_FORBIDDEN = 403;
export const STATUS_CODE_CREATED = 201;
export const STATUS_CODE_SUCCESS = 200;
export const STATUS_CODE_BAD_REQUEST = 400;

export async function uiRegister(page, user = USER) {
  await page.goto(REGISTER_CLIENT);
  await page.fill('input[placeholder="Username"]', user.username);
  await page.fill('input[placeholder="Password"]', user.password);
  const [res] = await Promise.all([
    page.waitForResponse(r =>
      r.request().method() === "POST" &&
      r.url() === REGISTER_SERVER &&
      r.status() === STATUS_CODE_CREATED
    ),
    page.click('button:text("Register")'),
  ]);
  expect(res.status()).toBe(STATUS_CODE_CREATED);
}

export async function uiLogin(page, user = USER) {
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', user.username);
  await page.fill('input[placeholder="Password"]', user.password);
  await page.click('button:text("Login")');

  const response = await page.waitForResponse(
    res =>
      res.request().method() === "POST" &&
      res.url() === LOGIN_SERVER &&
      res.status() === STATUS_CODE_SUCCESS
  );
  expect(response.ok()).toBeTruthy();
  await page.waitForURL(DASHBOARD_CLIENT);
}
