import { UserService } from "@/lib/services/UserService";
import { NextResponse } from "next/server";

const userService = new UserService();

async function signupUsr(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    if (!data.firstName || !data.email || !data.hash || !data.role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newUser = await userService.createUser({
      firstName: data.firstName,
      lastName: data.lastName || null,
      email: data.email,
      hash: data.hash,
      role: data.role
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: newUser
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error in signup:", error);
    
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

export const POST = signupUsr;
