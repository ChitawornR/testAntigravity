import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";
import { ApiResponse } from "@/lib/types";

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json<ApiResponse>(
      { success: true, message: "ออกจากระบบสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}
