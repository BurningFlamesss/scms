import { MousePointerClick, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	BLOCK_FIELDS,
	type FieldDef,
	str,
} from "#/components/cms/block-fields";
import { EmptyState } from "#/components/common/EmptyState";
import { ImageUploader } from "#/components/common/ImageUploader";
import { Panel } from "#/components/common/Panel";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { sectionLabel } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

interface SectionEditorProps {
	sectionType: BlockType | null;
	/** Current saved fields, or the section defaults when it has not been saved yet. */
	fields: Record<string, unknown> | undefined;
	canManage: boolean;
	saving: boolean;
	onSave: (fields: Record<string, unknown>) => void;
}

/**
 * Content-only editor for a fixed CMS section (text and image fields).
 * The fixed-section pages have no style, visibility, duplicate or delete
 * controls, so this intentionally stays leaner than the generic BlockInspector.
 */
export function SectionEditor({
	sectionType,
	fields,
	canManage,
	saving,
	onSave,
}: SectionEditorProps) {
	const [draft, setDraft] = useState<Record<string, unknown>>({});

	useEffect(() => {
		setDraft(fields ? JSON.parse(JSON.stringify(fields)) : {});
	}, [fields]);

	const dirty = useMemo(
		() => (fields ? JSON.stringify(draft) !== JSON.stringify(fields) : false),
		[draft, fields],
	);

	if (!sectionType) {
		return (
			<Panel
				eyebrow="Section editor"
				title="Nothing selected"
				testId="cms-section-editor"
			>
				<EmptyState
					compact
					icon={MousePointerClick}
					title="Click a section to edit it"
					description="Choose a section from the list, or click one directly in the live preview."
					testId="cms-section-editor-empty"
				/>
			</Panel>
		);
	}

	const defs = BLOCK_FIELDS[sectionType] ?? [];
	const set = (key: string, value: unknown) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const renderField = (field: FieldDef) => {
		const inputId = `cms-section-${sectionType}-${field.key}`;

		if (field.kind === "image") {
			return (
				<ImageUploader
					key={field.key}
					value={str(draft, field.key) || undefined}
					label={field.label}
					testId={`cms-section-image-${field.key}`}
					onChange={(url: string | undefined) => set(field.key, url ?? "")}
				/>
			);
		}

		if (field.kind === "textarea") {
			return (
				<div key={field.key} className="space-y-1.5">
					<Label className="text-xs" htmlFor={inputId}>
						{field.label}
					</Label>
					<Textarea
						id={inputId}
						rows={3}
						value={str(draft, field.key)}
						disabled={!canManage}
						data-testid={`cms-section-input-${field.key}`}
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
							set(field.key, event.target.value)
						}
					/>
					{field.help && (
						<p className="text-[11px] text-muted-foreground">{field.help}</p>
					)}
				</div>
			);
		}

		return (
			<div key={field.key} className="space-y-1.5">
				<Label className="text-xs" htmlFor={inputId}>
					{field.label}
				</Label>
				<Input
					id={inputId}
					type={
						field.kind === "number"
							? "number"
							: field.kind === "date"
								? "date"
								: "text"
					}
					value={str(draft, field.key)}
					placeholder={field.kind === "text" ? field.placeholder : undefined}
					disabled={!canManage}
					className="h-9 text-sm"
					data-testid={`cms-section-input-${field.key}`}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						set(
							field.key,
							field.kind === "number"
								? Number(event.target.value)
								: event.target.value,
						)
					}
				/>
				{field.help && (
					<p className="text-[11px] text-muted-foreground">{field.help}</p>
				)}
			</div>
		);
	};

	return (
		<Panel
			eyebrow="Section editor"
			title={sectionLabel(sectionType)}
			description={sectionType.replace(/_/g, " ")}
			testId="cms-section-editor"
			bodyClassName="p-0"
			footer={
				canManage ? (
					<div className="flex items-center justify-between gap-2">
						<p
							className="text-[11px] text-muted-foreground"
							data-testid="cms-section-editor-dirty"
						>
							{dirty ? "Unsaved changes" : "All changes saved"}
						</p>
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								data-testid="cms-section-editor-reset"
								onClick={() =>
									fields && setDraft(JSON.parse(JSON.stringify(fields)))
								}
							>
								<RotateCcw className="h-3 w-3" /> Reset
							</Button>
							<Button
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								data-testid="cms-section-editor-save"
								onClick={() => onSave(draft)}
							>
								<Save className="h-3 w-3" />{" "}
								{saving ? "Saving…" : "Save section"}
							</Button>
						</div>
					</div>
				) : (
					<p className="text-[11px] text-muted-foreground">
						Your role can view but not edit website content.
					</p>
				)
			}
		>
			{defs.length === 0 ? (
				<p className="p-4 text-sm text-muted-foreground">
					This section has no editable fields.
				</p>
			) : (
				<div className="space-y-4 p-4">{defs.map(renderField)}</div>
			)}
		</Panel>
	);
}
