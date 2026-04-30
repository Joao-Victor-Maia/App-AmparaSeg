"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "Painel" },
  { href: "/app/clientes", label: "Clientes" },
  { href: "/app/apolices", label: "Apólices" },
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
              "block rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-200 hover:bg-slate-900/60 hover:text-white",
            ].join(" ")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
