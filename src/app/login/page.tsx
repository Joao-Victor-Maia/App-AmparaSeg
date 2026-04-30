import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="relative flex flex-1 items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_45%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-white/95 p-8 shadow-xl backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white shadow-sm ring-1 ring-black/5">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2.5c2.7 2 5.2 2.7 8 3.4v7.4c0 4.8-3.2 8.5-8 9.8-4.8-1.3-8-5-8-9.8V5.9c2.8-.7 5.3-1.4 8-3.4Z"
                />
                <path
                  fill="#ffffff"
                  fillOpacity="0.92"
                  d="M12 9.4c-1-1.3-3.1-1.6-4.3-.3-1.1 1.2-1 3 .3 4.2l4 3.6 4-3.6c1.3-1.2 1.4-3 .3-4.2-1.2-1.3-3.3-1-4.3.3Z"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                AmparaSeg
              </div>
              <div className="text-xs font-semibold tracking-wide text-teal-700">
                Corretora de Seguros
              </div>
              <div className="text-xs text-slate-500">Seguro que acolhe</div>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Acesso ao painel
          </h1>
          <p className="text-sm text-slate-600">
            Gerencie clientes e apólices com segurança.
          </p>
        </div>

        <div className="mt-8">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Credenciais inválidas.
            </div>
          ) : null}
          <LoginForm nextPath={next} />
        </div>
      </div>
    </div>
  );
}
