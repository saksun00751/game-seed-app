const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL;

export interface ContactChannel {
  code: number;
  type: string;
  label: string;
  link: string;
  sort: number;
}

interface ContactChannelsResponse {
  success?: boolean;
  data?: { contact_channels?: ContactChannel[] };
}

function buildHeaders(lang?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (lang) {
    headers["X-Language"] = lang;
    headers.language = lang;
    headers.lang = lang;
    headers.locale = lang;
  }
  return headers;
}

const MOCK_CHANNELS: ContactChannel[] = [
  { code: 2, type: "line", label: "@1168lottov2", link: "https://1168lot.com/", sort: 0 },
  { code: 1, type: "telegram", label: "@1168lotto", link: "https://1168lot.com/", sort: 21 },
];

export async function getContactChannels(lang?: string): Promise<ContactChannel[]> {
  try {
    const res = await fetch(`${API_BASE}/meta/contact-channels`, {
      method: "GET",
      headers: buildHeaders(lang),
      redirect: "manual",
      cache: "no-store",
    });
    if (!res.ok) return [...MOCK_CHANNELS].sort((a, b) => a.sort - b.sort);

    const payload = (await res.json()) as ContactChannelsResponse;
    const channels = payload?.data?.contact_channels;
    if (!Array.isArray(channels) || channels.length === 0) {
      return [...MOCK_CHANNELS].sort((a, b) => a.sort - b.sort);
    }

    return [...channels].sort((a, b) => a.sort - b.sort);
  } catch {
    return [...MOCK_CHANNELS].sort((a, b) => a.sort - b.sort);
  }
}
