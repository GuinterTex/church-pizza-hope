import { Buffer } from "node:buffer";

async function getServer() {
  const serverModule = await import("../dist/server/server.js");
  const server = serverModule.default ?? serverModule;
  if (typeof server.fetch === "function") return server;
  if (server && typeof server.default?.fetch === "function") return server.default;
  throw new Error("Unable to resolve server fetch handler from dist/server/server.js");
}

function getUrl(req) {
  const host = req.headers.host ?? "localhost";
  const protocol = req.headers["x-forwarded-proto"] ?? (req.socket?.encrypted ? "https" : "http");
  const path = req.url ?? "/";
  return new URL(`${protocol}://${host}${path}`);
}

function getRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") return null;
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function normalizeHeaders(headers = {}) {
  const normalized = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) normalized.append(name, item.toString());
      }
    } else if (value != null) {
      normalized.append(name, value.toString());
    }
  }
  return normalized;
}

function toNodeResponse(response, res) {
  response.headers.forEach((value, name) => {
    if (!res.headersSent) res.setHeader(name, value);
  });
  res.statusCode = response.status;
  return response.arrayBuffer().then((buffer) => {
    res.end(Buffer.from(buffer));
  });
}

export default async function handler(req, res) {
  try {
    const method = (req.method ?? "GET").toUpperCase();
    const requestInit = {
      method,
      headers: normalizeHeaders(req.headers),
    };

    const body = await getRequestBody(req);
    if (body != null && !["GET", "HEAD"].includes(method)) {
      requestInit.body = body;
    }

    const request = new Request(getUrl(req), requestInit);
    const server = await getServer();
    const response = await server.fetch(request, {}, {});
    await toNodeResponse(response, res);
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end("<h1>Internal Server Error</h1>");
  }
}
