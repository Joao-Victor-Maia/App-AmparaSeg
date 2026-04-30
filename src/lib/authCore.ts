import { jwtVerify, SignJWT } from "jose";

export type SessionPayload = {
  email: string;
};

export function getAuthSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return new TextEncoder().encode("dev-auth-secret-change-me");
    }
    throw new Error("AUTH_SECRET não configurado.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  const key = getAuthSecretKey();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifySession(token: string) {
  const key = getAuthSecretKey();
  const { payload } = await jwtVerify(token, key);
  return payload as unknown as SessionPayload;
}
