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
			className={`group relative ${className}`}
			data-cms-section={sectionType}
		>
			<div
				className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] outline-2 outline-dashed -outline-offset-1 outline-accent/35 transition-colors duration-150 group-hover:outline-accent/70"
				aria-hidden="true"
			/>
			<button
				type="button"
				onClick={() => onSelect(sectionType)}
				title={`Edit ${sectionLabel(sectionType)}`}
				aria-label={`Edit ${sectionLabel(sectionType)}`}
				data-testid={testId ?? `cms-section-hit-${sectionType}`}
				className="pointer-events-auto absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-md border border-accent/60 bg-background px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-wide text-accent shadow-sm transition-colors duration-150 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
			>
				<Pencil className="h-3 w-3" aria-hidden="true" />
				{sectionLabel(sectionType)}
			</button>
			{children}
		</div>
	);
}
