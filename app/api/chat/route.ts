import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getChatMessages } from "@/lib/queries/app-data";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const messages = await getChatMessages(80);

  return NextResponse.json({ messages });
}
