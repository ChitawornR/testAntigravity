import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { User, LoginRequest, ApiResponse, UserPublic } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 }
      );
    }

    // Find user by email
    const users = await query<User[]>(
      "SELECT * FROM users WHERE email = ? AND deleteAt IS NULL",
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // Create session
    await createSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    const userPublic: UserPublic = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json<ApiResponse<UserPublic>>(
      { success: true, message: "เข้าสู่ระบบสำเร็จ", data: userPublic },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
