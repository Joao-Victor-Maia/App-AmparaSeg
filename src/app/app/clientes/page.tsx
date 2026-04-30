import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function monthOptions() {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const label = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
      new Date(2020, i, 1),
    );
    return { month, label };
  });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aniversarioMes?: string }>;
}) {
  const { q, aniversarioMes } = await searchParams;
  const query = q?.trim() ?? "";
  const month = aniversarioMes ? Number(aniversarioMes) : null;

  let clients:
    | Array<{
        id: string;
        name: string;
        cpfCnpj: string;
        email: string | null;
        phone: string | null;
        birthDate: Date | null;
        _count: { vehicles: number; policies: number; claims: number };
      }>
    | null = null;

  try {
    if (month && month >= 1 && month <= 12) {
      const ids = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Client"
        WHERE "birthDate" IS NOT NULL
          AND EXTRACT(MONTH FROM "birthDate") = ${month}
          AND (
            ${query === ""} = true
            OR "name" ILIKE ${"%" + query + "%"}
            OR "cpfCnpj" ILIKE ${"%" + query + "%"}
          )
        ORDER BY "name" ASC
        LIMIT 200
      `;

      clients = await prisma.client.findMany({
        where: { id: { in: ids.map((r) => r.id) } },
        include: { _count: true },
        orderBy: { name: "asc" },
      });
    } else {
      clients = await prisma.client.findMany({
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { cpfCnpj: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: { _count: true },
        orderBy: { name: "asc" },
        take: 200,
      });
    }
  } catch {
    clients = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastro, pesquisa e aniversários por mês.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/clientes/importar"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
          >
            Importar
          </Link>
          <Link
            href="/app/clientes/novo"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-95"
          >
            Novo cliente
          </Link>
        </div>
      </div>

      <form className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">
            Pesquisar (nome ou CPF/CNPJ)
          </label>
          <input
            name="q"
            defaultValue={query}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Aniversário (mês)
          </label>
          <select
            name="aniversarioMes"
            defaultValue={month?.toString() ?? ""}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">Todos</option>
            {monthOptions().map((m) => (
              <option key={m.month} value={m.month}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <button className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
            Aplicar filtros
          </button>
        </div>
      </form>

      {!clients ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          Configure o banco de dados para listar clientes.
        </div>
      ) : clients.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-6 text-sm text-muted-foreground shadow-sm">
          Nenhum cliente encontrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">CPF/CNPJ</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Itens</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/clientes/${c.id}`}
                      className="font-semibold text-foreground hover:underline decoration-primary/60 underline-offset-4"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{c.cpfCnpj}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{c.phone ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="text-xs">
                      Veículos: {c._count.vehicles} • Apólices: {c._count.policies}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
