import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	CloudUpload,
	Globe,
	Pencil,
	RefreshCw,
	Search,
	Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionEditor } from "@/components/cms/SectionEditor";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Panel } from "@/components/common/Panel";
import { PanelSkeleton } from "@/components/common/Skeletons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	type CmsPageKey,
	pageSectionTypes,
	sectionDefaults,
	sectionLabel,
} from "@/lib/cms-sections";
import { formatDateTime, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
	getWebsitePage,
	listWebsitePages,
	publishPage,
	saveSectionFields,
	unpublishPage,
	updatePageSeo,
} from "@/lib/website-admin-api";
import { useAuth } from "@/providers/AuthProvider";
import type { BlockType, WebsitePage, WebsitePageKey } from "@/types";

const PAGE_KEYS: WebsitePageKey[] = ["faculty", "login"];

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

export default function WebsiteContentPage() {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();
	const navigate = useNavigate();
	const searchParams =
		(useSearch({ strict: false }) as Record<string, string | undefined>) || {};

	const rawKey = searchParams.page as WebsitePageKey | null;
	const pageKey: WebsitePageKey =
		rawKey && PAGE_KEYS.includes(rawKey) ? rawKey : "faculty";

	const [selectedType, setSelectedType] = useState<BlockType | null>(null);
	const [iframeVersion, setIframeVersion] = useState(0);
	const [seoOpen, setSeoOpen] = useState(false);
	const [seoDraft, setSeoDraft] = useState({
		title: "",
		description: "",
		keywords: "",
	});

	const { data: pages = [] } = useQuery({
		queryKey: ["website-pages"],
		queryFn: async () => clone(await listWebsitePages()),
	});

	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", pageKey],
		queryFn: async () => {
			const found = await getWebsitePage(pageKey);
			return found ? clone(found) : null;
		},
	});

	useEffect(() => {
		setSelectedType(null);
	}, [pageKey]);

	useEffect(() => {
		if (page)
			setSeoDraft({
				title: page.seoTitle,
				description: page.seoDescription,
				keywords: page.seoKeywords,
			});
	}, [page]);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as
				| { source?: string; type?: string; sectionType?: unknown }
				| undefined;
			if (data?.source !== "scms-cms" || data?.type !== "select-section")
				return;
			if (typeof data.sectionType === "string")
				setSelectedType(data.sectionType as BlockType);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	const sectionTypes = useMemo(
		() => pageSectionTypes(pageKey as CmsPageKey),
		[pageKey],
	);

	const selectedBlock =
		page?.blocks.find((block) => block.type === selectedType) ?? null;
	const selectedFields = selectedType
		? (selectedBlock?.fields ?? sectionDefaults(selectedType))
		: undefined;

	const applyPage = (next: WebsitePage) => {
		qc.setQueryData(["website-page", next.key], clone(next));
		void qc.invalidateQueries({ queryKey: ["website-pages"] });
		void qc.invalidateQueries({ queryKey: ["overview"] });
		void qc.invalidateQueries({ queryKey: ["activity"] });
	};

	const saveSection = useMutation({
		mutationFn: (fields: Record<string, unknown>) => {
			if (!selectedType) throw new Error("No section selected");
			return saveSectionFields(pageKey, selectedType, fields, actor);
		},
		onSuccess: (next) => {
			applyPage(next);
			setIframeVersion((version) => version + 1);
			toast.success("Section saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const seoMutation = useMutation({
		mutationFn: () => updatePageSeo(pageKey, seoDraft, actor),
		onSuccess: (next) => {
			applyPage(next);
			setSeoOpen(false);
			toast.success("Search settings saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			void qc.invalidateQueries({ queryKey: ["notifications"] });
			toast.success(`${next.title} is live`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			toast.success(`${next.title} reverted to draft`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const changePage = (value: string) => {
		navigate({
			search: (prev: Record<string, string | undefined>) => {
				const next = { ...prev };
				next.page = value;
				return next;
			},
			replace: true,
		});
	};

	return (
		<div data-testid="website-content-page">
			<PageHeader
				wash
				eyebrow="Website"
				title="Website Content"
				description="Preview each page and click a section to edit its content — changes are saved to the database and shown to visitors after publishing."
				meta={
					page ? (
						<>
							<StatusBadge value={page.status} testId="cms-page-status" />
							{page.hasUnpublishedChanges && (
								<span
									className="inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent"
									data-testid="cms-unpublished-chip"
								>
									Unpublished changes
								</span>
							)}
							<span
								className="font-mono text-[11px]"
								data-testid="cms-page-path"
							>
								{page.path}
							</span>
							<span data-testid="cms-page-updated">
								Updated {relativeTime(page.updatedAt)} by {page.updatedBy}
							</span>
							<span data-testid="cms-page-published">
								{page.publishedAt
									? `Published ${formatDateTime(page.publishedAt)}`
									: "Never published"}
							</span>
						</>
					) : null
				}
				actions={
					<>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							data-testid="cms-seo-open"
							onClick={() => setSeoOpen(true)}
						>
							<Search className="h-3.5 w-3.5" /> Search settings
						</Button>
						{canManage && page?.status === "published" && (
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={unpublishMutation.isPending}
								data-testid="cms-unpublish-button"
								onClick={() => unpublishMutation.mutate()}
							>
								<Undo2 className="h-3.5 w-3.5" /> Unpublish
							</Button>
						)}
						{canManage && (
							<Button
								size="sm"
								className="gap-1.5"
								disabled={publishMutation.isPending}
								data-testid="cms-publish-button"
								onClick={() => publishMutation.mutate()}
							>
								<CloudUpload className="h-3.5 w-3.5" />
								{publishMutation.isPending ? "Publishing…" : "Publish"}
							</Button>
						)}
					</>
				}
			/>

			<div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
				<Tabs value={pageKey} onValueChange={changePage}>
					<TabsList className="h-9" data-testid="cms-page-tabs">
						{PAGE_KEYS.map((key) => {
							const entry = pages.find((item) => item.key === key);
							return (
								<TabsTrigger
									key={key}
									value={key}
									className="h-7 gap-1.5 px-3 text-xs"
									data-testid={`cms-page-tab-${key}`}
								>
									{entry?.title ?? key}
									{entry?.hasUnpublishedChanges && (
										<span className="h-1.5 w-1.5 rounded-full bg-accent" />
									)}
								</TabsTrigger>
							);
						})}
					</TabsList>
				</Tabs>
			</div>

			{isLoading ? (
				<div className="grid gap-5 xl:grid-cols-12">
					<div className="xl:col-span-3">
						<PanelSkeleton height="h-80" />
					</div>
					<div className="xl:col-span-6">
						<PanelSkeleton height="h-80" />
					</div>
					<div className="xl:col-span-3">
						<PanelSkeleton height="h-80" />
					</div>
				</div>
			) : !page ? (
				<div className="panel">
					<EmptyState
						icon={Globe}
						title="That page isn't set up yet"
						description="Choose Faculty & Administration or Sign in from the tabs above."
						testId="cms-page-missing"
					/>
				</div>
			) : (
				<div className="grid gap-5 xl:grid-cols-12">
					{/* Outline — fixed sections for this page */}
					<div className="xl:col-span-3">
						<Panel
							eyebrow="Page sections"
							title={`${sectionTypes.length} fixed sections`}
							description="Sections are defined by the page design"
							testId="cms-outline"
						>
							<ul className="space-y-1.5" data-testid="cms-section-list">
								{sectionTypes.map((type) => {
									const saved = page.blocks.some(
										(block) => block.type === type,
									);
									const active = type === selectedType;
									return (
										<li key={type}>
											<button
												type="button"
												onClick={() => setSelectedType(type)}
												className={cn(
													"flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
													active
														? "border-accent bg-accent/10"
														: "border-hairline bg-surface-2 hover:bg-surface-1",
												)}
												data-testid={`cms-section-button-${type}`}
												data-active={active}
											>
												<span className="flex items-center gap-2">
													<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-xs font-medium text-foreground">
														{sectionLabel(type)}
													</span>
												</span>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-[10px] leading-normal",
														saved
															? "bg-accent/14 text-accent"
															: "border border-dashed border-hairline text-muted-foreground",
													)}
												>
													{saved ? "Saved" : "Default"}
												</span>
											</button>
										</li>
									);
								})}
							</ul>
						</Panel>
					</div>

					{/* Live preview — the real public route in an iframe */}
					<div className="xl:col-span-6">
						<Panel
							eyebrow="Live preview"
							title={page.title}
							description={page.path}
							testId="cms-preview"
							bodyClassName="p-0"
							actions={
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1.5 px-2 text-xs"
									data-testid="cms-preview-reload"
									onClick={() => setIframeVersion((version) => version + 1)}
								>
									<RefreshCw className="h-3 w-3" /> Reload
								</Button>
							}
						>
							<iframe
								key={iframeVersion}
								src={`${page.path}?cms=1`}
								title={`Live preview: ${page.title}`}
								data-testid="cms-live-preview"
								className="h-[calc(100vh-240px)] min-h-[560px] w-full border-0 bg-[#FEE2E2]"
							/>
						</Panel>
					</div>

					{/* Editor — content fields for the selected section */}
					<div className="xl:col-span-3">
						<SectionEditor
							sectionType={selectedType}
							fields={selectedFields}
							canManage={canManage}
							saving={saveSection.isPending}
							onSave={(fields) => saveSection.mutate(fields)}
						/>
					</div>
				</div>
			)}

			<Dialog open={seoOpen} onOpenChange={setSeoOpen}>
				<DialogContent
					className="bg-popover sm:max-w-lg"
					data-testid="cms-seo-dialog"
				>
					<DialogHeader>
						<DialogTitle className="font-display">Search settings</DialogTitle>
						<DialogDescription>
							How this page appears in search results and link previews.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3.5">
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-title">
								Meta title
							</Label>
							<Input
								id="cms-seo-title"
								value={seoDraft.title}
								disabled={!canManage}
								data-testid="cms-seo-title"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setSeoDraft({ ...seoDraft, title: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-description">
								Meta description
							</Label>
							<Textarea
								id="cms-seo-description"
								rows={3}
								value={seoDraft.description}
								disabled={!canManage}
								data-testid="cms-seo-description"
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									setSeoDraft({ ...seoDraft, description: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-keywords">
								Keywords
							</Label>
							<Input
								id="cms-seo-keywords"
								value={seoDraft.keywords}
								disabled={!canManage}
								data-testid="cms-seo-keywords"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setSeoDraft({ ...seoDraft, keywords: event.target.value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							data-testid="cms-seo-cancel"
							onClick={() => setSeoOpen(false)}
						>
							Cancel
						</Button>
						<Button
							disabled={!canManage || seoMutation.isPending}
							data-testid="cms-seo-save"
							onClick={() => seoMutation.mutate()}
						>
							{seoMutation.isPending ? "Saving…" : "Save settings"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
