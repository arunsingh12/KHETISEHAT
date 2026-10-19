/**
 * Builds a self-contained bundle for cPanel's "Setup Node.js App" and puts
 * it in deploy/khetisehat-cpanel/ (plus a .zip next to it). Upload the zip,
 * extract it in the app root, set the environment variables in cPanel and
 * restart — no `npm install` or build needed on the server.
 * See docs/deploy-cpanel.md.
 *
 * Run with: npm run build:cpanel
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "deploy", "khetisehat-cpanel");
const zipPath = path.join(root, "deploy", "khetisehat-cpanel.zip");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: { ...process.env, BUILD_TARGET: "cpanel" } });
}

// --skip-build re-packages the last build without rebuilding.
if (!process.argv.includes("--skip-build")) {
  run("npx prisma generate");
  run("npx next build");
}

const standalone = path.join(root, ".next", "standalone");
if (!fs.existsSync(path.join(standalone, "server.js"))) {
  throw new Error("No .next/standalone/server.js — is output: 'standalone' set for BUILD_TARGET=cpanel?");
}

console.log(`\nAssembling ${path.relative(root, outDir)}…`);
fs.rmSync(path.join(root, "deploy"), { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
// The standalone output links some packages (e.g. @prisma/client) back into
// node_modules; copy the real files so the zip works on the server.
fs.cpSync(standalone, outDir, { recursive: true, dereference: true });

// cpSync's `dereference` only applies to the top-level source: nested
// symlinks — like Turbopack's .next/node_modules/@prisma/client-<hash> alias
// — get copied as links rewritten to an absolute path on *this* machine,
// which doesn't exist on the server ("Cannot find package
// '@prisma/client-…'"). Replace every remaining link with the real files.
function materializeSymlinks(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      const target = fs.realpathSync(p);
      fs.rmSync(p);
      fs.cpSync(target, p, { recursive: true, dereference: true });
      console.log(`  inlined link ${path.relative(outDir, p)}`);
    } else if (entry.isDirectory()) {
      materializeSymlinks(p);
    }
  }
}
materializeSymlinks(outDir);
// The standalone server serves these itself once they're copied in.
fs.cpSync(path.join(root, "public"), path.join(outDir, "public"), { recursive: true });
fs.cpSync(path.join(root, ".next", "static"), path.join(outDir, ".next", "static"), { recursive: true });

// Secrets come from cPanel's environment variables, never from a file in the upload.
for (const name of fs.readdirSync(outDir)) {
  if (name === ".env" || (name.startsWith(".env.") && name !== ".env.example")) {
    fs.rmSync(path.join(outDir, name));
    console.log(`  removed ${name}`);
  }
}
// The Windows/macOS query engine is useless on the Linux server.
const prismaDir = path.join(outDir, "src", "generated", "prisma");
if (fs.existsSync(prismaDir)) {
  for (const name of fs.readdirSync(prismaDir)) {
    if (/^(query_engine-windows|libquery_engine-darwin)/.test(name) || name.includes(".tmp")) {
      fs.rmSync(path.join(prismaDir, name));
    }
  }
  // At runtime the bundled client looks for its engine in <app>/.prisma/client
  // and <app>/src/generated — not in src/generated/prisma where tracing puts
  // it ("could not locate the Query Engine"). Move the engines there.
  const engineDir = path.join(outDir, ".prisma", "client");
  fs.mkdirSync(engineDir, { recursive: true });
  const engines = fs.readdirSync(prismaDir).filter((n) => n.includes("query_engine"));
  for (const name of engines) fs.renameSync(path.join(prismaDir, name), path.join(engineDir, name));
  console.log(`  Prisma engines in .prisma/client: ${engines.join(", ") || "NONE — check binaryTargets"}`);
}

// bsdtar ships with Windows 10+ and macOS; `-a` picks zip from the extension.
// On Windows, name it explicitly — Git Bash's GNU tar may be first on PATH.
const tar = process.platform === "win32" ? `"${process.env.SystemRoot}\\System32\\tar.exe"` : "tar";
try {
  execSync(`${tar} -a -c -f "${zipPath}" -C "${outDir}" .`, { stdio: "inherit" });
  console.log(`\nDone: ${path.relative(root, zipPath)} (${(fs.statSync(zipPath).size / 1e6).toFixed(1)} MB)`);
} catch {
  console.log(`\nDone: ${path.relative(root, outDir)} (zip it yourself — tar wasn't available)`);
}
