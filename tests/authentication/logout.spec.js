import { test, expect, } from "@playwright/test";
import { LOGIN_CLIENT, LOGIN_SERVER, REGISTER_CLIENT, REGISTER_SERVER } from "../url";
import { STATUS_CODE_CREATED, STATUS_CODE_SUCCESS } from "../statuscode";

test.beforeEach(async ({ page }) => {

    register(page);
    login(page);

})


test("Should deny access after logout", async ({ page }) => {

        await page.goto()




})




const register = async (page) => {

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

}


const login = async (page) => {
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
}