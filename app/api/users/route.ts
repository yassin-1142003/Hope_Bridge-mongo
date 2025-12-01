import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { 
  createSuccessResponse, 
  createUnauthorizedResponse, 
  handleApiError, 
  setCorsHeaders 
} from "@/lib/apiResponse";

// Handle OPTIONS method for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// GET - Get all users for task assignment
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return setCorsHeaders(createUnauthorizedResponse("Authentication required to access users"));
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const isActive = searchParams.get("isActive") !== "false"; // Default to true
    
    const usersCollection = await getCollection('users');
    
    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (typeof isActive === 'boolean') query.isActive = isActive;
    
    // Fetch users with selected fields
    const users = await usersCollection
      .find(query)
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        department: 1,
        isActive: 1,
        avatar: 1
      })
      .sort({ name: 1 })
      .toArray();
    
    // Transform users to match the expected format
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      avatar: user.avatar
    }));
    
    const response = createSuccessResponse(
      transformedUsers,
      `Successfully retrieved ${transformedUsers.length} users`,
      {
        count: transformedUsers.length,
        filters: { 
          role: role || undefined, 
          department: department || undefined,
          isActive: isActive
        } as any
      }
    );
    
    return setCorsHeaders(response);
  } catch (error) {
    return handleApiError(error, "Fetching users");
  }
}

// POST - Create new user (registration)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.password || !data.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, password, role" },
        { status: 400 }
      );
    }

    // For now, return a mock response since we don't have UserService
    const mockUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: mockUser
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof Error && error.message === "This email is already registered") {
      return NextResponse.json(
        { success: false, error: "This email is already registered" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
