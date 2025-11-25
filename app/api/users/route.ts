import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/UserService";

const userService = new UserService();

// POST - Create new user (registration)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.email || !data.hash || !data.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: firstName, email, hash, role" },
        { status: 400 }
      );
    }

    const user = await userService.createUser({
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email,
      hash: data.hash,
      role: data.role
    });
    
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: user
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

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const users = await userService.getAllUsers();
    
    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
