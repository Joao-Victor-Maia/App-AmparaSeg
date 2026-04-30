"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const policySchema = z.object({
  clientId: z.string().uuid(),
  insurer: z.string().min(2),
  policyType: z.string().min(2),
  policyNo: z.string().min(2),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  premium: z.string().optional().or(z.literal("")),
  status: z.string().min(2),
});

function toDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("invalid date");
  return d;
}

export type ActionState = { error?: string } | null;

export async function createPolicyAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const parsed = policySchema.safeParse({
    clientId: formData.get("clientId"),
    insurer: formData.get("insurer"),
    policyType: formData.get("policyType"),
    policyNo: formData.get("policyNo"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    premium: formData.get("premium") ?? "",
    status: formData.get("status") ?? "ATIVA",
  });

  if (!parsed.success) return { error: "Dados inválidos. Verifique os campos." };

  try {
    const created = await prisma.policy.create({
      data: {
        clientId: parsed.data.clientId,
        insurer: parsed.data.insurer.trim(),
        policyType: parsed.data.policyType.trim(),
        policyNo: parsed.data.policyNo.trim(),
        startDate: toDate(parsed.data.startDate),
        endDate: toDate(parsed.data.endDate),
        premium: parsed.data.premium?.trim() ? parsed.data.premium.trim() : null,
        status: parsed.data.status.trim(),
      },
    });
    revalidatePath("/app/apolices");
    redirect(`/app/apolices/${created.id}`);
    return null;
  } catch {
    return {
      error: "Não foi possível salvar. Verifique se a apólice já existe.",
    };
  }
}

export async function updatePolicyAction(
  policyId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const parsed = policySchema.safeParse({
    clientId: formData.get("clientId"),
    insurer: formData.get("insurer"),
    policyType: formData.get("policyType"),
    policyNo: formData.get("policyNo"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    premium: formData.get("premium") ?? "",
    status: formData.get("status") ?? "ATIVA",
  });

  if (!parsed.success) return { error: "Dados inválidos. Verifique os campos." };

  try {
    await prisma.policy.update({
      where: { id: policyId },
      data: {
        clientId: parsed.data.clientId,
        insurer: parsed.data.insurer.trim(),
        policyType: parsed.data.policyType.trim(),
        policyNo: parsed.data.policyNo.trim(),
        startDate: toDate(parsed.data.startDate),
        endDate: toDate(parsed.data.endDate),
        premium: parsed.data.premium?.trim() ? parsed.data.premium.trim() : null,
        status: parsed.data.status.trim(),
      },
    });
    revalidatePath("/app/apolices");
    revalidatePath(`/app/apolices/${policyId}`);
    redirect(`/app/apolices/${policyId}`);
    return null;
  } catch {
    return {
      error: "Não foi possível salvar. Verifique se a apólice já existe.",
    };
  }
}

export async function deletePolicyAction(policyId: string) {
  await requireSession();
  await prisma.policy.delete({ where: { id: policyId } });
  revalidatePath("/app/apolices");
  redirect("/app/apolices");
}

export async function uploadPolicyPdfAction(policyId: string, formData: FormData) {
  await requireSession();

  const file = formData.get("pdf");
  if (!file || !(file instanceof File) || file.size === 0) {
    redirect(`/app/apolices/${policyId}?erroPdf=1`);
  }
  if (file.type !== "application/pdf") {
    redirect(`/app/apolices/${policyId}?erroPdf=2`);
  }

  const blob = await put(`apolices/${policyId}/${file.name}`, file, {
    access: "public",
  });

  await prisma.policy.update({
    where: { id: policyId },
    data: { pdfUrl: blob.url, pdfFileName: file.name },
  });

  revalidatePath(`/app/apolices/${policyId}`);
  redirect(`/app/apolices/${policyId}`);
}

export async function removePolicyPdfAction(policyId: string) {
  await requireSession();
  await prisma.policy.update({
    where: { id: policyId },
    data: { pdfUrl: null, pdfFileName: null },
  });
  revalidatePath(`/app/apolices/${policyId}`);
  redirect(`/app/apolices/${policyId}`);
}
