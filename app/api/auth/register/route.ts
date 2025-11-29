import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getProfessionalDatabase } from '@/lib/professionalDatabase';
import { beautifulLog, createSuccessResponse, createBadRequestResponse, createErrorResponse } from '@/lib/beautifulResponse';
import { UserService } from '@/lib/services/UserService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    beautifulLog.info('🔐 User registration request received');
    
    const { name, email, password, role = 'USER' } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      beautifulLog.warning('Registration validation failed: Missing required fields');
      return NextResponse.json({
        success: false,
        message: '📝 Registration Information Required',
        details: {
          required: ['name', 'email', 'password'],
          message: 'Please provide all required information to create your account'
        },
        suggestions: [
          'Enter your full name',
          'Provide a valid email address',
          'Create a strong password (minimum 8 characters)'
        ]
      }, { status: 400 });
    }

    if (password.length < 8) {
      beautifulLog.warning('Registration validation failed: Password too short');
      return NextResponse.json({
        success: false,
        message: '🔒 Password Too Short',
        details: {
          minLength: 8,
          currentLength: password.length,
          message: 'Password must be at least 8 characters long for security'
        },
        suggestions: [
          'Use at least 8 characters',
          'Include uppercase and lowercase letters',
          'Add numbers and special characters for stronger security'
        ]
      }, { status: 400 });
    }

    if (!email.includes('@') || !email.includes('.')) {
      beautifulLog.warning('Registration validation failed: Invalid email format');
      return NextResponse.json({
        success: false,
        message: '📧 Invalid Email Address',
        details: {
          provided: email,
          message: 'Please provide a valid email address'
        },
        suggestions: [
          'Check your email spelling',
          'Include the @ symbol and domain',
          'Example: user@domain.com'
        ]
      }, { status: 400 });
    }

    // Use professional database and user service
    const userService = new UserService();
    
    // Check if user already exists with beautiful response
    const existingUser = await userService.getByEmail(email);
    if (existingUser) {
      beautifulLog.warning(`Registration failed: Email ${email} already exists`);
      
      // Check if user is logged in (has active sessions)
      if (existingUser.isActive) {
        return NextResponse.json({
          success: false,
          message: '📧 Email Already Registered',
          details: {
            email: email,
            status: 'registered',
            message: 'This email address is already registered in our system',
            registeredAt: existingUser.createdAt,
            lastLogin: existingUser.updatedAt
          },
          suggestions: [
            'Try logging in with your existing account',
            'Use the "Forgot Password" option if you cannot remember your password',
            'Contact support if you need assistance with your account'
          ],
          nextSteps: {
            login: 'Go to login page',
            forgotPassword: 'Reset your password',
            support: 'Contact support team'
          }
        }, { status: 409 });
      } else {
        // User is inactive - suggest reactivation
        return NextResponse.json({
          success: false,
          message: '⚠️ Account Inactive',
          details: {
            email: email,
            status: 'inactive',
            message: 'Your account exists but is currently inactive'
          },
          suggestions: [
            'Contact an administrator to reactivate your account',
            'Check your email for activation instructions'
          ]
        }, { status: 403 });
      }
    }

    // Create user with professional service
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      isActive: true,
      emailVerified: false
    };

    const newUser = await userService.createUser(userData);
    
    beautifulLog.success(`✨ User registered successfully: ${email}`);
    beautifulLog.api('POST', '/api/auth/register', 201, Date.now() - startTime);

    // Return beautiful success response
    return NextResponse.json({
      success: true,
      message: '🎉 Welcome to Hope Bridge! Account Created Successfully',
      details: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          emailVerified: newUser.emailVerified,
          createdAt: newUser.createdAt
        },
        registrationInfo: {
          timestamp: new Date().toISOString(),
          status: 'completed',
          nextSteps: [
            'Check your email for verification instructions',
            'Log in to access your account',
            'Complete your profile information'
          ]
        }
      },
      welcome: {
        greeting: `Hello ${newUser.name}!`,
        message: 'Your account has been created successfully. Welcome to the Hope Bridge platform!',
        features: [
          'Access to project management tools',
          'Collaboration features',
          'Real-time notifications',
          'Professional dashboard'
        ]
      }
    }, { status: 201 });

  } catch (error: any) {
    beautifulLog.error('🚨 Registration error', error);
    beautifulLog.api('POST', '/api/auth/register', 500, Date.now() - startTime);
    
    // Check for specific error types
    if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
      return NextResponse.json({
        success: false,
        message: '📧 Email Already Registered',
        details: {
          error: 'duplicate_email',
          message: 'This email address is already in use'
        },
        suggestions: [
          'Try logging in with your existing account',
          'Use a different email address',
          'Contact support if you believe this is an error'
        ]
      }, { status: 409 });
    }

    return createErrorResponse(error, '🚨 Registration Failed');
  }
}
