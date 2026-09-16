import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight } from "lucide-react";
import { photos } from "#/content/images";
import { school as schoolConfig } from "#/content/school";
import { CampusShowcase } from "#/templates/modern/components/CampusShowcase";
import { PageFrame, PageHeader, Section } from "#/templates/modern/components/chrome/PageFrame";
import {
	ArrowLink,
	ImageReveal,
	Reveal,
	SectionHeading,
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
		<PageFrame>
			<PageHeader 
				eyebrow="ABOUT EVEREST"
				title={<>A place where curiosity<br />becomes capability.</>}
				lead="An institutional story told through the people, spaces, and principles that shape each school day."
			/>

			<Section>
				<div className="about-who__grid mt-8 border-t border-rule pt-8 lg:grid lg:grid-cols-[1fr_2fr] lg:gap-16">
					<Reveal>
						<h2 className="t-h2 text-foreground">
							Established in purpose.
							<br />
							Contemporary in outlook.
						</h2>
					</Reveal>
					<div className="mt-6 lg:mt-0">
						<p className="t-body text-muted-foreground">
							{schoolConfig.nameEn} is a learning institution in Nepal built
							around a simple conviction: students thrive when expectations
							are clear, relationships are strong, and curiosity has room to
							become practice.
						</p>
						<dl className="mt-8 grid gap-6 sm:grid-cols-2">
							<div>
								<dt className="t-eyebrow mb-1">Institution</dt>
								<dd className="font-medium text-foreground">Everest English Boarding Higher Secondary School</dd>
							</div>
							<div>
								<dt className="t-eyebrow mb-1">Learning spaces</dt>
								<dd className="font-medium text-foreground">Everest Building + Canon Building</dd>
							</div>
							<div>
								<dt className="t-eyebrow mb-1">Educational language</dt>
								<dd className="font-medium text-foreground">English-medium, locally grounded</dd>
							</div>
							<div>
								<dt className="t-eyebrow mb-1">Community</dt>
								<dd className="font-medium text-foreground">Students, families, educators, and staff</dd>
							</div>
						</dl>
					</div>
				</div>
			</Section>

			<Section>
				<div className="story-section__header">
					<SectionHeading kicker="A continuing progression" title="The school changes. Its purpose holds.">
					</SectionHeading>
					<p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
						Not a timeline of milestones, but a record of an institution
						learning how to serve its community with greater attention.
					</p>
				</div>
				<div className="mt-12 grid gap-8 sm:grid-cols-3">
					{storyChapters.map((chapter) => (
						<article key={chapter.index} className="flex flex-col gap-3 group relative border-t border-rule pt-4">
							<div className="t-eyebrow">{chapter.index} · {chapter.label}</div>
							<h3 className="font-display text-[19px] font-semibold tracking-tight text-foreground">{chapter.title}</h3>
							<p className="text-[14px] leading-relaxed text-muted-foreground">{chapter.copy}</p>
						</article>
					))}
				</div>
			</Section>

			<Section>
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
					<div className="border-t border-rule pt-6">
						<span className="t-eyebrow mb-3 block">Mission</span>
						<p className="text-[20px] font-medium leading-[1.4] text-foreground">
							To make rigorous learning humane, purposeful, and available to
							every student who enters our classrooms.
						</p>
					</div>
					<div className="border-t border-rule pt-6">
						<span className="t-eyebrow mb-3 block">Vision</span>
						<p className="text-[20px] font-medium leading-[1.4] text-foreground">
							Young people who can think independently, act responsibly, and
							contribute with confidence.
						</p>
					</div>
				</div>
			</Section>

			<Section>
				<div className="grid gap-12 border-t border-rule pt-8 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
					<blockquote className="font-display text-[32px] font-semibold leading-[1.1] tracking-tight text-foreground lg:text-[40px]">
						"Capability grows when knowledge, character, and attention are
						practiced together."
					</blockquote>
					<div className="space-y-4">
						<p className="text-[15px] leading-relaxed text-muted-foreground">
							We believe education should be intellectually ambitious without
							becoming impersonal. Clear instruction matters. So do
							experimentation, conversation, and the confidence to revise an
							idea.
						</p>
						<p className="text-[15px] leading-relaxed text-muted-foreground">
							This means classrooms that value careful questions, educators
							who notice how each student learns, and a culture where
							discipline is understood as a form of care.
						</p>
					</div>
				</div>
			</Section>

			<Section>
				<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
					<div>
						<SectionHeading title="Spaces that invite attention." />
						<p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
							A school environment should make learning feel possible: ordered
							enough for concentration, open enough for exchange, and alive to
							the energy of young people.
						</p>
					</div>
					<ImageReveal
						src={photos.assemblyAerial.src}
						alt="Built environment and civic context in Nepal"
						className="aspect-[4/3] rounded-sm overflow-hidden"
						caption="Context matters. Learning is always located in a community."
						testId="about-environment-image"
					/>
				</div>
			</Section>

			<CampusShowcase />

			<Section>
				<div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-16">
					<SectionHeading title="Leadership is a daily practice, not a portrait on a wall." />
					<div>
						<p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
							Our leadership culture connects academic direction, student
							care, and operational discipline. It asks every adult in the
							institution to make the school's values visible in daily
							decisions.
						</p>
						<div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Leadership areas">
							<span className="border-t border-rule pt-3 text-[14px] font-medium">Academic direction</span>
							<span className="border-t border-rule pt-3 text-[14px] font-medium">Student wellbeing</span>
							<span className="border-t border-rule pt-3 text-[14px] font-medium">Family partnership</span>
							<span className="border-t border-rule pt-3 text-[14px] font-medium">Institutional stewardship</span>
						</div>
					</div>
				</div>
			</Section>

			<Section className="mb-32">
				<div className="flex flex-col items-center justify-center gap-6 rounded-b-lg rounded-t-sm bg-n-50 px-6 py-20 text-center lg:py-32">
					<span className="t-eyebrow">Begin with a conversation.</span>
					<h2 className="font-display text-[40px] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[56px]">
						See the institution
						<br />
						from inside.
					</h2>
					<ArrowLink to="/contact" testId="about-contact-cta">
						Contact the school
					</ArrowLink>
				</div>
      </Section>
    </PageFrame>
  );
}
