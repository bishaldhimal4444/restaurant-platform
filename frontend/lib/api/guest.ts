const API_URL = process.env.API_URL ?? 'http://backend:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

interface GuestRequestOptions extends RequestInit {
  cookieHeader?: string;
}

interface GuestApiResult<T> {
  data: T;
  setCookie: string | null;
}

export async function guestApiFetch<T>(
  path: string,
  options: GuestRequestOptions = {},
): Promise<GuestApiResult<T>> {
  const { cookieHeader, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  const setCookie = res.headers.get('set-cookie');

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) {
    return { data: undefined as T, setCookie };
  }

  const data = (await res.json()) as T;
  return { data, setCookie };
}
