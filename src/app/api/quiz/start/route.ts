import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/quiz/start — 创建任务，立即返回 taskId
export async function POST(req: Request) {
  try {
    const { resourceName, resourceType, targetRole, dimensions } = await req.json();
    if (!resourceName) return NextResponse.json({ error: "缺少 resourceName" }, { status: 400 });

    const supabase = await createClient();
    const { data: task, error } = await supabase.from("quiz_tasks").insert({
      resource: resourceName,
      role: targetRole || "",
      dimensions: dimensions || [],
      status: "pending",
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ taskId: task.id, status: "pending" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
