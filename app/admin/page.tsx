"use client";

import { useState, useEffect } from "react";
import { UserPublic } from "@/lib/types";

interface Stats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminCount: 0,
    userCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        const users: UserPublic[] = data.data;
        setStats({
          totalUsers: users.length,
          adminCount: users.filter((u) => u.role === "admin").length,
          userCount: users.filter((u) => u.role === "user").length,
        });
        setRecentUsers(users.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60 mt-1">ภาพรวมของระบบ</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-linear-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 shadow-xl shadow-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">
                ผู้ใช้ทั้งหมด
              </p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-indigo-200 text-sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            ไม่รวม admin ของคุณ
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-xl shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">ผู้ดูแลระบบ</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.adminCount}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-purple-200 text-sm">
            มีสิทธิ์จัดการทั้งหมด
          </div>
        </div>

        <div className="bg-linear-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-xl shadow-emerald-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-200 text-sm font-medium">ผู้ใช้งาน</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.userCount}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-emerald-200 text-sm">
            ผู้ใช้ทั่วไปในระบบ
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">ผู้ใช้ล่าสุด</h2>
          <p className="text-white/50 text-sm mt-1">
            ผู้ใช้ที่ลงทะเบียนล่าสุด 5 คน
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  ผู้ใช้
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  บทบาท
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-white/50"
                  >
                    ยังไม่มีผู้ใช้ในระบบ
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {u.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          u.role === "admin"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {u.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {new Date(u.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
