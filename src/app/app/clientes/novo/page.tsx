import Link from "next/link";

import { ClientForm } from "../ClientForm";
import { createClientAction } from "../actions";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Novo cliente
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre um cliente e depois vincule veículos e apólices.
          </p>
        </div>
        <Link
          href="/app/clientes"
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
        >
          Voltar
        </Link>
      </div>

      <ClientForm action={createClientAction} submitLabel="Cadastrar" />
    </div>
  );
}
