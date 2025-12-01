import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { beautifulLog, createSuccessResponse, createBadRequestResponse, createErrorResponse } from '@/lib/beautifulResponse';
import { UserService } from '@/lib/services/UserService';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    beautifulLog.info('🔑 User login request received');
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      beautifulLog.warning('Login validation failed: Missing credentials');
      return NextResponse.json({
        success: false,
        message: '🔐 Login Credentials Required',
        details: {
          required: ['email', 'password'],
          message: 'Please provide both email and password to login'
        },
        suggestions: [
          'Enter your registered email address',
          'Provide your account password',
          'Check your caps lock key'
        ]
      }, { status: 400 });
    }

    if (!email.includes('@') || !email.includes('.')) {
      beautifulLog.warning('Login validation failed: Invalid email format');
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
          'Use the email you registered with'
        ]
      }, { status: 400 });
    }

    // Use professional user service
    const userService = new UserService();
    
    // Find user with beautiful error handling
    const user = await userService.getByEmail(email);
    if (!user) {
      beautifulLog.warning(`Login failed: User not found for email ${email}`);
      return NextResponse.json({
        success: false,
        message: '🔍 Account Not Found',
        details: {
          email: email,
          status: 'not_found',
          message: 'No account found with this email address'
        },
        suggestions: [
          'Check your email spelling',
          'Register for a new account if you haven\'t already',
          'Contact support if you believe this is an error'
        ],
        nextSteps: {
          register: 'Create a new account',
          support: 'Contact support team',
          help: 'Visit help center'
        }
      }, { status: 401 });
    }

    // Check if user is active
    if (!user.isActive) {
      beautifulLog.warning(`Login failed: Account inactive for email ${email}`);
      return NextResponse.json({
        success: false,
        message: '⚠️ Account Inactive',
        details: {
          email: email,
          status: 'inactive',
          message: 'Your account has been deactivated'
        },
        suggestions: [
          'Contact an administrator to reactivate your account',
          'Check your email for reactivation instructions'
        ],
        support: {
          email: 'support@hopebridge.org',
          message: 'Contact our support team for assistance'
        }
      }, { status: 401 });
    }

    // Check password with beautiful response
    const isPasswordValid = await userService.verifyPassword(email, password);
    if (!isPasswordValid) {
      beautifulLog.warning(`Login failed: Invalid password for email ${email}`);
      return NextResponse.json({
        success: false,
        message: '🔒 Incorrect Password',
        details: {
          email: email,
          status: 'invalid_password',
          message: 'The password you entered is incorrect'
        },
        suggestions: [
          'Check your password spelling',
          'Try resetting your password if you can\'t remember',
          'Make sure caps lock is off'
        ],
        nextSteps: {
          forgotPassword: 'Reset your password',
          tryAgain: 'Try logging in again',
          support: 'Contact support'
        }
      }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    beautifulLog.success(`✅ User logged in successfully: ${email}`);
    beautifulLog.api('POST', '/api/auth/login', 200, Date.now() - startTime);

    // Create beautiful success response
    const response = NextResponse.json({
      success: true,
      message: '🎉 Welcome Back! Login Successful',
      details: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          lastLogin: new Date().toISOString()
        },
        session: {
          accessToken: token,
          expiresIn: '7 days',
          tokenType: 'Bearer'
        }
      },
      welcome: {
        greeting: `Welcome back, ${user.name}!`,
        message: 'You have successfully logged into your Hope Bridge account.',
        features: [
          'Access to your dashboard',
          'Project management tools',
          'Team collaboration features',
          'Real-time notifications'
        ]
      },
      nextActions: [
        'Check your dashboard for updates',
        'Review your assigned tasks',
        'Explore project features'
      ]
    }, { status: 200 });

    // Set HTTP-only cookie for session management
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;

  } catch (error: any) {
    beautifulLog.error('🚨 Login error', error);
    beautifulLog.api('POST', '/api/auth/login', 500, Date.now() - startTime);
    
    return createErrorResponse(error, '🚨 Login Failed');
  }
}
