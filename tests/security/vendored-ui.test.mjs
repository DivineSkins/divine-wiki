import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

// Checks on the vendored @divineskins/ui tarball (see vendor/README.md). If a
// package update fails one, look at the new tarball, then update the lists.

const ALLOWED_FILES = [
  /^package\/package\.json$/,
  /^package\/README\.md$/,
  /^package\/bin\/divine-ui\.mjs$/,
  /^package\/dist\/index\.(js|d\.ts)$/,
  /^package\/(tailwind|themes|tokens)\.css$/,
  /^package\/tailwind-preset\.cjs$/,
  /^package\/tokens\/tokens\.json$/,
  /^package\/skills\/divine-ui\/[\w/-]+\.md$/,
];

const INSTALL_SCRIPTS = [
  "preinstall",
  "install",
  "postinstall",
  "prepare",
  "preprepare",
  "postprepare",
];

// A UI library has no reason to reach the network or spawn processes.
const FORBIDDEN_IN_BUNDLE = [
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bsendBeacon\b/,
  /\bimportScripts\b/,
  /\bimport\s*\(/,
  /\bchild[_]process\b/,
];

/** Files of a .tgz as { path: Buffer }. Handles ustar prefixes and pax paths. */
function readTarball(file) {
  const tar = gunzipSync(readFileSync(file));
  const files = {};
  let paxPath;
  for (let at = 0; at + 512 <= tar.length;) {
    const header = tar.subarray(at, at + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, length) =>
      header.toString("utf8", start, start + length).replace(/\0.*$/s, "");
    const size = parseInt(field(124, 12).trim() || "0", 8);
    const type = field(156, 1);
    const body = tar.subarray(at + 512, at + 512 + size);
    const prefix = field(345, 155);
    const name =
      paxPath ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    paxPath = undefined;
    if (type === "x") {
      paxPath = /(?:^|\n)\d+ path=([^\n]+)\n/.exec(body.toString("utf8"))?.[1];
    } else if (type === "0" || type === "") {
      files[name] = body;
    } else if (type !== "5" && type !== "g") {
      assert.fail(`${name} is a tar entry of type "${type}", expected files`);
    }
    at += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}

const tarballs = readdirSync("vendor").filter((name) => name.endsWith(".tgz"));
const tarball = `vendor/${tarballs[0]}`;
const files = readTarball(tarball);
const manifest = JSON.parse(files["package/package.json"].toString("utf8"));

test("vendor/ holds one @divineskins/ui tarball, and package.json uses it", () => {
  assert.equal(tarballs.length, 1, `expected one .tgz, found ${tarballs}`);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.dependencies["@divineskins/ui"], `file:${tarball}`);
  assert.equal(manifest.name, "@divineskins/ui");
});

test("the lockfile pins the tarball's actual bytes", () => {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const entry = lock.packages["node_modules/@divineskins/ui"];
  const sha512 = createHash("sha512")
    .update(readFileSync(tarball))
    .digest("base64");
  assert.equal(entry.resolved, `file:${tarball}`);
  assert.equal(entry.integrity, `sha512-${sha512}`);
});

test("the tarball ships only the expected files", () => {
  const unexpected = Object.keys(files).filter(
    (path) => !ALLOWED_FILES.some((pattern) => pattern.test(path)),
  );
  assert.deepEqual(unexpected, []);
  for (const [path, body] of Object.entries(files)) {
    if (path.endsWith(".js") || path.endsWith(".css")) {
      assert.doesNotMatch(body.toString("utf8"), /sourceMappingURL/, path);
    }
  }
});

test("the package runs nothing on install and brings no dependencies", () => {
  for (const script of INSTALL_SCRIPTS) {
    assert.equal(manifest.scripts?.[script], undefined, `scripts.${script}`);
  }
  for (const field of [
    "dependencies",
    "optionalDependencies",
    "bundleDependencies",
    "bundledDependencies",
  ]) {
    assert.equal(
      manifest[field],
      undefined,
      `${field} would install more code`,
    );
  }
});

test("the bundle makes no network or process calls", () => {
  const bundle = files["package/dist/index.js"].toString("utf8");
  for (const pattern of FORBIDDEN_IN_BUNDLE) {
    assert.doesNotMatch(bundle, pattern);
  }
});
