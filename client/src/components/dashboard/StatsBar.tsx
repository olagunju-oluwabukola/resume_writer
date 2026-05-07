import { Card } from "@/components/ui/card";
import { FileText, Mail, Briefcase, TrendingUp } from "lucide-react";
import { getStatistics } from "@/lib/storage";

interface StatsBarProps {
  stats: ReturnType<typeof getStatistics>;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "Resumes",       value: stats.resumesCreated,      icon: <FileText className="h-4 w-4" />,  iconColor: "text-blue-600",   iconBg: "bg-blue-100",    cardBg: "bg-white",          textColor: "text-foreground" },
    { label: "Cover Letters", value: stats.coverLettersCreated, icon: <Mail className="h-4 w-4" />,      iconColor: "text-white",      iconBg: "bg-white/20",    cardBg: "bg-primary",        textColor: "text-white" },
    { label: "Applications",  value: stats.applicationsTracked, icon: <Briefcase className="h-4 w-4" />, iconColor: "text-purple-600", iconBg: "bg-purple-100",  cardBg: "bg-white",          textColor: "text-foreground" },
    { label: "Interviews",    value: stats.interviews,           icon: <TrendingUp className="h-4 w-4" />,iconColor: "text-white",      iconBg: "bg-white/20",    cardBg: "bg-primary",        textColor: "text-white" },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-3 flex-shrink-0">
      {items.map(s => (
        <Card key={s.label} className={`p-3 flex items-center gap-3 border-0 shadow-sm ${s.cardBg}`}>
          <div className={`rounded-lg p-2 ${s.iconBg} ${s.iconColor} flex-shrink-0`}>{s.icon}</div>
          <div className="min-w-0">
            <p className={`text-xs truncate ${s.cardBg === "bg-primary" ? "text-white/70" : "text-muted-foreground"}`}>{s.label}</p>
            <p className={`text-xl font-bold leading-tight ${s.textColor}`}>{s.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}