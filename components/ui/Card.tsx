interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0E0E0F] border border-[#2A2A2B] rounded-xl p-5 ${onClick ? "cursor-pointer hover:border-[#C9A96E]/40 transition-colors" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
