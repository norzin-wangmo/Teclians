import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public list of institutions for student sign-up. */
export async function GET() {
  const schools = await prisma.school.findMany({
    select: {
      id: true,
      name: true,
      university: true,
      institutionLevel: true,
      collegeCode: true,
      district: true,
      emailDomain: true,
    },
    orderBy: [{ institutionLevel: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ schools });
}
