import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes for authenticated users
  const protectedRoutes = ["/home", "/car"];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Admin-only routes
  const adminRoutes = ["/dashboard"];
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // If user is not logged in and trying to access protected/admin routes
  if (!user && (isProtectedRoute || isAdminRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in
  if (user) {
    // Redirect logged-in users away from public auth pages
    if (pathname === "/login" || pathname === "/signup") {
      // Check if user is admin
      const { data: userData } = await supabase
        .from("users")
        .select("access_level")
        .eq("user_id", user.id)
        .single();

      const isAdmin = userData?.access_level === 0;
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/dashboard" : "/home";
      return NextResponse.redirect(url);
    }

    // Check admin access for admin routes
    if (isAdminRoute) {
      const { data: userData } = await supabase
        .from("users")
        .select("access_level")
        .eq("user_id", user.id)
        .single();

      const isAdmin = userData?.access_level === 0;

      if (!isAdmin) {
        // Regular user trying to access admin routes - redirect to home
        const url = request.nextUrl.clone();
        url.pathname = "/home";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
