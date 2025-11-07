import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/types/auth';

// Mock user data (in real app, this would come from database)
const mockUser: User = {
  id: 'user_1',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  subscription: {
    plan: 'pro',
    features: ['ai_suggestions', 'unlimited_projects', 'export_pdf'],
  },
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: '未授权' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Mock token validation (in real app, verify JWT token)
    if (!token.startsWith('mock_token_')) {
      return NextResponse.json(
        { message: '无效的令牌' },
        { status: 401 }
      );
    }

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}