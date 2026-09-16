import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight } from "lucide-react";
import { photos } from "#/content/images";
import { school as schoolConfig } from "#/content/school";
import { CampusShowcase } from "#/templates/modern/components/CampusShowcase";
import {
	ArrowLink,
	ImageReveal,
	PageHero,
	Reveal,
	SectionHeading,
	SectionLabel,
} from "#/templates/modern/components/Editorial";

const storyChapters = [
	{
		index: "01",
		label: "Foundation",
		title: "A school begins with a promise.",
		copy: "Everest began with a clear institutional purpose: to make disciplined learning feel personal, attentive, and connected to the lives students are preparing to lead.",
	},
	{
		index: "02",
		label: "Growth",
		title: "One community learns to expand.",
		copy: "As the school community grew, its spaces and practices grew with it—bringing students, educators, and families into a shared culture of responsibility.",
	},
	{
		index: "03",
		label: "Now / Next",
		title: "Heritage becomes a direction.",
		copy: "Today, Everest carries its experience forward through thoughtful teaching, connected campuses, and a digital system designed to support the human work of education.",
	},
];

export const Route = createFileRoute("/_public/about")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<PageHero
				index="02"
				eyebrow="About Everest"
				title={
					<>
						A place where curiosity
						<br />
						becomes capability.
					</>
				}
				intro="An institutional story told through the people, spaces, and principles that shape each school day."
			>
				<ImageReveal
					src={photos.campusModern.src}
					alt="Architectural view of a contemporary learning space"
					className="page-hero__image"
					eager
					testId="about-hero-image"
				/>
			</PageHero>

			<section className="about-who section-space">
				<div className="u-container">
					<SectionLabel number="01">Who we are</SectionLabel>
					<div className="about-who__grid">
						<Reveal>
							<h2>
								Established in purpose.
								<br />
								Contemporary in outlook.
							</h2>
						</Reveal>
						<div className="about-who__body">
							<p>
								{schoolConfig.nameEn} is a learning institution in Nepal built
								around a simple conviction: students thrive when expectations
								are clear, relationships are strong, and curiosity has room to
								become practice.
							</p>
							<dl className="institution-list">
								<div>
									<dt>Institution</dt>
									<dd>Everest English Boarding Higher Secondary School</dd>
								</div>
								<div>
									<dt>Learning spaces</dt>
									<dd>Everest Building + Canon Building</dd>
								</div>
								<div>
									<dt>Educational language</dt>
									<dd>English-medium, locally grounded</dd>
								</div>
								<div>
									<dt>Community</dt>
									<dd>Students, families, educators, and staff</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</section>

			<section
				className="story-section section-space"
				aria-labelledby="story-title"
			>
				<div className="u-container">
					<SectionLabel number="02">Our story</SectionLabel>
					<div className="story-section__header">
						<SectionHeading kicker="A continuing progression">
							The school changes. Its purpose holds.
						</SectionHeading>
						<p>
							Not a timeline of milestones, but a record of an institution
							learning how to serve its community with greater attention.
						</p>
					</div>
					<div className="story-progression">
						{storyChapters.map((chapter) => (
							<article key={chapter.index} className="story-chapter">
								<div className="story-chapter__index">{chapter.index}</div>
								<div className="story-chapter__meta">{chapter.label}</div>
								<h3>{chapter.title}</h3>
								<p>{chapter.copy}</p>
								<ArrowDownRight aria-hidden="true" />
							</article>
						))}
					</div>
				</div>
			</section>

			<section
				className="mission-section section-space"
				aria-label="Mission and vision"
			>
				<div className="u-container">
					<SectionLabel number="03" inverse>
						Mission / Vision
					</SectionLabel>
					<div className="mission-statement">
						<span>Mission</span>
						<p>
							To make rigorous learning humane, purposeful, and available to
							every student who enters our classrooms.
						</p>
					</div>
					<div className="mission-statement mission-statement--vision">
						<span>Vision</span>
						<p>
							Young people who can think independently, act responsibly, and
							contribute with confidence.
						</p>
					</div>
				</div>
			</section>

			<section className="philosophy-detail section-space">
				<div className="u-container">
					<SectionLabel number="04">Educational philosophy</SectionLabel>
					<div className="philosophy-detail__grid">
						<blockquote>
							"Capability grows when knowledge, character, and attention are
							practiced together."
						</blockquote>
						<div>
							<p>
								We believe education should be intellectually ambitious without
								becoming impersonal. Clear instruction matters. So do
								experimentation, conversation, and the confidence to revise an
								idea.
							</p>
							<p>
								This means classrooms that value careful questions, educators
								who notice how each student learns, and a culture where
								discipline is understood as a form of care.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="environment-section section-space">
				<div className="environment-section__grid">
					<div className="environment-section__copy">
						<SectionLabel number="05">Our environment</SectionLabel>
						<SectionHeading>Spaces that invite attention.</SectionHeading>
						<p>
							A school environment should make learning feel possible: ordered
							enough for concentration, open enough for exchange, and alive to
							the energy of young people.
						</p>
					</div>
					<ImageReveal
						src={photos.assemblyAerial.src}
						alt="Built environment and civic context in Nepal"
						className="environment-section__image"
						caption="Context matters. Learning is always located in a community."
						testId="about-environment-image"
					/>
				</div>
			</section>

			<CampusShowcase />

			<section className="leadership-section section-space">
				<div className="u-container">
					<SectionLabel number="07">Leadership</SectionLabel>
					<div className="leadership-section__grid">
						<SectionHeading>
							Leadership is a daily practice, not a portrait on a wall.
						</SectionHeading>
						<div>
							<p>
								Our leadership culture connects academic direction, student
								care, and operational discipline. It asks every adult in the
								institution to make the school's values visible in daily
								decisions.
							</p>
							<div className="leadership-roles" aria-label="Leadership areas">
								<span>Academic direction</span>
								<span>Student wellbeing</span>
								<span>Family partnership</span>
								<span>Institutional stewardship</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="closing-cta">
				<div className="u-container closing-cta__inner">
					<span>Begin with a conversation.</span>
					<h2>
						See the institution
						<br />
						from inside.
					</h2>
					<ArrowLink to="/contact" inverse testId="about-contact-cta">
						Contact the school
					</ArrowLink>
				</div>
			</section>
		</>
	);
}
