"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Painel" },
  { href: "/app/clientes", label: "Clientes" },
  { href: "/app/apolices", label: "Apólices" },
  { href: "/app/sinistros", label: "Sinistros" },
  { href: "/app/config", label: "Config" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={[
              "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-100",
            ].join(" ")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
