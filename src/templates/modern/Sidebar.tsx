import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar() {
	const { sidebar } = useSchoolContent();
	const [scrolled, setScrolled] = useState(false);
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
		<aside className="fixed z-50 my-4 mx-4 rounded-2xl bg-cyan-300 p-4 h-[calc(100vh-32px)]">
			<span className="absolute right-0 top-0 translate-x-[30%] -translate-y-[30%] rounded-full bg-white border border-red-500 cursor-pointer">
				<ChevronLeft width={18} height={18} />
			</span>
			<section>
				<header>
					<img src={sidebar.logo} alt="" />
				</header>
				<div>Goated education</div>
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
