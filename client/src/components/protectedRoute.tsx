import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0812",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#8B5CF6",
          fontFamily: "Inter, sans-serif",
          fontSize: "0.9rem",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
