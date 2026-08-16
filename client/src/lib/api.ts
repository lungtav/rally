import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiErrorBody } from "../types";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = config?.url ?? "";

    const isAuthRoute = url.includes("/auth/");
    const shouldRetry =
      status === 401 && config && !config._retry && !isAuthRoute;

    if (shouldRetry) {
      config._retry = true;
      try {
        const { data } = await axios.post<{ accessToken: string }>(
          "/api/v1/auth/refresh",
          null,
          { withCredentials: true },
        );
        accessToken = data.accessToken;
        config.headers.Authorization = `Bearer ${accessToken}`;
        return api(config);
      } catch {
        accessToken = null;
        if (window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) {
      return body.error.message;
    }
    if (err.code === "ERR_NETWORK") {
      return "Cannot reach the server. Is it running?";
    }
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong";
}

export function getErrorCode(err: unknown): string | undefined {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    return body?.error?.code;
  }
  return undefined;
}