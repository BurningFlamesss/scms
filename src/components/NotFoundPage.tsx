import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="not-found" data-testid="not-found-page">
      <span>404 / OFF THE MAP</span>
      <h1>This chapter<br />is not here.</h1>
      <p>The page may have moved, or the address may be incomplete.</p>
      <Link to="/" className="institution-button activation-link" data-testid="not-found-home-link"><ArrowLeft aria-hidden="true" /> Return home</Link>
    </section>
  );
}
