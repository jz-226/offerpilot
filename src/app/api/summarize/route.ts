import { NextResponse } from "next/server";
import { chat } from "@/lib/ai/deepseek";

export async function POST(req: Request) {
  try {
    const { note, targetRole } = await req.json();
    if (!note || note.length < 10) {
      return NextResponse.json({ error: "内容太短" }, { status: 400 });
    }

    const summary = await chat([
      {
        role: "system",
        content: `你是 OfferPilot 成长导师。用户正在为「${targetRole || "目标岗位"}」努力。请根据用户的学习总结，给一段 2-3 句的鼓励性反馈，指出他今天的学习对目标岗位的哪个能力维度有帮助。不要打分，不要评价好坏，就事论事。用纯文本回复，不要输出 json。`,
      },
      { role: "user", content: `我今天的学习总结：${note}` },
    ], { max_tokens: 300, json: false });

    return NextResponse.json({ summary });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
