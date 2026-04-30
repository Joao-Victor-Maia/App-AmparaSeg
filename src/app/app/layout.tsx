import Link from "next/link";

import { getSession } from "@/lib/auth";
import { Nav } from "./Nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-full flex-1 bg-background">
      <aside className="hidden w-72 flex-col bg-slate-950 p-4 text-slate-100 md:flex">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600 text-white shadow-sm ring-1 ring-white/10">
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
            <div className="space-y-0.5">
              <div className="text-lg font-semibold tracking-tight text-white">
                AmparaSeg
              </div>
              <div className="text-xs font-semibold text-slate-300">
                Corretora de Seguros
              </div>
              <div className="text-xs text-slate-400">Seguro que acolhe</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Nav />
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
            {session?.email ?? "—"}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 md:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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
              <div className="text-base font-semibold tracking-tight text-foreground">
                AmparaSeg
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session?.email ? (
                <div className="hidden rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground sm:block md:hidden">
                  {session.email}
                </div>
              ) : null}
              <Link
                href="/logout"
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
              >
                Sair
              </Link>
            </div>
          </div>
        </header>

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.10),_transparent_55%)]" />
          <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
