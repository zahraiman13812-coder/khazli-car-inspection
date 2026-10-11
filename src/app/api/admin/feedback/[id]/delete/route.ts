import {
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  isAdminAuthenticated,
} from "@/lib/admin-auth";

import {
  prisma,
} from "@/lib/prisma";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const ADMIN_CREDENTIAL_ID =
  "main";

const GUARD_KEY =
  "feedback-delete-pin";

const WINDOW_MS =
  10 *
  60 *
  1000;

const BLOCK_MS =
  15 *
  60 *
  1000;

const MAX_FAILURES =
  5;

const SCRYPT_MAX_MEMORY =
  64 *
  1024 *
  1024;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DeleteBody = {
  pin?:
    unknown;
};

function isSameOriginRequest(
  request: Request,
) {
  const fetchSite =
    request.headers.get(
      "sec-fetch-site",
    );

  if (
    fetchSite ===
    "cross-site"
  ) {
    return false;
  }

  const origin =
    request.headers.get(
      "origin",
    );

  if (
    !origin
  ) {
    return true;
  }

  try {
    const originUrl =
      new URL(
        origin,
      );

    const forwardedHost =
      request.headers
        .get(
          "x-forwarded-host",
        )
        ?.split(",")[0]
        ?.trim();

    const host =
      forwardedHost ||
      request.headers.get(
        "host",
      );

    if (
      !host
    ) {
      return false;
    }

    return originUrl.host ===
      host;
  } catch {
    return false;
  }
}

function isValidStoredHash(
  value: string,
) {
  const parts =
    value.split(
      ":",
    );

  if (
    parts.length !==
      6 ||
    parts[0] !==
      "scrypt"
  ) {
    return false;
  }

  const [
    ,
    nRaw,
    rRaw,
    pRaw,
    saltHex,
    hashHex,
  ] =
    parts;

  const N =
    Number(
      nRaw,
    );

  const r =
    Number(
      rRaw,
    );

  const p =
    Number(
      pRaw,
    );

  return (
    Number.isInteger(
      N,
    ) &&
    Number.isInteger(
      r,
    ) &&
    Number.isInteger(
      p,
    ) &&
    N >=
      2 &&
    r >=
      1 &&
    p >=
      1 &&
    /^[a-f0-9]+$/i.test(
      saltHex,
    ) &&
    /^[a-f0-9]+$/i.test(
      hashHex,
    ) &&
    saltHex.length %
      2 ===
      0 &&
    hashHex.length %
      2 ===
      0
  );
}

function verifyPinAgainstHash(
  pin: string,
  storedHash: string,
) {
  if (
    !/^\d{4}$/.test(
      pin,
    ) ||
    !isValidStoredHash(
      storedHash,
    )
  ) {
    return false;
  }

  const [
    ,
    nRaw,
    rRaw,
    pRaw,
    saltHex,
    hashHex,
  ] =
    storedHash.split(
      ":",
    );

  const N =
    Number(
      nRaw,
    );

  const r =
    Number(
      rRaw,
    );

  const p =
    Number(
      pRaw,
    );

  const salt =
    Buffer.from(
      saltHex,
      "hex",
    );

  const expectedHash =
    Buffer.from(
      hashHex,
      "hex",
    );

  if (
    salt.length <
      16 ||
    expectedHash.length <
      32
  ) {
    return false;
  }

  try {
    const actualHash =
      scryptSync(
        pin,
        salt,
        expectedHash.length,
        {
          N,
          r,
          p,

          maxmem:
            SCRYPT_MAX_MEMORY,
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
  } catch (
    error
  ) {
    console.error(
      "FEEDBACK_DELETE_PIN_VERIFY_ERROR",
      error,
    );

    return false;
  }
}

async function getCurrentGuard() {
  return prisma.adminLoginGuard.findUnique({
    where: {
      key:
        GUARD_KEY,
    },
  });
}

async function clearGuard() {
  const now =
    new Date();

  await prisma.adminLoginGuard.upsert({
    where: {
      key:
        GUARD_KEY,
    },

    update: {
      failures:
        0,

      windowStartedAt:
        now,

      blockedUntil:
        null,
    },

    create: {
      key:
        GUARD_KEY,

      failures:
        0,

      windowStartedAt:
        now,

      blockedUntil:
        null,
    },
  });
}

async function registerFailedAttempt() {
  const now =
    new Date();

  const guard =
    await getCurrentGuard();

  const insideWindow =
    Boolean(
      guard &&
        now.getTime() -
          guard.windowStartedAt.getTime() <=
          WINDOW_MS,
    );

  const failures =
    insideWindow &&
    guard
      ? guard.failures +
        1
      : 1;

  const shouldBlock =
    failures >=
    MAX_FAILURES;

  const blockedUntil =
    shouldBlock
      ? new Date(
          now.getTime() +
            BLOCK_MS,
        )
      : null;

  await prisma.adminLoginGuard.upsert({
    where: {
      key:
        GUARD_KEY,
    },

    update: {
      failures,

      windowStartedAt:
        insideWindow &&
        guard
          ? guard.windowStartedAt
          : now,

      blockedUntil,
    },

    create: {
      key:
        GUARD_KEY,

      failures,

      windowStartedAt:
        now,

      blockedUntil,
    },
  });

  return {
    failures,
    shouldBlock,
  };
}

export async function POST(
  request: Request,
  {
    params,
  }: RouteContext,
) {
  try {
    const authenticated =
      await isAdminAuthenticated();

    if (
      !authenticated
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "دسترسی غیرمجاز است.",
        },
        {
          status:
            401,
        },
      );
    }

    if (
      !isSameOriginRequest(
        request,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "درخواست نامعتبر است.",
        },
        {
          status:
            403,
        },
      );
    }

    const guard =
      await getCurrentGuard();

    const now =
      new Date();

    if (
      guard?.blockedUntil &&
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

      return NextResponse.json(
        {
          ok:
            false,

          code:
            "PIN_BLOCKED",

          message:
            "به‌دلیل چند تلاش ناموفق، حذف موقتاً قفل شده است.",

          retryAfterSeconds,
        },
        {
          status:
            429,

          headers: {
            "Retry-After":
              String(
                retryAfterSeconds,
              ),
          },
        },
      );
    }

    let body:
      DeleteBody;

    try {
      body =
        (await request.json()) as DeleteBody;
    } catch {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "بدنه درخواست معتبر نیست.",
        },
        {
          status:
            400,
        },
      );
    }

    const pin =
      typeof body.pin ===
      "string"
        ? body.pin.trim()
        : "";

    if (
      !/^\d{4}$/.test(
        pin,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "INVALID_PIN_FORMAT",

          message:
            "کد حذف باید دقیقاً ۴ رقم باشد.",
        },
        {
          status:
            400,
        },
      );
    }

    const credential =
      await prisma.adminCredential.findUnique({
        where: {
          id:
            ADMIN_CREDENTIAL_ID,
        },

        select: {
          deletePinHash:
            true,
        },
      });

    if (
      !credential?.deletePinHash
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "DELETE_PIN_NOT_SET",

          message:
            "کد حذف تنظیم نشده است. ابتدا از بخش امنیت، کد ۴ رقمی حذف را تنظیم کنید.",
        },
        {
          status:
            409,
        },
      );
    }

    const pinValid =
      verifyPinAgainstHash(
        pin,
        credential.deletePinHash,
      );

    if (
      !pinValid
    ) {
      const failed =
        await registerFailedAttempt();

      if (
        failed.shouldBlock
      ) {
        return NextResponse.json(
          {
            ok:
              false,

            code:
              "PIN_BLOCKED",

            message:
              "تعداد تلاش‌های ناموفق بیش از حد مجاز بود. حذف برای ۱۵ دقیقه قفل شد.",

            retryAfterSeconds:
              Math.ceil(
                BLOCK_MS /
                  1000,
              ),
          },
          {
            status:
              429,

            headers: {
              "Retry-After":
                String(
                  Math.ceil(
                    BLOCK_MS /
                      1000,
                  ),
                ),
            },
          },
        );
      }

      return NextResponse.json(
        {
          ok:
            false,

          code:
            "INVALID_DELETE_PIN",

          message:
            "کد ۴ رقمی حذف صحیح نیست.",

          remainingAttempts:
            Math.max(
              0,
              MAX_FAILURES -
                failed.failures,
            ),
        },
        {
          status:
            403,
        },
      );
    }

    await clearGuard();

    const {
      id,
    } =
      await params;

    const existing =
      await prisma.feedback.findUnique({
        where: {
          id,
        },

        select: {
          id:
            true,
        },
      });

    if (
      !existing
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          message:
            "پیام پیدا نشد.",
        },
        {
          status:
            404,
        },
      );
    }

    await prisma.feedback.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok:
        true,

      message:
        "پیام برای همیشه حذف شد.",
    });
  } catch (
    error
  ) {
    console.error(
      "ADMIN_FEEDBACK_DELETE_ERROR",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          "حذف پیام با خطا مواجه شد.",
      },
      {
        status:
          500,
      },
    );
  }
}
