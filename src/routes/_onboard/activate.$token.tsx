import { createFileRoute, notFound, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { ERROR } from "#/lib/error.ts";
import { authClient } from "#/packages/auth/auth-client.ts";
import { activateInvite } from "#/packages/auth/server/activate-invite.ts";
import { getInvite } from "#/packages/auth/server/get-invite.ts";
import { pageCopy } from "#/lib/site";
import { Label } from "#/templates/modern/components/Label";
import { Input } from "#/templates/modern/components/Input";
import { Button } from "#/templates/modern/components/Button.tsx";
import { ImageReveal, SectionLabel } from "#/templates/modern/components/Editorial.tsx";

export const Route = createFileRoute("/_onboard/activate/$token")({
	beforeLoad: async ({ context }) => {
		if (context.session) {
			throw redirect({ to: "/" });
		}
	},
	loader: async ({ params }) => {
		const invite = await getInvite({ data: params.token });
		if (!invite) throw notFound();
		if (invite.usedAt) throw new Error(ERROR.INVITATION_USED);
		if (invite.expiresAt < new Date()) throw new Error(ERROR.INVITATION_EXPIRED);
		return invite;
	},
	notFoundComponent: () => <div>This invite link doesn't exists.</div>,
	errorComponent: ({ error }) => {
		if (error.message === ERROR.INVITATION_USED) return <div>This invitation has already been used.</div>;
		if (error.message === ERROR.INVITATION_EXPIRED) return <div>This invitation has expired.</div>;
		return <div>Something went wrong.</div>;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const invite = Route.useLoaderData();
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
        setBusy(true);
		try {
			const response = await activateInvite({ data: { token: invite.token, password } });
			if (!response.success) { setError("Failed to activate account"); setBusy(false); return; }
			const signInRes = await authClient.signIn.email({ email: invite.user.email, password });
			if (signInRes.error) { setError(signInRes.error.message || "Login failed"); setBusy(false); return; }
			navigate({ to: "/" });
		} catch (error) {
			setError("Something went wrong");
            setBusy(false);
		}
	};

	return (
			<section className="auth-page overflow-x-hidden min-w-0" aria-labelledby="activate-title">
			<div className="auth-visual min-w-0">
				<ImageReveal
					src="/public/schools/everest/landing-footage/frame_0001.jpeg"
					alt="School architecture marking the entrance to Everest"
					eager
					testId="activate-visual-image"
				/>
				<div className="auth-visual__overlay">
					<SectionLabel number="04" inverse>
						Welcome
					</SectionLabel>
					<p>Account Activation</p>
					<span>One community / connected responsibly</span>
				</div>
			</div>
			<div className="auth-panel w-full">
				<Link to="/" className="auth-back" style={{ color: "var(--c-black)" }}>
				<ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />
				Public website
				</Link>
				<div className="auth-panel__inner">
					<header>
						<span className="auth-kicker">
							{pageCopy.activate.eyebrow}
						</span>
						<h1 id="activate-title" className="t-page-title text-foreground">
						SET YOUR<br />PASSWORD.
						</h1>
						<p className="auth-intro text-foreground mt-4 font-medium break-all">Creating account for {invite.user.email}</p>
					</header>
					<form onSubmit={handleSubmit} className="auth-form" noValidate>
					<div className={`form-control ${error ? "form-control--error" : ""}`}>
						<Label htmlFor="password">Password</Label>
						<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => { setPassword(e.target.value); setError(""); }}
						className="editorial-input text-foreground"
						/>
					</div>
					<div className={`form-control ${error ? "form-control--error" : ""}`}>
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
						id="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
						className="editorial-input text-foreground"
						/>
						{error && (
							<p className="field-error">
							<AlertCircle aria-hidden="true" />
							{error}
							</p>
						)}
					</div>
					<Button type="submit" disabled={busy} className="institution-button institution-button--full">
						{busy ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
						{busy ? "Activating..." : "Activate Account"}
					</Button>
					</form>
				</div>
			</div>
			</section>
  );
}
