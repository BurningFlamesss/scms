import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  GraduationCap,
  MailQuestion,
  MessageSquarePlus,
  Pencil,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ApplicationStatus } from "#/types";
import {
  addApplicationNote,
  deleteApplication,
  getApplication,
  requestApplicationInfo,
  setApplicationStatus,
} from "#/services/operations";
import { listBranches } from "#/services/website";
import { listClasses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel, KeyValue } from "#/components/common/Panel";
import { DetailSkeleton } from "#/components/common/Skeletons";
import { EmptyState } from "#/components/common/EmptyState";
import { ErrorState } from "#/components/common/ErrorState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Timeline, type TimelineItem } from "#/components/common/Timeline";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { ApplicationFormDialog } from "#/components/admissions/ApplicationFormDialog";
import { ConvertApplicantDialog } from "#/components/admissions/ConvertApplicantDialog";
import { SOURCE_LABEL, scoreTone } from "#/components/admissions/pipeline-constants";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Textarea } from "#/components/ui/textarea";
import { formatDate, formatDateTime, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";

export default function ApplicationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { actor, can } = useAuth();
  const canManage = can("admissions.manage");

  const [note, setNote] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState(
    "Could you please share the latest transcript from the previous school so we can complete the review?",
  );
  const [editOpen, setEditOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: application, isLoading, isError, refetch } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id),
    enabled: Boolean(id),
  });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: listBranches });
  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["application", id] });
    qc.invalidateQueries({ queryKey: ["applications"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: ApplicationStatus) => setApplicationStatus(id, status, actor),
    onSuccess: (saved) => {
      toast.success(`Application marked ${saved.status}`);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const noteMutation = useMutation({
    mutationFn: () => addApplicationNote(id, note.trim(), actor),
    onSuccess: () => {
      toast.success("Note added");
      setNote("");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const infoMutation = useMutation({
    mutationFn: () => requestApplicationInfo(id, infoMessage.trim(), actor),
    onSuccess: () => {
      toast.success("Information request logged on the timeline");
      setInfoOpen(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(id, actor),
    onSuccess: () => {
      toast.success("Application deleted");
      qc.invalidateQueries({ queryKey: ["applications"] });
      navigate("/admin/admissions");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError) {
    return (
      <div className="panel">
        <ErrorState onRetry={() => refetch()} testId="application-detail-error" />
      </div>
    );
  }
  if (!application) {
    return (
      <div className="panel">
        <EmptyState
          icon={GraduationCap}
          title="Application not found"
          description="It may have been deleted or converted. Head back to the pipeline to pick another one."
          primaryLabel="Back to admissions"
          onPrimary={() => navigate("/admin/admissions")}
          testId="application-detail-missing"
        />
      </div>
    );
  }

  const branch = branches.find((item) => item.id === application.branchId);
  const timelineItems: TimelineItem[] = application.timeline
    .slice()
    .reverse()
    .map((entry) => ({
      id: entry.id,
      title: entry.label,
      description: entry.description,
      actor: entry.actor,
      at: entry.at,
      tone: entry.tone,
    }));

  return (
    <div data-testid="application-detail-page">
      <PageHeader
        eyebrow="Admissions"
        title={application.applicantName}
        description={`${application.applicationNo} · applied for ${application.gradeApplied} at ${branch?.name ?? "Northfield"}`}
        meta={
          <>
            <StatusBadge value={application.status} testId="application-status-badge" />
            <span>Submitted {formatDate(application.submittedAt)}</span>
            <span>{SOURCE_LABEL[application.source] ?? application.source}</span>
            {application.convertedStudentId && (
              <Link
                to={`/admin/students/${application.convertedStudentId}`}
                className="text-primary hover:underline"
                data-testid="application-student-link"
              >
                Open student record
              </Link>
            )}
          </>
        }
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/admin/admissions" data-testid="application-back">
                <ArrowLeft className="h-3.5 w-3.5" /> All applications
              </Link>
            </Button>
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-testid="application-edit"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  data-testid="application-request-info"
                  onClick={() => setInfoOpen(true)}
                >
                  <MailQuestion className="h-3.5 w-3.5" /> Request info
                </Button>
                {application.status !== "converted" && (
                  <Button size="sm" className="gap-1.5" data-testid="application-convert" onClick={() => setConvertOpen(true)}>
                    <GraduationCap className="h-3.5 w-3.5" /> Enrol as student
                  </Button>
                )}
              </>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {canManage && (
            <Panel
              eyebrow="Decision"
              title="Move this application"
              description="Every decision is written to the audit log and notifies the office"
              testId="application-decision-panel"
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending || application.status === "accepted"}
                  data-testid="application-accept"
                  onClick={() => statusMutation.mutate("accepted")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Make an offer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending || application.status === "waitlisted"}
                  data-testid="application-waitlist"
                  onClick={() => statusMutation.mutate("waitlisted")}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Waitlist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending || application.status === "rejected"}
                  data-testid="application-reject"
                  onClick={() => statusMutation.mutate("rejected")}
                >
                  <XCircle className="h-3.5 w-3.5 text-destructive" /> Decline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={statusMutation.isPending || application.status === "pending"}
                  data-testid="application-reopen"
                  onClick={() => statusMutation.mutate("pending")}
                >
                  Reopen review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5 text-destructive"
                  data-testid="application-delete"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Panel>
          )}

          <Panel eyebrow="Applicant" title="Personal details" testId="application-personal-panel">
            <dl className="grid gap-4 sm:grid-cols-3">
              <KeyValue label="Date of birth" value={formatDate(application.dateOfBirth)} />
              <KeyValue label="Gender" value={application.gender === "male" ? "Male" : "Female"} />
              <KeyValue label="Application no." value={application.applicationNo} mono testId="application-no" />
              <KeyValue label="Email" value={application.email} />
              <KeyValue label="Phone" value={application.phone} mono />
              <KeyValue label="Campus" value={branch?.name} />
              <KeyValue label="Address" value={application.address} />
              <KeyValue label="Previous school" value={application.previousSchool} />
              <KeyValue label="Previous grade" value={application.previousGrade} />
            </dl>
          </Panel>

          <Panel eyebrow="Guardian" title="Primary contact" testId="application-guardian-panel">
            <dl className="grid gap-4 sm:grid-cols-2">
              <KeyValue label="Name" value={application.guardian.name} />
              <KeyValue label="Relation" value={application.guardian.relation} />
              <KeyValue label="Phone" value={application.guardian.phone} mono />
              <KeyValue label="Email" value={application.guardian.email} />
              {application.guardian.occupation && (
                <KeyValue label="Occupation" value={application.guardian.occupation} />
              )}
            </dl>
          </Panel>

          <Panel
            eyebrow="Documents"
            title="Submitted paperwork"
            description={`${application.documents.filter((doc) => doc.verified).length} of ${application.documents.length} verified`}
            bodyClassName="p-2"
            testId="application-documents-panel"
          >
            {application.documents.length === 0 ? (
              <EmptyState
                compact
                icon={FileText}
                title="No documents uploaded"
                description="Request the birth certificate and previous transcript from the guardian."
                testId="application-documents-empty"
              />
            ) : (
              <ul className="divide-y divide-hairline">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3 px-2 py-2.5" data-testid={`application-doc-${doc.id}`}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-hairline bg-surface-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{doc.name}</p>
                      <p className="num truncate text-xs text-muted-foreground">
                        {doc.sizeKb} KB · uploaded {relativeTime(doc.uploadedAt)}
                      </p>
                    </div>
                    <StatusBadge
                      value={doc.verified ? "active" : "pending"}
                      label={doc.verified ? "Verified" : "Unverified"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-5 lg:col-span-1">
          <Panel eyebrow="Assessment" title="Review summary" testId="application-assessment-panel">
            <div className="space-y-3">
              <div className="rounded-lg border border-hairline bg-surface-2 px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Entrance score</p>
                <p className={cn("num font-display text-2xl font-semibold leading-none", scoreTone(application.entranceScore))}>
                  {application.entranceScore ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {application.entranceScore === undefined
                    ? "Assessment not recorded yet"
                    : application.entranceScore >= 80
                      ? "Strong candidate — fast-track the interview"
                      : application.entranceScore >= 60
                        ? "Meets the threshold for a standard review"
                        : "Below threshold — consider the waitlist"}
                </p>
              </div>
              <dl className="grid gap-3 grid-cols-2">
                <KeyValue label="Status" value={<StatusBadge value={application.status} />} />
                <KeyValue label="Source" value={SOURCE_LABEL[application.source] ?? application.source} />
                <KeyValue label="Grade" value={application.gradeApplied} />
                <KeyValue label="Seats open" value={
                  classes
                    .filter((cls) => cls.grade === application.gradeApplied)
                    .reduce((sum, cls) => sum + Math.max(0, cls.capacity - cls.studentCount), 0)
                } />
              </dl>
            </div>
          </Panel>

          <Panel
            eyebrow="Internal"
            title="Notes"
            description={`${application.notes.length} note${application.notes.length === 1 ? "" : "s"}`}
            testId="application-notes-panel"
          >
            {canManage && (
              <div className="mb-3 space-y-2">
                <Textarea
                  value={note}
                  rows={3}
                  placeholder="Add an internal note for the admissions team…"
                  data-testid="application-note-input"
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNote(event.target.value)}
                />
                <Button
                  size="sm"
                  className="w-full gap-1.5"
                  disabled={!note.trim() || noteMutation.isPending}
                  data-testid="application-note-submit"
                  onClick={() => noteMutation.mutate()}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  {noteMutation.isPending ? "Saving…" : "Add note"}
                </Button>
              </div>
            )}
            {application.notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No internal notes yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {application.notes.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-hairline bg-surface-2 px-3 py-2"
                    data-testid={`application-note-${item.id}`}
                  >
                    <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {item.author} · {relativeTime(item.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel eyebrow="History" title="Timeline" testId="application-timeline-panel">
            <Timeline items={timelineItems} testId="application-timeline" />
          </Panel>
        </div>
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="bg-popover sm:max-w-md" data-testid="application-info-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Request more information</DialogTitle>
            <DialogDescription>
              The request is logged on the application timeline so the whole office can see what was asked and when.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={infoMessage}
            rows={4}
            data-testid="application-info-message"
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setInfoMessage(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)} data-testid="application-info-cancel">
              Cancel
            </Button>
            <Button
              disabled={!infoMessage.trim() || infoMutation.isPending}
              data-testid="application-info-submit"
              onClick={() => infoMutation.mutate()}
            >
              {infoMutation.isPending ? "Sending…" : "Log request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ApplicationFormDialog
        open={editOpen}
        application={application}
        grades={Array.from(new Set(classes.map((cls) => cls.grade))).sort()}
        branches={branches}
        onOpenChange={setEditOpen}
      />

      <ConvertApplicantDialog
        application={convertOpen ? application : null}
        onOpenChange={(open) => setConvertOpen(open)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this application?"
        description={`${application.applicantName}'s application and its notes will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete application"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        testId="application-delete-confirm"
      />

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        Last updated {formatDateTime(application.timeline[application.timeline.length - 1]?.at)}
      </p>
    </div>
  );
}
