import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { resume_id, jd_id } = await req.json();
    
    if (!resume_id || !jd_id) {
      return NextResponse.json(
        { message: "resume_id 和 jd_id 不能为空" }, 
        { status: 400 }
      );
    }
    
    const task = createTask(resume_id, jd_id);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Pipeline run error:', error);
    return NextResponse.json(
      { message: '流水线启动失败' },
      { status: 500 }
    );
  }
}