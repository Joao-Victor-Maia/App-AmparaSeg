import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { ClaimForm } from "../ClaimForm";
import { createClaimAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;

  let clients: Array<{ id: string; name: string }> = [];
  try {
    clients = await prisma.client.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 500,
    });
  } catch {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Configure o banco de dados para cadastrar sinistros.
      </div>
    );
  }

  let policies: Array<{ id: string; policyNo: string }> = [];
  if (clienteId) {
    try {
      policies = await prisma.policy.findMany({
        where: { clientId: clienteId },
        select: { id: true, policyNo: true },
        orderBy: { endDate: "desc" },
        take: 200,
      });
    } catch {
      policies = [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Novo sinistro
          </h1>
          <p className="text-sm text-zinc-600">Registre um sinistro do cliente.</p>
        </div>
        <Link
          href="/app/sinistros"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
        >
          Voltar
        </Link>
      </div>

      <ClaimForm
        clients={clients}
        policies={policies}
        initialClientId={clienteId}
        action={createClaimAction}
      />
    </div>
  );
}
