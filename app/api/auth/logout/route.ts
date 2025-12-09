export async function POST(request: Request) {
  const headers = new Headers();
  // Clear the cookie (FirebaseSession) and redirect to /login
  headers.append("Set-Cookie", `FirebaseSession=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`);
  headers.append("Location", "/login");
  return new Response(null, { status: 302, headers });
}
