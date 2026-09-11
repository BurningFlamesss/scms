import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createStudent, updateStudent, type StudentInput } from "#/services/students";
import { useAuth } from "#/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Separator } from "#/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import type { SchoolClass, Student } from "#/types";

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  classes: SchoolClass[];
  branches: { value: string; label: string }[];
  onSaved?: () => void;
}

const EMPTY: StudentInput = {
  firstName: "",
  lastName: "",
  gender: "female",
  dateOfBirth: "",
  classId: "",
  branchId: "branch_main",
  email: "",
  phone: "",
  address: "",
  city: "",
  bloodGroup: "O+",
  guardianName: "",
  guardianRelation: "Father",
  guardianPhone: "",
  guardianEmail: "",
};

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  classes,
  branches,
  onSaved,
}: StudentFormDialogProps) {
  const { actor } = useAuth();
  const [form, setForm] = useState<StudentInput>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (student) {
      setForm({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        classId: student.classId,
        branchId: student.branchId,
        email: student.email,
        phone: student.phone,
        address: student.address,
        city: student.city,
        bloodGroup: student.bloodGroup,
        guardianName: student.guardian.name,
        guardianRelation: student.guardian.relation,
        guardianPhone: student.guardian.phone,
        guardianEmail: student.guardian.email,
      });
    } else {
      setForm({ ...EMPTY, classId: classes[0]?.id ?? "" });
    }
    setErrors({});
  }, [open, student, classes]);

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.classId) next.classId = "Choose a class";
    if (!form.guardianName.trim()) next.guardianName = "Guardian name is required";
    if (!form.guardianPhone.trim()) next.guardianPhone = "A contact number is required";
    if (form.guardianEmail && !/^\S+@\S+\.\S+$/.test(form.guardianEmail)) next.guardianEmail = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (student) {
        return updateStudent(
          student.id,
          {
            firstName: form.firstName,
            lastName: form.lastName,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            classId: form.classId,
            branchId: form.branchId,
            email: form.email,
            phone: form.phone,
            address: form.address,
            city: form.city,
            bloodGroup: form.bloodGroup,
            guardian: {
              ...student.guardian,
              name: form.guardianName,
              relation: form.guardianRelation,
              phone: form.guardianPhone,
              email: form.guardianEmail,
            },
          },
          actor,
        );
      }
      return createStudent(form, actor);
    },
    onSuccess: (saved) => {
      toast.success(
        student ? `${saved.firstName} ${saved.lastName}'s record updated` : `${saved.firstName} ${saved.lastName} enrolled in ${saved.grade} · ${saved.section}`,
      );
      onSaved?.();
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-popover sm:max-w-2xl" data-testid="student-form-dialog">
        <DialogHeader>
          <DialogTitle className="font-display">{student ? "Edit student" : "Enroll a student"}</DialogTitle>
          <DialogDescription>
            {student
              ? "Update personal, academic or guardian information. Changes are written to the audit log."
              : "Admission numbers and roll numbers are generated automatically once the class is chosen."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section>
            <p className="eyebrow-label mb-2.5">Student</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName} required>
                <Input
                  value={form.firstName}
                  data-testid="student-first-name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("firstName", e.target.value)}
                />
              </Field>
              <Field label="Last name" error={errors.lastName} required>
                <Input
                  value={form.lastName}
                  data-testid="student-last-name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("lastName", e.target.value)}
                />
              </Field>
              <Field label="Class" error={errors.classId} required>
                <Select value={form.classId} onValueChange={(v: string) => set("classId", v)}>
                  <SelectTrigger data-testid="student-class">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id} data-testid={`student-class-${cls.id}`}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Gender">
                <Select value={form.gender} onValueChange={(v: string) => set("gender", v as "male" | "female")}>
                  <SelectTrigger data-testid="student-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of birth">
                <Input
                  type="date"
                  value={form.dateOfBirth}
                  data-testid="student-dob"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("dateOfBirth", e.target.value)}
                />
              </Field>
              <Field label="Campus">
                <Select value={form.branchId} onValueChange={(v: string) => set("branchId", v)}>
                  <SelectTrigger data-testid="student-branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {branches.map((branch) => (
                      <SelectItem key={branch.value} value={branch.value}>
                        {branch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          <Separator />

          <section>
            <p className="eyebrow-label mb-2.5">Contact</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Student email">
                <Input
                  value={form.email}
                  placeholder="Generated if left blank"
                  data-testid="student-email"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("email", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  data-testid="student-phone"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("phone", e.target.value)}
                />
              </Field>
              <Field label="Address">
                <Input
                  value={form.address}
                  data-testid="student-address"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("address", e.target.value)}
                />
              </Field>
              <Field label="City">
                <Input
                  value={form.city}
                  data-testid="student-city"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <Separator />

          <section>
            <p className="eyebrow-label mb-2.5">Guardian</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Guardian name" error={errors.guardianName} required>
                <Input
                  value={form.guardianName}
                  data-testid="student-guardian-name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("guardianName", e.target.value)}
                />
              </Field>
              <Field label="Relation">
                <Select
                  value={form.guardianRelation}
                  onValueChange={(v: string) => set("guardianRelation", v as StudentInput["guardianRelation"])}
                >
                  <SelectTrigger data-testid="student-guardian-relation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Guardian phone" error={errors.guardianPhone} required>
                <Input
                  value={form.guardianPhone}
                  data-testid="student-guardian-phone"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("guardianPhone", e.target.value)}
                />
              </Field>
              <Field label="Guardian email" error={errors.guardianEmail}>
                <Input
                  value={form.guardianEmail}
                  data-testid="student-guardian-email"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("guardianEmail", e.target.value)}
                />
              </Field>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="student-form-cancel">
            Cancel
          </Button>
          <Button
            data-testid="student-form-save"
            disabled={mutation.isPending}
            onClick={() => {
              if (validate()) mutation.mutate();
            }}
          >
            {mutation.isPending ? "Saving…" : student ? "Save changes" : "Enroll student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
