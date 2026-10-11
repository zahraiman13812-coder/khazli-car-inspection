import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ADMIN_CREDENTIAL_ID = "main";
const SESSION_COOKIE_NAME = "khz_admin_session";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must contain at least 32 characters.",
    );
  }

  return secret;
}

function hashSecret(value: string) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(
    value,
    salt,
    SCRYPT_KEY_LENGTH,
    {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: SCRYPT_MAX_MEMORY,
    },
  );

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    derivedKey.toString("hex"),
  ].join(":");
}

export function hashAdminPassword(password: string) {
  return hashSecret(password);
}

function isValidStoredHash(value: string) {
  const parts = value.split(":");

  if (
    parts.length !== 6 ||
    parts[0] !== "scrypt"
  ) {
    return false;
  }

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] =
    parts;

  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (
    !Number.isInteger(N) ||
    !Number.isInteger(r) ||
    !Number.isInteger(p) ||
    N < 2 ||
    r < 1 ||
    p < 1
  ) {
    return false;
  }

  if (
    !/^[a-f0-9]+$/i.test(saltHex) ||
    !/^[a-f0-9]+$/i.test(hashHex)
  ) {
    return false;
  }

  return (
    saltHex.length % 2 === 0 &&
    hashHex.length % 2 === 0
  );
}

function verifySecretAgainstHash(
  value: string,
  storedHash: string,
) {
  if (
    !value ||
    value.length > 512 ||
    !isValidStoredHash(storedHash)
  ) {
    return false;
  }

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] =
    storedHash.split(":");

  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  const salt = Buffer.from(
    saltHex,
    "hex",
  );

  const expectedHash = Buffer.from(
    hashHex,
    "hex",
  );

  if (
    salt.length < 16 ||
    expectedHash.length < 32
  ) {
    return false;
  }

  try {
    const actualHash = scryptSync(
      value,
      salt,
      expectedHash.length,
      {
        N,
        r,
        p,
        maxmem: SCRYPT_MAX_MEMORY,
      },
    );

    if (
      actualHash.length !==
      expectedHash.length
    ) {
      return false;
    }

    return timingSafeEqual(
      actualHash,
      expectedHash,
    );
  } catch (error) {
    console.error(
      "ADMIN_SECRET_VERIFY_ERROR",
      error,
    );

    return false;
  }
}

function getBootstrapPasswordHash() {
  const envHash =
    process.env.ADMIN_PASSWORD_HASH;

  if (
    envHash &&
    isValidStoredHash(envHash)
  ) {
    return envHash;
  }

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    const plainPassword =
      process.env.ADMIN_PASSWORD;

    if (
      plainPassword &&
      plainPassword.length >= 12
    ) {
      return hashAdminPassword(
        plainPassword,
      );
    }
  }

  throw new Error(
    "No valid admin bootstrap password is configured.",
  );
}

async function ensureAdminCredential() {
  const existing =
    await prisma.adminCredential.findUnique({
      where: {
        id: ADMIN_CREDENTIAL_ID,
      },
    });

  if (existing) {
    return existing;
  }

  const bootstrapHash =
    getBootstrapPasswordHash();

  return prisma.adminCredential.upsert({
    where: {
      id: ADMIN_CREDENTIAL_ID,
    },
    update: {},
    create: {
      id: ADMIN_CREDENTIAL_ID,
      passwordHash: bootstrapHash,
      sessionVersion: 1,
    },
  });
}

export async function verifyAdminPassword(
  password: string,
) {
  const credential =
    await ensureAdminCredential();

  return verifySecretAgainstHash(
    password,
    credential.passwordHash,
  );
}

export async function changeAdminPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}) {
  const credential =
    await ensureAdminCredential();

  const currentValid =
    verifySecretAgainstHash(
      currentPassword,
      credential.passwordHash,
    );

  if (!currentValid) {
    return {
      ok: false as const,
      reason:
        "INVALID_CURRENT_PASSWORD" as const,
    };
  }

  const samePassword =
    verifySecretAgainstHash(
      newPassword,
      credential.passwordHash,
    );

  if (samePassword) {
    return {
      ok: false as const,
      reason:
        "SAME_PASSWORD" as const,
    };
  }

  const newHash =
    hashAdminPassword(newPassword);

  const updated =
    await prisma.adminCredential.update({
      where: {
        id: ADMIN_CREDENTIAL_ID,
      },
      data: {
        passwordHash: newHash,
        sessionVersion: {
          increment: 1,
        },
      },
    });

  return {
    ok: true as const,
    sessionVersion:
      updated.sessionVersion,
  };
}

export async function isAppointmentDeletePinConfigured() {
  const credential =
    await ensureAdminCredential();

  return Boolean(
    credential.deletePinHash,
  );
}

export async function verifyAppointmentDeletePin(
  pin: string,
) {
  if (!/^\d{4}$/.test(pin)) {
    return false;
  }

  const credential =
    await ensureAdminCredential();

  if (!credential.deletePinHash) {
    return false;
  }

  return verifySecretAgainstHash(
    pin,
    credential.deletePinHash,
  );
}

export async function setAppointmentDeletePin(
  pin: string,
) {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error(
      "Appointment delete PIN must contain exactly 4 digits.",
    );
  }

  const credential =
    await ensureAdminCredential();

  await prisma.adminCredential.update({
    where: {
      id: credential.id,
    },
    data: {
      deletePinHash:
        hashSecret(pin),
    },
  });
}

function signSessionPayload(
  payload: string,
) {
  return createHmac(
    "sha256",
    getSessionSecret(),
  )
    .update(payload)
    .digest("hex");
}

function safeCompareHex(
  first: string,
  second: string,
) {
  if (
    !/^[a-f0-9]+$/i.test(first) ||
    !/^[a-f0-9]+$/i.test(second) ||
    first.length % 2 !== 0 ||
    second.length % 2 !== 0
  ) {
    return false;
  }

  const firstBuffer = Buffer.from(
    first,
    "hex",
  );
  const secondBuffer = Buffer.from(
    second,
    "hex",
  );

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    firstBuffer,
    secondBuffer,
  );
}

async function createSessionToken() {
  const credential =
    await ensureAdminCredential();

  const expiresAt =
    Math.floor(Date.now() / 1000) +
    SESSION_MAX_AGE_SECONDS;

  const version =
    credential.sessionVersion;

  const payload =
    `${expiresAt}.${version}`;

  const signature =
    signSessionPayload(payload);

  return `${payload}.${signature}`;
}

async function verifySessionToken(
  token: string,
) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [
    expiresAtRaw,
    versionRaw,
    receivedSignature,
  ] = parts;

  const expiresAt = Number(
    expiresAtRaw,
  );
  const tokenVersion = Number(
    versionRaw,
  );

  if (
    !Number.isInteger(expiresAt) ||
    !Number.isInteger(tokenVersion)
  ) {
    return false;
  }

  const now = Math.floor(
    Date.now() / 1000,
  );

  if (expiresAt <= now) {
    return false;
  }

  if (
    expiresAt >
    now +
      SESSION_MAX_AGE_SECONDS +
      60
  ) {
    return false;
  }

  const credential =
    await ensureAdminCredential();

  if (
    tokenVersion !==
    credential.sessionVersion
  ) {
    return false;
  }

  const payload =
    `${expiresAtRaw}.${versionRaw}`;

  const expectedSignature =
    signSessionPayload(payload);

  return safeCompareHex(
    receivedSignature,
    expectedSignature,
  );
}

export async function createAdminSession() {
  const token =
    await createSessionToken();

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "strict",
      path: "/",
      maxAge:
        SESSION_MAX_AGE_SECONDS,
    },
  );
}

export async function clearAdminSession() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    },
  );
}

export async function isAdminAuthenticated() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

  if (!token) {
    return false;
  }

  try {
    return await verifySessionToken(
      token,
    );
  } catch (error) {
    console.error(
      "ADMIN_SESSION_VERIFY_ERROR",
      error,
    );

    return false;
  }
}

export async function requireAdmin() {
  const authenticated =
    await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}
