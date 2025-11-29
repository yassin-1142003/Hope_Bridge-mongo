import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/UserService";

const userService = new UserService();

// GET - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const users = await userService.getAll();
    
    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      data: users
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
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

    const user = await userService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
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
