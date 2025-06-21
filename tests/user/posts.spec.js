import { test, expect } from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_POSTS_SERVER,
} from "../url";
import { STATUS_CODE_SUCCESS } from "../statuscode";

// TODO : CLEAN UP THIS CODE !

test.beforeEach(async ({ page }) => {
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

  await page.goto(USER_INFO_CLIENT);
});

test("Should create a new post", async ({ page }) => {
  let isPostCreated = false;

  page.on("response", (response) => {
    if (
      response.url() === USER_POSTS_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      isPostCreated = true;
    }
  });

  await expect(page).toHaveURL(USER_INFO_CLIENT);
  await page.click('button:text("Create Post")');

  await page.waitForSelector('input[placeholder="Title"]', {
    state: "visible",
  });
  await page.waitForSelector('textarea[placeholder="Post Text"]', {
    state: "visible",
  });

  await page.fill('input[placeholder="Title"]', "New Post");
  await page.fill('textarea[placeholder="Post Text"]', "Post Text");

  await page.locator('input[placeholder="Title"]').evaluate((el) => el.blur());

  const createButton = page.locator('.chakra-portal button:text("Create")');
  await createButton.click();

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === USER_POSTS_SERVER &&
        response.status() === STATUS_CODE_SUCCESS
    );
  } catch (error) {
    console.error("200 response for creating a post was not received:", error);
  }

  expect(isPostCreated).toBe(true);
});

test("Should delete a post", async ({ page }) => {
  const createdPostTitle = `Post for Deletion - ${Date.now()}`;
  const postText = `This post will be deleted - ${Math.random()
    .toString(36)
    .substring(7)}`;

  await expect(page).toHaveURL(USER_INFO_CLIENT);
  await page.click('button:text("Create Post")');

  await page.waitForSelector('input[placeholder="Title"]', {
    state: "visible",
  });
  await page.waitForSelector('textarea[placeholder="Post Text"]', {
    state: "visible",
  });

  await page.fill('input[placeholder="Title"]', createdPostTitle);
  await page.fill('textarea[placeholder="Post Text"]', postText);

  await page.locator('input[placeholder="Title"]').evaluate((el) => el.blur());

  const createButton = page.locator('.chakra-portal button:text("Create")');
  await createButton.click();

  try {
    await page.waitForResponse(
      (response) =>
        response.url() === USER_POSTS_SERVER &&
        response.status() === STATUS_CODE_SUCCESS
    );
  } catch (error) {
    console.error("200 response for creating a post was not received:", error);
  }

  let isPostDeleted = false;

  page.on("response", (response) => {
    if (
      response.url() === USER_POSTS_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      isPostDeleted = true;
    }
  });

  const postsContainer = page.locator("div.css-189aeu6");
  const specificPostDivLocator = postsContainer.locator(
    `div.css-143t1la:has-text("${createdPostTitle}")`
  );

  await expect(specificPostDivLocator).toBeVisible();
  const postIdToDelete = await specificPostDivLocator.getAttribute("id");

  if (postIdToDelete) {
    const deleteButtonLocator = specificPostDivLocator.locator(
      'button:has-text("Delete")'
    );
    await expect(deleteButtonLocator).toBeEnabled();
    await deleteButtonLocator.click();

    await expect(specificPostDivLocator).not.toBeVisible();
  } else {
    console.error("Error: Could not retrieve ID for the specific post div.");
  }
});
