import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 w-full overflow-x-hidden min-w-0 md:ml-60">
        <div className="pt-16 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}