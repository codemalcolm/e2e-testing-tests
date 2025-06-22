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

// TODO : CLEAN UP THIS CODE !

async function register(page, username, password) {
  let sawCreated = false;
  page.on("response", (response) => {
    if (
      response.url() === REGISTER_SERVER &&
      response.status() === STATUS_CODE_CREATED
    ) {
      sawCreated = true;
    }
  });
  await page.goto(REGISTER_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:text("Register")');
  await page.waitForResponse(
    (r) => r.url() === REGISTER_SERVER && r.status() === STATUS_CODE_CREATED
  );
  expect(sawCreated).toBe(true);
}

async function login(page, username, password) {
  let sawLogin = false;
  page.on("response", (response) => {
    if (
      response.url() === LOGIN_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      sawLogin = true;
    }
  });
  await page.goto(LOGIN_CLIENT);
  await page.fill('input[placeholder="Username"]', username);
  await page.fill('input[placeholder="Password"]', password);
  await page.click('button:text("Login")');
  await page.waitForResponse(
    (r) => r.url() === LOGIN_SERVER && r.status() === STATUS_CODE_SUCCESS
  );
  expect(sawLogin).toBe(true);
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
  await createButton.click();
  let isPostDeleted = false;
  try {
    await page.waitForResponse(
      (response) =>
        response.url() === USER_POSTS_SERVER &&
        response.status() === STATUS_CODE_SUCCESS
    );
  } catch (error) {
    console.error("200 response for deleting a post was not received:", error);
  }

  page.on("response", (response) => {
    if (
      response.url() === ALL_POST_SERVER &&
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

    try {
      await page.waitForResponse(
        (response) =>
          response.url() === incudes(ALL_POST_SERVER) &&
          response.status() === STATUS_CODE_SUCCESS
      );
    } catch (error) {
      console.error(
        "200 response for deleting a post was not received:",
        error
      );
    }

    await expect(isPostDeleted).toBe(true);
    await expect(specificPostDivLocator).not.toBeVisible();
  } else {
    console.error("Error: Could not retrieve ID for the specific post div.");
  }
});

test("Should edit a post", async ({ page }) => {
  let isPostEditted = false;
  const createdPostTitle = `Post for editting - ${Date.now()}`;
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

  page.on("response", (response) => {
    if (
      response.url() === ALL_POST_SERVER &&
      response.status() === STATUS_CODE_SUCCESS
    ) {
      isPostEditted = true;
    }
  });

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
    await page.waitForSelector('textarea[placeholder="Post Text"]', {
      state: "visible",
    });

    await page.fill('input[placeholder="Title"]', "Editted title");
    await page.fill('textarea[placeholder="Post text"]', "Editted title");

    const response = await request.delete(`url/data`);

    // Assert that the API call was successful
    expect(response.ok()).toBeTruthy(); // Checks for 2xx status code
    expect(response.status()).toBe(200);

    const saveButton = page.locator('.chakra-portal button:text("Save")');
    await saveButton.click();
  } else {
    console.error("Error: Could not retrieve ID for the specific post div.");
  }
});

// test("Should delete everything", async ({ request }) => {
//   const response = await request.delete(`${ALL_DATA}`);

//   expect(response.ok()).toBeTruthy();
//   expect(response.status()).toBe(200);
// });
