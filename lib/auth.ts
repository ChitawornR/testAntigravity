import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "./types";

// Secret key for JWT signing (should be in .env)
const secretKey =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

// Session cookie settings
const SESSION_COOKIE_NAME = "session";
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

// Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

// Create JWT token
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY}s`)
    .sign(encodedKey);
}

// Verify JWT token
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Create session (set cookie)
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();

  // Use SECURE_COOKIES env var to control secure flag
  // Set SECURE_COOKIES=true only when using HTTPS
  const isSecure = process.env.SECURE_COOKIES === "true";

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: SESSION_EXPIRY,
    path: "/",
  });
}

// Get session from cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get session for middleware (without next/headers)
export async function getSessionFromToken(
  token: string
): Promise<SessionPayload | null> {
  return verifyToken(token);
}
