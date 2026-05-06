import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell, User, Database, Download, Trash2, Check, Key, AlertTriangle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from "@/contexts/DataContext";
import { clearAllData, exportAllData } from "@/lib/storage";
import { toast } from "sonner";

export default function Settings() {
  const { userProfile, updateUserProfile, stats } = useData();
  const [profileForm, setProfileForm] = useState({
    full_name: "", email: "",
  });
  const [groqKey, setGroqKey] = useState("");
  const [notifications, setNotifications] = useState({
    followUpReminders: true, weeklySummary: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileForm({ full_name: userProfile.full_name, email: userProfile.email });
    }
    const key = localStorage.getItem("resumerx_groq_key") || "";
    setGroqKey(key);
  }, [userProfile]);

  const handleSaveProfile = () => {
    if (!profileForm.full_name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateUserProfile({ full_name: profileForm.full_name, email: profileForm.email });
    setSaved(true);
    toast.success("Profile saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveGroqKey = () => {
    localStorage.setItem("resumerx_groq_key", groqKey.trim());
    toast.success("API key saved! Restart the app to use it.");
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumerx-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  const handleClearData = () => {
    clearAllData();
    toast.success("All data cleared. Refresh the page.");
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 max-w-2xl">
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-poppins font-bold text-foreground">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {profileForm.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">{profileForm.full_name || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{profileForm.email}</p>
            </div>
          </div>
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={profileForm.full_name}
              onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="mt-1" placeholder="Your full name" />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={profileForm.email}
              onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
              className="mt-1" placeholder="your@email.com" />
          </div>
          <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 gap-2">
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : "Save Profile"}
          </Button>
        </div>
      </Card>

      {/* AI API Key */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-poppins font-bold text-foreground">AI Integration</h2>
            <p className="text-xs text-muted-foreground">Groq API for resume analysis</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Add your <a href="https://console.groq.com" target="_blank" rel="noopener" className="text-primary underline">Groq API key</a> to enable AI-powered resume analysis and cover letter generation (free tier available).
          </p>
          <div>
            <Label>Groq API Key</Label>
            <Input value={groqKey} onChange={e => setGroqKey(e.target.value)}
              type="password" placeholder="gsk_..." className="mt-1 font-mono text-sm" />
          </div>
          <Button onClick={handleSaveGroqKey} variant="outline" className="gap-2">
            <Key className="h-4 w-4" /> Save API Key
          </Button>
          {groqKey && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" /> API key configured
            </p>
          )}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-poppins font-bold text-foreground">Preferences</h2>
        </div>
        <div className="space-y-5">
          {[
            { key: "followUpReminders", label: "Follow-up Reminders", desc: "Get reminded to follow up on applications" },
            { key: "weeklySummary", label: "Weekly Summary", desc: "See a weekly summary of your progress" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={v => {
                  setNotifications(prev => ({ ...prev, [item.key]: v }));
                  toast.success(`${item.label} ${v ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-poppins font-bold text-foreground">Data</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Resumes", value: stats.resumesCreated },
              { label: "Cover Letters", value: stats.coverLettersCreated },
              { label: "Applications", value: stats.applicationsTracked },
              { label: "Interviews", value: stats.interviews },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={handleExportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export All Data
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-red-600 hover:text-red-700 border-red-200">
                  <Trash2 className="h-4 w-4" /> Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" /> Clear All Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your resumes, cover letters, applications, and settings stored in this browser. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                    Yes, clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-xs text-muted-foreground">All data is stored locally in your browser. Nothing is sent to any server.</p>
        </div>
      </Card>
    </div>
  );
}
