"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const claimSchema = z.object({
  clientId: z.string().uuid(),
  policyId: z.string().uuid().optional().or(z.literal("")),
  occurredAt: z.string().min(4),
  description: z.string().min(3),
  status: z.string().min(2),
});

function toDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("invalid date");
  return d;
}

export type ActionState = { error?: string } | null;

export async function createClaimAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = claimSchema.safeParse({
    clientId: formData.get("clientId"),
    policyId: formData.get("policyId") ?? "",
    occurredAt: formData.get("occurredAt"),
    description: formData.get("description"),
    status: formData.get("status") ?? "ABERTO",
  });

  if (!parsed.success) return { error: "Dados inválidos. Verifique os campos." };

  await prisma.claim.create({
    data: {
      clientId: parsed.data.clientId,
      policyId: parsed.data.policyId ? parsed.data.policyId : null,
      occurredAt: toDate(parsed.data.occurredAt),
      description: parsed.data.description.trim(),
      status: parsed.data.status.trim(),
    },
  });

  revalidatePath("/app/sinistros");
  redirect("/app/sinistros");
  return null;
}

export async function deleteClaimAction(claimId: string) {
  await requireSession();
  await prisma.claim.delete({ where: { id: claimId } });
  revalidatePath("/app/sinistros");
  redirect("/app/sinistros");
}
