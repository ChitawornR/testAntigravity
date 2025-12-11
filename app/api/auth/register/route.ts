import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { User, RegisterRequest, ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
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
      [name, email, hashedPassword, "user"]
    );

    return NextResponse.json<ApiResponse>(
      { success: true, message: "ลงทะเบียนสำเร็จ" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาดในการลงทะเบียน" },
      { status: 500 }
    );
  }
}
