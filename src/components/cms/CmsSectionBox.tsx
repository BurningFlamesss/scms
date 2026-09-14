import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { sectionLabel } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

interface CmsSectionBoxProps {
	/** Only render the edit overlay when the page is shown in admin live-preview mode. */
	preview: boolean;
	sectionType: BlockType;
	onSelect: (sectionType: BlockType) => void;
	children: ReactNode;
	/** Extra classes for the wrapper (the live-preview mode replacement node). */
	className?: string;
	testId?: string;
}

/**
 * Marks a region of a public page as an editable CMS section. Outside the
 * live preview it renders its children untouched; in preview mode it wraps
 * them and overlays a click target that asks the admin window to open the
 * section editor.
 */
export function CmsSectionBox({
	preview,
	sectionType,
	onSelect,
	children,
	className = "",
	testId,
}: CmsSectionBoxProps) {
	if (!preview) return <>{children}</>;

	return (
		<div
			className={`group relative outline-2 outline-dashed outline-accent/40 ${className}`}
			data-cms-section={sectionType}
		>
			{children}
			<button
				type="button"
				onClick={() => onSelect(sectionType)}
				title={`Edit: ${sectionLabel(sectionType)}`}
				aria-label={`Edit ${sectionLabel(sectionType)}`}
				data-testid={testId ?? `cms-section-hit-${sectionType}`}
				className="pointer-events-auto absolute inset-0 z-20 flex cursor-pointer items-start justify-start p-2.5"
			>
				<span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-wide text-accent opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
					<Pencil className="h-3 w-3" aria-hidden="true" />
					{sectionLabel(sectionType)}
				</span>
			</button>
		</div>
	);
}
