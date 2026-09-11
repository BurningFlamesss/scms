import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Application, Branch, Guardian } from "#/types";
import { createApplication, updateApplication, type ApplicationInput } from "#/services/operations";
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
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { Separator } from "#/components/ui/separator";

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application | null;
  grades: string[];
  branches: Branch[];
  onSaved?: (application: Application) => void;
}

const EMPTY: ApplicationInput = {
  applicantName: "",
  gradeApplied: "",
  gender: "female",
  dateOfBirth: "",
  email: "",
  phone: "",
  address: "",
  guardianName: "",
  guardianRelation: "Mother",
  guardianPhone: "",
  guardianEmail: "",
  previousSchool: "",
  previousGrade: "",
  entranceScore: undefined,
  source: "walk_in",
  branchId: "",
};

export function ApplicationFormDialog({
  open,
  onOpenChange,
  application,
  grades,
  branches,
  onSaved,
}: ApplicationFormDialogProps) {
  const { actor } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<ApplicationInput>(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      application
        ? {
            applicantName: application.applicantName,
            gradeApplied: application.gradeApplied,
            gender: application.gender,
            dateOfBirth: application.dateOfBirth,
            email: application.email,
            phone: application.phone,
            address: application.address,
            guardianName: application.guardian.name,
            guardianRelation: application.guardian.relation,
            guardianPhone: application.guardian.phone,
            guardianEmail: application.guardian.email,
            previousSchool: application.previousSchool,
            previousGrade: application.previousGrade,
            entranceScore: application.entranceScore,
            source: application.source,
            branchId: application.branchId,
          }
        : { ...EMPTY, gradeApplied: grades[0] ?? "", branchId: branches[0]?.id ?? "" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, application]);

  const set = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const mutation = useMutation({
    mutationFn: () =>
      application
        ? updateApplication(
            application.id,
            {
              applicantName: form.applicantName,
              gradeApplied: form.gradeApplied,
              gender: form.gender,
              dateOfBirth: form.dateOfBirth,
              email: form.email,
              phone: form.phone,
              address: form.address,
              previousSchool: form.previousSchool,
              previousGrade: form.previousGrade,
              entranceScore: form.entranceScore,
              source: form.source,
              branchId: form.branchId,
              guardian: {
                ...application.guardian,
                name: form.guardianName,
                relation: form.guardianRelation,
                phone: form.guardianPhone,
                email: form.guardianEmail,
              },
            },
            actor,
          )
        : createApplication(form, actor),
    onSuccess: (saved) => {
      toast.success(application ? "Application updated" : `Application ${saved.applicationNo} recorded`);
      qc.invalidateQueries({ queryKey: ["applications"] });
      qc.invalidateQueries({ queryKey: ["application", saved.id] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      onOpenChange(false);
      onSaved?.(saved);
    },
    onError: (err: Error) => setError(err.message),
  });

  const submit = () => {
    if (!form.applicantName.trim()) return setError("Enter the applicant's full name.");
    if (!form.gradeApplied) return setError("Choose the grade being applied for.");
    if (!form.guardianName.trim()) return setError("A guardian name is required for every application.");
    return mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl"
        data-testid="application-form-dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">{application ? "Edit application" : "New application"}</DialogTitle>
          <DialogDescription>
            Record a walk-in or phone enquiry. New applications enter the pipeline in the “Applied” stage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="app-name" className="text-xs">
                Applicant name
              </Label>
              <Input
                id="app-name"
                value={form.applicantName}
                placeholder="Amara Whitfield"
                data-testid="application-form-name"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("applicantName", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Grade applied for</Label>
              <Select value={form.gradeApplied} onValueChange={(value: string) => set("gradeApplied", value)}>
                <SelectTrigger data-testid="application-form-grade">
                  <SelectValue placeholder="Choose a grade" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade} data-testid={`application-form-grade-${grade.replace(/\s+/g, "-").toLowerCase()}`}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(value: string) => set("gender", value as "male" | "female")}>
                <SelectTrigger data-testid="application-form-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-dob" className="text-xs">
                Date of birth
              </Label>
              <Input
                id="app-dob"
                type="date"
                value={form.dateOfBirth}
                data-testid="application-form-dob"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("dateOfBirth", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-email" className="text-xs">
                Email
              </Label>
              <Input
                id="app-email"
                type="email"
                value={form.email}
                placeholder="applicant@mail.com"
                data-testid="application-form-email"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("email", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="app-phone"
                value={form.phone}
                placeholder="+1 (555) 000-0000"
                data-testid="application-form-phone"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("phone", event.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="app-address" className="text-xs">
                Address
              </Label>
              <Input
                id="app-address"
                value={form.address}
                placeholder="12 Maple Street, Northfield"
                data-testid="application-form-address"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("address", event.target.value)}
              />
            </div>
          </div>

          <Separator />
          <p className="eyebrow-label">Guardian</p>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="app-guardian" className="text-xs">
                Guardian name
              </Label>
              <Input
                id="app-guardian"
                value={form.guardianName}
                data-testid="application-form-guardian-name"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("guardianName", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Relation</Label>
              <Select
                value={form.guardianRelation}
                onValueChange={(value: string) => set("guardianRelation", value as Guardian["relation"])}
              >
                <SelectTrigger data-testid="application-form-guardian-relation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-guardian-phone" className="text-xs">
                Guardian phone
              </Label>
              <Input
                id="app-guardian-phone"
                value={form.guardianPhone}
                data-testid="application-form-guardian-phone"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("guardianPhone", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-guardian-email" className="text-xs">
                Guardian email
              </Label>
              <Input
                id="app-guardian-email"
                type="email"
                value={form.guardianEmail}
                data-testid="application-form-guardian-email"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("guardianEmail", event.target.value)}
              />
            </div>
          </div>

          <Separator />
          <p className="eyebrow-label">Background</p>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="app-prev-school" className="text-xs">
                Previous school
              </Label>
              <Input
                id="app-prev-school"
                value={form.previousSchool}
                data-testid="application-form-previous-school"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("previousSchool", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-prev-grade" className="text-xs">
                Previous grade
              </Label>
              <Input
                id="app-prev-grade"
                value={form.previousGrade}
                data-testid="application-form-previous-grade"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => set("previousGrade", event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-score" className="text-xs">
                Entrance score (optional)
              </Label>
              <Input
                id="app-score"
                type="number"
                min={0}
                max={100}
                value={form.entranceScore ?? ""}
                data-testid="application-form-score"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  set("entranceScore", event.target.value === "" ? undefined : Number(event.target.value))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select
                value={form.source}
                onValueChange={(value: string) => set("source", value as Application["source"])}
              >
                <SelectTrigger data-testid="application-form-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">Campus</Label>
              <Select value={form.branchId} onValueChange={(value: string) => set("branchId", value)}>
                <SelectTrigger data-testid="application-form-branch">
                  <SelectValue placeholder="Choose a campus" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" data-testid="application-form-error">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="application-form-cancel">
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={submit} data-testid="application-form-submit">
            {mutation.isPending ? "Saving…" : application ? "Save application" : "Record application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
