import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSchoolContent } from "#/packages/school/hook.tsx";

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
		<aside>
			<img src={sidebar.logo} alt="" />
			<div>
				<Link to="/"></Link>
				<nav>Hello</nav>
			</div>
			<div></div>
		</aside>
	);
}

export default Sidebar;
