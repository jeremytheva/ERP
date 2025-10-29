import { NextResponse } from "next/server";
import { ALL_TASKS } from "@/data/tasks";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ tasks: ALL_TASKS });
}
