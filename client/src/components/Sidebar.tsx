import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Mail, Briefcase,
  LineChart, BookMarked, Settings, Menu, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "resumes", label: "My Resumes", icon: FileText, href: "/resumes" },
  { id: "cover-letters", label: "Cover Letters", icon: Mail, href: "/cover-letters" },
  { id: "applications", label: "Applications", icon: Briefcase, href: "/applications" },
  { id: "job-tracker", label: "Job Tracker", icon: BookMarked, href: "/job-tracker" },
  { id: "analytics", label: "Analytics", icon: LineChart, href: "/analytics" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useData();

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const firstName = userProfile?.full_name?.split(" ")[0] || "there";

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <>
      {/* Mobile toggle button */}
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

      {/* Sidebar — always fixed on all screen sizes */}
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
            <h1 className="font-poppins text-base font-bold text-sidebar-foreground">ResumeRX</h1>
            <p className="text-xs text-sidebar-foreground/50">Career Toolkit</p>
          </div>
        </div>


        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.id} href={item.href}>
                <a
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Pro card + User */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="rounded-lg bg-gradient-to-br from-primary to-purple-700 p-4 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">👑</span>
              <h3 className="text-sm font-bold text-white">Pro Plan</h3>
            </div>
            <p className="text-xs text-white/80 mb-3">Unlimited tailoring & premium templates.</p>
            <Button
              size="sm"
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-xs"
            >
              Upgrade Now
            </Button>
          </div>

          {/* User row */}
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer border border-sidebar-border">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {userProfile?.full_name || "Your Name"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {userProfile?.email || ""}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40 flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* Spacer so main content doesn't sit behind the fixed sidebar on desktop */}
      <div className="hidden md:block w-60 flex-shrink-0" />
    </>
  );
}