import {
  createHmac,
} from "node:crypto";

import {
  prisma,
} from "@/lib/prisma";

/*
 * ============================================================
 * CONFIG
 * ============================================================
 */

const WINDOW_MS =
  15 * 60 * 1000;

const BLOCK_MS =
  30 * 60 * 1000;

const MAX_FAILURES =
  5;

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export type LoginGuardResult = {
  allowed:
    boolean;

  retryAfterSeconds:
    number;
};

/*
 * ============================================================
 * CLIENT IP
 * ============================================================
 */

function getClientIp(
  request: Request,
) {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    const first =
      forwarded
        .split(",")[0]
        ?.trim();

    if (first) {
      return first;
    }
  }

  const realIp =
    request.headers.get(
      "x-real-ip",
    );

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/*
 * IP خام داخل Database ذخیره نمی‌شود.
 */
export function createLoginGuardKey(
  request: Request,
) {
  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured.",
    );
  }

  const ip =
    getClientIp(
      request,
    );

  return createHmac(
    "sha256",
    secret,
  )
    .update(
      `admin-login:${ip}`,
    )
    .digest(
      "hex",
    );
}

/*
 * ============================================================
 * CHECK
 * ============================================================
 */

export async function checkAdminLoginGuard(
  key: string,
): Promise<LoginGuardResult> {
  const now =
    new Date();

  const guard =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key,
      },
    });

  if (!guard) {
    return {
      allowed:
        true,

      retryAfterSeconds:
        0,
    };
  }

  if (
    guard.blockedUntil &&
    guard.blockedUntil >
      now
  ) {
    const retryAfterSeconds =
      Math.max(
        1,

        Math.ceil(
          (
            guard.blockedUntil.getTime() -
            now.getTime()
          ) /
            1000,
        ),
      );

    return {
      allowed:
        false,

      retryAfterSeconds,
    };
  }

  /*
   * Window قدیمی است.
   */
  if (
    now.getTime() -
      guard.windowStartedAt.getTime() >
    WINDOW_MS
  ) {
    await prisma.adminLoginGuard.update({
      where: {
        key,
      },

      data: {
        failures:
          0,

        windowStartedAt:
          now,

        blockedUntil:
          null,
      },
    });
  }

  return {
    allowed:
      true,

    retryAfterSeconds:
      0,
  };
}

/*
 * ============================================================
 * FAILURE
 * ============================================================
 */

export async function recordAdminLoginFailure(
  key: string,
) {
  const now =
    new Date();

  const existing =
    await prisma.adminLoginGuard.findUnique({
      where: {
        key,
      },
    });

  /*
   * اولین تلاش ناموفق
   */
  if (!existing) {
    await prisma.adminLoginGuard.create({
      data: {
        key,

        failures:
          1,

        windowStartedAt:
          now,

        blockedUntil:
          null,
      },
    });

    return;
  }

  const windowExpired =
    now.getTime() -
      existing.windowStartedAt.getTime() >
    WINDOW_MS;

  const failures =
    windowExpired
      ? 1
      : existing.failures +
        1;

  const blockedUntil =
    failures >=
    MAX_FAILURES
      ? new Date(
          now.getTime() +
            BLOCK_MS,
        )
      : null;

  await prisma.adminLoginGuard.update({
    where: {
      key,
    },

    data: {
      failures,

      windowStartedAt:
        windowExpired
          ? now
          : existing.windowStartedAt,

      blockedUntil,
    },
  });
}

/*
 * ============================================================
 * SUCCESS
 * ============================================================
 */

export async function clearAdminLoginFailures(
  key: string,
) {
  await prisma.adminLoginGuard.deleteMany({
    where: {
      key,
    },
  });
}