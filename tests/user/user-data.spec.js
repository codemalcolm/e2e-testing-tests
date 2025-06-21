import {
  test,
  expect
} from "@playwright/test";
import {
  USER_INFO_CLIENT,
  USER_POSTS_SERVER
} from "../url";
import {
  STATUS_CODE_FORBIDDEN,
} from "../statuscode";

test("Shouldn't fetch user posts", async ({ page }) => {
  let isNotFetched = false;

  page.on("response", (response) => {
    if (
      response.url() === USER_POSTS_SERVER &&
      response.status() === STATUS_CODE_FORBIDDEN
    ) {
      isNotFetched = true;
    }
  });

  await page.goto(USER_INFO_CLIENT);

  await page
    .waitForResponse(
      (response) =>
        response.url() === USER_POSTS_SERVER &&
        response.status() === STATUS_CODE_FORBIDDEN
    )
    .catch((error) => {
      console.error(
        "403 response for fetching user info was not received:",
        error
      );
    });

  expect(isNotFetched).toBe(true);
});
