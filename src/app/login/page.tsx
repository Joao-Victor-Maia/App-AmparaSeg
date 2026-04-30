import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

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
          <LoginForm nextPath={next} />
        </div>
      </div>
    </div>
  );
}
