import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { departments, pageCopy, school } from "#/lib/site";
import { Field } from "#/templates/modern/components/Field";
import { Button } from "#/templates/modern/components/kit";
import { Segmented } from "#/templates/modern/components/Segmented";

const kathmandu = () =>
	new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Kathmandu",
		weekday: "long",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date());
export const Route = createFileRoute("/user/contact-alt")({
	component: RouteComponent,
});

function RouteComponent() {
	const [route, setRoute] = useState("Admissions");
	const [time, setTime] = useState(kathmandu());
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [count, setCount] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setTime(kathmandu()), 60000);
		return () => clearInterval(id);
	}, []);
	const validate = (
		e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { id, value } = e.currentTarget;
		setErrors((x) => ({
			...x,
			[id]: value.trim() ? "" : "This field is required.",
		}));
	};
	return (
		<>
			<header className="page-header content">
				<p className="eyebrow">{pageCopy.contact.eyebrow}</p>
				<h1>
					{pageCopy.contact.title.split("\n").map((x) => (
						<React.Fragment key={x}>
							{x}
							<br />
						</React.Fragment>
					))}
				</h1>
				<p className="lead">{pageCopy.contact.support}</p>
			</header>
			<section className="contact-layout content">
				<aside>
					<p className="devanagari">{school.nepali}</p>
					<h2>{school.name}</h2>
					<p>{school.address}</p>
					<div className="time-card">
						<strong data-testid="contact-open-state">
							OPEN TODAY · 09:00–16:00
						</strong>
						<span data-testid="kathmandu-time">{time} · ASIA/KATHMANDU</span>
						{[
							"SUNDAY 09:00–16:00",
							"MONDAY 09:00–16:00",
							"TUESDAY 09:00–16:00",
							"WEDNESDAY 09:00–16:00",
							"THURSDAY 09:00–16:00",
							"FRIDAY 09:00–16:00",
							"SATURDAY CLOSED",
						].map((x) => (
							<p key={x}>{x}</p>
						))}
					</div>
					<a href={`tel:${school.phoneNtc}`} data-testid="contact-ntc-link">
						NTC · {school.phoneNtc}
					</a>
					<a href={`tel:${school.phoneNcell}`} data-testid="contact-ncell-link">
						NCELL · {school.phoneNcell}
					</a>
					<a
						href="https://maps.google.com/?q=Pokhara+5+Nepal"
						data-testid="contact-directions-link"
					>
						GET DIRECTIONS ↗
					</a>
				</aside>
				<form onSubmit={(e) => e.preventDefault()} data-testid="contact-form">
					<h2>DIRECT YOUR ENQUIRY</h2>
					<Segmented
						label="Direct your enquiry"
						options={[
							"Admissions",
							"Accounts",
							"Principal's Office",
							"General",
						].map((v) => ({ value: v, label: v }))}
						value={route}
						onChange={setRoute}
					/>
					<Field
						label="Full name"
						id="contact-name"
						onBlur={validate}
						error={errors["contact-name"]}
					/>
					<Field
						label="Email address"
						id="contact-email"
						type="email"
						onBlur={validate}
						error={errors["contact-email"]}
					/>
					<Field
						label="Phone number"
						id="contact-phone"
						onBlur={validate}
						error={errors["contact-phone"]}
					/>
					<div className="field">
						<label htmlFor="contact-message">Message</label>
						<textarea
							id="contact-message"
							maxLength={600}
							onBlur={validate}
							onChange={(e) => setCount(e.target.value.length)}
							data-testid="contact-message-input"
							aria-describedby="contact-message-count"
						/>
						<span
							id="contact-message-count"
							data-testid="contact-message-count"
						>
							{count} / 600
						</span>
						{errors["contact-message"] && (
							<p className="field-error">! {errors["contact-message"]}</p>
						)}
					</div>
					<Button type="submit" testId="contact-submit-button">
						Send enquiry
					</Button>
					<p className="form-note">
						This preview validates the form but does not transmit messages.
					</p>
				</form>
			</section>
			<section
				className="map-panel content"
				aria-label="School map placeholder"
				data-testid="school-map"
			>
				<span>EVEREST SCHOOL</span>
				<b>POKHARA–5</b>
			</section>
			<section className="departments content">
				<h2>WHO TO ASK</h2>
				<div>
					{departments.map((d) => (
						<article key={d.id} data-testid={`department-${d.id}`}>
							<span>{d.name}</span>
							<h3>{d.contact}</h3>
							<a href={`mailto:${d.email}`}>{d.email}</a>
							<p>{d.hours}</p>
						</article>
					))}
				</div>
			</section>
		</>
	);
}
