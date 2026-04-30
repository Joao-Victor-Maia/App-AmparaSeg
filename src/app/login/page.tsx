import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            AmparaSeg
          </h1>
          <p className="text-sm text-zinc-600">
            Acesse o painel para gerenciar clientes, apólices e sinistros.
          </p>
        </div>

        <div className="mt-8">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Credenciais inválidas.
            </div>
          ) : null}
          <LoginForm nextPath={next} />
        </div>
      </div>
    </div>
  );
}
