import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { PolicyForm } from "../PolicyForm";
import {
  deletePolicyAction,
  removePolicyPdfAction,
  updatePolicyAction,
  uploadPolicyPdfAction,
} from "../actions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

type PolicyWithClient = Prisma.PolicyGetPayload<{
  include: { client: { select: { id: true; name: true } } };
}>;

export default async function PolicyDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erroPdf?: string }>;
}) {
  const { id } = await params;
  const { erroPdf } = await searchParams;

  let policy: PolicyWithClient | null = null;
  try {
    policy = await prisma.policy.findUnique({
      where: { id },
      include: { client: { select: { id: true, name: true } } },
    });
  } catch {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Configure o banco de dados para acessar a apólice.
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-6 text-sm text-zinc-600">
        Apólice não encontrada.
      </div>
    );
  }

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
        Configure o banco de dados para editar a apólice.
      </div>
    );
  }

  const update = updatePolicyAction.bind(null, policy.id);
  const deletePolicy = deletePolicyAction.bind(null, policy.id);
  const uploadPdf = uploadPolicyPdfAction.bind(null, policy.id);
  const removePdf = removePolicyPdfAction.bind(null, policy.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Apólice {policy.policyNo}
          </h1>
          <div className="text-sm text-zinc-600">
            Cliente:{" "}
            <Link
              href={`/app/clientes/${policy.client.id}`}
              className="font-medium text-zinc-900 hover:underline"
            >
              {policy.client.name}
            </Link>{" "}
            • Vencimento: {formatDate(policy.endDate)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/apolices"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Voltar
          </Link>
          <form action={deletePolicy}>
            <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              Excluir
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="text-sm font-semibold text-zinc-900">
            Dados da apólice
          </div>
          <div className="mt-5">
            <PolicyForm
              clients={clients}
              initialValues={{
                clientId: policy.clientId,
                insurer: policy.insurer,
                policyType: policy.policyType,
                policyNo: policy.policyNo,
                startDate: policy.startDate,
                endDate: policy.endDate,
                premium: policy.premium?.toString() ?? "",
                status: policy.status,
              }}
              action={update}
              submitLabel="Salvar"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold text-zinc-900">PDF da apólice</div>

            <div className="mt-3 text-sm text-zinc-700">
              {policy.pdfUrl ? (
                <div className="space-y-3">
                  <a
                    href={policy.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-zinc-900 hover:underline"
                  >
                    {policy.pdfFileName ?? "Ver PDF"}
                  </a>
                  <form action={removePdf}>
                    <button className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
                      Remover PDF
                    </button>
                  </form>
                </div>
              ) : (
                "Nenhum PDF anexado."
              )}
            </div>

            <div className="mt-5">
              <form action={uploadPdf} encType="multipart/form-data" className="space-y-3">
                <input
                  name="pdf"
                  type="file"
                  accept="application/pdf"
                  className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-zinc-800"
                />
                <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
                  Anexar PDF
                </button>
              </form>
              {erroPdf ? (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {erroPdf === "2"
                    ? "Envie um arquivo PDF."
                    : "Selecione um arquivo para anexar."}
                </div>
              ) : null}
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Para upload funcionar no Vercel, configure BLOB_READ_WRITE_TOKEN.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
