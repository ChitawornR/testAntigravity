import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { User, ApiResponse, UserPublic } from "@/lib/types";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่ได้เข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // Get all users (excluding deleted and current admin)
    const users = await query<User[]>(
      "SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE deleteAt IS NULL AND id != ? ORDER BY createdAt DESC",
      [session.userId]
    );

    // Map to public users (without password)
    const usersPublic: UserPublic[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json<ApiResponse<UserPublic[]>>(
      { success: true, data: usersPublic },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUsers = await query<User[]>(
      "SELECT id FROM users WHERE email = ? AND deleteAt IS NULL",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    await query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    return NextResponse.json<ApiResponse>(
      { success: true, message: "สร้างผู้ใช้สำเร็จ" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
