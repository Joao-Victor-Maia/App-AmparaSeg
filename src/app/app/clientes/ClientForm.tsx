"use client";

import { useActionState } from "react";

import type { ActionState } from "./actions";

type ClientFormValues = {
  name?: string;
  cpfCnpj?: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: Date | null;
  notes?: string | null;
};

function toDateInputValue(d?: Date | null) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ClientForm({
  initialValues,
  action,
  submitLabel,
}: {
  initialValues?: ClientFormValues;
  action: (
    state: ActionState,
    formData: FormData,
  ) => ActionState | Promise<ActionState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Nome</label>
          <input
            name="name"
            required
            defaultValue={initialValues?.name ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">CPF/CNPJ</label>
          <input
            name="cpfCnpj"
            required
            defaultValue={initialValues?.cpfCnpj ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Telefone</label>
          <input
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">E-mail</label>
          <input
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Data de nascimento
          </label>
          <input
            name="birthDate"
            type="date"
            defaultValue={toDateInputValue(initialValues?.birthDate)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">
            Observações
          </label>
          <textarea
            name="notes"
            defaultValue={initialValues?.notes ?? ""}
            rows={4}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {state?.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {state.error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:opacity-60"
        >
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
