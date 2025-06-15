import { test, expect } from "@playwright/test";

// Checking for a 403 status code from a network response
test("Dashboard access denied", async ({ page }) => {
  let isForbidden = false;

  // server port is 5000
  page.on("response", (response) => {
    if (
      response.url() === "http://localhost:5000/dashboard" &&
      response.status() === 403
    ) {
      isForbidden = true;
    }
  });

  // navigating to actual /dashboard FE route
  await page.goto("http://localhost:3000/dashboard");

  await page
    .waitForResponse(
      (response) =>
        response.url() === "http://localhost:5000/dashboard" &&
        response.status() === 403
    )
    .catch(() => {
      console.error(
        "403 response for accessing dashboard was not received:",
        error
      );
    });

  expect(isForbidden).toBe(true);
});

test("User Registration", async ({ page }) => {
  let isRegistered = false;

  page.on("response", (response) => {
    if (
      response.url() === "http://localhost:5000/register" &&
      response.status() === 201
    ) {
      isRegistered = true;
    }
  });

  await page.goto("http://localhost:3000/register");

  await page.fill('input[placeholder="Username"]', "users");
  await page.fill('input[placeholder="Password"]', "263");

  await page.click('button:text("Register")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === "http://localhost:5000/register" &&
        response.status() === 201
    );
  } catch (error) {
    console.error("201 response for registration was not received:", error);
  }

  expect(isRegistered).toBe(true);
});

test("User Login", async ({ page }) => {
  let isLoggedIn = false;

  page.on("response", (response) => {
    if (
      response.url() === "http://localhost:5000/login" &&
      response.status() === 200
    ) {
      isLoggedIn = true;
    }
  });

  await page.goto("http://localhost:3000/login");

  await page.fill('input[placeholder="Username"]', "e2euser");
  await page.fill('input[placeholder="Password"]', "password123");

  await page.click('button:text("Login")');

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === "http://localhost:5000/login" &&
        response.status() === 200
    );
  } catch (error) {
    console.error("200 response for login was not received:", error);
  }

  expect(isLoggedIn).toBe(true);
});
