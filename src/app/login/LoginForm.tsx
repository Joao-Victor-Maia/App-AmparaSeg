"use client";

import { useState, useTransition } from "react";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="w-full space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);

        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("next", nextPath ?? "");

        startTransition(async () => {
          const res = await fetch("/api/login", {
            method: "POST",
            body: fd,
            credentials: "include",
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as
              | { error?: string }
              | null;
            setError(data?.error ?? "Falha ao entrar.");
            return;
          }

          const data = (await res.json().catch(() => null)) as
            | { redirectTo?: string }
            | null;
          window.location.href = data?.redirectTo ?? "/app";
        });
      }}
    >
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

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
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
