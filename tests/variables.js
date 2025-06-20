import { test, expect } from "@playwright/test";

export const DASHBOARD_SERVER = "http://localhost:5000/dashboard";
export const DASHBOARD_CLIENT = "http://localhost:3000/dashboard";
export const REGISTER_SERVER = "http://localhost:5000/register";
export const REGISTER_CLIENT = "http://localhost:3000/register";
export const LOGIN_SERVER = "http://localhost:5000/login";
export const LOGIN_CLIENT = "http://localhost:3000/login";

export const STATUS_CODE_FORBIDDEN = 403;
export const STATUS_CODE_BAD_REQUEST = 400;
export const STATUS_CODE_CREATED = 201;
export const STATUS_CODE_SUCCESS = 200;