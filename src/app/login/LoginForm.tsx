export function LoginForm({ nextPath }: { nextPath?: string }) {
  return (
    <form method="post" action="/api/login" className="w-full space-y-4">
      <input type="hidden" name="next" value={nextPath ?? ""} />
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900">E-mail</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none ring-0 focus:border-zinc-300"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900">Senha</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none ring-0 focus:border-zinc-300"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        Entrar
      </button>
    </form>
  );
}
