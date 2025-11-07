import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken || !refreshToken.startsWith('mock_refresh_')) {
      return NextResponse.json(
        { message: '无效的刷新令牌' },
        { status: 401 }
      );
    }

    // Extract user ID from refresh token (mock implementation)
    const userId = refreshToken.split('_')[2];

    const response = {
      token: `mock_token_${userId}_${Date.now()}`,
      refreshToken: `mock_refresh_${userId}_${Date.now()}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}