import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  addVehicleAction,
  deleteClientAction,
  deleteVehicleAction,
} from "../actions";

export const dynamic = "force-dynamic";

type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    vehicles: true;
    policies: true;
    claims: true;
  };
}>;

function formatDate(d?: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export default async function ClientDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erroVeiculo?: string }>;
}) {
  const { id } = await params;
  const { erroVeiculo } = await searchParams;

  let client: ClientWithRelations | null = null;
  try {
    client = await prisma.client.findUnique({
      where: { id },
      include: {
        vehicles: { orderBy: { createdAt: "desc" } },
        policies: { orderBy: { endDate: "desc" } },
        claims: { orderBy: { occurredAt: "desc" } },
      },
    });
  } catch {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Configure o banco de dados para acessar o cliente.
      </div>
    );
  }

  if (!client) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-sm text-zinc-600">
        Cliente não encontrado.
      </div>
    );
  }

  const addVehicle = addVehicleAction.bind(null, client.id);
  const deleteClient = deleteClientAction.bind(null, client.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {client.name}
          </h1>
          <div className="text-sm text-zinc-600">
            CPF/CNPJ: {client.cpfCnpj} • Nascimento: {formatDate(client.birthDate)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/app/clientes/${client.id}/editar`}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Editar
          </Link>
          <form action={deleteClient}>
            <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              Excluir
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="text-sm font-semibold text-zinc-900">Contato</div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
            <div>
              <div className="text-xs text-zinc-500">Telefone</div>
              <div>{client.phone ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">E-mail</div>
              <div>{client.email ?? "—"}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-zinc-500">Observações</div>
            <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
              {client.notes ?? "—"}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-semibold text-zinc-900">Atalhos</div>
          <div className="mt-4 space-y-2">
            <Link
              href={`/app/apolices/novo?clienteId=${client.id}`}
              className="block rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Nova apólice
            </Link>
            <Link
              href={`/app/sinistros/novo?clienteId=${client.id}`}
              className="block rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
            >
              Novo sinistro
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-lg font-semibold tracking-tight text-zinc-900">
                Veículos
              </div>
              <div className="text-sm text-zinc-600">Vinculados ao cliente.</div>
            </div>
          </div>

          <form
            action={addVehicle}
            className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-2"
          >
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-zinc-900">Placa</label>
              <input
                name="plate"
                required
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Marca</label>
              <input
                name="brand"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Modelo</label>
              <input
                name="model"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Ano</label>
              <input
                name="year"
                inputMode="numeric"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900">Renavam</label>
              <input
                name="renavam"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-300"
              />
            </div>
            <div className="md:col-span-2">
              <button className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800">
                Vincular veículo
              </button>
            </div>
            {erroVeiculo ? (
              <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Verifique os dados do veículo.
              </div>
            ) : null}
          </form>

          {client.vehicles.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-sm text-zinc-600">
              Nenhum veículo vinculado.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  <tr>
                    <th className="px-4 py-3">Placa</th>
                    <th className="px-4 py-3">Veículo</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {client.vehicles.map((v) => {
                    const deleteVehicle = deleteVehicleAction.bind(
                      null,
                      v.id,
                      client.id,
                    );
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-zinc-200 last:border-0"
                      >
                        <td className="px-4 py-3 font-semibold text-zinc-900">
                          {v.plate}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {[v.brand, v.model, v.year].filter(Boolean).join(" • ") ||
                            "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={deleteVehicle}>
                            <button className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50">
                              Remover
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="text-lg font-semibold tracking-tight text-zinc-900">
                  Apólices
                </div>
                <div className="text-sm text-zinc-600">
                  Vínculos e vencimentos.
                </div>
              </div>
              <Link
                href={`/app/apolices?clienteId=${client.id}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Ver todas
              </Link>
            </div>
            {client.policies.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-sm text-zinc-600">
                Nenhuma apólice cadastrada.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    <tr>
                      <th className="px-4 py-3">Seguradora</th>
                      <th className="px-4 py-3">Número</th>
                      <th className="px-4 py-3">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.policies.slice(0, 5).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-zinc-200 last:border-0"
                      >
                        <td className="px-4 py-3 text-zinc-700">{p.insurer}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/app/apolices/${p.id}`}
                            className="font-semibold text-zinc-900 hover:underline"
                          >
                            {p.policyNo}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {formatDate(p.endDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="text-lg font-semibold tracking-tight text-zinc-900">
                  Sinistros
                </div>
                <div className="text-sm text-zinc-600">Histórico do cliente.</div>
              </div>
              <Link
                href={`/app/sinistros?clienteId=${client.id}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Ver todos
              </Link>
            </div>
            {client.claims.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-sm text-zinc-600">
                Nenhum sinistro registrado.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.claims.slice(0, 5).map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-zinc-200 last:border-0"
                      >
                        <td className="px-4 py-3 text-zinc-700">
                          {formatDate(c.occurredAt)}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">{c.status}</td>
                        <td className="px-4 py-3 text-zinc-700">
                          {c.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
