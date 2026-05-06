interface EmptyStateProps {
  text: string;
  icon: React.ReactNode;
}

export function EmptyState({ text, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground max-w-[180px] leading-snug">{text}</p>
    </div>
  );
}