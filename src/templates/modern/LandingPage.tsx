import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
	const containerRef = useRef(null);

	return (
		<main className="w-full">
			<div ref={containerRef} className="relative">
				<div className="sticky top-0 h-screen w-full overflow-hidden">
					<HeroCanvas scrollTrackRef={containerRef} />
				</div>
			</div>
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
        )
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
