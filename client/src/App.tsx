import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import MyResumes from "@/pages/MyResumes";
import CoverLetters from "@/pages/CoverLetters";
import Applications from "@/pages/Applications";
import JobTracker from "@/pages/JobTracker";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/protectedRoute";

/** Routes that sit inside the app shell (sidebar + layout) */
function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/resumes" component={MyResumes} />
        <Route path="/cover-letters" component={CoverLetters} />
        <Route path="/applications" component={Applications} />
        <Route path="/job-tracker" component={JobTracker} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Protected app routes */}
      <Route>
        {() => (
          <ProtectedRoute>
            <AppRouter />
          </ProtectedRoute>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
