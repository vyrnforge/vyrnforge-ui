import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.join(
  fixtureRoot,
  "dist/vyrnforge-angular-consumer-fixture/browser",
);
const argumentsByName = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const argument = process.argv[index];
  if (!argument?.startsWith("--")) continue;
  const value = process.argv[index + 1];
  if (value && !value.startsWith("--")) {
    argumentsByName.set(argument, value);
    index += 1;
  } else {
    argumentsByName.set(argument, "true");
  }
}

const host = argumentsByName.get("--host") ?? "127.0.0.1";
const port = Number.parseInt(argumentsByName.get("--port") ?? "4183", 10);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

if (!existsSync(outputRoot)) {
  throw new Error(`Angular output is missing: ${outputRoot}`);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  const requestedPath = decodeURIComponent(url.pathname);
  const relativePath =
    requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  let candidate = path.resolve(outputRoot, relativePath);

  if (!candidate.startsWith(path.resolve(outputRoot))) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  if (!existsSync(candidate) || statSync(candidate).isDirectory()) {
    candidate = path.join(outputRoot, "index.html");
  }

  response.writeHead(200, {
    "Content-Type":
      contentTypes.get(path.extname(candidate)) ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(candidate).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Angular consumer preview: http://${host}:${port}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
