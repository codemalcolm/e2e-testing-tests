import { test, expect } from "@playwright/test";
import {
    REGISTER_CLIENT,
    REGISTER_SERVER,
    LOGIN_CLIENT,
    LOGIN_SERVER,
    DASHBOARD_CLIENT,
    DASHBOARD_SERVER,
    USER_INFO_CLIENT,
    USER_INFO_SERVER,
    STATUS_CODE_CREATED,
    STATUS_CODE_SUCCESS,
    STATUS_CODE_FORBIDDEN,
    USER
} from "../utility";

async function register(page, username, password) {
    let sawCreated = false;
    page.on("response", response => {
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
        r => r.url() === REGISTER_SERVER && r.status() === STATUS_CODE_CREATED
    );
    expect(sawCreated).toBe(true);
}

async function login(page, username, password) {
    let sawLogin = false;
    page.on("response", response => {
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
        r => r.url() === LOGIN_SERVER && r.status() === STATUS_CODE_SUCCESS
    );
    expect(sawLogin).toBe(true);
}

test.beforeEach(async ({ page }) => {
    await register(page, USER.username, USER.password);
    await login(page, USER.username, USER.password);
});

test("Should fetch user info, then logout and deny dashboard access", async ({ page }) => {
    let sawUserInfo = false;
    page.on("response", response => {
        if (
            response.url() === USER_INFO_SERVER &&
            response.status() === STATUS_CODE_SUCCESS
        ) {
            sawUserInfo = true;
        }
    });

    await page.goto(USER_INFO_CLIENT);
    await page.waitForResponse(
        r => r.url() === USER_INFO_SERVER && r.status() === STATUS_CODE_SUCCESS
    );
    expect(sawUserInfo).toBe(true);

    await page.click('button:text("Logout")');
    await page.context().clearCookies();

    let isForbiddenAfter = false;
    page.on("response", response => {
        if (
            response.url() === DASHBOARD_SERVER &&
            response.status() === STATUS_CODE_FORBIDDEN
        ) {
            isForbiddenAfter = true;
        }
    });
    await page.goto(DASHBOARD_CLIENT);
    await page.waitForResponse(
        r => r.url() === DASHBOARD_SERVER && r.status() === STATUS_CODE_FORBIDDEN
    );
    expect(isForbiddenAfter).toBe(true);
});
