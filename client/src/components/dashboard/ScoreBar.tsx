import { Progress } from "@/components/ui/progress";

interface ScoreBarProps {
  label: string;
  value: number;
}

export function ScoreBar({ label, value }: ScoreBarProps) {
  const color =
    value >= 70 ? "text-green-600" : value >= 50 ? "text-amber-600" : "text-red-500";
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={`font-bold ${color}`}>{value}/100</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}