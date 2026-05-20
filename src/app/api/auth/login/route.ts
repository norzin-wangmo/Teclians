import { NextResponse } from "next/server";
import { isEmailLoginIdentifier } from "@/lib/account-naming";
import { createSession, dashboardPath, verifyCredentials } from "@/lib/auth";
import { validateLoginEmail } from "@/lib/email-policy";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = String(body.email ?? body.identifier ?? "").trim();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json({ error: "Sign-in and password are required" }, { status: 400 });
    }

    if (!process.env.AUTH_SECRET?.trim()) {
      return NextResponse.json(
        {
          error:
            "Server is not configured. Copy .env.example to .env and set AUTH_SECRET, then run npm run setup.",
        },
        { status: 503 },
      );
    }

    if (isEmailLoginIdentifier(identifier)) {
      const email = identifier.toLowerCase();
      const emailError = validateLoginEmail(email);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 403 });
      }
    }

    const user = await verifyCredentials(identifier, password);
    if (!user) {
      const message = isEmailLoginIdentifier(identifier)
        ? "Invalid email or password, or account is not an approved education address"
        : "Invalid student ID or password";
      return NextResponse.json(
        {
          error: `${message} If this is a new machine, run: npm run setup`,
        },
        { status: 401 },
      );
    }

    await createSession(user);
    return NextResponse.json({ redirect: dashboardPath(user.role) });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json(
      {
        error:
          "Login failed due to a server error. On a new computer run: npm install && npm run setup",
      },
      { status: 500 },
    );
  }
}
