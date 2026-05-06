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
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/resumes"} component={MyResumes} />
        <Route path={"/cover-letters"} component={CoverLetters} />
        <Route path={"/applications"} component={Applications} />
        <Route path={"/job-tracker"} component={JobTracker} />
        <Route path={"/analytics"} component={Analytics} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
