// User from database
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Date | null;
}

// User without password (for client-side)
export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

// Session payload stored in JWT
export interface SessionPayload {
  userId: number;
  email: string;
  role: "admin" | "user";
  exp?: number;
}

// API Response types
export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
}

// Register request body
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Login request body
export interface LoginRequest {
  email: string;
  password: string;
}
