import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    authSecret: Boolean(process.env.AUTH_SECRET?.trim()),
    databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    database: false,
    userCount: 0,
  };

  try {
    checks.userCount = await prisma.user.count();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const ok = checks.authSecret && checks.databaseUrl && checks.database && checks.userCount > 0;

  return NextResponse.json(
    {
      ok,
      message: ok
        ? "Ready"
        : "Run npm run setup on this machine (creates .env and seeds the database).",
      checks,
    },
    { status: ok ? 200 : 503 },
  );
}
