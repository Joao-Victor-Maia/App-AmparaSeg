export function LoginForm({ nextPath }: { nextPath?: string }) {
  return (
    <form method="post" action="/api/login" className="w-full space-y-4">
      <input type="hidden" name="next" value={nextPath ?? ""} />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">E-mail</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-900">Senha</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:opacity-60"
      >
        Entrar
      </button>
    </form>
  );
}
