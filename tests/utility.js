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

export async function register(request, user = USER) {
    const response = await request.post(REGISTER_SERVER, {
        data: { username: user.username, password: user.password }
    });
    expect(response.status()).toBe(STATUS_CODE_CREATED);
    return response.json();
}

export async function login(request, user = USER) {
  const response = await request.post(LOGIN_SERVER, {
    data: { username: user.username, password: user.password },
  });
  expect(response.status()).toBe(STATUS_CODE_SUCCESS);
  return response.json();
}