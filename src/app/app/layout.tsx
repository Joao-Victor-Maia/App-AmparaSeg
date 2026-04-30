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
    <div className="flex min-h-full flex-1 bg-zinc-50">
      <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-4 md:flex">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight text-zinc-900">
            AmparaSeg
          </div>
        </div>

        <div className="mt-6">
          <Nav />
        </div>

        <div className="mt-auto pt-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
            {session?.email ?? "—"}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 md:hidden">
              <div className="text-base font-semibold tracking-tight text-zinc-900">
                AmparaSeg
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/logout"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
              >
                Sair
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
