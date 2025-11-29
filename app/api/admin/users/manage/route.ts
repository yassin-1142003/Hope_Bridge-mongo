import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  createSuccessResponse, 
  createCreatedResponse, 
  createBadRequestResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { UserRole, ROLE_DISPLAY_NAMES, canAssignRole, hasPermission } from "@/lib/roles";
import { UserService } from "@/lib/services/UserService";

const userService = new UserService();

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all users with role information (for role assignment)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, 'canManageUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to manage users"));
    }

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role") as UserRole;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let users;
    if (roleFilter) {
      users = await userService.getUsersByRole(roleFilter);
    } else {
      users = await userService.getAll();
    }

    // Add role display names
    const usersWithRoles = users.map(user => ({
      ...user,
      roleDisplayName: ROLE_DISPLAY_NAMES[user.role],
      canBeAssignedBy: canAssignRole(userRole, user.role)
    }));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = usersWithRoles.slice(startIndex, endIndex);

    return setCorsHeaders(createSuccessResponse({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: usersWithRoles.length,
        pages: Math.ceil(usersWithRoles.length / limit)
      },
      availableRoles: Object.entries(ROLE_DISPLAY_NAMES).map(([role, name]) => ({
        role,
        displayName: name,
        canAssign: canAssignRole(userRole, role as UserRole)
      }))
    }));
    
  } catch (error) {
    console.error("Error getting users:", error);
    return setCorsHeaders(handleApiError(error));
  }
}

// POST - Create new user with role assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, 'canManageUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to create users"));
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return setCorsHeaders(createBadRequestResponse("Missing required fields: name, email, password, role"));
    }

    // Check if the user can assign this role
    if (!canAssignRole(userRole, body.role)) {
      return setCorsHeaders(createForbiddenResponse(`Role '${userRole}' cannot assign role '${body.role}'`));
    }

    const user = await userService.createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      isActive: body.isActive ?? true,
      emailVerified: body.emailVerified ?? false
    });
    
    return setCorsHeaders(createCreatedResponse({
      ...user,
      roleDisplayName: ROLE_DISPLAY_NAMES[user.role]
    }));
    
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof Error && error.message.includes("already exists")) {
      return setCorsHeaders(createBadRequestResponse("User with this email already exists"));
    }
    
    return setCorsHeaders(handleApiError(error));
  }
}

// PATCH - Update user role
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const userRole = session.user.role as UserRole;
    
    if (!hasPermission(userRole, 'canAssignRoles')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to assign roles"));
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.newRole) {
      return setCorsHeaders(createBadRequestResponse("Missing required fields: userId, newRole"));
    }

    // Check if the user can assign this role
    if (!canAssignRole(userRole, body.newRole)) {
      return setCorsHeaders(createForbiddenResponse(`Role '${userRole}' cannot assign role '${body.newRole}'`));
    }

    const updatedUser = await userService.updateUserRole(body.userId, body.newRole, userRole);
    
    if (!updatedUser) {
      return setCorsHeaders(createNotFoundResponse("User not found"));
    }
    
    return setCorsHeaders(createSuccessResponse({
      ...updatedUser,
      roleDisplayName: ROLE_DISPLAY_NAMES[updatedUser.role]
    }));
    
  } catch (error) {
    console.error("Error updating user role:", error);
    
    if (error instanceof Error && error.message.includes("cannot assign role")) {
      return setCorsHeaders(createForbiddenResponse(error.message));
    }
    
    return setCorsHeaders(handleApiError(error));
  }
}
