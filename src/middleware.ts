import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getMarkdownForPath,
  getNotFoundMarkdown,
  MARKDOWN_VARY,
  normalizePathname,
} from "@/lib/markdown-pages";

const PRODUCES = ["text/html", "text/markdown"] as const;

type AcceptEntry = { type: string; q: number; specificity: number };

function parseAccept(header: string): AcceptEntry[] {
  return header.split(",").map((raw) => {
    const parts = raw
      .trim()
      .split(";")
      .map((s) => s.trim());
    const type = parts[0].toLowerCase();
    let q = 1;
    for (const param of parts.slice(1)) {
      const [name, value] = param.split("=").map((s) => s.trim());
      if (name === "q") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
      }
    }
    const specificity = type === "*/*" ? 0 : type.endsWith("/*") ? 1 : 2;
    return { type, q, specificity };
  });
}

function matches(entry: AcceptEntry, candidate: string): boolean {
  if (entry.type === "*/*") return true;
  if (entry.type.endsWith("/*")) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
}

function preferredType(header: string | null): string | null {
  if (!header) return PRODUCES[0];
  const entries = parseAccept(header);
  if (entries.length === 0) return PRODUCES[0];

  let bestType: string | null = null;
  let bestQ = -1;
  let bestPosition = Infinity;

  for (const candidate of PRODUCES) {
    let matched: AcceptEntry | null = null;
    let matchedPosition = Infinity;
    for (let idx = 0; idx < entries.length; idx++) {
      const e = entries[idx];
      if (!matches(e, candidate)) continue;
      if (
        matched === null ||
        e.specificity > matched.specificity ||
        (e.specificity === matched.specificity && idx < matchedPosition)
      ) {
        matched = e;
        matchedPosition = idx;
      }
    }
    if (matched === null) continue;
    if (matched.q <= 0) continue;

    if (
      matched.q > bestQ ||
      (matched.q === bestQ && matchedPosition < bestPosition)
    ) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      bestType = candidate;
    }
  }

  return bestType;
}

function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept");
    return;
  }
  const tokens = existing.split(",").map((s) => s.trim().toLowerCase());
  if (!tokens.includes("accept")) {
    headers.set("Vary", `${existing}, Accept`);
  }
}

function markdownResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: MARKDOWN_VARY,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
    },
  });
}

function shouldSkipNegotiation(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/_vercel/")) return true;
  if (pathname === "/llms.txt") return true;
  if (pathname === "/sitemap.xml" || pathname === "/robots.txt") return true;
  if (pathname === "/icon.svg" || pathname === "/favicon.ico") return true;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const pathname = normalizePathname(req.nextUrl.pathname);

  if (shouldSkipNegotiation(pathname)) {
    return NextResponse.next();
  }

  // Skip Markdown negotiation for product pages in this pass
  if (pathname === "/xrplook" || pathname.startsWith("/xrplook/")) {
    const res = NextResponse.next();
    appendVaryAccept(res.headers);
    return res;
  }

  const acceptHeader = req.headers.get("accept");
  const chosen = preferredType(acceptHeader);

  if (chosen === "text/markdown") {
    const body = getMarkdownForPath(pathname);
    if (body === null) {
      return markdownResponse(getNotFoundMarkdown(), 404);
    }
    return markdownResponse(body, 200);
  }

  if (chosen === null && acceptHeader) {
    return new NextResponse(
      "Not Acceptable\n\nAvailable: text/html, text/markdown\n",
      {
        status: 406,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Vary: "Accept",
        },
      },
    );
  }

  const res = NextResponse.next();
  appendVaryAccept(res.headers);
  return res;
}

export const config = {
  matcher: ["/((?!api/|_next/|_vercel/).*)"],
};
