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
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              isActive
                ? "bg-[#C9A96E]/12 text-[#C9A96E] border border-[#C9A96E]/25 font-semibold"
                : "text-[#9CA3AF] hover:text-[#F5F4F0] hover:bg-[#2A2A2B]"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
