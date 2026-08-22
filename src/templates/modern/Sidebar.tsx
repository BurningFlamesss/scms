import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils.ts";

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
				className="absolute right-0 top-0 translate-x-[30%] -translate-y-[30%] rounded-full bg-white border border-red-500 cursor-pointer"
			>
				<ChevronLeft width={18} height={18} />
			</button>
			<section className={cn("", isSidebarOpened ? "" : "hidden")}>
				<header className="rounded-t-2xl bg-yellow-400 flex flex-col items-center justify-center">
					<div className="p-4">
						<img src={sidebar.logo} alt="" />
					</div>
					<span className="py-2 bg-red-500 w-full text-center">Goated education</span>
				</header>
				<main>
					{[].map((item, index) => {
						return <SidebarItem key={item} />;
					})}
				</main>
				<footer>
					<button type="button">Login</button>
				</footer>
			</section>
		</aside>
	);
}

export default Sidebar;

function SidebarItem() {
	return (
		<li>
			<Link to="/"></Link>
			<span></span>
		</li>
	);
}
