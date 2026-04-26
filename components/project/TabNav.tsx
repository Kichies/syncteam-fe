"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  href: string;
  label: string;
  icon?: string;
}

export default function TabNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all"
            style={{
              background: isActive ? "var(--c-accent-bg)" : "transparent",
              color: isActive ? "var(--c-accent)" : "var(--c-muted)",
              border: isActive ? "1px solid var(--c-accent-bd)" : "1px solid transparent",
              fontWeight: isActive ? "600" : "400",
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
