import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from "react";
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "#/templates/modern/components/Button.tsx";
import { Input } from "#/templates/modern/components/Input.tsx";
import { Label } from "#/templates/modern/components/Label.tsx";
import { ImageReveal, SectionLabel } from "#/templates/modern/components/Editorial.tsx";
import { useSchoolConfig, useSchoolContent } from '#/packages/school/hook.tsx';

export const Route = createFileRoute('/user/login-modern')({
  component: RouteComponent,
})

export default function RouteComponent() {
  const { login } = useSchoolContent()
  const config = useSchoolConfig()
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    if (status === "success") setStatus("idle");
  };

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter the email address connected to your school account.";
    if (values.password.length < 8) next.password = "Password must contain at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus("error");
      document.getElementById(Object.keys(next)[0] === "email" ? "login-email" : "login-password")?.focus();
      return;
    }
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 850);
  };

  return (
    <section className="auth-page" aria-labelledby="login-title">
      <div className="auth-visual">
        <ImageReveal src={"/public/schools/everest/landing-footage/frame_0001.jpeg"} alt="School architecture marking the entrance to Everest" eager testId="login-visual-image" />
        <div className="auth-visual__overlay">
          <SectionLabel number="04" inverse>ScMS entrance</SectionLabel>
          <p>The digital entrance<br />to the school.</p>
          <span>One community / connected responsibly</span>
        </div>
      </div>
      <div className="auth-panel">
        <Link to="/" className="auth-back" data-testid="login-back-home-link"><ArrowLeft aria-hidden="true" /> Public website</Link>
        <div className="auth-panel__inner">
          <span className="auth-kicker">SCHOOL MANAGEMENT SYSTEM</span>
          <h1 id="login-title">Welcome back.</h1>
          <p className="auth-intro">Enter the credentials issued by {config.organization.name} to continue.</p>

          <form onSubmit={submit} noValidate className="auth-form" data-testid="login-form">
            <div className={`form-control ${errors.email ? "form-control--error" : ""}`}>
              <Label htmlFor="login-email">Email</Label>
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
              {errors.email ? <p id="login-email-error" className="field-error"><AlertCircle aria-hidden="true" />{errors.email}</p> : null}
            </div>
            <div className={`form-control ${errors.password ? "form-control--error" : ""}`}>
              <div className="label-line">
                <Label htmlFor="login-password">Password</Label>
                <button type="button" onClick={() => setRecoveryOpen((value) => !value)} data-testid="forgot-password-button">Forgot password?</button>
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
                  aria-describedby={errors.password ? "login-password-error" : undefined}
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
                >
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>
              {errors.password ? <p id="login-password-error" className="field-error"><AlertCircle aria-hidden="true" />{errors.password}</p> : null}
            </div>

            {recoveryOpen ? (
              <div className="auth-note" role="status" data-testid="password-recovery-note">
                Password recovery requires the connected ScMS service. Contact the school office for account assistance.
              </div>
            ) : null}
            {status === "success" ? (
              <div className="form-status form-status--success" role="status" data-testid="login-demo-success">
                <Check aria-hidden="true" />
                <span>Sign-in form verified. This frontend preview is not connected to authentication.</span>
              </div>
            ) : null}

            <Button type="submit" className="institution-button institution-button--full" disabled={status === "loading"} data-testid="login-form-submit-button">
              {status === "loading" ? <LoaderCircle className="spin" aria-hidden="true" /> : null}
              {status === "loading" ? "Checking interface…" : "Sign in"}
            </Button>
            <p className="demo-disclosure">Frontend demonstration — no credentials are transmitted or stored.</p>
          </form>

          <div className="auth-contact">
            <span>Don't have access?</span>
            <Link to="/contact" data-testid="login-contact-school-link">Contact the school <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
