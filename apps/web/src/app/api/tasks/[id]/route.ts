import { NextRequest, NextResponse } from "next/server";
import { getTask } from "@/lib/store";

export async function GET(
  _req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const t = getTask(params.id);
    
    if (!t) {
      return NextResponse.json(
        { message: "任务不存在" }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(t);
  } catch (error) {
    console.error('Task get error:', error);
    return NextResponse.json(
      { message: '获取任务状态失败' },
      { status: 500 }
    );
  }
}