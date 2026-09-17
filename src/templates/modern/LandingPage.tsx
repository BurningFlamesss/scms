import { useCanvasVideo } from "#/hooks/useCanvasVideo.ts";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Building2, Info, Users, Image as ImageIcon } from "lucide-react";
import { NoticeDialog } from "#/components/common/NoticeDialog";
import { ResultsChart } from "#/templates/modern/components/utilities/ResultsChart";
import { albums } from "#/content/gallery";
import { people } from "#/lib/faculty";
import { SectionHeading } from "#/templates/modern/components/chrome/PageFrame";
import { MonogramAvatar } from "#/templates/modern/components/shared/MonogramAvatar";

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
			<div className="relative min-h-screen bg-background">
				<div ref={containerRef} className="relative h-[500vh]">
					<div className="sticky top-0 h-screen w-full overflow-hidden">
						<HeroCanvas scrollTrackRef={containerRef} />
					</div>

					<section className="hero-next-section absolute bottom-0 left-0 z-10 h-[80vh] w-full overflow-hidden bg-[#FEF2F2] rounded-t-3xl">
						<div className="grid grid-cols-[6fr_5fr] mx-20 pt-20 gap-[8%]">
							<h2 className="text-8xl font-bold text-foreground">
								Established in purpose.
								<br />
								Contemporary in outlook.
							</h2>
							<div>
								<p className="text-lg leading-normal mb-8 text-muted-foreground">
									Everest English Boarding Higher Secondary School is a learning
									institution in Nepal built around a simple conviction: students
									thrivet when expectations are clear, relationships are strong,
									and curiosity has room to become practice.
								</p>
								<dl className="border-t border-rule-soft">
									<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-rule-soft">
										<dt className="text-xs uppercase text-muted-foreground tracking-wider">Institution</dt>
										<dd className="text-md font-medium text-foreground">
											Everest English Boarding Higher Secondary School
										</dd>
									</div>
									<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-rule-soft">
										<dt className="text-xs uppercase text-muted-foreground tracking-wider">Learning Spaces</dt>
										<dd className="text-md font-medium text-foreground">
											Everest Building + Canon Building
										</dd>
									</div>
									<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-rule-soft">
										<dt className="text-xs uppercase text-muted-foreground tracking-wider">Streams</dt>
										<dd className="text-md font-medium text-foreground">
											Science (Computer/Biology), Management
										</dd>
									</div>
									<div className="grid grid-cols-[140px_1fr] gap-5 p-4.5 border-b border-rule-soft">
										<dt className="text-xs uppercase text-muted-foreground tracking-wider">Labs</dt>
										<dd className="text-md font-medium text-foreground">
											Computer, Biology, Physics, Chemistry
										</dd>
									</div>
								</dl>
							</div>
						</div>
					</section>
				</div>

				<div className="relative z-20 bg-[#FEF2F2] px-8 py-24 pb-32">
					<div className="mx-auto max-w-screen-xl">
						{/* Result Chart */}
						<div className="mb-32">
							<SectionHeading
								eyebrow="Academic Excellence"
								title="Board Results"
								description="Consistent performance across all levels of examination."
							/>
							<div className="mt-12 rounded-card border border-border bg-card p-6 shadow-sm sm:p-10">
								<ResultsChart />
							</div>
						</div>

						{/* Discover / About / Courses / Facilities */}
						<div className="mb-32">
							<SectionHeading
								eyebrow="Explore Everest"
								title="Discover the school"
								description="Learn more about our academic programs, state-of-the-art facilities, and the institution's history."
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<Link to="/courses" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
										<BookOpen className="h-6 w-6 text-accent" aria-hidden="true" />
									</div>
									<p className="t-eyebrow mt-6">Academics</p>
									<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
										Courses & Programs
									</h3>
									<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
										Explore subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12.
									</p>
									<span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
										View courses
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>
								
								<Link to="/facilities" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
										<Building2 className="h-6 w-6 text-accent" aria-hidden="true" />
									</div>
									<p className="t-eyebrow mt-6">Campus</p>
									<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
										Facilities
									</h3>
									<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
										Detailed overviews of our laboratories, libraries, spaces, and digital infrastructure across the campus.
									</p>
									<span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
										Tour facilities
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>

								<Link to="/about" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14">
										<Info className="h-6 w-6 text-accent" aria-hidden="true" />
									</div>
									<p className="t-eyebrow mt-6">The Institution</p>
									<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
										About Everest
									</h3>
									<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
										Our history, guiding principles, and the structural vision that builds the foundation of our institution.
									</p>
									<span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
										Read about us
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>
							</div>
						</div>

						{/* Gallery */}
						<div className="mb-32">
							<SectionHeading
								eyebrow="Campus Life"
								title="Gallery Highlights"
								description="Moments captured around the school grounds and during major events."
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{albums.slice(0, 3).map((album) => (
									<Link key={album.id} to="/gallery" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
										<div className="mb-6 h-[200px] w-full overflow-hidden rounded-md border border-border bg-secondary">
											<img 
												src={album.photos[0].src} 
												alt={album.photos[0].alt}
												className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
											/>
										</div>
										<p className="t-eyebrow mt-auto">{album.year} · {album.category}</p>
										<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground line-clamp-2">
											{album.event}
										</h3>
										<span className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
											View all {album.photos.length} photos
											<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
									</Link>
								))}
							</div>
						</div>

						{/* Faculty */}
						<div>
							<SectionHeading
								eyebrow="Leadership"
								title="Our Faculty"
								description="The educators leading our academic departments and steering the school's vision."
							/>
							<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{people.filter((p) => p.leadership).slice(0, 3).map((person) => (
									<Link key={person.id} to="/faculty" className="group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
										<MonogramAvatar
											name={person.name}
											department={person.department}
											size="lg"
										/>
										<p className="t-eyebrow mt-6">{person.role}</p>
										<h3 className="mt-2 font-display text-[19px] font-semibold leading-snug text-foreground">
											{person.name}
										</h3>
										<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
											{person.qualification}
										</p>
										<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4">
											<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground">
												{person.department}
											</span>
											<span className="t-meta">Ext. {person.extension}</span>
										</div>
										<span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
											View directory
											<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
										</span>
									</Link>
								))}
							</div>
						</div>
					</div>
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