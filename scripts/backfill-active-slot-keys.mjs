import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not defined.",
  );
}

const adapter =
  new PrismaBetterSqlite3({
    url: databaseUrl,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

async function main() {
  const activeAppointments =
    await prisma.appointment.findMany({
      where: {
        status: {
          in: [
            "pending",
            "confirmed",
          ],
        },
      },

      orderBy: [
        {
          dateKey: "asc",
        },
        {
          time: "asc",
        },
      ],
    });

  const seen =
    new Map();

  const duplicates =
    [];

  for (
    const appointment of
    activeAppointments
  ) {
    const key =
      `${appointment.dateKey}:${appointment.time}`;

    const existing =
      seen.get(key);

    if (existing) {
      duplicates.push({
        key,
        first:
          existing.trackingCode,
        second:
          appointment.trackingCode,
      });

      continue;
    }

    seen.set(
      key,
      appointment,
    );
  }

  if (
    duplicates.length >
    0
  ) {
    console.error("");
    console.error(
      "❌ Active duplicate slots found:",
    );

    console.table(
      duplicates,
    );

    console.error("");
    console.error(
      "Backfill cancelled. Resolve these appointments first.",
    );

    process.exitCode =
      1;

    return;
  }

  let updated =
    0;

  for (
    const appointment of
    activeAppointments
  ) {
    const activeSlotKey =
      `${appointment.dateKey}:${appointment.time}`;

    await prisma.appointment.update({
      where: {
        id:
          appointment.id,
      },

      data: {
        activeSlotKey,
      },
    });

    updated +=
      1;
  }

  console.log("");
  console.log(
    `✅ Backfill completed. Updated ${updated} active appointments.`,
  );
}

main()
  .catch(
    (
      error,
    ) => {
      console.error(
        "BACKFILL_ERROR",
        error,
      );

      process.exitCode =
        1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );