import "dotenv/config";

import {
  randomBytes,
  scryptSync,
} from "node:crypto";

const password =
  process.env.ADMIN_PASSWORD;

if (!password) {
  console.error(
    "ADMIN_PASSWORD داخل .env پیدا نشد.",
  );

  process.exit(1);
}

if (password.length < 12) {
  console.error(
    "رمز ادمین باید حداقل ۱۲ کاراکتر باشد.",
  );

  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;

const salt =
  randomBytes(16);

const hash =
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
  hash.toString("hex"),
].join(":");

console.log("");
console.log(
  "این خط را داخل .env قرار بده:",
);

console.log("");
console.log(
  `ADMIN_PASSWORD_HASH="${result}"`,
);

console.log("");