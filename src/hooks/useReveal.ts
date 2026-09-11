import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useReveal(options = {}) {
  const ref = useRef(null);
  const { y = 28, delay = 0 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(element, { opacity: 1, y: 0 });
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          delay,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        },
      );
    }, element);

    return () => context.revert();
  }, [delay, y]);

  return ref;
}

export function useImageReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { clipPath: "inset(0 0 100% 0)" },
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 1.15,
          ease: "expo.out",
          scrollTrigger: { trigger: element, start: "top 82%", once: true },
        },
      );
    }, element);

    return () => context.revert();
  }, []);

  return ref;
}
