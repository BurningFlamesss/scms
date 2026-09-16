import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { departments, pageCopy, school } from "#/lib/site";
import { Button } from "#/templates/modern/components/kit";
import { Segmented } from "#/templates/modern/components/Segmented";
import { Input } from "#/templates/modern/components/Input";
import { Label } from "#/templates/modern/components/Label";

const kathmandu = () =>
	new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Kathmandu",
		weekday: "long",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date());
export const Route = createFileRoute("/_public/contact")({
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
					<div className={`form-control ${errors["contact-name"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-name" style={{ color: "var(--c-ink)" }}>Full name</Label>
						<Input
							type="text"
							id="contact-name"
							name="name"
							onBlur={validate}
							aria-invalid={!!errors["contact-name"]}
							className="editorial-input"
						/>
						{errors["contact-name"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-name"]}
							</p>
						)}
					</div>
					<div className={`form-control ${errors["contact-email"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-email" style={{ color: "var(--c-ink)" }}>Email address</Label>
						<Input
							type="email"
							id="contact-email"
							name="email"
							onBlur={validate}
							aria-invalid={!!errors["contact-email"]}
							className="editorial-input"
						/>
						{errors["contact-email"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-email"]}
							</p>
						)}
					</div>
					<div className={`form-control ${errors["contact-phone"] ? "form-control--error" : ""}`}>
						<Label htmlFor="contact-phone" style={{ color: "var(--c-ink)" }}>Phone number</Label>
						<Input
							type="tel"
							id="contact-phone"
							name="phone"
							onBlur={validate}
							aria-invalid={!!errors["contact-phone"]}
							className="editorial-input"
						/>
						{errors["contact-phone"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-phone"]}
							</p>
						)}
					</div>
					<div className={`form-control ${errors["contact-message"] ? "form-control--error" : ""}`}>
						<div className="label-line flex justify-between w-full">
							<Label htmlFor="contact-message" style={{ color: "var(--c-ink)" }}>Message</Label>
							<span
								id="contact-message-count"
								data-testid="contact-message-count"
								style={{ color: "var(--c-n-500)", fontSize: "14px" }}
							>
								{count} / 600
							</span>
						</div>
						<textarea
							id="contact-message"
							name="message"
							maxLength={600}
							onBlur={validate}
							onChange={(e) => setCount(e.target.value.length)}
							data-testid="contact-message-input"
							aria-describedby="contact-message-count"
							className="editorial-input"
						/>
						{errors["contact-message"] && (
							<p className="field-error">
								<AlertCircle aria-hidden="true" />
								{errors["contact-message"]}
							</p>
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
				<iframe 
					src="https://www.google.com/maps?q=Butwal-8+Sukkhanagar&output=embed" 
					width="100%" 
					height="400" 
					style={{ border: 0 }} 
					allowFullScreen={true} 
					loading="lazy" 
					referrerPolicy="no-referrer-when-downgrade"
				></iframe>
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
