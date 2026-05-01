import { createReadStream, existsSync, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { Readable } from "node:stream";

const port = Number(process.env.PORT || "3000");
const host = process.env.HOST || "0.0.0.0";
const clientDir = join(process.cwd(), "dist", "client");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getMimeType(filePath) {
  return MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
}

function loadEnvFile(fileName) {
  const filePath = join(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const rawContents = readFileSync(filePath, "utf-8");

  for (const line of rawContents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();

    if (!key || process.env[key]) {
      continue;
    }

    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const { default: app } = await import("./dist/server/index.js");

function toNodeHeaders(headers) {
  const nodeHeaders = {};

  headers.forEach((value, key) => {
    nodeHeaders[key] = value;
  });

  return nodeHeaders;
}

function toWebRequest(req) {
  const origin = process.env.APP_ORIGIN || `http://${req.headers.host || `127.0.0.1:${port}`}`;
  const url = new URL(req.url || "/", origin);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      headers.set(key, value);
    }
  }

  const init = {
    method: req.method,
    headers,
  };

  if (req.method && req.method !== "GET" && req.method !== "HEAD") {
    init.body = Readable.toWeb(req);
    init.duplex = "half";
  }

  return new Request(url, init);
}

async function sendWebResponse(res, response) {
  res.writeHead(response.status, toNodeHeaders(response.headers));

  if (!response.body) {
    res.end();
    return;
  }

  Readable.fromWeb(response.body).pipe(res);
}

function resolveStaticPath(pathname) {
  const cleanedPath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = normalize(cleanedPath)
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  const absolutePath = join(clientDir, normalizedPath);

  if (!absolutePath.startsWith(clientDir)) {
    return null;
  }

  return absolutePath;
}

async function tryServeStatic(req, res) {
  if (!req.url) {
    return false;
  }

  const pathname = new URL(req.url, `http://${req.headers.host || `127.0.0.1:${port}`}`).pathname;
  const staticPath = resolveStaticPath(pathname);

  if (!staticPath || !existsSync(staticPath)) {
    return false;
  }

  const fileStats = await stat(staticPath).catch(() => null);

  if (!fileStats || !fileStats.isFile()) {
    return false;
  }

  res.writeHead(200, {
    "cache-control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=300",
    "content-length": String(fileStats.size),
    "content-type": getMimeType(staticPath),
  });

  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  createReadStream(staticPath).pipe(res);
  return true;
}

const server = createServer(async (req, res) => {
  try {
    if (await tryServeStatic(req, res)) {
      return;
    }

    const request = toWebRequest(req);
    const response = await app.fetch(request);
    await sendWebResponse(res, response);
  } catch (error) {
    console.error("Erro ao processar requisicao", error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Erro interno do servidor.");
  }
});

server.listen(port, host, () => {
  console.log(`VP Requisicoes Pro rodando em http://${host}:${port}`);
});
