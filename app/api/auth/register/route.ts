import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = 'USER' } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      name,
      email,
      passwordHash: hashedPassword,
      role,
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(user);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'User registered successfully',
      details: {
        ...userWithoutPassword,
        _id: result.insertedId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
