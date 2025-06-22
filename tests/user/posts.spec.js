import { test, expect } from "@playwright/test";
import {
  LOGIN_CLIENT,
  LOGIN_SERVER,
  USER_INFO_CLIENT,
  USER_POSTS_SERVER,
  ALL_POST_SERVER,
  ALL_DATA,
  REGISTER_CLIENT,
  REGISTER_SERVER,
} from "../url";
import { STATUS_CODE_CREATED, STATUS_CODE_SUCCESS } from "../statuscode";
import { USER } from "../user-data";
import { HOMEPAGE_POST_SERVER } from "../utility";

// TODO : CLEAN UP THIS CODE !

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

test.beforeEach(async ({ page }) => {
  await register(page, USER.username, USER.password);
  await login(page, USER.username, USER.password);
  await page.goto(USER_INFO_CLIENT);
});

test("Should create a new post", async ({ page }) => {
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

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url() === USER_POSTS_SERVER && res.status() === STATUS_CODE_SUCCESS
    ),
    createButton.click(),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);
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

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes(USER_POSTS_SERVER) &&
        res.status() === STATUS_CODE_SUCCESS
    ),
    createButton.click(),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);

  const postsContainer = page.locator("div.css-189aeu6");
  const specificPostDivLocator = postsContainer.locator(
    `div.css-143t1la:has-text("${createdPostTitle}")`
  );

  await expect(specificPostDivLocator).toBeVisible();
  const postIdToDelete = await specificPostDivLocator.getAttribute("id");

  if (postIdToDelete) {
    const deleteButton = specificPostDivLocator.locator(
      'button:has-text("Delete")'
    );
    await expect(deleteButton).toBeEnabled();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(ALL_POST_SERVER) &&
          res.status() === STATUS_CODE_SUCCESS
      ),
      deleteButton.click(),
    ]);

    expect(response.status()).toBe(STATUS_CODE_SUCCESS);
    await expect(specificPostDivLocator).not.toBeVisible();
  } else {
    console.error("Error: Could not retrieve ID for the specific post div.");
  }
});

test("Should edit a post", async ({ page }) => {
  const createdPostTitle = `Post for Edit - ${Date.now()}`;
  const postText = `This post will be editted - ${Math.random()
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

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) =>
        res.url().includes(USER_POSTS_SERVER) &&
        res.status() === STATUS_CODE_SUCCESS
    ),
    createButton.click(),
  ]);

  expect(response.status()).toBe(STATUS_CODE_SUCCESS);

  const postsContainer = page.locator("div.css-189aeu6");
  const specificPostDivLocator = postsContainer.locator(
    `div.css-143t1la:has-text("${createdPostTitle}")`
  );

  await expect(specificPostDivLocator).toBeVisible();
  const postIdToEdit = await specificPostDivLocator.getAttribute("id");

  if (postIdToEdit) {
    const editButtonLocator = specificPostDivLocator.locator(
      'button:has-text("Edit")'
    );
    await expect(editButtonLocator).toBeEnabled();
    await editButtonLocator.click();

    await page.waitForSelector('input[placeholder="Title"]', {
      state: "visible",
    });
    await page.waitForSelector('textarea[placeholder="Post text"]', {
      state: "visible",
    });

    await page.fill('input[placeholder="Title"]', createdPostTitle);
    await page.fill('textarea[placeholder="Post text"]', postText);

    const saveButton = page.locator('button:text("Save")');

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes(HOMEPAGE_POST_SERVER) &&
          res.status() === STATUS_CODE_SUCCESS
      ),
      saveButton.click(),
    ]);
    expect(response.status()).toBe(STATUS_CODE_SUCCESS);
  } else {
    console.error("Error: Could not retrieve ID for the specific post div.");
  }
});
