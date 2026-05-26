// Central API client. All backend calls go through here so components/hooks
// never call fetch() directly. Prefixes /api, attaches the auth token, parses
// JSON, and throws a descriptive Error on non-OK responses.
import { getToken } from "../lib/session";

const BASE = "/api";

async function request(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(BASE + path, { method, headers, body: payload });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, body) => request(path, { method: "POST", body });
export const apiPatch = (path, body) =>
  request(path, { method: "PATCH", body });
export const apiDelete = (path) => request(path, { method: "DELETE" });
export const apiUpload = (path, formData) =>
  request(path, { method: "POST", body: formData });
