import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import { Link } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
	const { sidebar } = useSchoolContent();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				".hero-next-section",
				{
					yPercent: 100,
					clipPath: "polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)",
				},
				{
					yPercent: 0,
					clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
					ease: "none",
					scrollTrigger: {
						trigger: containerRef.current,
						start: "20% top",
						end: "bottom top",
						scrub: true,
					},
				},
			);
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<main className="w-full">
			<div ref={containerRef} className="relative h-[500vh]">
				<div className="sticky top-0 h-screen w-full overflow-hidden">
					<HeroCanvas scrollTrackRef={containerRef} />
				</div>

				<section className="hero-next-section absolute bottom-0 left-0 z-10 h-screen w-full overflow-hidden bg-white rounded-3xl">
					<div>
						<h2>
							Established in purpose.
							<br />
							Contemporary in outlook.
						</h2>
						<div>
							<p>
								Everest English Boarding Higher Secondary School is a learning
								institution in Nepal built around a simple conviction: students
								thrive when expectations are clear, relationships are strong,
								and curiosity has room to become practice.
							</p>
							<dl>
								<div>
									<dt>Institution</dt>
									<dd>Everest English Boarding Higher Secondary School</dd>
								</div>
								<div>
									<dt>Learning Spaces</dt>
									<dd>Everest Building + Canon Building</dd>
								</div>
								<div>
									<dt>Streams</dt>
									<dd>Science (Computer/Biology), Management</dd>
								</div>
								<div>
									<dt>Labs</dt>
									<dd>Computer, Biology, Physics, Chemistry</dd>
								</div>
							</dl>
						</div>
					</div>
				</section>
			</div>

			<footer className="h-[100vh] bg-yellow-500">
				<div className="flex h-full items-center justify-center">
					<div>
						<p>Reach the Highest Points</p>
						<Link to="/contact">
							<span>Contact Everest</span>
							<ArrowUpRight />
						</Link>
					</div>
					<hr />
					<div>
						<img src={sidebar.logo} alt="" />
						<div>
							<span>Explore</span>
							{["Home", "About", "Contact", "Signup"].map((item) => (
								<Link key={item} to={item}>
									{item}
								</Link>
							))}
						</div>
						<div>
							<span>Institution</span>
							<p>Nepal</p>
							<p>School Administrator</p>
						</div>
						<div>
							<span>SCMS / Everest</span>
							<span>{new Date().getFullYear()}</span>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}

export function HeroCanvas({ scrollTrackRef }) {
	const canvasRef = useRef(null);

	const { drawFrame, frameCount, isLoading, progress } = useCanvasVideo(
		canvasRef,
		216,
	);

	useEffect(() => {
		if (isLoading) return;

		drawFrame(0);

		const handleResize = () => {
			const start = ScrollTrigger.getById("hero-scroll");

			if (start) {
				drawFrame(start.progress * (frameCount - 1));
			}
		};

		addEventListener("resize", handleResize);

		const timeline = gsap.timeline({
			scrollTrigger: {
				id: "hero-scroll",
				trigger: scrollTrackRef.current,
				start: "top top",
				end: "bottom bottom",
				scrub: 0,
				onUpdate: (self) => {
					const frameIndex = Math.floor(self.progress * (frameCount - 1));
					drawFrame(frameIndex);
				},
			},
		});

		return () => {
			removeEventListener("resize", handleResize);
			ScrollTrigger.getById("hero-scroll")?.kill();
			timeline.kill();
		};
	}, [isLoading, drawFrame, scrollTrackRef, frameCount]);

	if (isLoading) {
		return (
			<div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
				<h1 className="text-2xl mb-4">Loading Experience</h1>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full">
			<canvas
				ref={canvasRef}
				className="block w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
			/>
		</div>
	);
}
