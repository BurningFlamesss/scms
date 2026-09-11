import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import type { Application } from "#/types";
import { convertApplicant } from "#/services/operations";
import { listClasses } from "#/services/academics";
import { useAuth } from "#/providers/AuthProvider";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";

interface ConvertApplicantDialogProps {
  application: Application | null;
  onOpenChange: (open: boolean) => void;
}

/** Turns an accepted applicant into an enrolled student with a class placement. */
export function ConvertApplicantDialog({ application, onOpenChange }: ConvertApplicantDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");

  const { data: classes = [] } = useQuery({ queryKey: ["classes"], queryFn: () => listClasses() });

  const options = useMemo(() => {
    if (!application) return classes;
    const sameGrade = classes.filter((cls) => cls.grade === application.gradeApplied);
    return sameGrade.length ? sameGrade : classes;
  }, [classes, application]);

  useEffect(() => {
    if (!application) return;
    setClassId(options[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.id, options.length]);

  const mutation = useMutation({
    mutationFn: () => convertApplicant(application!.id, classId, actor),
    onSuccess: ({ student }) => {
      toast.success(`${student.firstName} ${student.lastName} enrolled as ${student.admissionNo}`);
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["application"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["classes"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      onOpenChange(false);
      navigate(`/students/${student.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={Boolean(application)} onOpenChange={onOpenChange}>
      <DialogContent className="border-hairline bg-popover sm:max-w-md" data-testid="convert-applicant-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <GraduationCap className="h-4 w-4 text-primary" /> Enrol {application?.applicantName}
          </DialogTitle>
          <DialogDescription>
            This creates a student record with a new admission number, copies the guardian and documents across, and
            marks the application as enrolled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-medium text-foreground">Class placement</p>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger data-testid="convert-class-select">
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {options.map((cls) => (
                <SelectItem key={cls.id} value={cls.id} data-testid={`convert-class-${cls.id}`}>
                  {cls.name} · {cls.studentCount}/{cls.capacity} seats
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {application && (
            <p className="text-[11px] text-muted-foreground">
              Applied for {application.gradeApplied}
              {application.entranceScore !== undefined && ` · entrance score ${application.entranceScore}`}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="convert-cancel">
            Cancel
          </Button>
          <Button
            disabled={!classId || mutation.isPending}
            data-testid="convert-confirm"
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Enrolling…" : "Enrol student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
