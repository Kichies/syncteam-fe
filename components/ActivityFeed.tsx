export default function ActivityFeed() {
  // Data statis/dummy untuk riwayat aktivitas tim
  const activities = [
    { id: 1, user: "AI Konsultan", action: "meng-generate 4 tugas baru", time: "Baru saja", isAI: true },
    { id: 2, user: "Hanif", action: "bergabung ke Workspace", time: "10 mnt lalu", isAI: false },
    { id: 3, user: "Hanif", action: "membuat project Capstone MVP", time: "1 jam lalu", isAI: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
      <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-4">
        Aktivitas Tim
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3 items-start">
            {/* Ikon User/AI */}
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${activity.isAI ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-neutral-600'}`}></div>
            
            {/* Teks Aktivitas */}
            <div className="flex-1">
              <p className="text-xs text-neutral-300 leading-tight">
                <span className={activity.isAI ? "text-amber-500 font-bold" : "text-white font-bold"}>
                  {activity.user}
                </span>{" "}
                <span className="text-neutral-400">{activity.action}</span>
              </p>
              <p className="text-[10px] text-neutral-600 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}