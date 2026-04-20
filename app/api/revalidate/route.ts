import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const ALLOWED_TAGS = new Set([
  "site-meta",
  "navbar-config",
  "banks",
  "contact-channels",
]);

function isAuthorized(req: Request): boolean {
  const token = process.env.REVALIDATE_TOKEN;
  if (!token) return false;
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${token}`;
  return auth === expected;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let tags: string[] = [];
  try {
    const body = (await req.json()) as { tag?: string; tags?: string[] };
    if (typeof body?.tag === "string" && body.tag.trim()) {
      tags.push(body.tag.trim());
    }
    if (Array.isArray(body?.tags)) {
      tags.push(
        ...body.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean),
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  if (tags.length === 0) {
    return NextResponse.json({ success: false, message: "Provide `tag` or `tags`" }, { status: 400 });
  }

  const uniqueTags = [...new Set(tags)];
  const invalidTags = uniqueTags.filter((tag) => !ALLOWED_TAGS.has(tag));
  if (invalidTags.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid cache tag",
        invalidTags,
        allowedTags: [...ALLOWED_TAGS],
      },
      { status: 400 },
    );
  }

  for (const tag of uniqueTags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    success: true,
    message: "Cache revalidation requested",
    tags: uniqueTags,
  });
}
