import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const npmCliPath = process.env.npm_execpath;
const fixtures = [
  {
    id: "native-html",
    directory: "tests/consumers/native-html",
    output: "dist",
    port: 4181,
  },
  {
    id: "react",
    directory: "tests/consumers/react",
    output: "dist",
    port: 4182,
  },
  {
    id: "angular",
    directory: "tests/consumers/angular",
    output: "dist/vyrnforge-angular-consumer-fixture/browser",
    port: 4183,
  },
  { id: "vue", directory: "tests/consumers/vue", output: "dist", port: 4184 },
];

function npmSpawnArguments(args) {
  if (npmCliPath)
    return { command: process.execPath, args: [npmCliPath, ...args] };
  return { command: process.platform === "win32" ? "npm.cmd" : "npm", args };
}

async function waitForServer(url, handle) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (handle.exitCode !== null) {
      throw new Error(`Preview server exited with code ${handle.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stopProcess(handle) {
  if (!handle || handle.exitCode !== null) return;
  if (process.platform === "win32") {
    try {
      execFileSync("taskkill", ["/pid", String(handle.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } catch {
      handle.kill();
    }
    return;
  }
  try {
    process.kill(-handle.pid, "SIGTERM");
  } catch {
    handle.kill("SIGTERM");
  }
}

for (const fixture of fixtures) {
  const output = path.join(repositoryRoot, fixture.directory, fixture.output);
  if (!existsSync(output)) {
    throw new Error(
      `${fixture.id} build output is missing. Run npm run verify:cross-framework-accessibility:runtime -- --preserve-built-fixtures first.`,
    );
  }
}

const servers = [];
let stopping = false;
async function stopAll() {
  if (stopping) return;
  stopping = true;
  await Promise.all(servers.map(({ handle }) => stopProcess(handle)));
}

try {
  for (const fixture of fixtures) {
    const preview = npmSpawnArguments([
      "run",
      "preview",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      String(fixture.port),
      "--strictPort",
    ]);
    const handle = spawn(preview.command, preview.args, {
      cwd: path.join(repositoryRoot, fixture.directory),
      env: process.env,
      stdio: ["ignore", "inherit", "inherit"],
      detached: process.platform !== "win32",
    });
    servers.push({ fixture, handle });
    await waitForServer(`http://127.0.0.1:${fixture.port}`, handle);
  }

  console.log("\nCF-7010 Windows + Chrome + NVDA review URLs:");
  for (const { fixture } of servers) {
    console.log(`- ${fixture.id}: http://127.0.0.1:${fixture.port}`);
  }
  console.log(
    "\nReview the five contracts in docs/testing/cross-framework-accessibility-review.md.",
  );
  console.log(
    "Keep this process open during the NVDA session. Press Ctrl+C when finished.\n",
  );

  await new Promise((resolve) => {
    process.once("SIGINT", resolve);
    process.once("SIGTERM", resolve);
  });
} finally {
  await stopAll();
  console.log("CF-7010 preview servers stopped.");
}
