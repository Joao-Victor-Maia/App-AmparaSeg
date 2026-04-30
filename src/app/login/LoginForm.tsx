"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "./actions";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={action} className="w-full space-y-4">
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

      {state?.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
