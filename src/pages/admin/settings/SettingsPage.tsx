import { Settings as SettingsIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSettings, listBranches } from "#/services/website";
import { ModulePlaceholder } from "#/components/common/ModulePlaceholder";

export default function SettingsPage() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const { data: branches = [] } = useQuery({ queryKey: ["branches"], queryFn: listBranches });

  return (
    <ModulePlaceholder
      testId="settings-page"
      eyebrow="System"
      title="Settings"
      description="School profile, organisation structure, security policy, website and notification preferences."
      icon={SettingsIcon}
      stats={[
        { key: "school", label: "School", value: settings?.shortName ?? "—", hint: settings?.city },
        { key: "branches", label: "Branches", value: String(branches.length) },
        {
          key: "site",
          label: "Public site",
          value: settings ? (settings.publicSite.enabled ? "Live" : "Offline") : "—",
        },
        {
          key: "mfa",
          label: "Admin MFA",
          value: settings ? (settings.security.requireMfaForAdmins ? "Required" : "Optional") : "—",
        },
      ]}
      capabilities={[
        "School profile: name, tagline, contact details, branding and social profiles.",
        "Organisation: branches and academic years, including setting the current year.",
        "Users & security: password policy, session timeout, admin MFA and guardian self-signup.",
        "Website and notification preferences with per-rule email / SMS / in-app toggles.",
      ]}
    />
  );
}
