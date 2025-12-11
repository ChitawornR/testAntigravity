import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { User, ApiResponse, UserPublic } from "@/lib/types";

// Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const users = await query<User[]>(
      "SELECT id, name, email, role, createdAt, updatedAt FROM users WHERE id = ? AND deleteAt IS NULL",
      [id]
    );

    if (users.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    const user = users[0];
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
    console.error("Get user error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    // Check if user exists
    const existingUsers = await query<User[]>(
      "SELECT id FROM users WHERE id = ? AND deleteAt IS NULL",
      [id]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // Check if email is taken by another user
    if (email) {
      const emailCheck = await query<User[]>(
        "SELECT id FROM users WHERE email = ? AND id != ? AND deleteAt IS NULL",
        [email, id]
      );

      if (emailCheck.length > 0) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password = ?");
      values.push(await hashPassword(password));
    }
    if (role) {
      updates.push("role = ?");
      values.push(role);
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีข้อมูลที่ต้องอัพเดท" },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(", ")}, updatedAt = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json<ApiResponse>(
      { success: true, message: "อัพเดทผู้ใช้สำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}

// Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === session.userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่สามารถลบบัญชีตัวเองได้" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await query<User[]>(
      "SELECT id FROM users WHERE id = ? AND deleteAt IS NULL",
      [id]
    );

    if (existingUsers.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "ไม่พบผู้ใช้งาน" },
        { status: 404 }
      );
    }

    // Soft delete
    await query("UPDATE users SET deleteAt = NOW() WHERE id = ?", [id]);

    return NextResponse.json<ApiResponse>(
      { success: true, message: "ลบผู้ใช้สำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
