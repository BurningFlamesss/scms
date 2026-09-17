import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { pageCopy } from "#/lib/site";
import { Label } from "#/templates/modern/components/Label";
import { Input } from "#/templates/modern/components/Input";
import { Button } from "#/templates/modern/components/Button.tsx";
import { ImageReveal, SectionLabel } from "#/templates/modern/components/Editorial.tsx";

export const Route = createFileRoute("/_onboard/activate/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Please enter your activation code.");
      return;
    }
    navigate({ to: "/activate/$token", params: { token: token.trim() } });
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
		<div className="auth-panel">
			<Link to="/" className="auth-back" data-testid="activate-back-home-link" style={{ color: "var(--c-black)" }}>
			<ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />
			Public website
			</Link>
			<div className="auth-panel__inner">
				<header>
					<span className="auth-kicker">
						{pageCopy.activate.eyebrow}
					</span>
					<h1 id="activate-title" className="t-page-title text-foreground">
					{pageCopy.activate.title.split('\n').map((line, i) => (
						<span key={i}>{line}<br /></span>
					))}
					</h1>
					<p className="auth-intro text-foreground font-medium mt-4">{pageCopy.activate.support}</p>
				</header>
				<form onSubmit={submit} className="auth-form" noValidate>
				<div className={`form-control ${error ? "form-control--error" : ""}`}>
					<Label htmlFor="activate-token">Activation Code</Label>
					<Input
					id="activate-token"
					type="text"
					value={token}
					onChange={(e) => { setToken(e.target.value); setError(""); }}
					className="editorial-input text-foreground"
					placeholder="Enter 6-character code"
					/>
					{error && (
					<p className="field-error">
						<AlertCircle aria-hidden="true" />
						{error}
					</p>
					)}
				</div>
				<Button type="submit" className="institution-button institution-button--full">
					Continue
				</Button>
				</form>
			</div>
		</div>
		</section>
  );
}
