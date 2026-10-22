import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { IMPORT_MAX_BYTES } from "./import.mjs";
import { RegistryError } from "./store.mjs";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(body));
}
async function body(req, limit = 65536) {
  if (req.headers["content-type"]?.split(";")[0].trim() !== "application/json")
    throw new RegistryError(415, "Use application/json.");
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new RegistryError(413, "The request is too large.");
    chunks.push(chunk);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!result || typeof result !== "object") throw new Error();
    return result;
  } catch {
    throw new RegistryError(400, "The request is not valid JSON.");
  }
}
export function createWorkbenchServer({ store, dist, middleware }) {
  return createServer(async (req, res) => {
    try {
      const host = req.headers.host;
      // Loopback-only service. Reject DNS rebinding and cross-site writes, including localhost aliases.
      if (!host || !/^127\.0\.0\.1:\d+$/.test(host))
        return json(res, 403, {
          message: "Use the printed 127.0.0.1 address.",
        });
      if (req.headers.origin && req.headers.origin !== `http://${host}`)
        return json(res, 403, {
          message: "Cross-origin requests are not allowed.",
        });
      if (req.headers["sec-fetch-site"] === "cross-site")
        return json(res, 403, {
          message: "Cross-site requests are not allowed.",
        });
      const url = new URL(req.url, `http://${host}`);
      const path = url.pathname;
      if (path.startsWith("/api/")) {
        if (
          req.method === "POST" &&
          ["/api/import/preview", "/api/import/apply"].includes(path)
        ) {
          const data = await body(req, 2 * IMPORT_MAX_BYTES + 4096);
          return json(
            res,
            200,
            path.endsWith("/preview")
              ? store.previewImport(data?.source, data?.fileName)
              : store.applyImport(data?.source, data?.fileName, data?.token),
          );
        }
        if (req.method === "GET" && path === "/api/inventory/preview")
          return json(res, 200, store.previewInventory());
        if (req.method === "POST" && path === "/api/inventory/apply") {
          const data = await body(req);
          return json(res, 200, store.applyInventory(data.token));
        }
        if (req.method === "GET" && path === "/api/components")
          return json(res, 200, store.list());
        if (req.method === "GET" && path === "/api/export") {
          res.setHeader(
            "Content-Disposition",
            'attachment; filename="design-registry.json"',
          );
          return json(res, 200, {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            components: store.list(),
          });
        }
        if (req.method === "POST" && path === "/api/components") {
          const data = await body(req);
          return json(res, 201, store.save(null, data.record));
        }
        const match = path.match(
          /^\/api\/components\/([a-z0-9-]+)(\/history)?$/,
        );
        if (match && req.method === "GET")
          return json(
            res,
            200,
            match[2] ? store.history(match[1]) : store.get(match[1]),
          );
        if (match && !match[2] && req.method === "PUT") {
          const data = await body(req);
          return json(
            res,
            200,
            store.save(match[1], data.record, data.revision),
          );
        }
        return json(res, 404, { message: "Endpoint not found." });
      }
      if (!["GET", "HEAD"].includes(req.method))
        return json(res, 405, { message: "Method not allowed." });
      if (middleware)
        return middleware(req, res, () =>
          json(res, 404, { message: "Page not found." }),
        );
      const route = [
        "/",
        "/martlet",
        "/martlet/",
        "/krigsvold",
        "/krigsvold/",
      ].includes(path);
      const file = resolve(
        dist,
        route ? "index.html" : `.${decodeURIComponent(path)}`,
      );
      if (!file.startsWith(resolve(dist) + sep))
        return json(res, 404, { message: "File not found." });
      try {
        if (!(await stat(file)).isFile()) throw new Error();
        const bytes = await readFile(file);
        res.writeHead(200, {
          "Content-Type": mime[extname(file)] || "application/octet-stream",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": route ? "no-cache" : "public, max-age=3600",
          "Referrer-Policy": "no-referrer",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
        });
        res.end(req.method === "HEAD" ? undefined : bytes);
      } catch {
        json(res, 404, {
          message: "File not found. Run npm run build before npm start.",
        });
      }
    } catch (error) {
      if (!(error instanceof RegistryError)) console.error(error);
      json(res, error.status ?? 500, {
        message: error.status
          ? error.message
          : "The registry could not save this request. Try again.",
        fields: error.fields,
      });
    }
  });
}
