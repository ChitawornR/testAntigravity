import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
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

    // Get user data from database
    const users = await query<User[]>(
      "SELECT * FROM users WHERE id = ? AND deleteAt IS NULL",
      [session.userId]
    );

    if (users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    const user = users[0];

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
      { success: true, data: userPublic },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
