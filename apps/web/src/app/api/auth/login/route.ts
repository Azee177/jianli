import { NextRequest, NextResponse } from 'next/server';
import { User, AuthResponse } from '@/types/auth';

// Mock user database
const mockUsers: Array<User & { password: string }> = [
  {
    id: 'user_1',
    email: 'demo@example.com',
    name: 'Demo User',
    password: 'password123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    subscription: {
      plan: 'pro',
      features: ['ai_suggestions', 'unlimited_projects', 'export_pdf'],
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    const user = mockUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token: `mock_token_${user.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}