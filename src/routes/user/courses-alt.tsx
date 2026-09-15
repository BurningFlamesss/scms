import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useState } from "react";
import { levels, pageCopy } from "#/lib/site";
import { Chip } from "#/templates/modern/components/Chip";
import { Segmented } from "#/templates/modern/components/Segmented";

export const Route = createFileRoute("/user/courses-alt")({
	component: RouteComponent,
});

function RouteComponent() {
	const plus = levels[2];
	const [left, setLeft] = useState("Science");
	const [right, setRight] = useState("Management");
	const [filter, setFilter] = useState("All levels");
	const [expanded, setExpanded] = useState("");
	const a = plus.streams.find((s) => s.name === left)!;
	const b = plus.streams.find((s) => s.name === right)!;
	const shared = useMemo(
		() => a.subjects.filter((x) => b.subjects.some((y) => y.name === x.name)),
		[a, b],
	);
	return (
		<>
			<header className="page-header content">
				<p className="eyebrow">{pageCopy.courses.eyebrow}</p>
				<h1>
					{pageCopy.courses.title.split("\n").map((x) => (
						<React.Fragment key={x}>
							{x}
							<br />
						</React.Fragment>
					))}
				</h1>
				<p className="lead">{pageCopy.courses.support}</p>
			</header>
			<div className="filters content">
				<Chip
					selected={filter === "All levels"}
					onClick={() => setFilter("All levels")}
					testId="course-filter-all"
				>
					All levels
				</Chip>
				{levels.map((l) => (
					<Chip
						key={l.id}
						selected={filter === l.name}
						onClick={() => setFilter(l.name)}
						testId={`course-filter-${l.id}`}
					>
						{l.name}
					</Chip>
				))}
			</div>
			<section className="levels content">
				{levels
					.filter((l) => filter === "All levels" || filter === l.name)
					.map((l, i) => (
						<article
							className="level-band"
							key={l.id}
							style={{ "--rise": `${i + 1}` } as React.CSSProperties}
						>
							<div>
								<span>{l.marker}</span>
								<h2>{l.name}</h2>
								<p>{l.grades}</p>
							</div>
							{l.streams[0].subjects.map((s) => (
								<div className="subject-row" key={s.id}>
									<button
										aria-expanded={expanded === s.id}
										onClick={() => setExpanded(expanded === s.id ? "" : s.id)}
										data-testid={`subject-${s.id}-toggle`}
									>
										<strong>{s.name}</strong>
										<span>
											{s.creditHours} CR · {s.theory}/{s.practical}
										</span>
										<b>+</b>
									</button>
									{expanded === s.id && (
										<ul data-testid={`subject-${s.id}-outline`}>
											{s.outline.map((x) => (
												<li key={x}>{x}</li>
											))}
										</ul>
									)}
								</div>
							))}
						</article>
					))}
			</section>
			<section className="comparison content" data-testid="stream-comparison">
				<p className="eyebrow">SIGNATURE TOOL / +2 STREAM COMPARISON</p>
				<h2>COMPARE TWO DIRECTIONS.</h2>
				<div className="comparison-pickers">
					<Segmented
						label="Left stream"
						options={plus.streams.map((x) => ({
							value: x.name,
							label: x.name,
						}))}
						value={left}
						onChange={(v) => {
							setLeft(v);
							if (v === right)
								setRight(v === "Science" ? "Management" : "Science");
						}}
					/>
					<Segmented
						label="Right stream"
						options={plus.streams.map((x) => ({
							value: x.name,
							label: x.name,
						}))}
						value={right}
						onChange={(v) => {
							setRight(v);
							if (v === left)
								setLeft(v === "Science" ? "Management" : "Science");
						}}
					/>
				</div>
				<div className="diff">
					<article>
						<h3>{left}</h3>
						{a.subjects
							.filter((x) => !shared.some((y) => y.name === x.name))
							.map((x) => (
								<p key={x.id}>{x.name}</p>
							))}
						<div>
							{a.careers.map((x) => (
								<span key={x}>{x}</span>
							))}
						</div>
					</article>
					<article className="shared">
						<h3>SHARED</h3>
						{shared.map((x) => (
							<p key={x.id}>{x.name}</p>
						))}
					</article>
					<article>
						<h3>{right}</h3>
						{b.subjects
							.filter((x) => !shared.some((y) => y.name === x.name))
							.map((x) => (
								<p key={x.id}>{x.name}</p>
							))}
						<div>
							{b.careers.map((x) => (
								<span key={x}>{x}</span>
							))}
						</div>
					</article>
				</div>
			</section>
			<section className="fee-table content">
				<h2>ELIGIBILITY & FEE STRUCTURE</h2>
				<div>
					<table data-testid="fees-table">
						<thead>
							<tr>
								<th>Programme</th>
								<th>Minimum eligibility</th>
								<th>Admission</th>
								<th>Monthly tuition</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Basic Level</td>
								<td>Previous grade record</td>
								<td>NPR 8,500</td>
								<td>NPR 4,200</td>
							</tr>
							<tr>
								<td>Secondary</td>
								<td>Grade 8 result</td>
								<td>NPR 12,000</td>
								<td>NPR 5,800</td>
							</tr>
							<tr>
								<td>+2</td>
								<td>SEE GPA criteria</td>
								<td>NPR 18,000</td>
								<td>NPR 7,500</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</>
	);
}
