import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Menu, Pin, PinOff, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils";
import { authClient } from "#/packages/auth/auth-client.ts";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import type { ItemDetail } from "#/types/school";
import { Crest, type CrestTone } from "./Crest";

const SIDEBAR_W = 240;

const crestTone: CrestTone = {
	line: "#FFFFFF",
	solid: "#FBBF24",
	onSolid: "#000000",
};

function setNavWidth(open: boolean) {
	document.documentElement.style.setProperty(
		"--nav-w",
		open ? `${SIDEBAR_W}px` : "0px",
	);
}

function SidebarItem({
	item,
	pathname,
}: {
	item: ItemDetail;
	pathname: string;
}) {
	const isActive = item.href
		? pathname === item.href || pathname.startsWith(item.href + "/")
		: false;
	const [isOpen, setIsOpen] = useState(isActive);
	const hasChildren = item.children && item.children.length > 0;

	// Check if any child is active to auto-expand
	useEffect(() => {
		if (
			hasChildren &&
			item.children?.some(
				(c) =>
					c.href && (pathname === c.href || pathname.startsWith(c.href + "/")),
			)
		) {
			setIsOpen(true);
		}
	}, [pathname, hasChildren, item.children]);

	if (!hasChildren) {
		return (
			<li>
				<Link
					to={item.href ?? "/"}
					target={item.external ? "_blank" : undefined}
					className={cn(
						"flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium transition-colors hover:text-accent",
						isActive ? "text-accent" : "text-white",
					)}
				>
					<span>{item.label}</span>
				</Link>
			</li>
		);
	}

	return (
		<li>
			<div className="flex items-center w-full transition-colors">
				{item.href ? (
					<Link
						to={item.href}
						className={cn(
							"flex-1 px-4 py-2 text-sm font-medium text-left transition-colors hover:text-accent",
							isActive ? "text-accent" : "text-white",
						)}
					>
						{item.label}
					</Link>
				) : (
					<button
						type="button"
						onClick={() => setIsOpen((s) => !s)}
						className={cn(
							"flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-left transition-colors bg-transparent border-none hover:text-accent",
							isActive ? "text-accent" : "text-white",
						)}
					>
						{item.label}
					</button>
				)}
				<button
					type="button"
					onClick={() => setIsOpen((s) => !s)}
					aria-expanded={isOpen}
					className="cursor-pointer px-3 py-2 text-white bg-transparent border-none hover:text-accent transition-colors"
				>
					<ChevronRight
						size={16}
						className={cn(
							"shrink-0 transition-transform duration-300",
							isOpen ? "rotate-90" : "",
						)}
					/>
				</button>
			</div>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.ul
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden ml-6 pl-2 border-l border-white/20 mt-1 space-y-1 flex flex-col"
					>
						{item.children?.map((child) => (
							<SidebarItem key={child.id} item={child} pathname={pathname} />
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</li>
	);
}

export function Sidebar() {
	const { data } = authClient.useSession();
	const { sidebar } = useSchoolContent();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const reduced = useReducedMotion();

	const isAdmin = pathname.startsWith("/admin");

	const [isOpen, setIsOpen] = useState(() => pathname === "/");
	const [pinned, setPinned] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);

	useEffect(() => {
		if (pinned || pathname !== "/") return;
		const onScroll = () => setIsOpen(window.scrollY <= 50);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [pinned, pathname]);

	useEffect(() => {
		if (pathname === "/") setIsOpen(true);
	}, [pathname]);

	useEffect(() => setNavWidth(isOpen), [isOpen]);

	useEffect(() => {
		if (!sheetOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSheetOpen(false);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [sheetOpen]);

	if (isAdmin) return null;

	const logoMark = sidebar?.logo ? (
		<img
			src={sidebar.logo}
			alt="School logo"
			className="size-16 rounded-full bg-[#FEE2E2] object-contain p-1"
		/>
	) : (
		<img
			src={"../../../../../schools/everest/logo.png"}
			alt="School logo"
			className="h-16"
		/>
	);

	const navFooter = data?.session?.id ? (
		<div className="bg-accent flex w-full items-center justify-center py-2 cursor-pointer text-accent-foreground">
			Dashboard Coming Soon!
		</div>
	) : (
		<Link
				to="/login"
				className="bg-accent flex w-full items-center justify-center py-2 cursor-pointer text-primary-foreground hover:bg-accent/90"
			>
				Login
			</Link>
	);

	const navLinks = (
		<ul className="space-y-1 mt-4">
			{sidebar?.collapsible && Object.values(sidebar.collapsible).map((item) => (
				<SidebarItem key={item.id} item={item} pathname={pathname} />
			))}
		</ul>
	);

	return (
		<>
			{/* ── Desktop sidebar panel: fixed left edge ── */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-nav hidden h-screen w-60 flex-col justify-between bg-primary rounded-br-2xl shadow-xl transition-transform duration-500 lg:flex",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<header className="flex flex-col items-center justify-center text-primary-foreground">
					<Link
						to="/"
						className="flex items-center gap-3 p-4"
						data-testid="nav-home"
					>
						{logoMark}
						{/* <span className="text-lg font-bold uppercase tracking-wide">
							<span className="text-primary-foreground">Everest</span>
							<span className="text-accent">School</span>
						</span> */}
					</Link>
					{/* <span
						className="w-full bg-accent py-2 text-center text-accent-foreground font-medium"
						data-testid="nav-tagline"
					>
						{sidebar.tagline}
					</span> */}
				</header>

				<nav
					aria-label="Main"
					className="min-h-0 flex-1 overflow-auto text-primary-foreground"
				>
					{navLinks}
				</nav>

				<footer className="bg-primary">{navFooter}</footer>
			</aside>

			{/* ── Desktop controls: fixed right edge ── */}
			<div className="fixed top-4 right-4 z-nav hidden flex-col items-center gap-2 rounded-full bg-primary/95 backdrop-blur-sm p-1.5 shadow-lg lg:flex">
				<button
					type="button"
					onClick={() => setIsOpen((s) => !s)}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close navigation" : "Open navigation"}
					title={isOpen ? "Close navigation" : "Open navigation"}
					data-testid="nav-collapse-toggle"
					className="inline-flex size-9 border-none cursor-pointer items-center justify-center rounded-full bg-[#FEE2E2]/10 text-white transition-colors hover:bg-[#FEE2E2]/30"
				>
					<Menu aria-hidden="true" size={18} />
				</button>

				<button
					type="button"
					onClick={() => setPinned((s) => !s)}
					aria-pressed={pinned}
					aria-label={pinned ? "Unlock sidebar" : "Lock sidebar open"}
					title={pinned ? "Auto-collapse: OFF" : "Lock open"}
					data-testid="nav-pin-toggle"
					className={cn(
						"inline-flex size-9 border-none cursor-pointer items-center justify-center rounded-full transition-colors",
						pinned
							? "bg-[#FEE2E2] text-black"
							: "bg-[#FEE2E2]/10 text-white hover:bg-[#FEE2E2]/30",
					)}
				>
					{pinned ? (
						<Pin aria-hidden="true" size={16} />
					) : (
						<PinOff aria-hidden="true" size={16} />
					)}
				</button>
			</div>

			{/* ── Mobile top bar ── */}
			<div className="fixed inset-x-0 top-0 z-nav flex h-topbar items-center justify-between bg-primary px-4 lg:hidden">
				<Link
					to="/"
					className="flex min-w-0 items-center gap-3"
					data-testid="nav-home-mobile"
				>
					<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#FEE2E2]">
						{sidebar?.logo ? (
							<img
								src={sidebar.logo}
								alt=""
								className="size-6 object-contain"
							/>
						) : (
							<Crest size={24} tone={{ ...crestTone, line: "#000" }} title="" />
						)}
					</span>
					<span className="truncate text-[15px] font-semibold text-primary-foreground">
						{sidebar?.tagline}
					</span>
				</Link>
				<button
					type="button"
					onClick={() => setSheetOpen(true)}
					aria-expanded={sheetOpen}
					aria-controls="sidebar-nav-panel"
					data-testid="nav-mobile-trigger"
					className="inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground"
				>
					<Menu aria-hidden="true" size={20} />
					<span className="sr-only">Open the main menu</span>
				</button>
			</div>

			{/* ── Mobile sheet ── */}
			<AnimatePresence>
				{sheetOpen && (
					<motion.div
						className="fixed inset-0 z-overlay lg:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<button
							type="button"
							tabIndex={-1}
							aria-label="Close the main menu"
							data-testid="nav-mobile-scrim"
							className="absolute inset-0 border-none bg-black/60"
							onClick={() => setSheetOpen(false)}
						/>
						<motion.nav
							aria-label="Main"
							id="sidebar-nav-panel"
							data-testid="nav-mobile-sheet"
							className="absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-3xl bg-primary"
							initial={reduced ? { opacity: 0 } : { y: "100%" }}
							animate={reduced ? { opacity: 1 } : { y: 0 }}
							exit={reduced ? { opacity: 0 } : { y: "100%" }}
							transition={{ duration: 0.3 }}
						>
							<div className="flex items-center justify-between px-4 pt-3">
								<span className="flex items-center gap-2 font-semibold text-primary-foreground">
									<span className="flex size-8 items-center justify-center rounded-md bg-[#FEE2E2]">
										{logoMark}
									</span>
									{sidebar?.tagline}
								</span>
								<button
									type="button"
									onClick={() => setSheetOpen(false)}
									data-testid="nav-mobile-close"
									className="inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground"
								>
									<X aria-hidden="true" size={20} />
									<span className="sr-only">Close the main menu</span>
								</button>
							</div>
							<div className="flex-1 overflow-y-auto px-4 py-4 text-primary-foreground">
								<nav aria-label="Main">{navLinks}</nav>
							</div>
							<div
								style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
								className="px-4"
							>
								{navFooter}
							</div>
						</motion.nav>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
