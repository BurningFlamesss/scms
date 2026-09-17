import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { NoticeDialog } from "#/components/common/NoticeDialog";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
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
		<>
			<div className="relative min-h-screen">
					<div ref={containerRef} className="relative h-[500vh]">
							<div className="sticky top-0 h-screen w-full overflow-hidden">
								<HeroCanvas scrollTrackRef={containerRef} />
							</div>

							<section className="hero-next-section absolute bottom-0 left-0 z-10 h-[80vh] w-full overflow-hidden bg-[#FEE2E2] rounded-3xl">
								<div className="grid grid-cols-[6fr_5fr] mx-20 pt-20 gap-[8%]">
									<h2 className="text-8xl font-bold">
										Established in purpose.
										<br />
										Contemporary in outlook.
									</h2>
									<div>
										<p className="text-lg leading-normal mb-8">
											Everest English Boarding Higher Secondary School is a learning
											institution in Nepal built around a simple conviction: students
											thrive when expectations are clear, relationships are strong,
											and curiosity has room to become practice.
										</p>
										<dl className="border-t border-gray-300">
											<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-gray-300">
												<dt className="text-xs uppercase">Institution</dt>
												<dd className="text-md font-medium">
													Everest English Boarding Higher Secondary School
												</dd>
											</div>
											<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-gray-300">
												<dt className="text-xs uppercase">Learning Spaces</dt>
												<dd className="text-md font-medium">
													Everest Building + Canon Building
												</dd>
											</div>
											<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-gray-300">
												<dt className="text-xs uppercase">Streams</dt>
												<dd className="text-md font-medium">
													Science (Computer/Biology), Management
												</dd>
											</div>
											<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-gray-300">
												<dt className="text-xs uppercase">Labs</dt>
												<dd className="text-md font-medium">
													Computer, Biology, Physics, Chemistry
												</dd>
											</div>
										</dl>
									</div>
								</div>
							</section>
						</div>
			</div>
			<NoticeDialog />
		</>
	);
}

export function HeroCanvas({ scrollTrackRef }: { scrollTrackRef: React.RefObject<HTMLDivElement | null> }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const { drawFrame, frameCount, isLoading, progress, ready } = useCanvasVideo(
		canvasRef,
		216,
	);

	// Ensure active frame is drawn whenever ready or when loading completes
	useEffect(() => {
		if (ready && !isLoading) {
			requestAnimationFrame(() => {
				const start = ScrollTrigger.getById("hero-scroll");
				const index = start ? Math.floor(start.progress * (frameCount - 1)) : 0;
				drawFrame(index);
			});
		}
	}, [ready, isLoading, drawFrame, frameCount]);

	useEffect(() => {
		if (!ready) return;

		const handleResize = () => {
			const start = ScrollTrigger.getById("hero-scroll");

			if (start) {
				drawFrame(start.progress * (frameCount - 1));
			} else {
				drawFrame(0);
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

		// Trigger initial frame draw after GSAP ScrollTrigger setup
		const currentScroll = ScrollTrigger.getById("hero-scroll");
		const initialIndex = currentScroll ? Math.floor(currentScroll.progress * (frameCount - 1)) : 0;
		drawFrame(initialIndex);

		return () => {
			removeEventListener("resize", handleResize);
			ScrollTrigger.getById("hero-scroll")?.kill();
			timeline.kill();
		};
	}, [ready, drawFrame, scrollTrackRef, frameCount]);

	return (
		<div className="relative w-full h-full bg-black">
			{isLoading && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
					<div className="text-center">
						<div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
						<h1 className="text-lg font-medium">Loading Experience</h1>
						<p className="text-sm text-muted-foreground mt-1">{Math.round(progress)}%</p>
					</div>
				</div>
			)}
			<canvas
				ref={canvasRef}
				className="block w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
			/>
		</div>
	);
}