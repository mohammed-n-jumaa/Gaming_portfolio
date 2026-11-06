import { Fragment } from "react";

const AR = /[؀-ۿ]/;

/**
 * Renders text as masked words (and chars for Latin scripts) so GSAP can animate
 * each glyph. Arabic is only split by word to keep letter joining intact.
 */
export function Split({
  text,
  chars = true,
  className,
  charClass = "c",
}: {
  text: string;
  chars?: boolean;
  className?: string;
  charClass?: string;
}) {
  const isAr = AR.test(text);
  const words = text.split(" ");
  // inline-block glyphs are bidi-neutral: pin Latin runs to LTR so they never reverse inside RTL pages
  return (
    <span className={className} dir={isAr ? undefined : "ltr"}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="w" dir={AR.test(w) ? undefined : "ltr"}>
              <span className="wi">
                {chars && !isAr
                  ? Array.from(w).map((c, j) => (
                      <span className={charClass} key={j}>
                        {c}
                      </span>
                    ))
                  : w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}

/** Text that rolls up to a duplicate of itself on hover. */
export function Roll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`roll ${className ?? ""}`}>
      <span className="roll-in">
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </span>
    </span>
  );
}

/** Heading where *marked* words switch to the italic serif — the quiet editorial accent. */
export function Title({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.startsWith("*") ? (
          <em className="accent" key={i}>
            <Split text={p.slice(1, -1)} />
          </em>
        ) : (
          <Split key={i} text={p.trim()} />
        )
      ).reduce<React.ReactNode[]>((acc, el, i) => (i ? [...acc, " ", el] : [el]), [])}
    </span>
  );
}
