import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { JobApplication } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3B82F6", interviewing: "#10B981", rejected: "#EF4444", accepted: "#8B5CF6",
};
const STATUS_LABELS: Record<string, string> = {
  applied: "bg-blue-100 text-blue-800",
  interviewing: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  accepted: "bg-purple-100 text-purple-800",
};

interface RecentApplicationsProps {
  applications: JobApplication[];
  totalCount: number;
}

export function RecentApplications({ applications, totalCount }: RecentApplicationsProps) {
  if (totalCount === 0) return null;

  const appStats = ["applied", "interviewing", "rejected", "accepted"]
    .map(s => ({
      name: s.charAt(0).toUpperCase() + s.slice(1),
      value: applications.filter(a => a.status === s).length,
      fill: STATUS_COLORS[s],
    }))
    .filter(d => d.value > 0);

  const recent = [...applications]
    .sort((a, b) => new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-3 flex-shrink-0">
      {/* Donut */}
      <Card className="p-4">
        <h3 className="font-semibold text-sm text-foreground mb-3">Application Stats</h3>
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie data={appStats} cx="50%" cy="50%" innerRadius={35} outerRadius={52} paddingAngle={3} dataKey="value">
              {appStats.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1 mt-2">
          {appStats.map(s => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: s.fill }} />
                <span className="text-foreground/70">{s.name}</span>
              </div>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4 lg:col-span-2">
        <h3 className="font-semibold text-sm text-foreground mb-3">Recent Applications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                {["Job Title", "Company", "Applied", "Status"].map(h => (
                  <th key={h} className="px-2 py-1.5 text-left text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(app => (
                <tr key={app.id} className="border-b border-border/40 hover:bg-muted/20">
                  <td className="px-2 py-2 font-medium text-foreground">{app.job_title}</td>
                  <td className="px-2 py-2 text-foreground/70">{app.company}</td>
                  <td className="px-2 py-2 text-foreground/60 hidden sm:table-cell">
                    {new Date(app.date_applied).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${STATUS_LABELS[app.status]}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}