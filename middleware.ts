import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [/^\/admin\//];
const REQUIRED_ROLE = process.env.UXQA_ADMIN_ROLE ?? "admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((regex) => regex.test(pathname));
  if (!isProtected) {
    return NextResponse.next();
  }
  const rolesHeader = request.headers.get("x-uxqa-role");
  if (!rolesHeader || !rolesHeader.split(",").includes(REQUIRED_ROLE)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
