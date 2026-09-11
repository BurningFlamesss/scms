import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils.ts";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import type { ItemDetail } from "#/types/school.ts";
import { authClient } from "#/packages/auth/auth-client.ts";

function Sidebar() {
	const { data } = authClient.useSession();
	const { sidebar } = useSchoolContent();
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const [isSidebarOpened, setIsSidebarOpened] = useState(() => {
		// On initial load, open sidebar only for home route
		if (typeof window !== "undefined") {
			return window.location.pathname === "/";
		}
		return true;
	});

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(scrollY > 50);

			// Only auto-close/open on home route ("/")
			// On other routes, keep sidebar in user's chosen state
			if (location.pathname === "/") {
				if (scrollY > 50) {
					setIsSidebarOpened(false);
				} else {
					setIsSidebarOpened(true);
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [location.pathname]);

	// Reset sidebar state when navigating to home route
	useEffect(() => {
		if (location.pathname === "/") {
			setIsSidebarOpened(true);
		}
	}, [location.pathname]);

	return (
		<aside
			className={cn(
				"fixed z-50 h-screen w-60 transition-all duration-500",
				isSidebarOpened ? "" : "w-4",
			)}
		>
			<button
				type="button"
				onClick={() => setIsSidebarOpened((state) => !state)}
				className={cn("absolute right-0 top-1/2 translate-x-[30%] translate-y-[-50%] rounded-full bg-background border border-red cursor-pointer")}
			>
				<ChevronLeft
					width={18}
					height={18}
					className={cn(isSidebarOpened ? "" : "rotate-180")}
				/>
			</button>

			<section
				className={cn(
					"h-full flex flex-col justify-between",
					isSidebarOpened ? "" : "hidden",
				)}
			>
				<header className="bg-primary flex flex-col items-center justify-center text-primary-foreground">
					<Link to="/" className="p-4">
						<img src={sidebar.logo} alt="" />
					</Link>
					<span className="py-2 bg-accent w-full text-center text-accent-foreground">
						{sidebar.tagline}
					</span>
				</header>

				<main className="bg-primary flex-1 min-h-0 overflow-auto text-primary-foreground">
					<ul>
						{Object.values(sidebar.collapsible).map((item, index) => {
							return <SidebarItem key={item.id} item={item} />;
						})}
					</ul>
				</main>

				<footer className="bg-primary">
					{data?.session.id ? (
						<div className="bg-accent flex w-full items-center justify-center py-2 cursor-pointer rounded-b-2xl text-accent-foreground">
							Dashboard Coming Soon!
						</div>
					) : (
						<>
							<Link
								to="/signup"
								className="bg-accent flex w-full items-center justify-center py-2 cursor-pointer text-accent-foreground"
							>
								Signup
							</Link>
							<Link
								to="/login"
								className="bg-primary flex w-full items-center justify-center py-2 cursor-pointer rounded-b-2xl text-primary-foreground"
							>
								Login
							</Link>
						</>
					)}
				</footer>
			</section>
		</aside>
	);
}

export default Sidebar;

function SidebarItem({ item }: { item: ItemDetail }) {
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = item.children && item.children.length > 0;

	if (!hasChildren) {
		return (
			<li>
				<Link
					to={item.href ?? "/"}
					target={item.external ? "_blank" : ""}
					className="flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-foreground"
				>
					<span>{item.label}</span>
				</Link>
			</li>
		);
	}

	return (
		<li className={cn(isOpen ? "" : "")}>
			<button
				type="button"
				onClick={() => setIsOpen((state) => !state)}
				className="flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-foreground"
			>
				<span className="flex-1 text-left">{item.label}</span>
				<ChevronRight
					size={16}
					className={cn(
						"shrink-0 transition-transform duration-300",
						isOpen ? "rotate-90" : "",
					)}
				/>
			</button>

			{isOpen && (
				<ul className="rounded-lg overflow-hidden">
					{item.children?.map((child) => (
						<SidebarItem key={child.id} item={child} />
					))}
				</ul>
			)}
		</li>
	);
}