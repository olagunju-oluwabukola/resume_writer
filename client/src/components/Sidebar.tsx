import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Mail, Briefcase,
  LineChart, BookMarked, Settings, Menu, X, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { id: "dashboard",     label: "Dashboard",     icon: LayoutDashboard, href: "/dashboard" },
  { id: "resumes",       label: "My Resumes",    icon: FileText,        href: "/resumes" },
  { id: "cover-letters", label: "Cover Letters", icon: Mail,            href: "/cover-letters" },
  { id: "applications",  label: "Applications",  icon: Briefcase,       href: "/applications" },
  { id: "job-tracker",   label: "Job Tracker",   icon: BookMarked,      href: "/job-tracker" },
  { id: "analytics",     label: "Analytics",     icon: LineChart,       href: "/analytics" },
  { id: "settings",      label: "Settings",      icon: Settings,        href: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useData();
  const { user, signOut } = useAuth();

  // Prefer Firebase display name, fall back to Supabase profile
  const displayName = user?.displayName || userProfile?.full_name || "User";
  const displayEmail = user?.email || userProfile?.email || "";

  const initials = displayName
    .split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (href: string) => location.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background shadow"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-60 z-40
          bg-sidebar border-r border-sidebar-border shadow-lg
          flex flex-col
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border flex-shrink-0">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-poppins text-base font-bold text-sidebar-foreground">ResumeRx</h1>
            <p className="text-xs text-sidebar-foreground/50">Career Toolkit</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon, href }) => (
            <Link key={id} href={href}>
              <a
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive(href)
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}
                `}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </a>
            </Link>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{displayEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent
              transition-colors duration-150"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
