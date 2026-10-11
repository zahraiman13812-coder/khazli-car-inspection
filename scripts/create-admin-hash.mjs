import "dotenv/config";

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const password =
  process.env.ADMIN_PASSWORD;

if (!password) {
  console.error(
    "❌ ADMIN_PASSWORD داخل .env پیدا نشد.",
  );

  process.exit(1);
}

if (password.length < 12) {
  console.error(
    "❌ رمز مدیریت باید حداقل ۱۲ کاراکتر باشد.",
  );

  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;

const salt =
  randomBytes(16);

const derivedKey =
  scryptSync(
    password,
    salt,
    64,
    {
      N,
      r,
      p,
      maxmem:
        64 * 1024 * 1024,
    },
  );

const result = [
  "scrypt",
  N,
  r,
  p,
  salt.toString("hex"),
  derivedKey.toString("hex"),
].join(":");

/*
 * Self-test before showing the hash.
 */
const [
  algorithm,
  storedN,
  storedR,
  storedP,
  storedSalt,
  storedHash,
] =
  result.split(":");

if (
  algorithm !== "scrypt"
) {
  throw new Error(
    "Hash format error.",
  );
}

const verificationKey =
  scryptSync(
    password,
    Buffer.from(
      storedSalt,
      "hex",
    ),
    Buffer.from(
      storedHash,
      "hex",
    ).length,
    {
      N:
        Number(
          storedN,
        ),

      r:
        Number(
          storedR,
        ),

      p:
        Number(
          storedP,
        ),

      maxmem:
        64 * 1024 * 1024,
    },
  );

const expected =
  Buffer.from(
    storedHash,
    "hex",
  );

const valid =
  verificationKey.length ===
    expected.length &&
  timingSafeEqual(
    verificationKey,
    expected,
  );

if (!valid) {
  console.error(
    "❌ Self-test failed.",
  );

  process.exit(1);
}

console.log("");
console.log(
  "✅ HASH SELF-TEST PASSED",
);

console.log("");
console.log(
  `ADMIN_PASSWORD_HASH="${result}"`,
);

console.log("");
console.log(
  "فعلاً ADMIN_PASSWORD را حذف نکن.",
);