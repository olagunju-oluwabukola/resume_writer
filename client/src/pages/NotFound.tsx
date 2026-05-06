import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="font-poppins text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Page not found
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <a>
            <Button className="mt-6 gap-2 bg-primary hover:bg-primary-light">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </a>
        </Link>
      </div>
    </div>
  );
}
