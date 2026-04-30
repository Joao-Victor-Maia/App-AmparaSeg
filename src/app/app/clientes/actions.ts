"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const clientSchema = z.object({
  name: z.string().min(2),
  cpfCnpj: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function toDate(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export type ActionState = { error?: string } | null;

export async function createClientAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    cpfCnpj: formData.get("cpfCnpj"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) return { error: "Dados inválidos. Verifique os campos." };

  try {
    const created = await prisma.client.create({
      data: {
        name: parsed.data.name.trim(),
        cpfCnpj: parsed.data.cpfCnpj.trim(),
        email: parsed.data.email ? parsed.data.email.trim() : null,
        phone: parsed.data.phone ? parsed.data.phone.trim() : null,
        birthDate: toDate(parsed.data.birthDate) ?? null,
        notes: parsed.data.notes ? parsed.data.notes.trim() : null,
      },
    });
    revalidatePath("/app/clientes");
    redirect(`/app/clientes/${created.id}`);
    return null;
  } catch {
    return { error: "Não foi possível salvar. CPF/CNPJ pode já existir." };
  }
}

export async function updateClientAction(
  clientId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    cpfCnpj: formData.get("cpfCnpj"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    birthDate: formData.get("birthDate") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) return { error: "Dados inválidos. Verifique os campos." };

  try {
    await prisma.client.update({
      where: { id: clientId },
      data: {
        name: parsed.data.name.trim(),
        cpfCnpj: parsed.data.cpfCnpj.trim(),
        email: parsed.data.email ? parsed.data.email.trim() : null,
        phone: parsed.data.phone ? parsed.data.phone.trim() : null,
        birthDate: toDate(parsed.data.birthDate) ?? null,
        notes: parsed.data.notes ? parsed.data.notes.trim() : null,
      },
    });
    revalidatePath("/app/clientes");
    revalidatePath(`/app/clientes/${clientId}`);
    redirect(`/app/clientes/${clientId}`);
    return null;
  } catch {
    return { error: "Não foi possível salvar. CPF/CNPJ pode já existir." };
  }
}

const vehicleSchema = z.object({
  plate: z.string().min(6),
  brand: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  year: z.string().optional().or(z.literal("")),
  renavam: z.string().optional().or(z.literal("")),
});

export async function addVehicleAction(clientId: string, formData: FormData) {
  await requireSession();

  const parsed = vehicleSchema.safeParse({
    plate: formData.get("plate"),
    brand: formData.get("brand") ?? "",
    model: formData.get("model") ?? "",
    year: formData.get("year") ?? "",
    renavam: formData.get("renavam") ?? "",
  });

  if (!parsed.success) {
    redirect(`/app/clientes/${clientId}?erroVeiculo=1`);
  }

  const year =
    parsed.data.year && parsed.data.year.trim()
      ? Number(parsed.data.year.trim())
      : null;

  await prisma.vehicle.create({
    data: {
      clientId,
      plate: parsed.data.plate.trim().toUpperCase(),
      brand: parsed.data.brand ? parsed.data.brand.trim() : null,
      model: parsed.data.model ? parsed.data.model.trim() : null,
      year: Number.isFinite(year) ? year : null,
      renavam: parsed.data.renavam ? parsed.data.renavam.trim() : null,
    },
  });

  revalidatePath(`/app/clientes/${clientId}`);
  redirect(`/app/clientes/${clientId}`);
}

export async function deleteVehicleAction(vehicleId: string, clientId: string) {
  await requireSession();
  await prisma.vehicle.delete({ where: { id: vehicleId } });
  revalidatePath(`/app/clientes/${clientId}`);
  redirect(`/app/clientes/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  await requireSession();
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath("/app/clientes");
  redirect("/app/clientes");
}
