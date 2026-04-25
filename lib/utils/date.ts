export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export function isOverdue(dueDateString: string): boolean {
  return new Date(dueDateString) < new Date();
}

export function daysUntil(dueDateString: string): number {
  const diff = new Date(dueDateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
