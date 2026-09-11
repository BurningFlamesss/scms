import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import React, { useState } from "react";
import { RailFill, RevealUp } from "#/templates/modern/components/motion";
import { useSectionProgress } from "#/lib/motion";
import { leaders, milestones, pageCopy } from "#/lib/site";

function CrestStory() {
	const ref = React.useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const reduce = useReducedMotion();
	const x = useTransform(scrollYProgress, [0, 0.5, 1], [0, 90, 0]);
	const y = useTransform(scrollYProgress, [0, 0.5, 1], [0, -55, 0]);
	const bookX = useTransform(x, (v) => -v);
	const bookY = useTransform(y, (v) => -v * 0.8);
	return (
		<section
			ref={ref}
			className={`crest-story ${reduce ? "static" : ""}`}
			data-testid="about-crest-story"
		>
			<div className="crest-stage">
				<motion.span
					className="crest-piece star"
					style={reduce ? { x: 90, y: -55 } : { x, y }}
				>
					★<i>ASPIRATION</i>
				</motion.span>
				<motion.span
					className="crest-piece book"
					style={reduce ? { x: -100, y: 45 } : { x: bookX, y: bookY }}
				>
					▱<i>LEARNING</i>
				</motion.span>
				<span className="crest-core">
					EVEREST<small>2048 B.S.</small>
				</span>
			</div>
		</section>
	);
}
export const Route = createFileRoute("/user/about-alt")({
	component: RouteComponent,
});

function RouteComponent() {
	const [open, setOpen] = useState(1);
	const { ref, progress } = useSectionProgress();
	return (
		<>
			<header className="page-header content">
				<p className="eyebrow">{pageCopy.about.eyebrow}</p>
				<h1>
					{pageCopy.about.title.split("\n").map((x) => (
						<React.Fragment key={x}>
							{x}
							<br />
						</React.Fragment>
					))}
				</h1>
				<p className="lead">{pageCopy.about.support}</p>
			</header>
			<section className="index-list content" ref={ref}>
				<RailFill progress={progress} />
				{milestones.map((m) => (
					<article className={open === m.index ? "open" : ""} key={m.index}>
						<button
							onClick={() => setOpen(open === m.index ? 0 : m.index)}
							aria-expanded={open === m.index}
							data-testid={`milestone-${m.index}-toggle`}
						>
							<span>0{m.index}</span>
							<span>{m.marker}</span>
							<strong>{m.title}</strong>
							<span>{m.blurb}</span>
							<ChevronDown />
						</button>
						{open === m.index && (
							<div
								className="index-detail"
								data-testid={`milestone-${m.index}-detail`}
							>
								<img
									src={m.image?.src}
									alt={m.image?.alt}
									width={m.image?.width}
									height={m.image?.height}
								/>
								<div>
									{m.body.map((p) => (
										<p key={p}>{p}</p>
									))}
								</div>
							</div>
						)}
					</article>
				))}
			</section>
			<CrestStory />
			<section className="leaders content">
				<p className="eyebrow">THE PEOPLE WHO HOLD IT</p>
				<h2>LEADERSHIP</h2>
				<div>
					{leaders.map((p, i) => (
						<RevealUp delay={i * 0.06} key={p.id}>
							<article data-testid={`leader-${p.id}`}>
								<img
									src={p.photo.src}
									alt={p.photo.alt}
									width={p.photo.width}
									height={p.photo.height}
								/>
								<h3>{p.name}</h3>
								<span>{p.role}</span>
								<p>“{p.quote}”</p>
							</article>
						</RevealUp>
					))}
				</div>
			</section>
			<section className="triptych content">
				{[
					"MISSION / Learning with discipline and care.",
					"VISION / Young people ready to contribute.",
					"VALUES / Curiosity, integrity and service.",
				].map((x, i) => (
					<article key={x}>
						<span>0{i + 1}</span>
						<h2>{x.split(" / ")[0]}</h2>
						<p>{x.split(" / ")[1]}</p>
					</article>
				))}
			</section>
		</>
	);
}
