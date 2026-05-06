import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { TrendingUp, Award, Clock, FileText, Mail, Briefcase } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  applied: "#3B82F6",
  interviewing: "#10B981",
  rejected: "#EF4444",
  accepted: "#8B5CF6",
};

export default function Analytics() {
  const { applications, resumes, coverLetters, stats } = useData();

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = { applied: 0, interviewing: 0, rejected: 0, accepted: 0 };
    applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: STATUS_COLORS[name],
    })).filter(d => d.value > 0);
  }, [applications]);

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { month: string; applications: number; interviews: number }> = {};
    applications.forEach(a => {
      const d = new Date(a.date_applied);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!months[key]) months[key] = { month: label, applications: 0, interviews: 0 };
      months[key].applications++;
      if (a.status === "interviewing" || a.status === "accepted") months[key].interviews++;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).slice(-6);
  }, [applications]);

  const conversionFunnel = [
    { stage: "Applied", count: stats.applicationsTracked },
    { stage: "Interviews", count: stats.interviews },
    { stage: "Accepted", count: stats.accepted },
  ];

  const interviewRate = stats.applicationsTracked > 0
    ? Math.round((stats.interviews / stats.applicationsTracked) * 100)
    : 0;

  const avgResponseDays = useMemo(() => {
    const interviewed = applications.filter(a => a.status === "interviewing" || a.status === "accepted");
    if (interviewed.length === 0) return null;
    const total = interviewed.reduce((sum, a) => {
      const applied = new Date(a.date_applied).getTime();
      const now = new Date().getTime();
      return sum + (now - applied) / (1000 * 60 * 60 * 24);
    }, 0);
    return Math.round(total / interviewed.length);
  }, [applications]);

  if (stats.applicationsTracked === 0) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track your job search progress and insights.</p>
        </div>
        <Card className="p-12 text-center">
          <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Add job applications to see analytics and insights about your job search.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track your job search progress and insights.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Applications", value: stats.applicationsTracked, icon: <Briefcase className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Interview Rate", value: `${interviewRate}%`, icon: <TrendingUp className="h-5 w-5" />, color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg Days to Interview", value: avgResponseDays != null ? `${avgResponseDays}d` : "—", icon: <Clock className="h-5 w-5" />, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Accepted", value: stats.accepted, icon: <Award className="h-5 w-5" />, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(m => (
          <Card key={m.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                <p className="mt-2 font-poppins text-2xl font-bold text-foreground">{m.value}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${m.bg} ${m.color}`}>{m.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Resumes</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{resumes.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Cover Letters</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{coverLetters.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Rejected</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {monthlyTrend.length > 1 && (
          <Card className="p-6">
            <h3 className="font-poppins font-bold text-foreground mb-4">Application Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#6B46C1" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="interviews" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {statusBreakdown.length > 0 && (
          <Card className="p-6">
            <h3 className="font-poppins font-bold text-foreground mb-4">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {statusBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {statusBreakdown.map(s => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: s.fill }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-poppins font-bold text-foreground mb-4">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={conversionFunnel} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6B46C1" radius={[4, 4, 0, 0]}>
                {conversionFunnel.map((_, i) => (
                  <Cell key={i} fill={["#6B46C1", "#10B981", "#8B5CF6"][i] || "#6B46C1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
