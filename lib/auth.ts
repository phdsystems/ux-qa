import { apiKey, rbacMap } from "@/lib/config";

const AUTH_OK = "ok";
const AUTH_FORBIDDEN = "forbidden";

function getHeader(source: Request | Headers, key: string) {
  if (source instanceof Request) {
    return source.headers.get(key);
  }
  return (source as Headers).get(key);
}

export function ensureAuthorized(source: Request | Headers) {
  if (!apiKey) {
    return { status: AUTH_OK };
  }
  const headerKey = getHeader(source, "x-playwright-hub-key");
  if (headerKey !== apiKey) {
    return { status: AUTH_FORBIDDEN };
  }
  const role = getHeader(source, "x-playwright-hub-role");
  return { status: AUTH_OK, role };
}

export function hasRole(role: string | null | undefined, required: string[]) {
  if (!rbacMap || required.length === 0) {
    return true;
  }
  if (!role) {
    return false;
  }
  return required.some((r) => rbacMap[role]?.includes(r));
}
