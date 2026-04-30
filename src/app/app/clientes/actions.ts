"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
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

export type ImportClientsState =
  | {
      error?: string;
      total?: number;
      created?: number;
      updated?: number;
      skipped?: number;
      rowErrors?: Array<{ row: number; message: string }>;
    }
  | null;

function normalizeHeader(value: unknown) {
  const s = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return s.replace(/[^a-z0-9]+/g, " ").trim();
}

function pickCell(row: unknown[], headerIndex: Record<string, number>, keys: string[]) {
  for (const key of keys) {
    const idx = headerIndex[key];
    if (typeof idx === "number") return row[idx];
  }
  return undefined;
}

function toText(value: unknown) {
  const s = String(value ?? "").trim();
  return s === "" ? null : s;
}

function parseBirthDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  const s = String(value).trim();
  if (!s) return null;

  const iso = new Date(s);
  if (!Number.isNaN(iso.getTime())) return iso;

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
    const d = new Date(year, month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export async function importClientsAction(
  _: ImportClientsState,
  formData: FormData,
): Promise<ImportClientsState> {
  await requireSession();

  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo Excel (.xlsx ou .xls)." };
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
    return { error: "Envie um arquivo .xlsx ou .xls." };
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { error: "Planilha vazia." };
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  const headerRow = rows[0];
  if (!Array.isArray(headerRow) || headerRow.length === 0) {
    return { error: "Não encontrei o cabeçalho na primeira linha." };
  }

  const headerIndex: Record<string, number> = {};
  headerRow.forEach((h, idx) => {
    const key = normalizeHeader(h);
    if (key) headerIndex[key] = idx;
  });

  const nameKeys = ["nome", "name", "cliente", "razao social", "razao", "segurado"];
  const cpfKeys = ["cpf", "cnpj", "cpf cnpj", "cpf cnpj", "cpf/cnpj", "documento", "cpfcnpj"];
  const emailKeys = ["email", "e mail", "e-mail"];
  const phoneKeys = ["telefone", "celular", "fone", "contato", "whatsapp"];
  const birthKeys = [
    "data nascimento",
    "nascimento",
    "data de nascimento",
    "dt nascimento",
    "aniversario",
  ];
  const notesKeys = ["observacoes", "observacao", "obs", "anotacoes", "notas", "notes"];

  const dataRows = rows.slice(1);
  const rowErrors: Array<{ row: number; message: string }> = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2;
    const row = dataRows[i];
    if (!Array.isArray(row)) continue;

    const rawName = pickCell(row, headerIndex, nameKeys);
    const rawCpf = pickCell(row, headerIndex, cpfKeys);
    const rawEmail = pickCell(row, headerIndex, emailKeys);
    const rawPhone = pickCell(row, headerIndex, phoneKeys);
    const rawBirth = pickCell(row, headerIndex, birthKeys);
    const rawNotes = pickCell(row, headerIndex, notesKeys);

    const clientName = toText(rawName);
    const cpfCnpj = toText(rawCpf);
    if (!clientName || !cpfCnpj) {
      skipped += 1;
      if (rowErrors.length < 20) {
        rowErrors.push({
          row: rowNumber,
          message: "Nome e CPF/CNPJ são obrigatórios.",
        });
      }
      continue;
    }

    const email = toText(rawEmail);
    const phone = toText(rawPhone);
    const birthDate = parseBirthDate(rawBirth);
    const notes = toText(rawNotes);

    try {
      const existing = await prisma.client.findUnique({
        where: { cpfCnpj: cpfCnpj.trim() },
        select: { id: true },
      });

      await prisma.client.upsert({
        where: { cpfCnpj: cpfCnpj.trim() },
        create: {
          name: clientName.trim(),
          cpfCnpj: cpfCnpj.trim(),
          email: email ? email.trim() : null,
          phone: phone ? phone.trim() : null,
          birthDate,
          notes: notes ? notes.trim() : null,
        },
        update: {
          name: clientName.trim(),
          email: email ? email.trim() : null,
          phone: phone ? phone.trim() : null,
          birthDate,
          notes: notes ? notes.trim() : null,
        },
      });

      if (existing) updated += 1;
      else created += 1;
    } catch {
      skipped += 1;
      if (rowErrors.length < 20) {
        rowErrors.push({
          row: rowNumber,
          message: "Não foi possível importar esta linha.",
        });
      }
    }
  }

  revalidatePath("/app/clientes");
  return {
    total: dataRows.length,
    created,
    updated,
    skipped,
    rowErrors: rowErrors.length ? rowErrors : undefined,
  };
}

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
