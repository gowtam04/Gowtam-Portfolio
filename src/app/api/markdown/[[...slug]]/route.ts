import {
  getMarkdownForPath,
  getNotFoundMarkdown,
  MARKDOWN_VARY,
} from "@/lib/markdown-pages";

type RouteParams = { params: Promise<{ slug?: string[] }> };

function pathFromSlug(slug?: string[]): string {
  if (!slug || slug.length === 0) return "/";
  return `/${slug.join("/")}`;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const pathname = pathFromSlug(slug);
  const body = getMarkdownForPath(pathname);

  if (body === null) {
    return new Response(getNotFoundMarkdown(), {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: MARKDOWN_VARY,
      },
    });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: MARKDOWN_VARY,
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=86400",
    },
  });
}
