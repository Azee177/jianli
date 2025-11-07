import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you would invalidate the token in the database
    // For now, we just return success
    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}