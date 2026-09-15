import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { school as schoolConfig } from "#/content/school";
import { Button } from "#/templates/modern/components/Button";
import {
	ArrowLink,
	PageHero,
	SectionHeading,
	SectionLabel,
} from "#/templates/modern/components/Editorial";
import { Field, TextArea } from "#/templates/modern/components/Field";

const initialForm = {
	name: "",
	email: "",
	phone: "",
	subject: "",
	message: "",
};

function validate(values: typeof initialForm) {
	const errors: Partial<typeof initialForm> = {};
	if (!values.name.trim()) errors.name = "Please tell us your name.";
	if (!/^\S+@\S+\.\S+$/.test(values.email))
		errors.email = "Enter a valid email address.";
	if (values.phone && !/^[+\d\s()-]{7,}$/.test(values.phone))
		errors.phone = "Enter a valid phone number, or leave this field blank.";
	if (!values.subject.trim())
		errors.subject = "Add a short subject so we can direct your message.";
	if (values.message.trim().length < 20)
		errors.message =
			"Please share at least 20 characters so we can understand your enquiry.";
	return errors;
}

function ContactForm() {
	const [values, setValues] = useState(initialForm);
	const [errors, setErrors] = useState<Partial<typeof initialForm>>({});
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");

	const update = (name: string, value: string) => {
		setValues((current) => ({ ...current, [name]: value }));
		if (errors[name as keyof typeof errors])
			setErrors((current) => ({ ...current, [name]: undefined }));
		if (status === "success") setStatus("idle");
	};

	const submit = (event: React.FormEvent) => {
		event.preventDefault();
		const nextErrors = validate(values);
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) {
			setStatus("error");
			const firstErrorKey = Object.keys(nextErrors)[0];
			document.getElementById(firstErrorKey)?.focus();
			return;
		}
		setStatus("loading");
		window.setTimeout(() => setStatus("success"), 900);
	};

	return (
		<form
			className="contact-form"
			onSubmit={submit}
			noValidate
			data-testid="contact-form"
		>
			<div className="contact-form__row">
				<Field
					label="Name"
					name="name"
					id="name"
					value={values.name}
					onChange={(v) => update("name", v)}
					error={errors.name}
					testId="contact-name-input"
					required
					autoComplete="name"
				/>
				<Field
					label="Email"
					name="email"
					id="email"
					type="email"
					value={values.email}
					onChange={(v) => update("email", v)}
					error={errors.email}
					testId="contact-email-input"
					required
					autoComplete="email"
				/>
			</div>
			<div className="contact-form__row">
				<Field
					label="Phone (optional)"
					name="phone"
					id="phone"
					type="tel"
					value={values.phone}
					onChange={(v) => update("phone", v)}
					error={errors.phone}
					testId="contact-phone-input"
					autoComplete="tel"
				/>
				<Field
					label="Subject"
					name="subject"
					id="subject"
					value={values.subject}
					onChange={(v) => update("subject", v)}
					error={errors.subject}
					testId="contact-subject-input"
					required
				/>
			</div>
			<TextArea
				label="Message"
				name="message"
				id="message"
				value={values.message}
				onChange={(v) => update("message", v)}
				error={errors.message}
				testId="contact-message-input"
				required
				rows={6}
			/>

			{status === "error" ? (
				<div
					className="form-status form-status--error"
					role="alert"
					data-testid="contact-form-error-summary"
				>
					<AlertCircle aria-hidden="true" />
					<span>
						Some details need your attention before the message can be prepared.
					</span>
				</div>
			) : null}
			{status === "success" ? (
				<div
					className="form-status form-status--success"
					role="status"
					data-testid="contact-form-success"
				>
					<Check aria-hidden="true" />
					<span>
						Message prepared locally. This frontend preview does not send
						information to the school office.
					</span>
				</div>
			) : null}

			<div className="contact-form__actions">
				<Button
					type="submit"
					className="institution-button"
					disabled={status === "loading"}
					data-testid="contact-form-submit-button"
				>
					{status === "loading" ? (
						<LoaderCircle className="spin" aria-hidden="true" />
					) : null}
					{status === "loading" ? "Preparing message…" : "Prepare message"}
				</Button>
				<p>Frontend demonstration — no message is transmitted.</p>
			</div>
		</form>
	);
}

export const Route = createFileRoute("/user/contact-page-detail")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<PageHero
				index="03"
				eyebrow="Contact"
				title={
					<>
						Come closer.
						<br />
						See how learning lives.
					</>
				}
				intro="A visit begins with a conversation. Our school office can help families find the right next step."
				compact
			/>

			<section className="contact-destination section-space">
				<div className="u-container">
					<SectionLabel number="01">Visit us</SectionLabel>
					<div className="contact-destination__grid">
						<SectionHeading>
							Two buildings.
							<br />
							One welcome.
						</SectionHeading>
						<p>
							Everest and Canon are connected parts of the same institution.
							Official directions and visit arrangements are confirmed directly
							by the school office.
						</p>
					</div>
					<div className="location-table">
						{[
							{
								id: "everest",
								name: schoolConfig.nameEn,
								role: "Main school",
								address: `${schoolConfig.address.line1}, ${schoolConfig.address.line2}`,
							},
							{
								id: "canon",
								name: "Canon",
								role: "Affiliated building",
								address: schoolConfig.address.line2,
							},
						].map((campus, index) => (
							<article key={campus.id} className="location-row">
								<span>0{index + 1}</span>
								<div>
									<h3>{campus.name}</h3>
									<p>{campus.role}</p>
								</div>
								<address data-testid={`contact-${campus.id}-address`}>
									{campus.address}
									<br />
									{schoolConfig.address.district}
								</address>
							</article>
						))}
					</div>
				</div>
			</section>

			<section className="contact-information section-space">
				<div className="u-container">
					<SectionLabel number="02" inverse>
						School office
					</SectionLabel>
					<div className="contact-information__grid">
						<div>
							<span>Enquiries</span>
							<h2>{schoolConfig.email}</h2>
							<p>Use the enquiry form to prepare your message.</p>
						</div>
						<div>
							<span>Telephone</span>
							<h2>{schoolConfig.phones.map((p) => p.value).join(" · ")}</h2>
							<p>Official contact details are maintained by the institution.</p>
						</div>
						<div>
							<span>Location</span>
							<h2>{schoolConfig.address.district}</h2>
							<p>Campus-specific directions are confirmed before a visit.</p>
						</div>
					</div>
				</div>
			</section>

			<section
				className="contact-form-section section-space"
				aria-labelledby="contact-form-title"
			>
				<div className="u-container contact-form-section__grid">
					<div className="contact-form-section__intro">
						<SectionLabel number="03">Write to Everest</SectionLabel>
						<h2 id="contact-form-title">Start with what you need to know.</h2>
						<p>
							Share a clear message and the school office can direct it to the
							right conversation when this interface is connected to the
							institution's communication system.
						</p>
						<ArrowLink to="/login" testId="contact-login-link">
							Already part of the school? Enter ScMS
						</ArrowLink>
					</div>
					<ContactForm />
				</div>
			</section>

			<section className="contact-final">
				<div className="u-container contact-final__grid">
					<span>NEXT / VISIT</span>
					<h2>A school is best understood in person.</h2>
					<ArrowLink to="/about" inverse testId="contact-about-link">
						Explore our story first
					</ArrowLink>
				</div>
			</section>
		</>
	);
}
