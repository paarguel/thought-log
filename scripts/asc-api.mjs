#!/usr/bin/env node
// Minimal App Store Connect API client for release automation.
// Reads the same key config as the ios-*.sh scripts.
//
// Usage:
//   node scripts/asc-api.mjs GET  /v1/bundleIds?filter[identifier]=com.urbanpyx.thinkingerrors
//   node scripts/asc-api.mjs POST /v1/bundleIds '{"data":{...}}'

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";

const CONFIG = path.join(
  process.env.TEN_IOS_RELEASE_ENV ? path.dirname(process.env.TEN_IOS_RELEASE_ENV) : path.join(homedir(), ".thinking-errors-notepad"),
  "ios-release.env"
);

const env = Object.fromEntries(
  readFileSync(CONFIG, "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      const key = l.slice(0, idx).replace(/^export\s+/, "").trim();
      const value = l.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      return [key, value];
    })
);

const keyPath = env.ASC_KEY_PATH.replace(/^~/, homedir()).replace("$HOME", homedir());
const privateKey = readFileSync(keyPath, "utf8");

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function makeJwt() {
  const header = { alg: "ES256", kid: env.ASC_KEY_ID, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: env.ASC_ISSUER_ID, iat: now, exp: now + 900, aud: "appstoreconnect-v1" };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signer = createSign("SHA256");
  signer.update(signingInput);
  const signature = signer.sign({ key: privateKey, dsaEncoding: "ieee-p1363" });
  return `${signingInput}.${signature.toString("base64url")}`;
}

const [, , method = "GET", route = "/v1/apps", body] = process.argv;
const res = await fetch(`https://api.appstoreconnect.apple.com${route}`, {
  method,
  headers: {
    Authorization: `Bearer ${makeJwt()}`,
    "Content-Type": "application/json",
  },
  body: body || undefined,
});

const text = await res.text();
console.log(`HTTP ${res.status}`);
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}
process.exit(res.ok ? 0 : 1);
