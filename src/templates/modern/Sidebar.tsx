import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils.ts";
import type { ItemDetail } from "#/types/school.ts";

function Sidebar() {
	const { sidebar } = useSchoolContent();
	const [scrolled, setScrolled] = useState(false);
	const [isSidebarOpened, setIsSidebarOpened] = useState(true);
	const [openSubMenus, setOpenSubMenus] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(scrollY > 50);
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<aside
			className={cn(
				"fixed z-50 my-4 mx-4 rounded-2xl h-[calc(100vh-32px)] w-60 transition-all duration-500",
				isSidebarOpened ? "" : "w-4",
			)}
		>
			<button
				type="button"
				onClick={() => setIsSidebarOpened((state) => !state)}
				className="absolute right-0 top-0 translate-x-[30%] translate-y-[-30%] rounded-full bg-white border border-red-500 cursor-pointer"
			>
				<ChevronLeft width={18} height={18} />
			</button>
			<section
				className={cn(
					"h-full flex flex-col justify-between",
					isSidebarOpened ? "" : "hidden",
				)}
			>
				<header className="rounded-t-2xl bg-red-400 flex flex-col items-center justify-center">
					<div className="p-4">
						<img src={sidebar.logo} alt="" />
					</div>
					<span className="py-2 bg-yellow-400 w-full text-center">
						{sidebar.tagline}
					</span>
				</header>

				<main className="bg-red-400 flex-1 min-h-0 overflow-auto">
					<ul>
						{Object.values(sidebar.collapsible).map((item, index) => {
							return <SidebarItem key={item.id} item={item} />;
						})}
					</ul>
				</main>

				<footer className="rounded-b-2xl bg-yellow-400">
					<Link
						to="/"
						className="flex w-full items-center justify-center py-2 cursor-pointer"
					>
						Login
					</Link>
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
					className="flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
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
				className="flex items-center w-full gap-2.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
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
