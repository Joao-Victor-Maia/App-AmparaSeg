import Link from "next/link";

import { ClientForm } from "../ClientForm";
import { createClientAction } from "../actions";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Novo cliente
          </h1>
          <p className="text-sm text-zinc-600">
            Cadastre um cliente e depois vincule veículos, apólices e sinistros.
          </p>
        </div>
        <Link
          href="/app/clientes"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>

      <ClientForm action={createClientAction} submitLabel="Cadastrar" />
    </div>
  );
}
