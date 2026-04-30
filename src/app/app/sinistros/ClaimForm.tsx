"use client";

import { useActionState } from "react";

import type { ActionState } from "./actions";

type ClientOption = { id: string; name: string };
type PolicyOption = { id: string; policyNo: string };

export function ClaimForm({
  clients,
  policies,
  initialClientId,
  action,
}: {
  clients: ClientOption[];
  policies: PolicyOption[];
  initialClientId?: string;
  action: (
    state: ActionState,
    formData: FormData,
  ) => ActionState | Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultDate = `${yyyy}-${mm}-${dd}`;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Cliente</label>
          <select
            name="clientId"
            required
            defaultValue={initialClientId ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
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
          <div className="text-xs text-muted-foreground">
            Selecione o cliente; para escolher apólice do cliente, abra esta tela
            pelo cliente.
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Apólice</label>
          <select
            name="policyId"
            defaultValue=""
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">Sem apólice</option>
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.policyNo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Data</label>
          <input
            name="occurredAt"
            type="date"
            required
            defaultValue={defaultDate}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Status</label>
          <select
            name="status"
            defaultValue="ABERTO"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="ABERTO">ABERTO</option>
            <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
            <option value="FINALIZADO">FINALIZADO</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">
            Descrição
          </label>
          <textarea
            name="description"
            required
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

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-95 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Cadastrar sinistro"}
      </button>
    </form>
  );
}
