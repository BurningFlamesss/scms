import type { ReactNode } from "react";
import { cn } from "#/lib/utils";
import { Footer } from "./Footer";
import { NoticeTicker } from "./NoticeTicker";

export function PageShell({
	children,
	variant = "default",
}: {
	children: ReactNode;
	variant?: "default" | "overlay";
}) {
	return (
		<div
			className={cn(
				"min-h-svh pt-topbar lg:pt-0",
				variant === "default" && "lg:pl-[var(--nav-w)]",
			)}
		>
			<div className={variant === "overlay" ? "lg:pl-[var(--nav-w)]" : ""}>
				<div className="u-container">
					<NoticeTicker />
				</div>
			</div>
			<main id="main" tabIndex={-1} className="outline-none">
				{children}
			</main>
			<Footer />
		</div>
	);
}

/** Standard content container. Reserves the fixed sidebar's width on desktop. */
export function Container({
	children,
	className = "",
	as: Tag = "div",
}: {
	children: ReactNode;
	className?: string;
	as?: "div" | "section" | "header" | "article";
}) {
	return <Tag className={"u-container " + className}>{children}</Tag>;
}

/** Vertical rhythm between major sections: 80px mobile, 128px desktop. */
export function Section({
	children,
	className = "",
	id,
	labelledBy,
	testId,
}: {
	children: ReactNode;
	className?: string;
	id?: string;
	labelledBy?: string;
	testId?: string;
}) {
	return (
		<section
			id={id}
			aria-labelledby={labelledBy}
			data-testid={testId}
			className={"py-section lg:py-section-lg " + className}
		>
			{children}
		</section>
	);
}
