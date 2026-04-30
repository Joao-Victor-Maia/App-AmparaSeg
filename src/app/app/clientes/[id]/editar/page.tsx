import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ClientForm } from "../../ClientForm";
import { updateClientAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let client: Awaited<ReturnType<typeof prisma.client.findUnique>> | null = null;
  try {
    client = await prisma.client.findUnique({ where: { id } });
  } catch {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Configure o banco de dados para editar o cliente.
      </div>
    );
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-6 text-sm text-muted-foreground shadow-sm">
        Cliente não encontrado.
      </div>
    );
  }

  const action = updateClientAction.bind(null, client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Editar cliente
          </h1>
          <p className="text-sm text-muted-foreground">{client.name}</p>
        </div>
        <Link
          href={`/app/clientes/${client.id}`}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
        >
          Voltar
        </Link>
      </div>

      <ClientForm
        initialValues={client}
        action={action}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
