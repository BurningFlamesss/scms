import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MailPlus, MoreHorizontal, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  changeUserRole,
  createUser,
  deleteUser,
  listRoleDefinitions,
  listSessions,
  listUsers,
  resendInvitation,
  revokeInvitation,
  revokeSession,
  setAccountStatus,
  simulateActivation,
  userSummary,
  type CreateUserInput,
} from "@/services/users";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PersonCell } from "@/components/common/PersonCell";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_DESCRIPTION, ROLE_LABEL } from "@/lib/permissions";
import { formatDateTime, relativeTime } from "@/lib/format";
import type { Role, SessionRecord, UserAccount } from "@/types";

const INVITE_STEPS = [
  { label: "Create user", detail: "Name, email and campus" },
  { label: "Assign role", detail: "Determines console access" },
  { label: "Link profile", detail: "Staff, student or guardian" },
  { label: "Send invitation", detail: "Expires after 7 days" },
  { label: "User activates", detail: "Sets a password and verifies email" },
];

export default function UsersPage() {
  const { actor, can } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const searchParams = (useSearch({ strict: false }) as Record<string, string | undefined>) || {};
  const tab = searchParams.tab ?? "directory";

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [accountStatus, setStatus] = useState("all");
  const [invitationStatus, setInvitationStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(searchParams.new === "1");
  const [form, setForm] = useState<CreateUserInput>({
    name: "",
    email: "",
    role: "staff",
    profileType: "staff",
    profileLabel: "",
    branchId: "branch_main",
    sendInvitation: true,
  });
  const [confirm, setConfirm] = useState<{ title: string; description: string; label: string; destructive?: boolean; run: () => void } | null>(null);

  useEffect(() => {
    if (searchParams.new === "1") setCreateOpen(true);
  }, [searchParams.new]);

  const summary = useMemo(() => userSummary(), []);
  const effectiveInvitation = tab === "invitations" && invitationStatus === "all" ? "pending" : invitationStatus;
  const query = { search, role, accountStatus, invitationStatus: effectiveInvitation, page, pageSize: 10 };
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["users", query], queryFn: () => listUsers(query) });
  const { data: roles = [] } = useQuery({ queryKey: ["roles"], queryFn: listRoleDefinitions });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: listSessions });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["users"] });
    qc.invalidateQueries({ queryKey: ["roles"] });
    qc.invalidateQueries({ queryKey: ["overview"] });
  };

  const createMutation = useMutation({
    mutationFn: () => createUser(form, actor),
    onSuccess: (user) => {
      toast.success(form.sendInvitation ? `Invitation sent to ${user.email}` : `${user.name} created`);
      setCreateOpen(false);
      setForm({ ...form, name: "", email: "", profileLabel: "" });
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const action = useMutation({
    mutationFn: async ({ kind, id, nextRole }: { kind: string; id: string; nextRole?: Role }) => {
      if (kind === "resend") return resendInvitation(id, actor);
      if (kind === "revoke") return revokeInvitation(id, actor);
      if (kind === "activate") return simulateActivation(id, actor);
      if (kind === "suspend") return setAccountStatus(id, "suspended", actor);
      if (kind === "reactivate") return setAccountStatus(id, "active", actor);
      if (kind === "role" && nextRole) return changeUserRole(id, nextRole, actor);
      if (kind === "delete") return deleteUser(id, actor);
      return undefined;
    },
    onSuccess: () => {
      toast.success("User updated");
      setConfirm(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sessionMutation = useMutation({
    mutationFn: (id: string) => revokeSession(id, actor),
    onSuccess: () => {
      toast.success("Session revoked");
      setConfirm(null);
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const columns: Column<UserAccount>[] = [
    {
      key: "name",
      header: "User account",
      sortable: true,
      render: (user) => <PersonCell name={user.name} subtitle={user.email} avatarUrl={user.avatarUrl} />,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <StatusBadge value="normal" label={ROLE_LABEL[user.role]} dot={false} />,
    },
    {
      key: "profile",
      header: "Linked profile",
      render: (user) => (
        <div className="min-w-0">
          <p className="truncate text-sm capitalize text-foreground">{user.profileType}</p>
          <p className="truncate text-xs text-muted-foreground">{user.profileLabel ?? "—"}</p>
        </div>
      ),
    },
    {
      key: "accountStatus",
      header: "Account",
      render: (user) => <StatusBadge value={user.accountStatus} testId={`user-account-status-${user.id}`} />,
    },
    {
      key: "invitationStatus",
      header: "Invitation",
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge value={user.invitationStatus} testId={`user-invite-status-${user.id}`} />
          {user.invitationExpiresAt && user.invitationStatus === "pending" && (
            <span className="text-[11px] text-muted-foreground">expires {relativeTime(user.invitationExpiresAt)}</span>
          )}
        </div>
      ),
    },
    {
      key: "verified",
      header: "Email",
      align: "center",
      render: (user) =>
        user.emailVerified ? (
          <CheckCircle2 className="mx-auto h-4 w-4 text-success" aria-label="Verified" />
        ) : (
          <XCircle className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Unverified" />
        ),
    },
    {
      key: "lastActiveAt",
      header: "Last active",
      render: (user) => <span className="text-xs text-muted-foreground">{user.lastActiveAt ? relativeTime(user.lastActiveAt) : "Never"}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User actions"
              data-testid={`user-actions-${user.id}`}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-popover">
            <DropdownMenuLabel className="text-xs">{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.invitationStatus === "pending" || user.invitationStatus === "expired" ? (
              <>
                <DropdownMenuItem data-testid={`user-resend-${user.id}`} onClick={() => action.mutate({ kind: "resend", id: user.id })}>
                  Resend invitation
                </DropdownMenuItem>
                <DropdownMenuItem data-testid={`user-simulate-activation-${user.id}`} onClick={() => action.mutate({ kind: "activate", id: user.id })}>
                  Simulate activation
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  data-testid={`user-revoke-${user.id}`}
                  onClick={() =>
                    setConfirm({
                      title: "Revoke this invitation?",
                      description: `${user.name} will no longer be able to activate their account with the current link.`,
                      label: "Revoke invitation",
                      destructive: true,
                      run: () => action.mutate({ kind: "revoke", id: user.id }),
                    })
                  }
                >
                  Revoke invitation
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem data-testid={`user-invite-${user.id}`} onClick={() => action.mutate({ kind: "resend", id: user.id })}>
                <MailPlus className="mr-2 h-3.5 w-3.5" /> Send new invitation
              </DropdownMenuItem>
            )}
            {can("users.manage") && (
              <>
                <DropdownMenuSeparator />
                {((["super_admin", "admin", "staff"] as Role[]).filter((r) => r !== user.role)).map((r) => (
                  <DropdownMenuItem key={r} onClick={() => action.mutate({ kind: "role", id: user.id, nextRole: r })}>
                    Make {ROLE_LABEL[r]}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {user.accountStatus === "suspended" ? (
                  <DropdownMenuItem onClick={() => action.mutate({ kind: "reactivate", id: user.id })}>
                    Reactivate account
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirm({
                        title: "Suspend this account?",
                        description: `${user.name} will be signed out and blocked from signing in until reactivated.`,
                        label: "Suspend account",
                        run: () => action.mutate({ kind: "suspend", id: user.id }),
                      })
                    }
                  >
                    Suspend account
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() =>
                    setConfirm({
                      title: "Delete this user account?",
                      description: "The linked staff, student or guardian profile is kept, but console access is removed permanently.",
                      label: "Delete account",
                      destructive: true,
                      run: () => action.mutate({ kind: "delete", id: user.id }),
                    })
                  }
                >
                  Delete account
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div data-testid="users-page">
      <PageHeader
        eyebrow="People"
        title="Users & Roles"
        description="User accounts are separate from staff, student and guardian profiles. Roles decide what each account can do."
        meta={
          <>
            <span data-testid="users-total">{summary.total} accounts</span>
            <span>{summary.pendingInvites} pending invitations</span>
            <span>{summary.unverified} unverified emails</span>
          </>
        }
        actions={
          can("users.manage") ? (
            <Button size="sm" className="gap-1.5" data-testid="users-create" onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" /> Create user
            </Button>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value: string) => {
          navigate({
            search: (prev: Record<string, any>) => {
              const next = { ...prev };
              next.tab = value;
              return next;
            },
            replace: true,
          });
        }}
      >
        <TabsList className="mb-4 h-9">
          <TabsTrigger value="directory" className="text-xs" data-testid="users-tab-directory">
            Directory
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs" data-testid="users-tab-roles">
            Roles & permissions
          </TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs" data-testid="users-tab-invitations">
            Invitations
          </TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs" data-testid="users-tab-sessions">
            Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <FilterBar
            testId="users-filters"
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by name, email or linked profile…"
            filters={[
              {
                key: "role",
                label: "Role",
                value: role,
                options: [
                  { value: "all", label: "All roles" },
                  { value: "super_admin", label: "Super Admin" },
                  { value: "admin", label: "Admin" },
                  { value: "staff", label: "Staff" },
                  { value: "student", label: "Student" },
                  { value: "guardian", label: "Guardian" },
                ],
                onChange: (v) => {
                  setRole(v);
                  setPage(1);
                },
              },
              {
                key: "status",
                label: "Account",
                value: accountStatus,
                options: [
                  { value: "all", label: "Any account" },
                  { value: "active", label: "Active" },
                  { value: "invited", label: "Invited" },
                  { value: "suspended", label: "Suspended" },
                  { value: "deactivated", label: "Deactivated" },
                ],
                onChange: (v) => {
                  setStatus(v);
                  setPage(1);
                },
              },
            ]}
            onReset={() => {
              setSearch("");
              setRole("all");
              setStatus("all");
            }}
          />
          <DataTable<UserAccount>
            testId="users-table"
            columns={columns}
            rows={data?.rows ?? []}
            rowId={(u) => u.id}
            rowTestId={(u) => `user-row-${u.id}`}
            loading={isLoading}
            error={isError ? true : undefined}
            onRetry={() => refetch()}
            page={data?.page ?? 1}
            total={data?.total ?? 0}
            onPageChange={setPage}
            empty={
              <EmptyState
                icon={ShieldCheck}
                title="No accounts match these filters"
                description="Try a different role or account status, or create a new user and send them an invitation."
                primaryLabel={can("users.manage") ? "Create user" : undefined}
                onPrimary={() => setCreateOpen(true)}
                testId="users-empty"
              />
            }
          />
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-4 lg:grid-cols-2">
            {roles.map((definition) => (
              <Panel
                key={definition.key}
                title={ROLE_LABEL[definition.key]}
                description={`${definition.userCount} accounts`}
                testId={`role-card-${definition.key}`}
                actions={definition.isSystem ? <StatusBadge value="internal" label="System role" dot={false} /> : null}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{ROLE_DESCRIPTION[definition.key]}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {definition.permissions.slice(0, 14).map((permission) => (
                    <span
                      key={permission}
                      className="rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {permission}
                    </span>
                  ))}
                  {definition.permissions.length > 14 && (
                    <span className="text-[11px] text-muted-foreground">
                      +{definition.permissions.length - 14} more
                    </span>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invitations">
          <Panel
            title="Invitation workflow"
            description="How an account moves from creation to activation"
            className="mb-4"
            testId="invitation-workflow"
          >
            <ol className="grid gap-2 sm:grid-cols-5">
              {INVITE_STEPS.map((step, index) => (
                <li key={step.label} className="rounded-lg border border-hairline bg-surface-2 p-2.5">
                  <span className="num text-[10px] font-semibold text-primary">STEP {index + 1}</span>
                  <p className="mt-0.5 text-xs font-medium text-foreground">{step.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{step.detail}</p>
                </li>
              ))}
            </ol>
          </Panel>
          <FilterBar
            testId="invitations-filters"
            search={search}
            onSearchChange={setSearch}
            placeholder="Search invitations…"
            filters={[
              {
                key: "invitation",
                label: "Invitation",
                value: invitationStatus,
                options: [
                  { value: "all", label: "Pending" },
                  { value: "pending", label: "Pending" },
                  { value: "activated", label: "Activated" },
                  { value: "expired", label: "Expired" },
                  { value: "revoked", label: "Revoked" },
                ],
                onChange: setInvitationStatus,
              },
            ]}
            onReset={() => {
              setSearch("");
              setInvitationStatus("all");
            }}
          />
          <DataTable<UserAccount>
            testId="invitations-table"
            columns={columns.filter((c) => c.key !== "profile" && c.key !== "lastActiveAt")}
            rows={data?.rows ?? []}
            rowId={(u) => u.id}
            loading={isLoading}
            page={data?.page ?? 1}
            total={data?.total ?? 0}
            onPageChange={setPage}
            empty={
              <EmptyState
                icon={MailPlus}
                title="No invitations here"
                description="Invitations you send appear here until they are activated, expire or are revoked."
                testId="invitations-empty"
              />
            }
          />
        </TabsContent>

        <TabsContent value="sessions">
          <DataTable<SessionRecord>
            testId="sessions-table"
            columns={[
              {
                key: "userName",
                header: "User",
                render: (session) => (
                  <div>
                    <p className="text-sm text-foreground">{session.userName}</p>
                    <p className="text-xs text-muted-foreground">{session.browser}</p>
                  </div>
                ),
              },
              { key: "device", header: "Device", render: (s) => <span className="text-sm text-foreground">{s.device}</span> },
              { key: "location", header: "Location", render: (s) => <span className="text-xs text-muted-foreground">{s.location}</span> },
              { key: "ip", header: "IP", render: (s) => <span className="num font-mono text-xs text-muted-foreground">{s.ip}</span> },
              {
                key: "lastActiveAt",
                header: "Last active",
                render: (s) => (
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(s.lastActiveAt)}
                    {s.current && <span className="ml-1.5 text-success">· this device</span>}
                  </span>
                ),
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (session) => (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={session.current}
                    data-testid={`session-revoke-${session.id}`}
                    onClick={() =>
                      setConfirm({
                        title: "Revoke this session?",
                        description: `${session.userName} will be signed out on ${session.device}.`,
                        label: "Revoke session",
                        destructive: true,
                        run: () => sessionMutation.mutate(session.id),
                      })
                    }
                  >
                    Revoke
                  </Button>
                ),
              },
            ]}
            rows={sessions}
            rowId={(s) => s.id}
            total={sessions.length}
            pageSize={sessions.length || 1}
            empty={<EmptyState title="No active sessions" description="Sessions appear here when users sign in to the console." />}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            navigate({
              search: (prev: Record<string, any>) => {
                const next = { ...prev };
                delete next.new;
                return next;
              },
              replace: true,
            });
          }
        }}
      >
        <DialogContent className="bg-popover sm:max-w-lg" data-testid="user-create-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Create user account</DialogTitle>
            <DialogDescription>
              The account is separate from the person's profile. Assign a role, then send an invitation so they can set
              their own password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full name *</Label>
              <Input value={form.name} data-testid="user-name" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input value={form.email} data-testid="user-email" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={(v: string) => setForm({ ...form, role: v as Role })}>
                  <SelectTrigger data-testid="user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Profile type</Label>
                <Select
                  value={form.profileType}
                  onValueChange={(v: string) => setForm({ ...form, profileType: v as CreateUserInput["profileType"] })}
                >
                  <SelectTrigger data-testid="user-profile-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                    <SelectItem value="none">No profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Profile description</Label>
              <Input
                value={form.profileLabel}
                placeholder="e.g. Registrar · Administration"
                data-testid="user-profile-label"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, profileLabel: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-2 p-3">
              <div>
                <p className="text-xs font-medium text-foreground">Send invitation now</p>
                <p className="text-[11px] text-muted-foreground">The invitation link expires after 7 days.</p>
              </div>
              <Switch
                checked={form.sendInvitation}
                onCheckedChange={(checked: boolean) => setForm({ ...form, sendInvitation: checked })}
                data-testid="user-send-invitation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              data-testid="user-create-save"
              disabled={!form.name || !form.email || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Creating…" : form.sendInvitation ? "Create & invite" : "Create account"}
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
        busy={action.isPending || sessionMutation.isPending}
        onConfirm={() => confirm?.run()}
        testId="users-confirm"
      />
    </div>
  );
}
