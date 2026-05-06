import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AppStat {
  name: string;
  value: number;
  fill: string;
}

interface ApplicationStatsProps {
  appStats: AppStat[];
}

export function ApplicationStats({ appStats }: ApplicationStatsProps) {
  return (
    <Card className="p-5 border-0">
      <h3 className="font-semibold text-foreground mb-4 text-sm">
        Application Stats
      </h3>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie
            data={appStats}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={3}
            dataKey="value"
          >
            {appStats.map((e, i) => (
              <Cell key={i} fill={e.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5 mt-2">
        {appStats.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: s.fill }}
              />
              <span className="text-foreground/70">{s.name}</span>
            </div>
            <span className="font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
