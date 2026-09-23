"use client";

import Link from "next/link";
import type { RoomBlock } from "@/lib/room-content";
import { LONGER_CONTENT, proseToRich } from "@/lib/room-content";
import type { RoomProject } from "@/lib/room-projects";
import { useRoomActions } from "../store";
import { Rich, isBarePlaceholder } from "./Rich";

type Block<T extends RoomBlock["type"]> = Extract<RoomBlock, { type: T }>;

function Arrow() {
  return (
    <span className="room-arr" aria-hidden="true">
      &rarr;
    </span>
  );
}

function ProjectTag({ type }: { type: RoomProject["projectType"] }) {
  const pro = type === "professional";
  return (
    <span className={pro ? "room-tag room-tag-pro" : "room-tag"}>
      <i aria-hidden="true" />
      {pro ? "Professional" : "Independent"}
    </span>
  );
}

function ProjectsBlock({ block, projects }: { block: Block<"projects">; projects: RoomProject[] }) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <section className="room-block">
      <h2 className="room-h">{block.heading}</h2>
      {featured.length > 0 ? (
        <ul className="room-cards">
          {featured.map((p) => (
            <li key={p.slug}>
              <Link className="room-card" href={`/case-studies/${p.slug}`}>
                <span className="room-card-top">
                  <span className="room-card-name">
                    {p.title}
                    <Arrow />
                  </span>
                  <ProjectTag type={p.projectType} />
                </span>
                <span className="room-card-desc">{p.description}</span>
                <span className="room-card-cat">{p.category}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {rest.length > 0 ? (
        <ul className="room-rows">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link className="room-row" href={`/case-studies/${p.slug}`}>
                <span className="room-row-main">
                  <span className="room-row-name">{p.title}</span>
                  <span className="room-row-cat">{p.category}</span>
                </span>
                <ProjectTag type={p.projectType} />
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link className="room-text-link" href={block.allHref}>
        {block.allLabel}
        <Arrow />
      </Link>
    </section>
  );
}

function FactsBlock({ block }: { block: Block<"facts"> }) {
  return (
    <section className="room-block">
      {block.heading ? <h2 className="room-h">{block.heading}</h2> : null}
      <ul className="room-facts">
        {block.items.map((item, i) => (
          <li key={i}>
            <Rich text={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SpecBlock({ block }: { block: Block<"spec"> }) {
  return (
    <section className="room-block">
      {block.heading ? <h2 className="room-h">{block.heading}</h2> : null}
      <dl className="room-spec">
        {block.rows.map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              <Rich text={row.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ChipsBlock({ block }: { block: Block<"chips"> }) {
  return (
    <section className="room-block">
      <h2 className="room-h">{block.heading}</h2>
      <ul className="room-chips">
        {block.items.map((item, i) => (
          <li key={i}>
            {isBarePlaceholder(item) ? (
              <Rich text={item} />
            ) : (
              <span className="room-solid-chip">
                <Rich text={item} />
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatBlock({ block }: { block: Block<"stat"> }) {
  return (
    <section className="room-block room-stat">
      <p className="room-stat-value">{block.value}</p>
      <p className="room-stat-label">{block.label}</p>
    </section>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9.75h4v11H3v-11zm6.5 0h3.8v1.5h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4v-11z"
      />
    </svg>
  );
}

function linkIcon(href: string) {
  if (href.startsWith("mailto:")) return <MailIcon />;
  if (href.includes("linkedin.com")) return <LinkedInIcon />;
  return null;
}

function LinksBlock({ block }: { block: Block<"links"> }) {
  return (
    <section className="room-block">
      <ul className="room-btns">
        {block.items.map((item) => {
          const className = item.primary ? "room-btn room-btn-primary" : "room-btn room-btn-ghost";
          const body = (
            <>
              {linkIcon(item.href)}
              <span className="room-btn-label">{item.label}</span>
              {item.detail ? <span className="room-btn-detail">{item.detail}</span> : null}
              {item.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </>
          );
          return (
            <li key={item.href}>
              {item.external ? (
                <a className={className} href={item.href} target="_blank" rel="noopener noreferrer">
                  {body}
                </a>
              ) : (
                <a className={className} href={item.href}>
                  {body}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LongerBlock({ block }: { block: Block<"longer"> }) {
  const content = LONGER_CONTENT[block.source];
  return (
    <details className="room-block room-longer">
      <summary>
        <span>{block.summary}</span>
        <svg className="room-longer-chev" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="room-longer-body">
        {content.headline ? <p className="room-longer-headline">{content.headline}</p> : null}
        {content.lede ? <p className="room-longer-lede">{content.lede}</p> : null}
        {content.sections.map((s) => (
          <div key={s.heading} className="room-longer-section">
            <h3>{s.heading}</h3>
            {s.paragraphs.map((p, i) => (
              <p key={i}>
                <Rich text={proseToRich(p)} />
              </p>
            ))}
            {s.bullets ? (
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>
                    <Rich text={proseToRich(b)} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}

function TeekoTeaser({ block }: { block: Block<"teeko-teaser"> }) {
  const actions = useRoomActions();
  return (
    <section className="room-block room-teaser">
      <h2 className="room-teaser-title">{block.heading}</h2>
      <p>{block.text}</p>
      <button
        type="button"
        className="room-btn room-btn-ghost room-btn-sm"
        onClick={() => {
          actions.pokeTeeko();
          actions.openSpot("teeko");
        }}
      >
        {block.cta}
        <Arrow />
      </button>
    </section>
  );
}

export function PanelBlock({ block, projects }: { block: RoomBlock; projects: RoomProject[] }) {
  switch (block.type) {
    case "projects":
      return <ProjectsBlock block={block} projects={projects} />;
    case "facts":
      return <FactsBlock block={block} />;
    case "spec":
      return <SpecBlock block={block} />;
    case "chips":
      return <ChipsBlock block={block} />;
    case "stat":
      return <StatBlock block={block} />;
    case "links":
      return <LinksBlock block={block} />;
    case "longer":
      return <LongerBlock block={block} />;
    case "teeko-teaser":
      return <TeekoTeaser block={block} />;
  }
}
