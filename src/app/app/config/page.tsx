import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function item(label: string, ok: boolean, detail?: string) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="space-y-1">
        <div className="text-sm font-semibold text-zinc-900">{label}</div>
        {detail ? <div className="text-sm text-zinc-600">{detail}</div> : null}
      </div>
      <div
        className={[
          "rounded-full px-3 py-1 text-xs font-semibold",
          ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
        ].join(" ")}
      >
        {ok ? "OK" : "Pendente"}
      </div>
    </div>
  );
}

export default async function ConfigPage() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const hasAdminEmail = Boolean(process.env.ADMIN_EMAIL);
  const hasAdminPassword = Boolean(
    process.env.ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD,
  );
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  let dbOk = false;
  let dbDetail = hasDbUrl
    ? "DATABASE_URL configurado. Testando conexão..."
    : "Defina DATABASE_URL (Postgres) para persistir dados.";

  if (hasDbUrl) {
    try {
      await prisma.client.count();
      dbOk = true;
      dbDetail = "Conexão com o banco OK.";
    } catch {
      dbOk = false;
      dbDetail = "Falha ao conectar. Verifique DATABASE_URL e o schema no banco.";
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Configuração
        </h1>
        <p className="text-sm text-zinc-600">
          Checklist rápido para rodar localmente e subir no Vercel.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {item("Banco de dados", dbOk, dbDetail)}
        {item(
          "Admin (login)",
          hasAdminEmail && hasAdminPassword,
          hasAdminEmail && hasAdminPassword
            ? "ADMIN_EMAIL e ADMIN_PASSWORD/_HASH configurados."
            : "Defina ADMIN_EMAIL e ADMIN_PASSWORD (ou ADMIN_PASSWORD_HASH).",
        )}
        {item(
          "Sessão (JWT)",
          hasAuthSecret,
          hasAuthSecret
            ? "AUTH_SECRET configurado."
            : "Defina AUTH_SECRET no Vercel. Em dev existe fallback temporário.",
        )}
        {item(
          "Upload PDF (Vercel Blob)",
          hasBlobToken,
          hasBlobToken
            ? "BLOB_READ_WRITE_TOKEN configurado."
            : "Defina BLOB_READ_WRITE_TOKEN para anexar PDFs.",
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-semibold text-zinc-900">Comandos úteis</div>
        <div className="mt-3 grid gap-2 text-sm text-zinc-700">
          <div>
            <span className="font-semibold">npm run db:push</span> — aplica o schema
            no banco
          </div>
          <div>
            <span className="font-semibold">npm run dev</span> — roda o projeto
          </div>
          <div>
            <span className="font-semibold">npm run build</span> — valida para deploy
          </div>
        </div>
      </div>
    </div>
  );
}
