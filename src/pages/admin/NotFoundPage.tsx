import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "#/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-20 text-center" data-testid="not-found">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-hairline bg-surface-2">
        <Compass className="h-5 w-5 text-muted-foreground" />
      </span>
      <h1 className="font-display text-lg font-semibold text-foreground">That page isn't part of the console</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The link may be out of date. Use the sidebar, or press ⌘K to jump straight to a student, notice or page.
      </p>
      <Button asChild className="mt-5" data-testid="not-found-home">
        <Link to="/admin/overview">Back to overview</Link>
      </Button>
    </div>
  );
}
