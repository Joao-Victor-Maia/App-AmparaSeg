"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, verifyAdminCredentials } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
});

export type LoginState = { error?: string } | null;

export async function loginAction(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    return { error: "Preencha e-mail e senha corretamente." };
  }

  const ok = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!ok) return { error: "Credenciais inválidas." };

  await createSession(parsed.data.email);
  redirect(parsed.data.next?.startsWith("/") ? parsed.data.next : "/app");
  return null;
}
