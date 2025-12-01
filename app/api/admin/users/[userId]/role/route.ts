/**
 * Role Management API Endpoint
 * 
 * Handles role assignment and updates for authorized administrators only.
 * Roles are hidden from general users and can only be updated by admins.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";
import { UserRole, canAssignRole, hasPermission } from "@/lib/roles";

// PATCH - Update user role (authorized admins only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const currentUserRole = session.user.role as UserRole;
    const targetUserId = params.userId;

    // Check if current user has permission to manage users
    if (!hasPermission(currentUserRole, 'canManageUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to manage roles"));
    }

    // Parse request body
    const body = await request.json();
    const { role } = body;

    if (!role || !Object.values(['SUPER_ADMIN', 'ADMIN', 'GENERAL_MANAGER', 'PROGRAM_MANAGER', 'PROJECT_COORDINATOR', 'HR', 'FINANCE', 'PROCUREMENT', 'STOREKEEPER', 'ME_OFFICER', 'FIELD_OFFICER', 'ACCOUNTANT', 'USER']).includes(role)) {
      return setCorsHeaders(
        NextResponse.json(
          { success: false, error: "Invalid role provided" },
          { status: 400 }
        )
      );
    }

    // Get target user
    const usersCollection = await getCollection('users');
    const targetUser = await usersCollection.findOne({ 
      _id: new ObjectId(targetUserId) 
    });

    if (!targetUser) {
      return setCorsHeaders(createNotFoundResponse("User not found"));
    }

    // Check if current user can assign this role to this user
    if (!canAssignRole(currentUserRole, role)) {
      return setCorsHeaders(createForbiddenResponse("Cannot assign this role"));
    }

    // Prevent users from modifying their own role (except SUPER_ADMIN)
    if (targetUserId === session.user.id && currentUserRole !== 'SUPER_ADMIN') {
      return setCorsHeaders(
        NextResponse.json(
          { success: false, error: "Cannot modify your own role" },
          { status: 403 }
        )
      );
    }

    // Update user role
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { 
        $set: { 
          role: role,
          updatedAt: new Date(),
          updatedBy: session.user.email
        } 
      }
    );

    if (result.matchedCount === 0) {
      return setCorsHeaders(createNotFoundResponse("User not found"));
    }

    // Log the role change
    const activityCollection = await getCollection('activity');
    await activityCollection.insertOne({
      userId: session.user.email,
      action: 'ROLE_UPDATE',
      entityType: 'user',
      entityId: targetUserId,
      entityName: targetUser.name,
      description: `Updated role for ${targetUser.name} from ${targetUser.role} to ${role}`,
      metadata: {
        previousRole: targetUser.role,
        newRole: role,
        targetUserId: targetUserId,
        targetUserName: targetUser.name,
        performedBy: session.user.email,
        performedByRole: currentUserRole
      },
      createdAt: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Get updated user
    const updatedUser = await usersCollection.findOne({ 
      _id: new ObjectId(targetUserId) 
    });

    const response = createSuccessResponse(
      {
        id: updatedUser?._id?.toString(),
        name: updatedUser?.name,
        email: updatedUser?.email,
        role: updatedUser?.role,
        department: updatedUser?.department,
        isActive: updatedUser?.isActive,
        updatedAt: updatedUser?.updatedAt
      },
      `Role updated successfully for ${updatedUser?.name}`
    );

    return setCorsHeaders(response);

  } catch (error) {
    console.error('Role update error:', error);
    return handleApiError(error, "Updating user role");
  }
}

// GET - Get user role history (authorized admins only)
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required"));
    }

    const currentUserRole = session.user.role as UserRole;
    const targetUserId = params.userId;

    // Check if current user has permission to manage users
    if (!hasPermission(currentUserRole, 'canManageUsers')) {
      return setCorsHeaders(createForbiddenResponse("Insufficient permissions to view role history"));
    }

    // Get role change history
    const activityCollection = await getCollection('activity');
    const roleHistory = await activityCollection
      .find({ 
        entityType: 'user',
        entityId: targetUserId,
        action: 'ROLE_UPDATE'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const response = createSuccessResponse(
      roleHistory,
      `Role history retrieved for user ${targetUserId}`
    );

    return setCorsHeaders(response);

  } catch (error) {
    console.error('Role history error:', error);
    return handleApiError(error, "Fetching role history");
  }
}
