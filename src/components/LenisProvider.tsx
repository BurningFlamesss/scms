import gsap from "gsap";
import Lenis from "lenis";
import { useEffect } from "react";

export function LenisProvider() {
	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			smoothWheel: true,
		});

		const update = (time: number) => {
			lenis.raf(time * 1000);
		};

		gsap.ticker.add(update);

		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(update);
			lenis.destroy();
		};
	}, []);

	return null;
}
