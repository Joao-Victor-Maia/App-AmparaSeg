import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function monthLabel(month: number) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(2020, month - 1, 1),
  );
}

export default async function DashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  let stats: {
    clients: number;
    policiesExpiring30: number;
    openClaims: number;
    birthdaysThisMonth: number;
  } | null = null;

  try {
    const [clients, policiesExpiring30, openClaims, birthdaysRow] =
      await Promise.all([
        prisma.client.count(),
        prisma.policy.count({ where: { endDate: { gte: now, lte: in30Days } } }),
        prisma.claim.count({
          where: { status: { in: ["ABERTO", "EM_ANDAMENTO"] } },
        }),
        prisma.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int as count
          FROM "Client"
          WHERE "birthDate" IS NOT NULL
            AND EXTRACT(MONTH FROM "birthDate") = ${month}
        `,
      ]);

    const birthdaysThisMonth = birthdaysRow[0]?.count ?? 0;
    stats = { clients, policiesExpiring30, openClaims, birthdaysThisMonth };
  } catch {
    stats = null;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Painel
        </h1>
        <p className="text-sm text-zinc-600">
          Visão geral e atalhos para filtros.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">Clientes</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {stats?.clients ?? "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">Apólices vencendo (30 dias)</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {stats?.policiesExpiring30 ?? "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">Sinistros em aberto</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {stats?.openClaims ?? "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <div className="text-sm text-zinc-600">
            Aniversários ({monthLabel(month)})
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">
            {stats?.birthdaysThisMonth ?? "—"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-zinc-900">
                Vencimentos por mês
              </div>
              <div className="text-sm text-zinc-600">
                Filtre apólices pelo mês de vencimento.
              </div>
            </div>
            <Link
              href={`/app/apolices?mes=${month}`}
              className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Ver {monthLabel(month)}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-zinc-900">
                Aniversários por mês
              </div>
              <div className="text-sm text-zinc-600">
                Veja clientes aniversariantes no mês.
              </div>
            </div>
            <Link
              href={`/app/clientes?aniversarioMes=${month}`}
              className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Ver {monthLabel(month)}
            </Link>
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Configure o banco de dados (DATABASE_URL) e rode o schema para ver os
          números do painel.
        </div>
      ) : null}
    </div>
  );
}
