"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Project } from "@/types";

interface SidebarProps {
  projects: Project[];
  userName: string;
}

export default function Sidebar({ projects, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Semua Proyek" },
    { href: "/profile", label: "Profil Saya" },
  ];

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    router.push(`/projects/new?name=${encodeURIComponent(newProjectName)}`);
    setIsModalOpen(false);
    setNewProjectName("");
    setNewProjectDesc("");
  };

  return (
    <>
      <div className="w-64 bg-[#0E0E0F] border-r border-[#2A2A2B] flex flex-col h-full">
        <div className="p-4 shrink-0">
          <h2 className="text-xl font-bold text-[#C9A96E] mb-6 px-2">
            SyncTeam
          </h2>

          <nav className="space-y-1 mb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-[#2A2A2B] text-[#F5F4F0] font-semibold"
                    : "text-[#9CA3AF] hover:text-[#F5F4F0] hover:bg-[#2A2A2B]/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[#2A2A2B] pt-4 space-y-1">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider px-2 mb-2">
              Proyek
            </p>
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}/board`}
                className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors truncate ${
                  pathname.startsWith(`/projects/${p.id}`)
                    ? "bg-[#2A2A2B] text-[#F5F4F0]"
                    : "text-[#9CA3AF] hover:text-[#F5F4F0] hover:bg-[#2A2A2B]/50"
                }`}
              >
                # {p.name}
              </Link>
            ))}
            <button
              onClick={() => setIsModalOpen(true)}
              className="block w-full text-left px-4 py-2 text-[#9CA3AF] hover:text-[#C9A96E] transition-colors text-sm"
            >
              + Buat Project Baru
            </button>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-[#2A2A2B] text-xs text-[#9CA3AF] shrink-0">
          {userName}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Project Baru"
      >
        <div className="space-y-4">
          <Input
            label="Nama Project"
            placeholder="Contoh: E-Commerce MVP"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Input
            label="Deskripsi Singkat"
            placeholder="Goal utama dari project ini..."
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setIsModalOpen(false)}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleCreateProject}
            disabled={!newProjectName.trim()}
          >
            Lanjutkan
          </Button>
        </div>
      </Modal>
    </>
  );
}
