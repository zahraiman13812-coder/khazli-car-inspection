import "dotenv/config";

import {
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const password =
  process.argv[2];

const stored =
  process.env.ADMIN_PASSWORD_HASH;

if (!password) {
  console.error(
    'Usage: node scripts/test-admin-password.mjs "YOUR_PASSWORD"',
  );

  process.exit(1);
}

if (!stored) {
  console.error(
    "ADMIN_PASSWORD_HASH not found.",
  );

  process.exit(1);
}

const parts =
  stored.split(":");

if (
  parts.length !== 6 ||
  parts[0] !== "scrypt"
) {
  console.error(
    "Invalid hash format:",
    stored,
  );

  process.exit(1);
}

const N =
  Number(parts[1]);

const r =
  Number(parts[2]);

const p =
  Number(parts[3]);

const salt =
  Buffer.from(
    parts[4],
    "hex",
  );

const expected =
  Buffer.from(
    parts[5],
    "hex",
  );

const actual =
  scryptSync(
    password,
    salt,
    expected.length,
    {
      N,
      r,
      p,
      maxmem:
        64 * 1024 * 1024,
    },
  );

const valid =
  actual.length ===
    expected.length &&
  timingSafeEqual(
    actual,
    expected,
  );

console.log(
  valid
    ? "PASSWORD MATCH ✅"
    : "PASSWORD DOES NOT MATCH ❌",
);