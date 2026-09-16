import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle } from "lucide-react";
import { pageCopy } from "#/lib/site";
import { Label } from "#/templates/modern/components/Label";
import { Input } from "#/templates/modern/components/Input";
import { Button } from "#/templates/modern/components/Button";

export const Route = createFileRoute("/_onboard/activate")({
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
    <section className="auth-page" aria-labelledby="activate-title">
      <div className="cms-section-box min-w-0" style={{ border: 'none', background: 'transparent' }}>
         <div className="auth-visual">
            <img src="/public/schools/everest/landing-footage/frame_0001.jpeg" alt="" className="editorial-media" />
         </div>
      </div>
      <div className="auth-panel">
        <div className="cms-section-box" style={{ border: 'none', background: 'transparent' }}>
          <Link to="/" className="auth-back" style={{ color: "var(--c-black)" }}>
            <ArrowLeft aria-hidden="true" style={{ color: "var(--c-red)" }} />
            Public website
          </Link>
        </div>
        <div className="auth-panel__inner">
          <div className="cms-section-box" style={{ border: 'none', background: 'transparent' }}>
             <header className="auth-intro">
                <p className="eyebrow" style={{ color: "var(--c-red)" }}>{pageCopy.activate.eyebrow}</p>
                <h1 id="activate-title" className="u-display" style={{ color: "var(--c-black)" }}>
                   {pageCopy.activate.title.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                   ))}
                </h1>
                <p className="lead" style={{ color: "var(--c-ink)" }}>{pageCopy.activate.support}</p>
             </header>
          </div>
          <div className="cms-section-box" style={{ border: 'none', background: 'transparent' }}>
            <form onSubmit={submit} className="auth-form" noValidate>
              <div className={`form-control ${error ? "form-control--error" : ""}`}>
                <Label htmlFor="activate-token" style={{ color: "var(--c-black)" }}>Activation Code</Label>
                <Input
                  id="activate-token"
                  type="text"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(""); }}
                  className="editorial-input"
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
      </div>
    </section>
  );
}
