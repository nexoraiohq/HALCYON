import { Container } from "./ui";

export default function PageHero({
  eyebrow,
  title,
  intro,
  meta,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  meta?: string;
}) {
  return (
    <section className="bg-paper pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
      <Container>
        <p className="reveal eyebrow text-fog">{eyebrow}</p>
        <h1
          className="reveal display mt-5 max-w-[18ch] text-display"
          style={{ ["--reveal-delay" as string]: "60ms" }}
        >
          {title}
        </h1>
        {(intro || meta) && (
          <div
            className="reveal mt-10 grid gap-8 sm:grid-cols-2"
            style={{ ["--reveal-delay" as string]: "140ms" }}
          >
            {intro && (
              <p className="max-w-[34rem] text-[1.05rem] leading-relaxed tracking-[-0.01em] text-slate">
                {intro}
              </p>
            )}
            {meta && <p className="eyebrow self-end text-brass sm:text-right">{meta}</p>}
          </div>
        )}
      </Container>
    </section>
  );
}
