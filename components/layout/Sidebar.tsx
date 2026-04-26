"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { Project } from "@/types";

interface SidebarProps {
  projects: Project[];
  userName: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Semua Proyek",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1 4.5C1 3.12 2.12 2 3.5 2H6l1.5 2H13a1 1 0 011 1v7a1 1 0 01-1 1H3.5C2.12 13 1 11.88 1 10.5V4.5z" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil Saya",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 13c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Sidebar({ projects, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    router.push(`/projects/new?name=${encodeURIComponent(newProjectName)}`);
    setIsCreating(false);
    setNewProjectName("");
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-60 flex flex-col h-full"
      style={{
        background: "var(--c-surface)",
        borderRight: "1px solid var(--c-border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
            style={{
              background: "var(--c-accent-bg)",
              border: "1px solid var(--c-accent-bd)",
              color: "var(--c-accent)",
            }}
          >
            S
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--c-accent)" }}>
            SyncTeam
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: active ? "var(--c-raised)" : "transparent",
                color: active ? "var(--c-text)" : "var(--c-muted)",
                fontWeight: active ? "600" : "400",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                  (e.currentTarget as HTMLElement).style.background = "var(--c-raised)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <span style={{ color: active ? "var(--c-accent)" : "currentColor" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Projects section */}
      <div className="px-3 flex-1 overflow-y-auto" style={{ borderTop: "1px solid var(--c-border)", paddingTop: "12px" }}>
        <p
          className="text-[10px] uppercase tracking-widest font-bold px-3 mb-2"
          style={{ color: "var(--c-faint)" }}
        >
          Proyek
        </p>

        <div className="space-y-0.5">
          {projects.map((p) => {
            const active = pathname.startsWith(`/projects/${p.id}`);
            return (
              <Link
                key={p.id}
                href={`/projects/${p.id}/board`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all truncate"
                style={{
                  background: active ? "var(--c-raised)" : "transparent",
                  color: active ? "var(--c-text)" : "var(--c-muted)",
                  fontWeight: active ? "600" : "400",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--c-text)";
                    (e.currentTarget as HTMLElement).style.background = "var(--c-raised)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: active ? "var(--c-accent)" : "var(--c-faint)" }}
                />
                <span className="truncate"># {p.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Quick create */}
        {isCreating ? (
          <div className="mt-2 px-1">
            <input
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateProject();
                if (e.key === "Escape") setIsCreating(false);
              }}
              placeholder="Nama proyek..."
              className="w-full text-xs px-3 py-1.5 rounded-lg outline-none"
              style={{
                background: "var(--c-raised)",
                border: "1px solid var(--c-accent)",
                color: "var(--c-text)",
              }}
            />
            <p className="text-[10px] mt-1 px-1" style={{ color: "var(--c-muted)" }}>
              Enter untuk buat · Esc untuk batal
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all w-full mt-1"
            style={{ color: "var(--c-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-accent)";
              (e.currentTarget as HTMLElement).style.background = "var(--c-accent-bg)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--c-muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Buat proyek baru
          </button>
        )}
      </div>

      {/* Footer: user + theme */}
      <div
        className="px-4 py-3 shrink-0 flex items-center justify-between gap-2"
        style={{ borderTop: "1px solid var(--c-border)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{
              background: "var(--c-accent-bg)",
              color: "var(--c-accent)",
              border: "1px solid var(--c-accent-bd)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--c-text)" }}>
              {userName}
            </p>
            {userEmail && (
              <p className="text-[10px] truncate" style={{ color: "var(--c-muted)" }}>
                {userEmail}
              </p>
            )}
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
