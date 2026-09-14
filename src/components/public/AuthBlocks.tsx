import { Link } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowLeft,
	Check,
	Eye,
	EyeOff,
	LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { Button } from "#/templates/modern/components/Button.tsx";
import {
	ImageReveal,
	SectionLabel,
} from "#/templates/modern/components/Editorial.tsx";
import { Input } from "#/templates/modern/components/Input.tsx";
import { Label } from "#/templates/modern/components/Label.tsx";
import type { BlockType, ContentBlock } from "#/types";

const VISUAL_IMAGE = "/public/schools/everest/landing-footage/frame_0001.jpeg";

function AuthVisual({ fields }: { fields: Record<string, unknown> }) {
	return (
		<div className="auth-visual">
			<ImageReveal
				src={str(fields, "image", VISUAL_IMAGE)}
				alt="School architecture marking the entrance to Everest"
				eager
				testId="login-visual-image"
			/>
			<div className="auth-visual__overlay">
				<SectionLabel number="04" inverse>
					{str(fields, "eyebrow", "ScMS entrance")}
				</SectionLabel>
				<p>{str(fields, "headline", "The digital entrance to the school.")}</p>
				<span>
					{str(fields, "subheadline", "One community / connected responsibly")}
				</span>
			</div>
		</div>
	);
}

function AuthIntro({
	fields,
	orgName,
}: {
	fields: Record<string, unknown>;
	orgName?: string;
}) {
	return (
		<>
			<span className="auth-kicker">
				{str(fields, "kicker", "SCHOOL MANAGEMENT SYSTEM")}
			</span>
			<h1 id="login-title">{str(fields, "title", "Welcome back.")}</h1>
			<p className="auth-intro" style={{ color: "var(--c-black)" }}>
				{str(
					fields,
					"intro",
					orgName
						? `Enter the credentials issued by ${orgName} to continue.`
						: "Enter the credentials issued by your school to continue.",
				)}
			</p>
		</>
	);
}

function LoginForm({ fields }: { fields: Record<string, unknown> }) {
	const [values, setValues] = useState({ email: "", password: "" });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [recoveryOpen, setRecoveryOpen] = useState(false);

	const update = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setValues((current) => ({ ...current, [name]: value }));
		setErrors((current) => ({ ...current, [name]: "" }));
		if (status === "success") setStatus("idle");
	};

	const submit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const next: Record<string, string> = {};
		if (!/^\S+@\S+\.\S+$/.test(values.email))
			next.email = "Enter the email address connected to your school account.";
		if (values.password.length < 8)
			next.password = "Password must contain at least 8 characters.";
		setErrors(next);
		if (Object.keys(next).length) {
			setStatus("error");
			document
				.getElementById(
					Object.keys(next)[0] === "email" ? "login-email" : "login-password",
				)
				?.focus();
			return;
		}
		setStatus("loading");
		window.setTimeout(() => setStatus("success"), 850);
	};

	return (
		<form
			onSubmit={submit}
			noValidate
			className="auth-form"
			data-testid="login-form"
		>
			<div
				className={`form-control ${errors.email ? "form-control--error" : ""}`}
			>
				<Label htmlFor="login-email" style={{ color: "var(--c-black)" }}>
					{str(fields, "emailLabel", "Email")}
				</Label>
				<Input
					id="login-email"
					name="email"
					type="email"
					value={values.email}
					onChange={update}
					autoComplete="email"
					aria-invalid={Boolean(errors.email)}
					aria-describedby={errors.email ? "login-email-error" : undefined}
					className="editorial-input"
					disabled={status === "loading"}
					data-testid="login-email-input"
				/>
				{errors.email ? (
					<p id="login-email-error" className="field-error">
						<AlertCircle aria-hidden="true" />
						{errors.email}
					</p>
				) : null}
			</div>
			<div
				className={`form-control ${errors.password ? "form-control--error" : ""}`}
			>
				<div className="label-line">
					<Label htmlFor="login-password" style={{ color: "var(--c-black)" }}>
						{str(fields, "passwordLabel", "Password")}
					</Label>
					<button
						type="button"
						onClick={() => setRecoveryOpen((value) => !value)}
						data-testid="forgot-password-button"
						style={{ color: "var(--c-yellow)", fontWeight: 500 }}
					>
						{str(fields, "forgotLabel", "Forgot password?")}
					</button>
				</div>
				<div className="password-field">
					<Input
						id="login-password"
						name="password"
						type={showPassword ? "text" : "password"}
						value={values.password}
						onChange={update}
						autoComplete="current-password"
						aria-invalid={Boolean(errors.password)}
						aria-describedby={
							errors.password ? "login-password-error" : undefined
						}
						className="editorial-input"
						disabled={status === "loading"}
						data-testid="login-password-input"
					/>
					<button
						type="button"
						className="password-toggle"
						onClick={() => setShowPassword((value) => !value)}
						aria-label={showPassword ? "Hide password" : "Show password"}
						data-testid="login-password-toggle"
						style={{ color: "var(--c-red) !important" }}
					>
						{showPassword ? (
							<EyeOff aria-hidden="true" />
						) : (
							<Eye aria-hidden="true" />
						)}
					</button>
				</div>
				{errors.password ? (
					<p id="login-password-error" className="field-error">
						<AlertCircle aria-hidden="true" />
						{errors.password}
					</p>
				) : null}
			</div>

			{recoveryOpen ? (
				<div
					className="auth-note"
					role="status"
					data-testid="password-recovery-note"
				>
					Password recovery requires the connected ScMS service. Contact the
					school office for account assistance.
				</div>
			) : null}
			{status === "success" ? (
				<div
					className="form-status form-status--success"
					role="status"
					data-testid="login-demo-success"
				>
					<Check aria-hidden="true" />
					<span>
						Sign-in form verified. This frontend preview is not connected to
						authentication.
					</span>
				</div>
			) : null}

			<Button
				type="submit"
				className="institution-button institution-button--full"
				disabled={status === "loading"}
				data-testid="login-form-submit-button"
			>
				{status === "loading" ? (
					<LoaderCircle className="spin" aria-hidden="true" />
				) : null}
				{status === "loading"
					? "Checking interface…"
					: str(fields, "submitLabel", "Sign in")}
			</Button>
			<p className="demo-disclosure" style={{ color: "var(--c-yellow)" }}>
				{str(
					fields,
					"disclosure",
					"Frontend demonstration — no credentials are transmitted or stored.",
				)}
			</p>
		</form>
	);
}

function AuthContact({ fields }: { fields: Record<string, unknown> }) {
	const href = str(fields, "linkHref", "/contact");
	return (
		<div className="auth-contact">
			<span style={{ color: "var(--c-black)" }}>
				{str(fields, "title", "Don't have access?")}
			</span>
			<Link
				to={href as never}
				data-testid="login-contact-school-link"
				style={{ color: "var(--c-red)", fontWeight: 500 }}
			>
				{str(fields, "linkLabel", "Contact the school")}{" "}
				<span aria-hidden="true">→</span>
			</Link>
		</div>
	);
}

function pick(
	blocks: ContentBlock[],
	type: ContentBlock["type"],
): ContentBlock | undefined {
	return blocks.find((block) => block.type === type);
}

/**
 * Renders the sign-in page as a composition of the auth_* section blocks.
 * Sections without a block fall back to the default copy, so a page with no
 * blocks renders the static sign-in layout. In admin live-preview mode each
 * section is wrapped in a click target that opens the section editor.
 */
export function AuthPage({
	blocks,
	orgName,
	preview = false,
	onSelectSection,
}: {
	blocks?: ContentBlock[] | null;
	orgName?: string;
	preview?: boolean;
	onSelectSection?: (sectionType: BlockType) => void;
}) {
	const list = blocks ?? [];
	const visual = pick(list, "auth_visual");
	const intro = pick(list, "auth_intro");
	const form = pick(list, "auth_form");
	const contact = pick(list, "auth_contact");
	const select = onSelectSection ?? (() => {});

	return (
		<section className="auth-page" aria-labelledby="login-title">
			<CmsSectionBox
				preview={preview}
				sectionType="auth_visual"
				onSelect={select}
				className="min-w-0"
			>
				<AuthVisual fields={visual?.fields ?? {}} />
			</CmsSectionBox>
			<div className="auth-panel">
				<CmsSectionBox
					preview={preview}
					sectionType="auth_form"
					onSelect={select}
					testId="cms-section-hit-auth_back"
				>
					<Link
						to="/"
						className="auth-back"
						data-testid="login-back-home-link"
						style={{ color: "var(--c-black)" }}
					>
						<ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />{" "}
						{str(form?.fields ?? {}, "backLabel", "Public website")}
					</Link>
				</CmsSectionBox>
				<div className="auth-panel__inner">
					<CmsSectionBox
						preview={preview}
						sectionType="auth_intro"
						onSelect={select}
					>
						<AuthIntro fields={intro?.fields ?? {}} orgName={orgName} />
					</CmsSectionBox>
					<CmsSectionBox
						preview={preview}
						sectionType="auth_form"
						onSelect={select}
						testId="cms-section-hit-auth_form"
					>
						<LoginForm fields={form?.fields ?? {}} />
					</CmsSectionBox>
					<CmsSectionBox
						preview={preview}
						sectionType="auth_contact"
						onSelect={select}
					>
						<AuthContact fields={contact?.fields ?? {}} />
					</CmsSectionBox>
				</div>
			</div>
		</section>
	);
}
