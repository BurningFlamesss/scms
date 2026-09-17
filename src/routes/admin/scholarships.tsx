import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";

export const Route = createFileRoute("/admin/scholarships")({
  component: ScholarshipsAdmin,
});

function ScholarshipsAdmin() {
  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Scholarships"
        description="Manage scholarship information and applications shown on the public website."
      />
      <div className="p-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 pt-0 mt-6">
            <p className="text-sm text-muted-foreground">Scholarship management module is available here to edit the public data dynamically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
