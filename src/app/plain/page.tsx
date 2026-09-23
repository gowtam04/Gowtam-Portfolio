import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PlaceholderLegend } from "@/components/room/ui/Placeholder";
import { Rich, isBarePlaceholder } from "@/components/room/ui/Rich";
import type { RoomBlock, RoomSection } from "@/lib/room-content";
import {
  LONGER_CONTENT,
  PANEL_SPOT_ORDER,
  proseToRich,
  ROOM_INTRO,
  ROOM_PLACEHOLDERS,
  ROOM_SECTIONS,
} from "@/lib/room-content";
import type { RoomProject } from "@/lib/room-projects";
import { getRoomProjects } from "@/lib/room-projects";
import { SITE_NAME } from "@/lib/site-content";

export const metadata: Metadata = {
  title: `Plain version | ${SITE_NAME}`,
  description:
    "Everything in Gowtam's 3D room as a simple, fast text page: AI architecture work, games, cars, places, Teeko the chihuahua, and how to get in touch.",
  alternates: {
    canonical: "/plain",
  },
};

const LINK = "font-medium text-[var(--accent)] underline-offset-4 hover:text-[var(--accent-hover)] hover:underline";
const LABEL = "text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--faint)]";

function Tag({ type }: { type: RoomProject["projectType"] }) {
  const pro = type === "professional";
  return (
    <span
      className={`inline-flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold tracking-[0.02em] ${
        pro ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "bg-[var(--surface-2)] text-[var(--muted)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${pro ? "bg-[var(--accent)]" : "bg-[var(--faint)]"}`}
      />
      {pro ? "Professional" : "Independent"}
    </span>
  );
}

function Projects({ block, projects }: { block: Extract<RoomBlock, { type: "projects" }>; projects: RoomProject[] }) {
  return (
    <div>
      <h3 className={LABEL}>{block.heading}</h3>
      <ul className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {projects.map((p) => (
          <li key={p.slug} className="py-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href={`/case-studies/${p.slug}`}
                className={`font-display tracking-[-0.01em] text-[var(--foreground)] hover:text-[var(--accent)] ${p.featured ? "text-xl" : "text-lg"}`}
              >
                {p.title}
              </Link>
              <Tag type={p.projectType} />
              <span className="text-[0.8rem] text-[var(--faint)]">{p.category}</span>
            </div>
            {p.featured ? (
              <p className="mt-1.5 text-[0.95rem] leading-[1.6] text-[var(--muted)]">{p.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link href={block.allHref} className={LINK}>
          {block.allLabel} <span aria-hidden="true">&rarr;</span>
        </Link>
      </p>
    </div>
  );
}

function Longer({ block }: { block: Extract<RoomBlock, { type: "longer" }> }) {
  const content = LONGER_CONTENT[block.source];
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-1)] p-6">
      <h3 className={LABEL}>{block.summary}</h3>
      {content.headline ? (
        <p className="mt-3 font-display text-xl tracking-[-0.01em] text-[var(--foreground)]">{content.headline}</p>
      ) : null}
      {content.lede ? <p className="mt-2 text-[0.95rem] leading-[1.65] text-[var(--muted)]">{content.lede}</p> : null}
      <div className="mt-6 space-y-6">
        {content.sections.map((s) => (
          <div key={s.heading}>
            <h4 className="text-[0.95rem] font-semibold text-[var(--foreground)]">{s.heading}</h4>
            <div className="mt-2 space-y-2.5 text-[0.95rem] leading-[1.65] text-[var(--muted)]">
              {s.paragraphs.map((para, i) => (
                <p key={i}>
                  <Rich text={proseToRich(para)} variant="site" linkClassName={LINK} />
                </p>
              ))}
              {s.bullets ? (
                <ul className="list-disc space-y-1 pl-5 marker:text-[var(--accent)]">
                  {s.bullets.map((b, i) => (
                    <li key={i}>
                      <Rich text={proseToRich(b)} variant="site" linkClassName={LINK} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ block, projects }: { block: RoomBlock; projects: RoomProject[] }) {
  switch (block.type) {
    case "projects":
      return <Projects block={block} projects={projects} />;
    case "facts":
      return (
        <div>
          {block.heading ? <h3 className={LABEL}>{block.heading}</h3> : null}
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.98rem] leading-[1.6] text-[var(--foreground)] marker:text-[var(--accent)]">
            {block.items.map((item, i) => (
              <li key={i}>
                <Rich text={item} variant="site" linkClassName={LINK} />
              </li>
            ))}
          </ul>
        </div>
      );
    case "spec":
      return (
        <div>
          {block.heading ? <h3 className={LABEL}>{block.heading}</h3> : null}
          <dl className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {block.rows.map((row) => (
              <div key={row.label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
                <dt className="text-[0.85rem] font-semibold text-[var(--muted)]">{row.label}</dt>
                <dd className="text-[0.98rem] text-[var(--foreground)]">
                  <Rich text={row.value} variant="site" linkClassName={LINK} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "chips":
      return (
        <div>
          <h3 className={LABEL}>{block.heading}</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {block.items.map((item, i) => (
              <li key={i}>
                {isBarePlaceholder(item) ? (
                  <Rich text={item} variant="site" />
                ) : (
                  <span className="inline-flex rounded-[9px] border border-[var(--border)] bg-[var(--surface-1)] px-2.5 py-1 text-[0.85rem] text-[var(--foreground)]">
                    <Rich text={item} variant="site" linkClassName={LINK} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
    case "stat":
      return (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="mono-stat text-3xl">{block.value}</span>
          <span className="text-[0.95rem] text-[var(--muted)]">{block.label}</span>
        </p>
      );
    case "links":
      return (
        <ul className="flex flex-wrap gap-3">
          {block.items.map((item) => {
            const className = item.primary
              ? "inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
              : "inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--foreground)] hover:border-[var(--accent)]";
            const body = (
              <>
                {item.label}
                {item.detail ? <span className="font-medium opacity-80">{item.detail}</span> : null}
              </>
            );
            return (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {body}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <a href={item.href} className={className}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      );
    case "longer":
      return <Longer block={block} />;
    case "teeko-teaser":
      return (
        <div>
          <h3 className={LABEL}>{block.heading}</h3>
          <p className="mt-2 text-[0.98rem] leading-[1.6] text-[var(--muted)]">
            {block.text}{" "}
            <a href="#teeko" className={LINK}>
              {block.cta}
            </a>
          </p>
        </div>
      );
  }
}

function Section({ section, projects }: { section: RoomSection; projects: RoomProject[] }) {
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-28">
      <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
        {section.kicker}
      </p>
      <h2
        id={`${section.id}-title`}
        className="font-display text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-[var(--foreground)] sm:text-[2.1rem]"
      >
        {section.title}
      </h2>
      <p className="mt-4 text-[1.05rem] leading-[1.7] text-[var(--muted)]">
        <Rich text={section.lead} variant="site" linkClassName={LINK} />
      </p>
      <div className="mt-7 space-y-8">
        {section.blocks.map((block, i) => (
          <Block key={`${block.type}-${i}`} block={block} projects={projects} />
        ))}
      </div>
      <p className="mt-7 text-[0.85rem]">
        <Link href={section.route} className={LINK}>
          See it in the room <span aria-hidden="true">&rarr;</span>
        </Link>
      </p>
    </section>
  );
}

export default function PlainPage() {
  const projects = getRoomProjects();
  return (
    <>
      <Header />
      <main className="px-6 pb-24 pt-28">
        <article className="mx-auto max-w-3xl">
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
            Plain version
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl">
            {ROOM_INTRO.title}, <em className="text-[var(--accent)]">without the 3D</em>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">{ROOM_INTRO.summary}</p>
          <p className="mt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[0.92rem] font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              Step into the room <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>

          <nav aria-label="Sections" className="mt-10 border-y border-[var(--border)] py-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.9rem]">
              {PANEL_SPOT_ORDER.map((id) => (
                <li key={id}>
                  <a href={`#${id}`} className="font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
                    {ROOM_SECTIONS[id].navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-14 space-y-20">
            {PANEL_SPOT_ORDER.map((id) => (
              <Section key={id} section={ROOM_SECTIONS[id]} projects={projects} />
            ))}
          </div>

          {ROOM_PLACEHOLDERS.length > 0 ? (
            <div className="mt-16 border-t border-[var(--border)] pt-6">
              <PlaceholderLegend variant="site" />
            </div>
          ) : null}
        </article>
      </main>
      <Footer />
    </>
  );
}
