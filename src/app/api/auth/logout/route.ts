import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

async function logout(request: Request) {
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}

export async function GET(request: Request) {
  return logout(request);
}

export async function POST(request: Request) {
  return logout(request);
}
