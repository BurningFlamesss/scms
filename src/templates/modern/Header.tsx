import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

function Header() {
	const [scrolled, setScrolled] = useState(false);

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
		<header>
			<div>
				<Link to="/"></Link>
				<nav></nav>
			</div>
			<div></div>
		</header>
	);
}

export default Header;
