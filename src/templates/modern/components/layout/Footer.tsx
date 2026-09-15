import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useSchoolContent } from "#/packages/school/hook.tsx";

const exploreLinks: Array<[string, string]> = [
	["Home", "/"],
	["About", "/about"],
	["Contact", "/contact"],
	["Signup", "/signup"],
];

/**
 * The original institutional footer: a black band with the oversized "With
 * Everest" call-to-action, the school logo, quick explore links and the
 * created-year attribution.
 */
export function Footer() {
	const { sidebar } = useSchoolContent();
	return (
		<footer className="bg-black pb-10 pt-16 text-white" data-testid="footer">
			<div className="mx-8">
				<div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
					<p className="m-0 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
						Reach the Highest Point
					</p>
					<Link
						className="group inline-flex w-fit items-center gap-3 text-[clamp(42px,7vw,110px)] leading-[0.9] no-underline md:gap-6"
						to="/contact"
						data-testid="footer-with-everest"
					>
						<span>With Everest</span>
						<ArrowUpRight
							aria-hidden="true"
							className="h-11 w-11 text-yellow transition-transform duration-200 ease-in group-hover:translate-x-1 group-hover:-translate-y-1"
						/>
					</Link>
				</div>

				<div className="mb-10 mt-14 h-px bg-gray-700" />

				<div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr_1.5fr_1fr]">
					{sidebar.logo ? (
						<img src={sidebar.logo} alt="" className="w-32" />
					) : (
						<div />
					)}

					<nav aria-label="Footer" className="flex flex-col gap-2.5 text-xs">
						<span className="mb-2 text-[9px] uppercase tracking-[0.12em] text-yellow">
							Explore
						</span>
						{exploreLinks.map(([label, to]) => (
							<Link
								key={label}
								to={to}
								className="w-fit text-white no-underline transition-colors hover:text-yellow"
							>
								{label}
							</Link>
						))}
					</nav>

					<div className="flex flex-col gap-2.5 text-xs">
						<span className="mb-2 text-[9px] uppercase tracking-[0.12em] text-yellow">
							Institution
						</span>
						<p className="m-0 leading-normal text-muted-foreground">Nepal</p>
						<p className="m-0 leading-normal text-muted-foreground">
							School Administrator
						</p>
					</div>

					<div className="flex flex-col items-start justify-between gap-2 text-[9px] text-muted-foreground md:items-end">
						<span>SCMS / Everest</span>
						<span data-testid="footer-year">{new Date().getFullYear()}</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
