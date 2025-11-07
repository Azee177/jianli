import { NextRequest, NextResponse } from "next/server";
import { saveResume } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const file = fd.get("file") as File | null;
      const text = (fd.get("text") as string) || "";
      const raw = text || (file ? await file.text() : "");
      const res = saveResume(raw || "EMPTY_RESUME_TEXT");
      return NextResponse.json(res);
    } else {
      const body = await req.json().catch(() => ({}));
      const raw = body.text || "";
      const res = saveResume(raw || "EMPTY_RESUME_TEXT");
      return NextResponse.json(res);
    }
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { message: '简历上传失败' },
      { status: 500 }
    );
  }
}