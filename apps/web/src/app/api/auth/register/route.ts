import { NextRequest, NextResponse } from 'next/server';
import { User, AuthResponse } from '@/types/auth';

// Mock user database (in real app, this would be in a database)
const mockUsers: Array<User & { password: string }> = [];

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { message: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: 'free',
        features: ['basic_editing', 'single_project'],
      },
    };

    mockUsers.push(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    const response: AuthResponse = {
      user: userWithoutPassword,
      token: `mock_token_${newUser.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${newUser.id}_${Date.now()}`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}