import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, MailPlus, MoreHorizontal, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  changeStaffRole,
  createStaff,
  inviteStaff,
  listStaff,
  setStaffStatus,
  staffDirectorySummary,
  staffFilterOptions,
  type StaffInput,
} from "#/services/staff";
import { useAuth } from "#/providers/AuthProvider";
import { PageHeader } from "#/components/common/PageHeader";
import { FilterBar, toOptions } from "#/components/common/FilterBar";
import { DataTable, type Column, type SortState } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { StatusBadge } from "#/components/common/StatusBadge";
import { PersonCell } from "#/components/common/PersonCell";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#/components/ui/select";
import { ROLE_LABEL } from "#/lib/permissions";
import { downloadTextFile, formatDate, toCsv } from "#/lib/format";
import type { EmploymentStatus, Role, StaffMember } from "#/types";

const EMPTY_STAFF: StaffInput = {
  firstName: "",
  lastName: "",
  gender: "female",
  email: "",
  phone: "",
  department: "Mathematics",
  designation: "Teacher",
  employmentType: "full_time",
  joiningDate: new Date().toISOString().slice(0, 10),
  branchId: "branch_main",
  role: "staff",
  qualification: "M.Ed.",
};

export default function StaffPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params, setParams] = useSearch();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [designation, setDesignation] = useState("all");
  const [status, setStatus] = useState("all");
  const [branch, setBranch] = useState("all");
  const [sort, setSort] = useState<SortState>({ key: "firstName", dir: "asc" });
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(params.get("new") === "1");
  const [form, setForm] = useState<StaffInput>(EMPTY_STAFF);
  const [roleTarget, setRoleTarget] = useState<StaffMember | null>(null);
  const [nextRole, setNextRole] = useState<Role>("staff");
  const [confirm, setConfirm] = useState<{ title: string; description: string; label: string; destructive?: boolean; run: () => void } | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") setFormOpen(true);
  }, [params]);

  const options = useMemo(() => staffFilterOptions(), []);
  const summary = useMemo(() => staffDirectorySummary(), []);
  const query = { search, department, designation, employmentStatus: status, branchId: branch, sort: sort.key, dir: sort.dir, page, pageSize: 10 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["staff", query], queryFn: () => listStaff(query) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["staff"] });
    qc.invalidateQueries({ queryKey: ["users"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const createMutation = useMutation({
    mutationFn: () => createStaff(form, actor),
    onSuccess: (member) => {
      toast.success(`${member.firstName} ${member.lastName} added to ${member.department}`);
      setFormOpen(false);
      setForm(EMPTY_STAFF);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: EmploymentStatus }) => setStaffStatus(id, next, actor),
    onSuccess: (member) => {
      toast.success(`${member.firstName} ${member.lastName} · ${member.employmentStatus.replace(/_/g, " ")}`);
      setConfirm(null);
      invalidate();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (id: string) => inviteStaff(id, actor),
    onSuccess: (member) => {
      toast.success(`Invitation sent to ${member.email}`);
      invalidate();
    },
  });

  const roleMutation = useMutation({
    mutationFn: () => changeStaffRole(roleTarget!.id, nextRole, actor),
    onSuccess: (member) => {
      toast.success(`${member.firstName} is now ${ROLE_LABEL[member.role]}`);
      setRoleTarget(null);
      invalidate();
    },
  });

  const exportStaff = (rows: StaffMember[]) => {
    downloadTextFile(
      `northfield-staff-${Date.now()}.csv`,
      toCsv(
        rows.map((s) => ({
          employeeId: s.employeeId,
          name: `${s.firstName} ${s.lastName}`,
          department: s.department,
          designation: s.designation,
          role: s.role,
          status: s.employmentStatus,
          email: s.email,
          phone: s.phone,
          joiningDate: s.joiningDate,
        })),
      ),
    );
    toast.success(`Exported ${rows.length} staff records`);
  };

  const columns: Column<StaffMember>[] = [
    {
      key: "firstName",
      header: "Staff member",
      sortable: true,
      render: (member) => (
        <PersonCell
          name={`${member.firstName} ${member.lastName}`}
          subtitle={member.employeeId}
          avatarUrl={member.avatarUrl}
          to={`/staff/${member.id}`}
          mono
          testId={`staff-link-${member.id}`}
        />
      ),
    },
    {
      key: "designation",
      header: "Role at school",
      sortable: true,
      render: (member) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{member.designation}</p>
          <p className="truncate text-xs text-muted-foreground">{member.department}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "App role",
      render: (member) => <StatusBadge value="internal" label={ROLE_LABEL[member.role]} dot={false} />,
    },
    {
      key: "joiningDate",
      header: "Joined",
      sortable: true,
      render: (member) => <span className="num text-xs text-muted-foreground">{formatDate(member.joiningDate)}</span>,
    },
    {
      key: "classes",
      header: "Assignments",
      render: (member) => (
        <span className="num text-xs text-muted-foreground">
          {member.assignedClassIds.length} classes · {member.assignedCourseIds.length} subjects
        </span>
      ),
    },
    {
      key: "employmentStatus",
      header: "Status",
      sortable: true,
      render: (member) => <StatusBadge value={member.employmentStatus} testId={`staff-status-${member.id}`} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (member) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Staff actions"
              data-testid={`staff-actions-${member.id}`}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover">
            <DropdownMenuLabel className="text-xs">
              {member.firstName} {member.lastName}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/staff/${member.id}`)}>View profile</DropdownMenuItem>
            {can("staff.manage") && (
              <>
                <DropdownMenuItem onClick={() => inviteMutation.mutate(member.id)} data-testid={`staff-invite-${member.id}`}>
                  <MailPlus className="mr-2 h-3.5 w-3.5" /> Invite to console
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-testid={`staff-change-role-${member.id}`}
                  onClick={() => {
                    setRoleTarget(member);
                    setNextRole(member.role);
                  }}
                >
                  Change role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportStaff([member])}>
                  <Download className="mr-2 h-3.5 w-3.5" /> Export record
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setConfirm({
                      title: "Mark as on leave?",
                      description: `${member.firstName} will be excluded from duty rosters until they return.`,
                      label: "Set on leave",
                      run: () => statusMutation.mutate({ id: member.id, next: "on_leave" }),
                    })
                  }
                >
                  Set on leave
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setConfirm({
                      title: "Retire this staff member?",
                      description: `${member.firstName} ${member.lastName} will be retired and their console account deactivated.`,
                      label: "Retire",
                      run: () => statusMutation.mutate({ id: member.id, next: "retired" }),
                    })
                  }
                >
                  Retire
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  data-testid={`staff-terminate-${member.id}`}
                  onClick={() =>
                    setConfirm({
                      title: "Terminate employment?",
                      description: `This ends ${member.firstName} ${member.lastName}'s employment and revokes console access immediately.`,
                      label: "Terminate",
                      destructive: true,
                      run: () => statusMutation.mutate({ id: member.id, next: "terminated" }),
                    })
                  }
                >
                  Terminate
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div data-testid="staff-page">
      <PageHeader
        eyebrow="People"
        title="Staff"
        description="Teaching and support staff with employment status, assignments and console access."
        meta={
          <>
            <span data-testid="staff-total-count">{data?.total ?? 0} matching records</span>
            <span>{summary.active} active · {summary.onLeave} on leave</span>
            <span>{summary.departments} departments</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" data-testid="staff-export" onClick={() => exportStaff(data?.rows ?? [])}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            {can("staff.manage") && (
              <Button size="sm" className="gap-1.5" data-testid="staff-add" onClick={() => setFormOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" /> Add staff
              </Button>
            )}
          </>
        }
      />

      <FilterBar
        testId="staff-filters"
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search by name, employee ID or designation…"
        filters={[
          { key: "department", label: "Department", value: department, options: toOptions(options.departments, "All departments"), onChange: (v) => { setDepartment(v); setPage(1); }, width: "w-[170px]" },
          { key: "designation", label: "Designation", value: designation, options: toOptions(options.designations, "All designations"), onChange: (v) => { setDesignation(v); setPage(1); }, width: "w-[180px]" },
          {
            key: "status",
            label: "Employment",
            value: status,
            options: [
              { value: "all", label: "Any status" },
              { value: "active", label: "Active" },
              { value: "probation", label: "Probation" },
              { value: "on_leave", label: "On leave" },
              { value: "retired", label: "Retired" },
              { value: "terminated", label: "Terminated" },
            ],
            onChange: (v) => { setStatus(v); setPage(1); },
          },
          {
            key: "branch",
            label: "Branch",
            value: branch,
            options: [{ value: "all", label: "All campuses" }, ...options.branches],
            onChange: (v) => { setBranch(v); setPage(1); },
            width: "w-[170px]",
          },
        ]}
        onReset={() => {
          setSearch("");
          setDepartment("all");
          setDesignation("all");
          setStatus("all");
          setBranch("all");
        }}
      />

      <DataTable<StaffMember>
        testId="staff-table"
        columns={columns}
        rows={data?.rows ?? []}
        rowId={(m) => m.id}
        rowTestId={(m) => `staff-row-${m.id}`}
        loading={isLoading}
        error={isError ? true : undefined}
        onRetry={() => refetch()}
        onRowClick={(m) => navigate(`/staff/${m.id}`)}
        sort={sort}
        onSortChange={setSort}
        page={data?.page ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
        empty={
          <EmptyState
            icon={Users}
            title="No staff match these filters"
            description="Adjust the department or employment filters, or add a new staff member to the directory."
            primaryLabel={can("staff.manage") ? "Add staff member" : undefined}
            onPrimary={() => setFormOpen(true)}
            testId="staff-empty"
          />
        }
      />

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            const next = new URLSearchParams(params);
            next.delete("new");
            setParams(next, { replace: true });
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-popover sm:max-w-xl" data-testid="staff-form-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Add staff member</DialogTitle>
            <DialogDescription>
              New staff start on probation. Invite them separately to create their console account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">First name *</Label>
              <Input value={form.firstName} data-testid="staff-first-name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last name *</Label>
              <Input value={form.lastName} data-testid="staff-last-name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work email *</Label>
              <Input value={form.email} data-testid="staff-email" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.phone} data-testid="staff-phone" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={(v: string) => setForm({ ...form, department: v })}>
                <SelectTrigger data-testid="staff-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {options.departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Designation</Label>
              <Input value={form.designation} data-testid="staff-designation" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, designation: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Application role</Label>
              <Select value={form.role} onValueChange={(v: string) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger data-testid="staff-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {actor.role === "super_admin" && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Joining date</Label>
              <Input type="date" value={form.joiningDate} data-testid="staff-joining-date" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, joiningDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="staff-form-save"
              disabled={!form.firstName || !form.lastName || !form.email || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Saving…" : "Add staff member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(roleTarget)} onOpenChange={(open) => !open && setRoleTarget(null)}>
        <DialogContent className="bg-popover sm:max-w-md" data-testid="staff-role-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Change application role</DialogTitle>
            <DialogDescription>
              This controls what {roleTarget?.firstName} can see and do inside the admin console.
            </DialogDescription>
          </DialogHeader>
          <Select value={nextRole} onValueChange={(v: string) => setNextRole(v as Role)}>
            <SelectTrigger data-testid="staff-role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button data-testid="staff-role-save" disabled={roleMutation.isPending} onClick={() => roleMutation.mutate()}>
              {roleMutation.isPending ? "Saving…" : "Update role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.label}
        destructive={confirm?.destructive}
        busy={statusMutation.isPending}
        onConfirm={() => confirm?.run()}
        testId="staff-confirm"
      />
    </div>
  );
}
