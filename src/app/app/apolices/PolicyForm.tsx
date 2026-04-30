"use client";

import { useActionState } from "react";

import type { ActionState } from "./actions";

type ClientOption = { id: string; name: string };

type PolicyFormValues = {
  clientId?: string;
  insurer?: string;
  policyType?: string;
  policyNo?: string;
  startDate?: Date;
  endDate?: Date;
  premium?: string | null;
  status?: string;
};

function toDateInputValue(d?: Date | null) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PolicyForm({
  clients,
  initialValues,
  action,
  submitLabel,
}: {
  clients: ClientOption[];
  initialValues?: PolicyFormValues;
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
      <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-zinc-900">Cliente</label>
          <select
            name="clientId"
            required
            defaultValue={initialValues?.clientId ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Seguradora</label>
          <input
            name="insurer"
            required
            defaultValue={initialValues?.insurer ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Tipo</label>
          <input
            name="policyType"
            required
            defaultValue={initialValues?.policyType ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">
            Número da apólice
          </label>
          <input
            name="policyNo"
            required
            defaultValue={initialValues?.policyNo ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Status</label>
          <select
            name="status"
            defaultValue={initialValues?.status ?? "ATIVA"}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          >
            <option value="ATIVA">ATIVA</option>
            <option value="VENCIDA">VENCIDA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Início</label>
          <input
            name="startDate"
            type="date"
            required
            defaultValue={toDateInputValue(initialValues?.startDate)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Vencimento</label>
          <input
            name="endDate"
            type="date"
            required
            defaultValue={toDateInputValue(initialValues?.endDate)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-900">Prêmio</label>
          <input
            name="premium"
            inputMode="decimal"
            defaultValue={initialValues?.premium ?? ""}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
          />
        </div>
      </div>

      {state?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}
