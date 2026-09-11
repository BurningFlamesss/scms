import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight } from "lucide-react";
import {
	CardStack,
	FrameSequence,
	LedgerCount,
	MagneticHover,
	RevealUp,
	SheetRise,
	RailFill,
} from "#/templates/modern/components/motion";
import { useSectionProgress } from "#/lib/motion";
import { Button } from "#/templates/modern/components/Button";
import { frames, pageCopy, pillars, stats, voices } from "#/lib/site";

export const Route = createFileRoute("/user/home-page")({
	component: RouteComponent,
});

function RouteComponent() {
	const { ref, progress } = useSectionProgress();
	return (
		<>
			<section className="hero" aria-label="A day at Everest">
				<FrameSequence frames={frames} />
				<div className="hero-title">
					<p>{pageCopy.home.eyebrow}</p>
					<h1>
						{pageCopy.home.title.split("\n").map((x, i) => (
							<React.Fragment key={x}>
								{x}
								{i < 2 && <br />}
							</React.Fragment>
						))}
					</h1>
				</div>
			</section>
			<SheetRise>
				<div className="home-intro content">
					<RevealUp>
						<p className="eyebrow">{pageCopy.home.eyebrow}</p>
						<h2>
							{pageCopy.home.title.split("\n").map((x) => (
								<React.Fragment key={x}>
									{x}
									<br />
								</React.Fragment>
							))}
						</h2>
					</RevealUp>
					<p className="lead" data-testid="home-support-copy">
						{pageCopy.home.support}
					</p>
					<div className="ledger">
						{stats.map((s) => (
							<div key={s.id}>
								<LedgerCount
									value={s.value}
									suffix={s.suffix}
									testId={`stat-${s.id}`}
								/>
								<small>{s.label}</small>
							</div>
						))}
					</div>
					<div className="actions">
						<Link to="/contact" data-testid="home-admissions-link">
							<Button testId="home-admissions-button">Admissions 2026</Button>
						</Link>
						<Link to="/facilities" data-testid="home-tour-link">
							<Button variant="secondary" testId="home-tour-button">
								Take a tour
							</Button>
						</Link>
					</div>
				</div>
				<div className="content pillar-section">
					<CardStack>
						{pillars.map((p) => (
							<MagneticHover key={p.id}>
								<Link
									to={p.href}
									className="pillar-card"
									data-testid={`pillar-${p.id}`}
								>
									<div>
										<span className="eyebrow">{p.label}</span>
										<h2>{p.title}</h2>
										<p>{p.blurb}</p>
										<span className="tertiary-label">
											Explore <ArrowDownRight />
										</span>
									</div>
									<img
										src={p.image.src}
										alt={p.image.alt}
										width={p.image.width}
										height={p.image.height}
										loading="lazy"
									/>
								</Link>
							</MagneticHover>
						))}
					</CardStack>
				</div>
				<section className="voices content" ref={ref}>
					<RailFill progress={progress} axis="x" />
					<p className="eyebrow">VOICES / SCHOOL COMMUNITY</p>
					<h2>WHAT STAYS WITH THEM.</h2>
					<div className="voice-rail">
						{voices.map((v, i) => (
							<article key={v.name} data-testid={`voice-${i + 1}`}>
								<span>0{i + 1}</span>
								<blockquote>“{v.quote}”</blockquote>
								<p>
									{v.name} · {v.role}
								</p>
							</article>
						))}
					</div>
				</section>
				<section className="admission-band">
					<div>
						<p className="eyebrow">{pageCopy.home.admissions}</p>
						<h2>
							YOUR NEXT SCHOOL
							<br />
							YEAR STARTS HERE.
						</h2>
					</div>
					<div>
						<p>APPLICATION WINDOW</p>
						<strong>15 CHAITRA — 20 BAISAKH</strong>
						<p>4 REQUIRED DOCUMENTS</p>
						<Link to="/contact" data-testid="invitation-apply-link">
							<Button testId="invitation-apply-button">Begin an enquiry</Button>
						</Link>
					</div>
				</section>
			</SheetRise>
		</>
	);
}
